/**
 * ZACR WHOIS availability check.
 *
 * Why this file exists: Absolute Hosting's API does not expose a domain-check
 * method (we enumerated the entire WSDL — 39 operations, no `Domain_Check`).
 * The clean fallback is to query ZACR (the .za registry) directly via the
 * standard WHOIS protocol on TCP port 43.
 *
 * This works for any .za TLD: .co.za, .org.za, .net.za, .web.za.
 *
 * Reliability notes:
 *   - ZACR rate-limits aggressive queries (~5/sec from a single IP). Cache
 *     results upstream and debounce client-side input.
 *   - Connection is plain TCP, no TLS, no auth. The protocol is read-only.
 *   - Responses are ASCII text. We parse heuristically — see isAvailable().
 */

import { connect } from "node:net";
import type { AvailabilityResult } from "./types";

const DEFAULT_HOST = process.env.ZACR_WHOIS_HOST || "whois.registry.net.za";
const DEFAULT_PORT = parseInt(process.env.ZACR_WHOIS_PORT || "43", 10);
const DEFAULT_TIMEOUT_MS = 8000;

/**
 * Send a WHOIS query and return the raw response text.
 */
function whoisQuery(
  domain: string,
  host: string = DEFAULT_HOST,
  port: number = DEFAULT_PORT,
  timeoutMs: number = DEFAULT_TIMEOUT_MS
): Promise<string> {
  return new Promise((resolve, reject) => {
    const socket = connect({ host, port });
    const chunks: Buffer[] = [];

    const t = setTimeout(() => {
      socket.destroy();
      reject(new Error(`WHOIS timeout after ${timeoutMs}ms (${host}:${port})`));
    }, timeoutMs);

    socket.on("connect", () => {
      socket.write(`${domain}\r\n`);
    });

    socket.on("data", (chunk) => {
      chunks.push(chunk);
    });

    socket.on("end", () => {
      clearTimeout(t);
      resolve(Buffer.concat(chunks).toString("utf8"));
    });

    socket.on("error", (err) => {
      clearTimeout(t);
      reject(err);
    });
  });
}

/**
 * Heuristic parser for ZACR's "is this domain registered" response.
 *
 * For .co.za, ZACR returns one of:
 *   - "Available\n" or similar — domain is free
 *   - A multi-line WHOIS record with "Domain Name:", "Registrant:" etc. — taken
 *   - "Throttled" or rate-limit messages — back off
 *
 * Other patterns we accept as available: "No data found", "no entries found",
 * "not registered" (case-insensitive).
 */
function isAvailable(raw: string): { available: boolean; rateLimited: boolean } {
  const text = raw.toLowerCase();

  // Rate-limited responses — distinct from "available" or "taken"
  if (text.includes("throttle") || text.includes("rate limit") || text.includes("too many")) {
    return { available: false, rateLimited: true };
  }

  // Strong taken signals
  if (text.includes("domain name:") || text.includes("registrant:") || text.includes("registrar:")) {
    return { available: false, rateLimited: false };
  }

  // Strong available signals
  if (
    text.includes("available") ||
    text.includes("no data found") ||
    text.includes("no entries found") ||
    text.includes("not registered") ||
    text.includes("does not exist")
  ) {
    return { available: true, rateLimited: false };
  }

  // Empty or unrecognised response — be conservative, treat as taken (don't
  // accidentally tell a customer a domain is available when we're not sure).
  return { available: false, rateLimited: false };
}

/**
 * Check whether a .za domain is available for registration.
 *
 * Returns an AvailabilityResult that's safe to surface to users:
 *   - `available: true` — confidently free
 *   - `available: false` — taken, or unable to confirm
 *   - `error` set when we couldn't reach the WHOIS server
 *
 * Suggestions (`name + sa.co.za`, etc.) are added when the domain is taken.
 */
export async function checkAvailability(domain: string): Promise<AvailabilityResult> {
  const cleaned = sanitiseDomain(domain);
  if (!cleaned) {
    return {
      domain,
      available: false,
      source: "zacr-whois",
      error: "Invalid domain format",
    };
  }

  let raw: string;
  try {
    raw = await whoisQuery(cleaned);
  } catch (err) {
    return {
      domain: cleaned,
      available: false,
      source: "zacr-whois",
      error: `WHOIS query failed: ${(err as Error).message}`,
    };
  }

  const { available, rateLimited } = isAvailable(raw);

  if (rateLimited) {
    return {
      domain: cleaned,
      available: false,
      source: "zacr-whois",
      raw,
      error: "Rate limited by ZACR. Try again in a few seconds.",
    };
  }

  if (available) {
    return {
      domain: cleaned,
      available: true,
      source: "zacr-whois",
      raw,
    };
  }

  return {
    domain: cleaned,
    available: false,
    source: "zacr-whois",
    raw,
    suggestions: suggestAlternatives(cleaned),
  };
}

/**
 * Validate and lowercase the input. Returns null for invalid input.
 *
 * - Strips leading/trailing whitespace
 * - Lowercases (DNS is case-insensitive but ZACR returns inconsistent case)
 * - Rejects anything that isn't [a-z0-9-]+ in the SLD or a recognised .za TLD
 */
function sanitiseDomain(input: string): string | null {
  const s = input.trim().toLowerCase();
  if (!s) return null;

  // Allowed pattern: SLD.TLD where SLD is [a-z0-9-]{1,63}, TLD is one of the
  // .za second-levels.
  const pattern = /^([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)\.(co\.za|org\.za|net\.za|web\.za|gov\.za|edu\.za|ac\.za)$/;
  if (!pattern.test(s)) return null;

  return s;
}

/**
 * Lightweight suggestion generator when a name is taken.
 * Strips trailing -sa / -za, then offers a few common variants.
 */
export function suggestAlternatives(domain: string): string[] {
  const dot = domain.indexOf(".");
  if (dot < 0) return [];

  const sld = domain.slice(0, dot);
  const tld = domain.slice(dot); // includes the leading "."

  const candidates = new Set<string>();
  candidates.add(`${sld}sa${tld}`);
  candidates.add(`${sld}-sa${tld}`);
  candidates.add(`my${sld}${tld}`);
  candidates.add(`${sld}online${tld}`);
  candidates.add(`${sld}-online${tld}`);

  candidates.delete(domain); // never suggest the same one back
  return Array.from(candidates).slice(0, 3);
}

/**
 * Bulk check helper. Use sparingly — sequential, with delay, to avoid rate limits.
 */
export async function checkBulk(
  domains: string[],
  delayMs: number = 250
): Promise<AvailabilityResult[]> {
  const results: AvailabilityResult[] = [];
  for (const d of domains) {
    results.push(await checkAvailability(d));
    if (delayMs > 0) await new Promise((r) => setTimeout(r, delayMs));
  }
  return results;
}

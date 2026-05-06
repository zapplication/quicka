/**
 * POST /api/domains/check
 *
 * Body: { name: string }   ← either bare SLD ("sarahshair") or full ("sarahshair.co.za")
 *
 * Returns: { available: boolean, domain: string, suggestions?: string[], error?: string }
 *
 * Used by the /build flow as the user types their business name to give
 * live feedback on whether their preferred domain is free.
 *
 * Implementation notes:
 *   - Goes through ZACR WHOIS (port 43), not Absolute Hosting (their API
 *     has no domain-check method). See src/lib/registrar/whois.ts.
 *   - Caching: in-memory per-instance for 5 minutes, keyed on domain name.
 *     Vercel serverless functions have small per-instance lifetime so this
 *     mostly helps within a single user session, not across users. For
 *     production scale a Redis cache would be ideal — TODO.
 *   - Rate limit: token bucket per IP, 30 calls / minute. Best-effort —
 *     for cross-instance limits use Vercel KV or Upstash.
 *   - The route runs in Node.js because /lib/registrar/whois.ts uses
 *     node:net which isn't in Edge runtime.
 */

import { NextRequest, NextResponse } from "next/server";
import { getRegistrar } from "@/lib/registrar";

export const runtime = "nodejs";

interface CacheEntry {
  result: unknown;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 5 * 60 * 1000;

const rateBuckets = new Map<string, { count: number; windowStart: number }>();
const RATE_LIMIT = 30; // requests per window
const RATE_WINDOW_MS = 60 * 1000;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const bucket = rateBuckets.get(ip);
  if (!bucket || now - bucket.windowStart > RATE_WINDOW_MS) {
    rateBuckets.set(ip, { count: 1, windowStart: now });
    return false;
  }
  bucket.count++;
  return bucket.count > RATE_LIMIT;
}

function clientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

/**
 * Coerce user input into a checkable domain.
 *  - Trim, lowercase
 *  - Strip a leading "www."
 *  - Append ".co.za" if no TLD provided
 */
function coerceDomain(input: string): string {
  let s = input.trim().toLowerCase();
  if (s.startsWith("www.")) s = s.slice(4);
  if (!/\.[a-z]{2,}/.test(s)) s += ".co.za";
  return s;
}

export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Try again in a minute." },
      { status: 429 }
    );
  }

  let body: { name?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (typeof body.name !== "string" || body.name.trim().length < 2) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  const domain = coerceDomain(body.name);

  // Cache hit?
  const cached = cache.get(domain);
  if (cached && cached.expiresAt > Date.now()) {
    return NextResponse.json(cached.result);
  }

  try {
    const registrar = getRegistrar();
    const result = await registrar.checkAvailability(domain);

    // Strip the raw WHOIS text from the public response — it can leak whois
    // server identifiers and is noisy. Keep on the server side only.
    const publicResult = {
      domain: result.domain,
      available: result.available,
      suggestions: result.suggestions,
      ...(result.error ? { error: result.error } : {}),
    };

    cache.set(domain, {
      result: publicResult,
      expiresAt: Date.now() + CACHE_TTL_MS,
    });

    return NextResponse.json(publicResult);
  } catch (err) {
    console.error("[/api/domains/check] error:", err);
    return NextResponse.json(
      {
        domain,
        available: false,
        error: "Could not check availability. Please try again.",
      },
      { status: 200 } // 200 even on internal error so UI handles gracefully
    );
  }
}

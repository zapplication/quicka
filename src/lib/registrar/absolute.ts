/**
 * Absolute Hosting registrar adapter.
 *
 * Implements the provider-agnostic Registrar interface (./index.ts) on top of
 * Absolute Hosting's SOAP API at https://www.zadomains.net/api/API_GENERAL.asmx
 *
 * Key design choices:
 *   - Availability is checked via ZACR WHOIS (./whois.ts), since Absolute
 *     Hosting's API has no Domain_Check method.
 *   - All other domain operations go through SOAP (./soap.ts).
 *   - Response parsing is defensive: we accept JSON, pipe-delimited or plain
 *     text since the API response format is undocumented and varies per method.
 *   - Credentials come from env vars (ABSOLUTE_HOSTING_USERNAME /
 *     ABSOLUTE_HOSTING_PASSWORD); never logged, never stored.
 */

import { soapCall, pipeJoin, SoapError } from "./soap";
import { checkAvailability as zacrCheckAvailability } from "./whois";
import type {
  AvailabilityResult,
  DomainContact,
  DomainInfo,
  RegistrationInput,
  RegistrationResult,
  RenewalResult,
} from "./types";

// ───────────────────────────────────────────────────────────────────────────
// Configuration
// ───────────────────────────────────────────────────────────────────────────

export interface AbsoluteHostingConfig {
  username: string;
  password: string;
  /** Defaults to https://www.zadomains.net/api/API_GENERAL.asmx via env */
  apiUrl?: string;
  /** Per-call timeout in ms. Default 15s. */
  timeoutMs?: number;
}

function getConfigFromEnv(): AbsoluteHostingConfig {
  const username = process.env.ABSOLUTE_HOSTING_USERNAME ?? "";
  const password = process.env.ABSOLUTE_HOSTING_PASSWORD ?? "";
  const apiUrl = process.env.ABSOLUTE_HOSTING_API_URL || undefined;

  if (!username || !password) {
    throw new Error(
      "Absolute Hosting not configured: set ABSOLUTE_HOSTING_USERNAME and ABSOLUTE_HOSTING_PASSWORD"
    );
  }

  return { username, password, apiUrl };
}

// ───────────────────────────────────────────────────────────────────────────
// Helpers
// ───────────────────────────────────────────────────────────────────────────

/**
 * Try to parse a SOAP result string as JSON. Returns null on failure rather
 * than throwing — caller decides what to do.
 */
function parseJson<T>(raw: string): T | null {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/**
 * Heuristic success detector. Treat empty / "ok" / "success" / "1" /
 * a JSON `{"success":true}` as success. Treat anything containing
 * "error", "failed", "denied" as failure.
 */
function looksLikeSuccess(raw: string): boolean {
  const trimmed = raw.trim();
  if (trimmed === "") return true; // void methods often return empty
  const lower = trimmed.toLowerCase();
  if (lower === "ok" || lower === "1" || lower === "true" || lower === "success") return true;
  if (lower.startsWith("error") || lower.includes("failed") || lower.includes("denied") || lower.includes("invalid"))
    return false;

  const parsed = parseJson<{ success?: boolean; status?: string }>(trimmed);
  if (parsed) {
    if (parsed.success === true) return true;
    if (typeof parsed.status === "string" && /ok|success|complete/i.test(parsed.status)) return true;
    if (parsed.success === false) return false;
  }

  // Default to "we got a response, no obvious failure" — caller can inspect raw.
  return true;
}

function splitDomain(domain: string): { sld: string; tld: string } {
  const dot = domain.indexOf(".");
  if (dot < 0) throw new Error(`Invalid domain (no TLD): ${domain}`);
  return { sld: domain.slice(0, dot), tld: domain.slice(dot + 1) };
}

// ───────────────────────────────────────────────────────────────────────────
// Public API — implements the Registrar interface
// ───────────────────────────────────────────────────────────────────────────

export class AbsoluteHostingRegistrar {
  private readonly config: AbsoluteHostingConfig;

  constructor(config?: AbsoluteHostingConfig) {
    this.config = config ?? getConfigFromEnv();
  }

  /**
   * Check whether a domain is available for registration.
   * Delegates to ZACR WHOIS — see ./whois.ts for why.
   */
  async checkAvailability(domain: string): Promise<AvailabilityResult> {
    return zacrCheckAvailability(domain);
  }

  /**
   * Register a new domain.
   *
   * Sequence:
   *   1. Add (or reuse) the contact via Contact_Add
   *   2. Call Domain_Register with the contact reference + nameservers
   *
   * Note: Absolute Hosting's exact `fieldvalues` shape for Domain_Register
   * isn't publicly documented. The format below is a best-faith reconstruction
   * — verify against the live sandbox before going to production.
   */
  async register(input: RegistrationInput): Promise<RegistrationResult> {
    const { domain, period, contact, nameservers } = input;

    // 1. Create / update the contact
    let contactRef: string;
    try {
      contactRef = await this.upsertContact(contact);
    } catch (err) {
      return {
        domain,
        registered: false,
        error: `Contact create failed: ${(err as Error).message}`,
      };
    }

    // 2. Register the domain
    // Conservative payload — domain | period | contactRef | ns1 | ns2 | ns3 | ns4 | ns5
    const ns = nameservers ?? [];
    const fieldvalues = pipeJoin([
      domain,
      String(period),
      contactRef,
      ns[0] ?? "",
      ns[1] ?? "",
      ns[2] ?? "",
      ns[3] ?? "",
      ns[4] ?? "",
    ]);

    let raw: string;
    try {
      raw = await soapCall("Domain_Register", fieldvalues, this.config);
    } catch (err) {
      return {
        domain,
        registered: false,
        error: this.errorMessage(err),
      };
    }

    if (!looksLikeSuccess(raw)) {
      return { domain, registered: false, raw, error: raw };
    }

    return {
      domain,
      registered: true,
      providerReference: this.extractReference(raw) ?? undefined,
      raw,
    };
  }

  /**
   * Renew an existing domain for `period` years.
   */
  async renew(domain: string, period: number = 1): Promise<RenewalResult> {
    const { sld, tld } = splitDomain(domain);
    const fieldvalues = pipeJoin([sld, tld, String(period)]);

    try {
      const raw = await soapCall("Domain_Renew", fieldvalues, this.config);
      return {
        domain,
        renewed: looksLikeSuccess(raw),
        raw,
        error: looksLikeSuccess(raw) ? undefined : raw,
      };
    } catch (err) {
      return { domain, renewed: false, error: this.errorMessage(err) };
    }
  }

  /**
   * Replace the nameservers for a domain.
   */
  async setNameservers(domain: string, nameservers: string[]): Promise<void> {
    if (nameservers.length < 2 || nameservers.length > 5) {
      throw new Error("setNameservers requires 2–5 nameservers");
    }
    const fieldvalues = pipeJoin([
      domain,
      nameservers[0],
      nameservers[1],
      nameservers[2] ?? "",
      nameservers[3] ?? "",
      nameservers[4] ?? "",
    ]);
    const raw = await soapCall("Domain_SetNameservers", fieldvalues, this.config);
    if (!looksLikeSuccess(raw)) {
      throw new Error(`setNameservers failed: ${raw}`);
    }
  }

  /**
   * Enable / disable auto-renewal on a domain.
   */
  async setAutoRenew(domain: string, enabled: boolean): Promise<void> {
    const fieldvalues = pipeJoin([domain, enabled ? "1" : "0"]);
    const raw = await soapCall("Domain_SetAutoRenew", fieldvalues, this.config);
    if (!looksLikeSuccess(raw)) {
      throw new Error(`setAutoRenew failed: ${raw}`);
    }
  }

  /**
   * Lock or unlock a domain (registrar-lock to prevent unauthorised transfers).
   */
  async setLock(domain: string, locked: boolean): Promise<void> {
    const fieldvalues = pipeJoin([domain, locked ? "1" : "0"]);
    const raw = await soapCall("Domain_SetLock", fieldvalues, this.config);
    if (!looksLikeSuccess(raw)) {
      throw new Error(`setLock failed: ${raw}`);
    }
  }

  /**
   * Send the auth (EPP) code to the registrant's email — used for transfer-out
   * when a customer cancels and wants to move their domain elsewhere.
   */
  async sendAuthCode(domain: string): Promise<void> {
    const raw = await soapCall("Domain_SendAuthCode", domain, this.config);
    if (!looksLikeSuccess(raw)) {
      throw new Error(`sendAuthCode failed: ${raw}`);
    }
  }

  /**
   * Get a single domain's full record.
   * Result format is undocumented — we return a best-effort DomainInfo with
   * raw response attached for inspection.
   */
  async getDomainInfo(domain: string): Promise<DomainInfo> {
    const raw = await soapCall("Domain_Select_Info", domain, this.config);

    // Try JSON first
    const parsed = parseJson<Record<string, unknown>>(raw);
    if (parsed && typeof parsed === "object") {
      return {
        domain,
        nameservers: this.extractNameservers(parsed),
        status: String(parsed.status ?? "unknown"),
        autoRenew: Boolean(parsed.autoRenew ?? parsed.autorenew),
        locked: Boolean(parsed.locked ?? parsed.lock),
        registeredAt: parsed.registeredAt as string | undefined,
        expiresAt: parsed.expiresAt as string | undefined,
        raw,
      };
    }

    // Fallback — empty struct with raw attached
    return {
      domain,
      nameservers: [],
      status: "unknown",
      autoRenew: false,
      locked: false,
      raw,
    };
  }

  /**
   * List all domains under our reseller account.
   */
  async listDomains(): Promise<string[]> {
    const raw = await soapCall("Domain_SelectAll", "", this.config);
    const parsed = parseJson<string[]>(raw);
    if (Array.isArray(parsed)) return parsed;

    // Fallback for non-JSON formats — assume newline or pipe-delimited
    return raw
      .split(/[\n|]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Internals
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Create a contact and return the reference Absolute Hosting uses to
   * identify it in subsequent calls. We always pass our `userReference` so
   * we can correlate later.
   *
   * Field order from API_GENERAL Contact_Add documentation:
   *   FirstName | LastName | Email | OrganisationName | AddressLine1 |
   *   AddressLine2 | City | Province | PostalCode | CountryCode | ContactNo
   *   | FaxNo | UserReference
   */
  private async upsertContact(contact: DomainContact): Promise<string> {
    const fieldvalues = pipeJoin([
      contact.firstName,
      contact.lastName,
      contact.email,
      contact.organisationName ?? "",
      contact.addressLine1,
      contact.addressLine2 ?? "",
      contact.city,
      contact.province,
      contact.postalCode,
      contact.countryCode,
      contact.contactNumber,
      contact.faxNumber ?? "",
      contact.userReference,
    ]);

    const raw = await soapCall("Contact_Add", fieldvalues, this.config);
    if (!looksLikeSuccess(raw)) {
      throw new Error(`Contact_Add failed: ${raw}`);
    }

    // The user reference is the most reliable thing to use as the contactRef
    // in Domain_Register — Absolute Hosting indexes contacts by this field.
    return contact.userReference;
  }

  private extractReference(raw: string): string | null {
    // Try JSON first
    const parsed = parseJson<{ id?: string; reference?: string; orderId?: string }>(raw);
    if (parsed) {
      return parsed.id ?? parsed.reference ?? parsed.orderId ?? null;
    }

    // Or a simple pipe-delimited "ok|orderId|expiry" pattern
    const parts = raw.split("|");
    if (parts.length >= 2 && parts[1].trim().length > 0) return parts[1].trim();

    return null;
  }

  private extractNameservers(parsed: Record<string, unknown>): string[] {
    const ns = parsed.nameservers ?? parsed.nameServer ?? parsed.ns;
    if (Array.isArray(ns)) return ns.map(String);
    if (typeof ns === "string") return ns.split(/[\s,]+/).filter(Boolean);
    return [];
  }

  private errorMessage(err: unknown): string {
    if (err instanceof SoapError) return err.message;
    if (err instanceof Error) return err.message;
    return String(err);
  }
}

/**
 * Domain registrar types — provider-agnostic.
 *
 * The Registrar interface (in ./index.ts) is what the rest of the app talks
 * to. Adapters (./absolute.ts for Absolute Hosting today, future ones for
 * Domains.co.za etc.) implement this interface.
 *
 * Keep this file free of any provider-specific concepts (no SOAP, no
 * pipe-delimited strings, no XML). Those belong in the adapter.
 */

export interface DomainContact {
  firstName: string;
  lastName: string;
  email: string;
  organisationName?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  province: string;
  postalCode: string;
  /** ISO 3166-1 alpha-2 country code, e.g. "ZA" */
  countryCode: string;
  contactNumber: string;
  faxNumber?: string;
  /** Caller-supplied stable reference (e.g. our customer/site UUID) */
  userReference: string;
}

export interface AvailabilityResult {
  domain: string;
  /** True only if WHOIS confirms it's available; false on taken or any error */
  available: boolean;
  /** Source of the determination ("zacr-whois" today). For future audit trails. */
  source: string;
  /** Raw WHOIS / API response — useful for debugging unexpected results */
  raw?: string;
  /** Set when we couldn't get a reliable answer */
  error?: string;
  /** Suggested alternatives when the requested name is taken */
  suggestions?: string[];
}

export interface RegistrationInput {
  /** Full domain name including TLD, e.g. "sarahshair.co.za" */
  domain: string;
  /** Registration period in years — most TLDs accept 1, 2, 5, 10 */
  period: 1 | 2 | 5 | 10;
  contact: DomainContact;
  /** 2–5 nameservers. If omitted the registrar uses its default DNS. */
  nameservers?: string[];
}

export interface RegistrationResult {
  domain: string;
  registered: boolean;
  /** Provider-side reference for this registration (for audit / support tickets) */
  providerReference?: string;
  /** Best-effort expiry date as ISO string, if the provider returned one */
  expiresAt?: string;
  raw?: string;
  error?: string;
}

export interface RenewalResult {
  domain: string;
  renewed: boolean;
  newExpiresAt?: string;
  raw?: string;
  error?: string;
}

export interface DomainInfo {
  domain: string;
  registrant?: DomainContact;
  nameservers: string[];
  /** "active" | "pendingTransfer" | "suspended" | "expired" | provider-specific */
  status: string;
  autoRenew: boolean;
  locked: boolean;
  registeredAt?: string;
  expiresAt?: string;
  raw?: string;
}

export interface RegistrarError extends Error {
  code:
    | "AUTH_FAILED"
    | "DOMAIN_TAKEN"
    | "DOMAIN_NOT_FOUND"
    | "NETWORK_ERROR"
    | "PROVIDER_ERROR"
    | "RATE_LIMITED"
    | "INVALID_INPUT";
  raw?: string;
  retryable: boolean;
}

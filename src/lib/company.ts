/**
 * Quicka — company-wide constants.
 *
 * SINGLE SOURCE OF TRUTH for legal entity details displayed across the site.
 * Update the values here and they propagate to every legal page (Terms,
 * Privacy, Refund, Contact, About, footer).
 *
 * ⚠️ BEFORE DEPLOYING TO PRODUCTION:
 * Replace every value marked TODO below with the exact details from your
 * CIPC certificate. PayFast's merchant review team checks that these match
 * their records — mismatches cause review failures.
 */

export const COMPANY = {
  // ─── Legal identity ────────────────────────────────────────────────
  // Trading name shown to customers
  tradingName: "Quicka",

  // Legal name as registered at CIPC
  // TODO: confirm — if the registered Pty Ltd name is different from
  //       the trading name (e.g. "Quicka Holdings (Pty) Ltd"), update.
  legalName: "Quicka",

  // CIPC registration number — exact format from the CIPC certificate
  // TODO: confirm the format. K-prefix indicates Close Corporation
  //       (typical format: K2016/112724/23). Pty Ltd would be 2016/112724/07.
  //       Andre provided "K2016112724" — formatted here as Close Corporation.
  cipcRegNumber: "K2016/112724/23",

  // Type label shown on legal pages alongside the registration number
  entityType: "Close Corporation" as "Close Corporation" | "(Pty) Ltd" | "Sole Proprietor",

  // VAT number — only set if VAT-registered (R1m turnover threshold)
  vatNumber: null as string | null,

  // ─── Contact ───────────────────────────────────────────────────────
  publicEmail: "hello@quicka.website",

  // Optional but adds trust on the contact / footer
  publicPhone: null as string | null,

  registeredAddress: {
    line1: "[REGISTERED OFFICE ADDRESS — UPDATE BEFORE DEPLOY]",
    line2: null as string | null,
    city: "Johannesburg",
    province: "Gauteng",
    postalCode: null as string | null,
    country: "South Africa",
  },

  // ─── Public-facing details ─────────────────────────────────────────
  website: "https://quicka.website",
  domain: "quicka.website",

  // ─── POPIA Information Officer ────────────────────────────────────
  // Register the IO with the Information Regulator (free, ~30 min):
  //   https://inforegulator.org.za/
  informationOfficer: {
    name: "Andre du Toit",
    email: "andre@quicka.website",
    title: "Founder & Information Officer",
  },

  // ─── Business context ─────────────────────────────────────────────
  founded: 2026,
  launchMarket: "South Africa",
  responseSla: "1 business day",
  governingLaw: "South Africa",
  jurisdiction: "Gauteng",

  // ─── Subscription pricing (ZAR, monthly) ──────────────────────────
  plans: {
    Basic: { name: "Basic", priceZar: 99, changesPerMonth: 5, blogPostsPerMonth: 0, items: 5 },
    Growth: { name: "Growth", priceZar: 149, changesPerMonth: 8, blogPostsPerMonth: 3, items: 8 },
    Business: { name: "Business", priceZar: 249, changesPerMonth: 10, blogPostsPerMonth: 5, items: 12 },
  },

  // ─── Site links ────────────────────────────────────────────────────
  links: {
    home: "/",
    build: "/build",
    about: "/about",
    terms: "/terms",
    privacy: "/privacy",
    refund: "/refund",
    contact: "/contact",
  },
} as const;

/** Address formatted as a single comma-separated string. */
export function formatAddress(): string {
  const a = COMPANY.registeredAddress;
  return [a.line1, a.line2, a.city, a.province, a.postalCode, a.country]
    .filter(Boolean)
    .join(", ");
}

/** Address formatted as multiple lines for layout (each non-null part on its own line). */
export function formatAddressLines(): string[] {
  const a = COMPANY.registeredAddress;
  const cityProvince = [a.city, a.province].filter(Boolean).join(", ");
  return [a.line1, a.line2, cityProvince, a.postalCode, a.country].filter(
    (x): x is string => Boolean(x)
  );
}

/** Detect leftover placeholders so we can fail fast in production. */
export function hasUnresolvedPlaceholders(): { ok: boolean; fields: string[] } {
  const fields: string[] = [];
  if (COMPANY.registeredAddress.line1.includes("[REGISTERED")) fields.push("registeredAddress.line1");
  return { ok: fields.length === 0, fields };
}

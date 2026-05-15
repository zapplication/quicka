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

  // Legal name as registered at CIPC.
  // Confirmed Pty Ltd by Andre.
  legalName: "Quicka (Pty) Ltd",

  // CIPC registration number — exact format from the CIPC certificate.
  // Confirmed Pty Ltd format (YYYY/NNNNNN/07) by Andre.
  cipcRegNumber: "2016/112724/07",

  // Type label shown on legal pages alongside the registration number
  entityType: "(Pty) Ltd" as "Close Corporation" | "(Pty) Ltd" | "Sole Proprietor",

  // VAT number — only set if VAT-registered (R1m turnover threshold)
  vatNumber: null as string | null,

  // ─── Contact ───────────────────────────────────────────────────────
  publicEmail: "hello@quicka.website",

  // Optional but adds trust on the contact / footer
  publicPhone: null as string | null,

  registeredAddress: {
    line1: "57 Aries Avenue",
    line2: "Sundowner" as string | null,
    city: "Johannesburg",
    province: "Gauteng",
    postalCode: "2188" as string | null,
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
  // `status` controls whether a plan can be selected at checkout.
  //   "live"         — fully available, plan can be selected and billed
  //   "coming_soon"  — visible on the site but disabled (Business has this
  //                    while the e-commerce platform isn't built yet)
  //
  // Flip Business from "coming_soon" → "live" the moment the online-store
  // feature ships. Both the landing pricing section and the build-flow plan
  // picker read from this single source.
  plans: {
    Basic: {
      name: "Basic",
      priceZar: 99,
      changesPerMonth: 5,
      blogPostsPerMonth: 0,
      items: 5,
      status: "live",
      tagline: "One clean page. Everything you need to get found online.",
      features: [
        "1-page site",
        "Custom .co.za domain",
        "SSL certificate",
        "Up to 5 services",
        "Contact form",
        "WhatsApp button",
        "5 changes/month",
      ],
    },
    Growth: {
      name: "Growth",
      priceZar: 149,
      changesPerMonth: 8,
      blogPostsPerMonth: 3,
      items: 8,
      status: "live",
      tagline: "More pages, blog and AI content to grow your reach.",
      features: [
        "5 pages",
        "Everything in Basic",
        "8 services",
        "AI content",
        "3 blog posts",
        "SEO setup",
        "8 changes/month",
      ],
    },
    Business: {
      name: "Business",
      priceZar: 249,
      changesPerMonth: 10,
      blogPostsPerMonth: 5,
      items: 12,
      status: "coming_soon",
      tagline: "Full online presence with store, gallery and ordering.",
      features: [
        "Everything in Growth",
        "12 services",
        "5 blog posts",
        "Photo gallery",
        "Online store (coming soon)",
        "10 changes/month",
        "Priority support",
      ],
    },
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

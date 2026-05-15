/**
 * Shared types and helpers for the /build flow.
 *
 * The build flow is a multi-step questionnaire that collects everything
 * needed to render a website preview. All collected data lives in memory
 * on the client; uploads go nowhere until Supabase Storage is wired in a
 * future PR.
 */

export type BusinessType = "Service" | "Product";

export interface BuildState {
  // Step 1 — lead
  email: string;

  // Step 2 — what kind of business
  businessType: BusinessType | null;

  // Step 3 — business name (slugifies to the .co.za domain)
  businessName: string;

  // Step 4 — location
  city: string;
  province: string;

  // Step 5 — what they do (drives AI-generated copy when AI lands)
  tagline: string;
  description: string;

  // Step 6 — logo (data URL only, no upload yet)
  logoDataUrl: string | null;

  // Step 7 — photos (data URLs, max 5)
  photoDataUrls: string[];
  useIndustryPhotos: boolean;

  // Step 8 — contact
  whatsappRaw: string;
  whatsappE164: string | null;

  // Generation + plan selection
  siteId: string | null;
  selectedPlan: "Basic" | "Growth" | null;
}

export function emptyBuildState(): BuildState {
  return {
    email: "",
    businessType: null,
    businessName: "",
    city: "",
    province: "",
    tagline: "",
    description: "",
    logoDataUrl: null,
    photoDataUrls: [],
    useIndustryPhotos: true,
    whatsappRaw: "",
    whatsappE164: null,
    siteId: null,
    selectedPlan: null,
  };
}

/**
 * Strip the business name down to a domain-safe slug.
 *   "Sarah's Hair Studio" → "sarahshairstudio"
 */
export function slugifyDomain(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 30);
}

/**
 * Normalize a South African mobile number to E.164 format.
 *   "082 123 4567"  → "+27821234567"
 *   "0821234567"    → "+27821234567"
 *   "27821234567"   → "+27821234567"
 *   "+27821234567"  → "+27821234567"
 *   anything else   → null
 */
export function normalizeE164(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("27") && digits.length === 11) return "+" + digits;
  if (digits.startsWith("0") && digits.length === 10) return "+27" + digits.slice(1);
  if (digits.length === 9 && /^[678]/.test(digits)) return "+27" + digits;
  return null;
}

/**
 * Strip surrounding whitespace and any HTML special characters from a user
 * string so it's safe to plop into the preview template. Doesn't try to be
 * a security boundary — the preview runs in a sandboxed iframe — but does
 * keep the template from breaking on stray `<` or `>` characters.
 */
export function sanitize(input: string): string {
  return input
    .trim()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

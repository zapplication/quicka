/**
 * PayFast integration — secure helper library
 * --------------------------------------------
 * Used for both outbound checkout (signing the form sent to PayFast) and
 * inbound IPN verification (signature + IP + echo-validate).
 *
 * Security model (do not weaken without good reason):
 *   1. The PASSPHRASE is used ONLY to compute the MD5 signature.
 *      It is NEVER sent to PayFast as a form field.
 *   2. Outbound: every field POSTed to PayFast is signed.
 *   3. Inbound: three independent checks must all pass before crediting:
 *        a) MD5 signature on the body matches recomputed signature
 *        b) Source IP is in PayFast's allowlist (resolved via DNS)
 *        c) Server-side echo-validate to PayFast returns "VALID"
 *
 * Reference: https://developers.payfast.co.za/docs#signature
 */

import crypto from "node:crypto";
import { promises as dns } from "node:dns";

// ───────────────────────────────────────────────────────────────────────────
// Configuration
// ───────────────────────────────────────────────────────────────────────────

export interface PayfastConfig {
  merchantId: string;
  merchantKey: string;
  passphrase: string;
  sandbox: boolean;
}

export function getPayfastConfig(): PayfastConfig {
  const merchantId = process.env.PAYFAST_MERCHANT_ID ?? "";
  const merchantKey = process.env.PAYFAST_MERCHANT_KEY ?? "";
  const passphrase = process.env.PAYFAST_PASSPHRASE ?? "";
  const sandbox = process.env.PAYFAST_SANDBOX === "true";

  if (!merchantId || !merchantKey) {
    throw new Error(
      "PayFast not configured: set PAYFAST_MERCHANT_ID and PAYFAST_MERCHANT_KEY"
    );
  }

  return { merchantId, merchantKey, passphrase, sandbox };
}

export const PAYFAST_PROCESS_URL = (sandbox: boolean) =>
  sandbox
    ? "https://sandbox.payfast.co.za/eng/process"
    : "https://www.payfast.co.za/eng/process";

export const PAYFAST_VALIDATE_URL = (sandbox: boolean) =>
  sandbox
    ? "https://sandbox.payfast.co.za/eng/query/validate"
    : "https://www.payfast.co.za/eng/query/validate";

// ───────────────────────────────────────────────────────────────────────────
// Signature
// ───────────────────────────────────────────────────────────────────────────

/**
 * PayFast's "pfOutput" string is built from form fields, in submission order,
 * URL-encoded with `+` for spaces (form-urlencoded style), with empty values
 * and the `signature` field itself omitted. The passphrase is appended last.
 *
 * Insertion order matters. Build the object in the same order you POST it.
 */
function buildPfOutput(
  data: Record<string, string | number | undefined | null>,
  passphrase?: string
): string {
  const pairs: string[] = [];

  for (const [key, raw] of Object.entries(data)) {
    if (key === "signature") continue;
    if (raw === undefined || raw === null) continue;
    const value = String(raw).trim();
    if (value === "") continue;
    const encoded = encodeURIComponent(value).replace(/%20/g, "+");
    pairs.push(`${key}=${encoded}`);
  }

  let pfOutput = pairs.join("&");

  if (passphrase && passphrase.trim() !== "") {
    pfOutput += `&passphrase=${encodeURIComponent(passphrase.trim()).replace(
      /%20/g,
      "+"
    )}`;
  }

  return pfOutput;
}

export function signPayload(
  data: Record<string, string | number | undefined | null>,
  passphrase?: string
): string {
  const pfOutput = buildPfOutput(data, passphrase);
  return crypto.createHash("md5").update(pfOutput).digest("hex");
}

/**
 * Verify an inbound signature: re-build the canonical string from the data
 * we received, hash it, and compare in constant time to the supplied signature.
 */
export function verifySignature(
  data: Record<string, string>,
  suppliedSignature: string,
  passphrase?: string
): boolean {
  const expected = signPayload(data, passphrase);
  return safeEqual(expected, suppliedSignature);
}

function safeEqual(a: string, b: string): boolean {
  const aBuf = Buffer.from(a, "utf8");
  const bBuf = Buffer.from(b, "utf8");
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

// ───────────────────────────────────────────────────────────────────────────
// Outbound: build a signed checkout payload
// ───────────────────────────────────────────────────────────────────────────

export interface CheckoutInput {
  amount: number;            // monthly amount in ZAR (first charge)
  itemName: string;          // e.g. "Quicka Growth Plan"
  itemDescription: string;
  mPaymentId: string;        // your unique reference for this transaction
  emailAddress: string;
  nameFirst?: string;
  nameLast?: string;
  customStr1?: string;       // commonly: site_id
  customStr2?: string;       // commonly: plan name
  customStr3?: string;
  customStr4?: string;
  customStr5?: string;
  returnUrl: string;
  cancelUrl: string;
  notifyUrl: string;
  // Subscription fields (omit for one-time payments)
  subscription?: {
    recurringAmount: number;       // monthly recurring in ZAR
    frequency: 3 | 4 | 5 | 6;       // 3 = monthly, 4 = quarterly, 5 = biannual, 6 = annual
    cycles: number;                 // 0 = indefinite
    billingDate?: string;            // YYYY-MM-DD; defaults to today
  };
}

/**
 * Returns a signed, ordered field set ready to be POSTed to PAYFAST_PROCESS_URL
 * via an auto-submitting HTML form.
 */
export function buildCheckoutFields(
  input: CheckoutInput
): { url: string; fields: Record<string, string> } {
  const cfg = getPayfastConfig();

  // Order matters for signature stability. Keep this list canonical.
  const fields: Record<string, string> = {
    merchant_id: cfg.merchantId,
    merchant_key: cfg.merchantKey,
    return_url: input.returnUrl,
    cancel_url: input.cancelUrl,
    notify_url: input.notifyUrl,
    name_first: input.nameFirst ?? "",
    name_last: input.nameLast ?? "",
    email_address: input.emailAddress,
    m_payment_id: input.mPaymentId,
    amount: input.amount.toFixed(2),
    item_name: input.itemName.slice(0, 100),
    item_description: input.itemDescription.slice(0, 255),
    custom_str1: input.customStr1 ?? "",
    custom_str2: input.customStr2 ?? "",
    custom_str3: input.customStr3 ?? "",
    custom_str4: input.customStr4 ?? "",
    custom_str5: input.customStr5 ?? "",
  };

  if (input.subscription) {
    Object.assign(fields, {
      subscription_type: "1",
      billing_date:
        input.subscription.billingDate ??
        new Date().toISOString().slice(0, 10),
      recurring_amount: input.subscription.recurringAmount.toFixed(2),
      frequency: String(input.subscription.frequency),
      cycles: String(input.subscription.cycles),
    });
  }

  // Strip empty values BEFORE signing to match PayFast's pfOutput rules.
  const nonEmpty: Record<string, string> = {};
  for (const [k, v] of Object.entries(fields)) {
    if (v !== "" && v !== undefined && v !== null) nonEmpty[k] = v;
  }

  const signature = signPayload(nonEmpty, cfg.passphrase);
  nonEmpty.signature = signature;

  return { url: PAYFAST_PROCESS_URL(cfg.sandbox), fields: nonEmpty };
}

// ───────────────────────────────────────────────────────────────────────────
// Inbound IPN: IP allowlist
// ───────────────────────────────────────────────────────────────────────────

const PAYFAST_HOSTS = [
  "www.payfast.co.za",
  "w1w.payfast.co.za",
  "w2w.payfast.co.za",
  "sandbox.payfast.co.za",
];

const IP_CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
let ipCache: { ips: Set<string>; cachedAt: number } | null = null;

/**
 * Resolve PayFast hostnames to IP addresses (cached for 1 hour).
 *
 * PayFast publishes a small set of source IPs but uses DNS as the
 * authoritative source. This is the recommended approach.
 */
export async function getPayfastIpAllowlist(): Promise<Set<string>> {
  const now = Date.now();
  if (ipCache && now - ipCache.cachedAt < IP_CACHE_TTL_MS) {
    return ipCache.ips;
  }

  const ips = new Set<string>();
  await Promise.all(
    PAYFAST_HOSTS.map(async (host) => {
      try {
        const addrs = await dns.resolve4(host);
        for (const ip of addrs) ips.add(ip);
      } catch (e) {
        // Don't throw — if a single host fails to resolve, we still want the
        // others. We log but don't treat this as a security failure.
        console.warn(`[payfast] DNS resolution failed for ${host}:`, e);
      }
    })
  );

  ipCache = { ips, cachedAt: now };
  return ips;
}

export async function isPayfastIp(ip: string): Promise<boolean> {
  const allowlist = await getPayfastIpAllowlist();
  return allowlist.has(ip);
}

// ───────────────────────────────────────────────────────────────────────────
// Inbound IPN: server-side echo-validate
// ───────────────────────────────────────────────────────────────────────────

/**
 * Echoes the entire received payload back to PayFast and confirms the
 * response is "VALID". This catches replay/forgery attempts that somehow
 * passed signature + IP checks.
 *
 * We MUST NOT include our passphrase in this echo POST.
 */
export async function echoValidate(
  rawData: Record<string, string>,
  sandbox: boolean
): Promise<boolean> {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(rawData)) {
    params.append(k, v);
  }

  try {
    const response = await fetch(PAYFAST_VALIDATE_URL(sandbox), {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });
    const text = (await response.text()).trim();
    return text === "VALID";
  } catch (e) {
    console.error("[payfast] echoValidate request failed:", e);
    return false;
  }
}

// ───────────────────────────────────────────────────────────────────────────
// Composite verifier
// ───────────────────────────────────────────────────────────────────────────

export interface IpnVerificationResult {
  ok: boolean;
  reason?:
    | "missing_signature"
    | "signature_mismatch"
    | "ip_not_allowlisted"
    | "echo_invalid"
    | "merchant_id_mismatch"
    | "amount_mismatch";
  details?: Record<string, unknown>;
}

export interface IpnVerifyOptions {
  /** Fail if merchant_id in the IPN doesn't match the env. Strongly recommended. */
  checkMerchantId?: boolean;
  /** Optional: known expected amount (R) for this m_payment_id from your DB. */
  expectedAmountZar?: number;
}

/**
 * Run all three security checks. Pass an options object to add the merchant_id
 * and amount-from-DB checks where applicable.
 */
export async function verifyIpn(
  rawData: Record<string, string>,
  sourceIp: string,
  options: IpnVerifyOptions = { checkMerchantId: true }
): Promise<IpnVerificationResult> {
  const cfg = getPayfastConfig();
  const supplied = rawData.signature;

  if (!supplied) {
    return { ok: false, reason: "missing_signature" };
  }

  // 1. Recompute signature from received fields (excluding 'signature' itself)
  const dataForSig: Record<string, string> = { ...rawData };
  delete dataForSig.signature;
  if (!verifySignature(dataForSig, supplied, cfg.passphrase)) {
    return { ok: false, reason: "signature_mismatch" };
  }

  // 2. IP allowlist
  if (!(await isPayfastIp(sourceIp))) {
    return {
      ok: false,
      reason: "ip_not_allowlisted",
      details: { sourceIp },
    };
  }

  // 3. Echo-validate
  if (!(await echoValidate(rawData, cfg.sandbox))) {
    return { ok: false, reason: "echo_invalid" };
  }

  // 4. Optional: merchant_id sanity check
  if (options.checkMerchantId && rawData.merchant_id !== cfg.merchantId) {
    return {
      ok: false,
      reason: "merchant_id_mismatch",
      details: {
        received: rawData.merchant_id,
        expected: cfg.merchantId,
      },
    };
  }

  // 5. Optional: amount-from-DB check (defends against altered amount attacks)
  if (typeof options.expectedAmountZar === "number") {
    const received = parseFloat(rawData.amount_gross ?? rawData.amount ?? "0");
    if (Math.abs(received - options.expectedAmountZar) > 0.01) {
      return {
        ok: false,
        reason: "amount_mismatch",
        details: { received, expected: options.expectedAmountZar },
      };
    }
  }

  return { ok: true };
}

// ───────────────────────────────────────────────────────────────────────────
// Helpers
// ───────────────────────────────────────────────────────────────────────────

/**
 * Convert a Next.js Request's headers to the best-guess client IP.
 * Vercel and Cloudflare both populate `x-forwarded-for` (first entry = client).
 */
export function clientIpFromHeaders(headers: Headers): string {
  const xff = headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return headers.get("x-real-ip") ?? "";
}

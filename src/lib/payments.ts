/**
 * Payment persistence — interface to your DB layer.
 *
 * This is intentionally a thin abstraction so the PayFast webhook can be
 * security-correct today and Supabase-wired tomorrow without changing
 * either side.
 *
 * REPLACE the function bodies with real Supabase calls when the DB lands.
 * The schema below is what the webhook expects; align your `payments` and
 * `sites` tables to it.
 *
 *   payments (
 *     m_payment_id     text primary key,         -- our reference
 *     pf_payment_id    text,                      -- PayFast's reference (unique per attempt)
 *     site_id          uuid references sites(id),
 *     plan             text,
 *     amount_gross     numeric(10,2),
 *     amount_fee       numeric(10,2),
 *     amount_net       numeric(10,2),
 *     payment_status   text,                      -- COMPLETE | FAILED | CANCELLED
 *     subscription_token text,                    -- only set for subscription transactions
 *     billing_period_start timestamptz,
 *     billing_period_end   timestamptz,
 *     received_at      timestamptz default now(),
 *     processed_at     timestamptz,
 *     raw              jsonb                      -- full IPN payload, for audit
 *   )
 */

export interface PaymentRecord {
  mPaymentId: string;
  pfPaymentId: string | null;
  siteId: string | null;
  plan: string | null;
  amountGross: number;
  amountFee: number;
  amountNet: number;
  paymentStatus: "COMPLETE" | "FAILED" | "CANCELLED" | string;
  subscriptionToken: string | null;
  raw: Record<string, string>;
}

export interface PaymentLookupResult {
  exists: boolean;
  alreadyProcessed: boolean;
  expectedAmountZar?: number;
}

/**
 * Look up a payment by m_payment_id.
 *
 * Used to:
 *   1. Prevent double-processing on PayFast retries (idempotency).
 *   2. Cross-check the amount we expected vs. what arrived.
 */
export async function findPayment(
  mPaymentId: string
): Promise<PaymentLookupResult> {
  // TODO(supabase): replace with real query
  // const { data } = await supabase
  //   .from("payments")
  //   .select("processed_at, expected_amount")
  //   .eq("m_payment_id", mPaymentId)
  //   .maybeSingle();
  // return {
  //   exists: !!data,
  //   alreadyProcessed: !!data?.processed_at,
  //   expectedAmountZar: data?.expected_amount,
  // };
  console.warn(
    `[payments][stub] findPayment(${mPaymentId}) — wire Supabase before launch`
  );
  return { exists: false, alreadyProcessed: false };
}

/**
 * Record a verified payment. Call ONLY after verifyIpn returns ok.
 *
 * Idempotency: must be safe to call twice with the same mPaymentId.
 * Use an upsert pattern.
 */
export async function recordPayment(record: PaymentRecord): Promise<void> {
  // TODO(supabase): replace with real upsert
  // await supabase.from("payments").upsert({
  //   m_payment_id: record.mPaymentId,
  //   pf_payment_id: record.pfPaymentId,
  //   site_id: record.siteId,
  //   plan: record.plan,
  //   amount_gross: record.amountGross,
  //   amount_fee: record.amountFee,
  //   amount_net: record.amountNet,
  //   payment_status: record.paymentStatus,
  //   subscription_token: record.subscriptionToken,
  //   raw: record.raw,
  //   processed_at: new Date().toISOString(),
  // });
  console.log("[payments][stub] recordPayment", {
    mPaymentId: record.mPaymentId,
    pfPaymentId: record.pfPaymentId,
    status: record.paymentStatus,
    amount: record.amountGross,
    plan: record.plan,
  });
}

/**
 * Mark a site as paid / active after a successful first payment.
 * Subsequent recurring payments reuse the same site_id.
 */
export async function activateSite(siteId: string, plan: string): Promise<void> {
  // TODO(supabase): replace with real update
  // await supabase.from("sites").update({
  //   status: "active",
  //   plan,
  //   activated_at: new Date().toISOString(),
  // }).eq("id", siteId);
  console.log("[payments][stub] activateSite", { siteId, plan });
}

/**
 * Mark a site as suspended / payment-failed.
 */
export async function suspendSite(siteId: string, reason: string): Promise<void> {
  // TODO(supabase): replace with real update
  console.log("[payments][stub] suspendSite", { siteId, reason });
}

/**
 * Optional: append to a security_log table for audit/investigation.
 * Useful for traceability when something looks off.
 */
export async function logSecurityEvent(event: {
  level: "info" | "warn" | "error";
  endpoint: string;
  reason?: string;
  ip?: string;
  details?: Record<string, unknown>;
}): Promise<void> {
  // TODO(supabase): replace with real insert
  const tag = event.level === "error" ? "[security][error]" :
              event.level === "warn"  ? "[security][warn]"  :
                                          "[security][info]";
  console.log(tag, event);
}

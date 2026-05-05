/**
 * POST /api/webhook/payfast
 *
 * PayFast Instant Transaction Notification (IPN) handler.
 * Three independent verification layers must all pass before we record
 * a payment as completed:
 *
 *   1. MD5 signature on the body matches recomputed signature
 *   2. Source IP is in PayFast's DNS-published allowlist
 *   3. Server-side echo to PayFast returns "VALID"
 *
 * We always return HTTP 200 to PayFast (even on internal errors) so they
 * stop retrying — but we only credit the customer when verification passes.
 *
 * Note: this is a Node runtime route because it uses node:crypto and
 *       node:dns via the helper library.
 */

import { NextRequest, NextResponse } from "next/server";
import {
  verifyIpn,
  clientIpFromHeaders,
} from "@/lib/payfast";
import {
  findPayment,
  recordPayment,
  activateSite,
  suspendSite,
  logSecurityEvent,
} from "@/lib/payments";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const sourceIp = clientIpFromHeaders(req.headers);
  let raw: Record<string, string> = {};

  try {
    const formData = await req.formData();
    for (const [k, v] of formData.entries()) {
      raw[k] = String(v);
    }
  } catch (e) {
    await logSecurityEvent({
      level: "warn",
      endpoint: "payfast-webhook",
      reason: "malformed_body",
      ip: sourceIp,
      details: { error: String(e) },
    });
    // Tell PayFast we got it (no retry). Don't credit anyone.
    return new NextResponse("OK", { status: 200 });
  }

  const mPaymentId = raw.m_payment_id ?? "unknown";

  // Idempotency: if we've already processed this transaction, ack and stop.
  const lookup = await findPayment(mPaymentId);
  if (lookup.alreadyProcessed) {
    await logSecurityEvent({
      level: "info",
      endpoint: "payfast-webhook",
      reason: "duplicate_already_processed",
      ip: sourceIp,
      details: { mPaymentId },
    });
    return new NextResponse("OK", { status: 200 });
  }

  // Run all three verification layers (and the optional amount cross-check
  // if our DB knows what we expect).
  const verification = await verifyIpn(raw, sourceIp, {
    checkMerchantId: true,
    expectedAmountZar: lookup.expectedAmountZar,
  });

  if (!verification.ok) {
    await logSecurityEvent({
      level: "error",
      endpoint: "payfast-webhook",
      reason: verification.reason,
      ip: sourceIp,
      details: {
        mPaymentId,
        ...(verification.details ?? {}),
        // Avoid logging the full payload — it contains customer PII.
        receivedFields: Object.keys(raw),
      },
    });
    return new NextResponse("OK", { status: 200 });
  }

  // ───────── verification passed ─────────
  const status = (raw.payment_status ?? "").toUpperCase();
  const siteId = raw.custom_str1 || null;
  const plan = raw.custom_str2 || null;

  const amountGross = parseFloat(raw.amount_gross ?? "0");
  const amountFee = parseFloat(raw.amount_fee ?? "0");
  const amountNet = parseFloat(raw.amount_net ?? "0");

  await recordPayment({
    mPaymentId,
    pfPaymentId: raw.pf_payment_id ?? null,
    siteId,
    plan,
    amountGross,
    amountFee,
    amountNet,
    paymentStatus: status,
    subscriptionToken: raw.token ?? null,
    raw,
  });

  if (status === "COMPLETE" && siteId && plan) {
    await activateSite(siteId, plan);
    // TODO(resend): trigger welcome email + "your site is being generated" email
  } else if (status === "FAILED" && siteId) {
    await suspendSite(siteId, "payment_failed");
    // TODO(resend): trigger payment-failed email with retry link
  } else if (status === "CANCELLED" && siteId) {
    await suspendSite(siteId, "subscription_cancelled");
    // TODO(resend): trigger cancellation confirmation email
  }

  return new NextResponse("OK", { status: 200 });
}

// Optional GET handler so manual `curl` checks return something friendly,
// without exposing config.
export async function GET() {
  return NextResponse.json({ status: "ok" });
}

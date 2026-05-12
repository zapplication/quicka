/**
 * POST /api/checkout
 *
 * Server-only endpoint that builds a signed PayFast payload for a given
 * plan + site. The merchant_key and passphrase NEVER leave the server.
 *
 * Returns: { url, fields } — the client posts these to PayFast as a form.
 */

import { NextRequest, NextResponse } from "next/server";
import { buildCheckoutFields } from "@/lib/payfast";

// Force Node runtime — we use crypto and dns elsewhere in the same module tree.
export const runtime = "nodejs";

// Plan registry (single source of truth — keep this in sync with /lib/constants
// when you extract it).
const PLANS = {
  Basic:    { price: 99,  blogs: 0 },
  Growth:   { price: 149, blogs: 3 },
  Business: { price: 249, blogs: 5 },
} as const;

type PlanName = keyof typeof PLANS;

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://quicka.website";

interface CheckoutBody {
  plan: PlanName;
  email: string;
  bizName: string;
  siteId: string;
  // Optional once-off / recurring upsells; off by default.
  emailUpsell?: boolean;        // hello@yourbusiness.co.za (recurring add-on)
  logoUpsell?: boolean;         // AI-generated logo (once-off)
}

const EMAIL_UPSELL_PRICE_PER_MONTH = 29;
const LOGO_UPSELL_ONCEOFF = 149;

export async function POST(req: NextRequest) {
  let body: CheckoutBody;
  try {
    body = (await req.json()) as CheckoutBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { plan, email, bizName, siteId, emailUpsell, logoUpsell } = body;

  if (!plan || !PLANS[plan]) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }
  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }
  if (!siteId) {
    return NextResponse.json({ error: "Missing siteId" }, { status: 400 });
  }

  const planData = PLANS[plan];
  const monthlyTotal = planData.price + (emailUpsell ? EMAIL_UPSELL_PRICE_PER_MONTH : 0);
  const onceOff = logoUpsell ? LOGO_UPSELL_ONCEOFF : 0;
  const firstChargeAmount = monthlyTotal + onceOff;

  // Build a unique m_payment_id we can later reconcile against.
  const mPaymentId = `quicka_${siteId}_${Date.now()}`;

  // Use plan-specific item name for clarity on bank statements.
  const itemNameSuffix = emailUpsell ? " + Email" : "";
  const itemName = `Quicka ${plan} Plan${itemNameSuffix}`;
  const itemDescription = `Monthly Quicka subscription — ${plan} plan${
    onceOff ? ` + once-off AI logo (R${LOGO_UPSELL_ONCEOFF})` : ""
  }`;

  try {
    const { url, fields } = buildCheckoutFields({
      amount: firstChargeAmount,
      itemName,
      itemDescription,
      mPaymentId,
      emailAddress: email,
      nameFirst: bizName.slice(0, 100),
      customStr1: siteId,
      customStr2: plan,
      customStr3: emailUpsell ? "email_upsell" : "",
      customStr4: logoUpsell ? "logo_upsell" : "",
      returnUrl: `${SITE_URL}/payment/success?site=${encodeURIComponent(siteId)}`,
      cancelUrl: `${SITE_URL}/payment/cancel?site=${encodeURIComponent(siteId)}`,
      notifyUrl: `${SITE_URL}/api/webhook/payfast`,
      subscription: {
        recurringAmount: monthlyTotal,
        frequency: 3, // monthly
        cycles: 0,     // indefinite
      },
    });

    // TODO(supabase): record this as a pending payment with expected_amount =
    // firstChargeAmount, so the webhook can verify-amount on receipt.
    // await supabase.from("payments").insert({
    //   m_payment_id: mPaymentId,
    //   site_id: siteId,
    //   plan,
    //   expected_amount: firstChargeAmount,
    //   payment_status: "PENDING",
    // });

    return NextResponse.json({ url, fields });
  } catch (error) {
    console.error("[checkout] failed:", error);
    return NextResponse.json(
      { error: "Failed to build checkout" },
      { status: 500 }
    );
  }
}

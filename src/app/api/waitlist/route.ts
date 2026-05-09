import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/waitlist
 *
 * Accepts { email, tier } from the WaitlistForm component on the homepage.
 * For v1 alpha, captures the lead by logging to Vercel logs only.
 * Andre can read these via `vercel logs --grep waitlist` or the Vercel dashboard.
 *
 * When PR #6 lands (Supabase + Resend), extend this handler to:
 *   1. Persist {email, tier, ts, ip} to a `waitlist` table in Supabase
 *   2. Send a confirmation email to the prospect via Resend
 *   3. Send a notification email to Andre at andre@quicka.website
 *
 * Until then: log + 200 is honest enough — emails are recoverable from logs
 * and Andre can manually follow up with anyone who registers interest.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALLOWED_TIERS = new Set(["Growth", "Business"]);

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const { email, tier } =
    (body as { email?: string; tier?: string }) ?? {};

  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "invalid_email" }, { status: 400 });
  }
  if (!tier || !ALLOWED_TIERS.has(tier)) {
    return NextResponse.json({ error: "invalid_tier" }, { status: 400 });
  }

  // v1 alpha capture — readable via Vercel logs.
  // Format chosen to be greppable: `[waitlist] tier=Growth email=foo@bar.co.za`
  console.log(
    `[waitlist] tier=${tier} email=${email} ts=${new Date().toISOString()}`,
  );

  return NextResponse.json({ ok: true });
}

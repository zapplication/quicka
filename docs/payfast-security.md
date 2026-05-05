# PayFast security fix — drop-in replacement

This package replaces Quicka's current PayFast integration with one that is
production-safe. It addresses three security issues in the existing code:

| Existing issue | Fix |
|---|---|
| `src/lib/payfast.ts` builds a URL with raw query params; PayFast actually requires a form POST with MD5 signature | New `buildCheckoutFields()` returns a signed field set; client posts via auto-submitting form |
| Passphrase is sent to PayFast as a form field | Passphrase is now used **only** to compute the MD5 signature, never transmitted |
| IPN handler at `/api/payment/notify` only checks `merchant_id` (spoofable) | New `/api/webhook/payfast` runs three independent checks: signature, IP allowlist, and server-side echo-validate |

## Files in this package

```
src/lib/payfast.ts                     # core helper (sign / verify / IP / echo)
src/lib/payments.ts                    # DB-facing stub (replace with Supabase later)
src/app/api/checkout/route.ts          # POST endpoint: builds signed payload
src/app/api/webhook/payfast/route.ts   # POST endpoint: IPN handler with full security
src/components/PayfastForm.tsx         # client auto-submit form
.env.example                           # required env vars
scripts/test-signature.mjs             # standalone signature sanity check
```

## Installation

```bash
# 1. Copy these files into your repo.
#    Delete the OLD payment notify path: src/app/api/payment/notify/
#    Replace src/lib/payfast.ts entirely.

# 2. Install no new packages required for the security fix itself —
#    everything uses Node built-ins (crypto, dns).

# 3. Set env vars locally:
cp .env.example .env.local
#    The .env.example values are PayFast's published sandbox demo credentials.
#    For production, set PAYFAST_SANDBOX=false and use your own keys (in
#    Vercel/Cloudflare env, NOT in the repo).

# 4. (Optional) verify the signature builder still produces valid output:
node scripts/test-signature.mjs
```

## How the new flow works

```
[Customer in /build]
    │
    │ 1. Click "Build my preview" / "Pay now"
    ▼
[POST /api/checkout]   ← server, holds passphrase
    │ builds: signed PayFast field set
    │ returns: { url, fields }
    ▼
[Client renders PayfastForm]
    │ <form method="POST" action="https://(sandbox.)payfast.co.za/eng/process">
    │   <input type="hidden" name=... value=... />  (one per signed field)
    ▼
[Customer at PayFast]
    │ enters card / EFT details, completes payment
    │
    │  ┌─── 2a. Browser redirected to /payment/success or /payment/cancel
    │  │
    │  └─── 2b. Server-to-server IPN fired in parallel:
    │           POST /api/webhook/payfast
    ▼
[/api/webhook/payfast]
    │ a) recompute MD5 signature, compare to body.signature
    │ b) DNS-resolve PayFast hosts, check source IP is allowlisted
    │ c) POST entire payload back to PayFast /eng/query/validate
    │    → must return "VALID"
    │ d) optional: cross-check amount against expected (when DB knows)
    ▼
[All three pass]   →   recordPayment() + activateSite()
[Any fail]         →   logSecurityEvent() + return 200 (no credit)
```

## Critical correctness rules

1. **Order in `buildCheckoutFields` matches the form POST order.**
   PayFast computes the signature from fields in the order they appear in
   the form. The helper preserves Object insertion order so this works,
   but if you reorder the fields in either side you'll break signing —
   the `nonEmpty` map and the `<form>` render must use the same iteration.

2. **The webhook always returns HTTP 200.**
   PayFast retries up to 10 times if it doesn't get 200 (with exponential
   backoff). Returning 4xx/5xx on a malformed or invalid request invites
   a flood of retries. Instead we log and ack.

3. **Idempotency.**
   PayFast can legitimately send the same IPN twice (network retries).
   The webhook's first action is `findPayment(mPaymentId)` to skip
   already-processed payments. When you wire Supabase, make sure
   `recordPayment` is an upsert keyed on `m_payment_id`.

4. **The Node.js runtime is required for the webhook.**
   It uses `node:crypto` and `node:dns`. Vercel uses Node by default for
   App Router routes — but if you have `export const runtime = "edge"`
   anywhere in the route file or its parents, the webhook will fail at
   build time. Each route file in this package explicitly sets
   `export const runtime = "nodejs"` to be safe.

## Testing in the PayFast sandbox

PayFast's sandbox has documented test cards and bank credentials:

| Channel | Test value | Result |
|---|---|---|
| Visa | 4000000000000002 | Success |
| Mastercard | 5200000000000007 | Success |
| Test EFT | use sandbox login (any) | Success |

Steps:

1. Make sure `PAYFAST_SANDBOX=true` in `.env.local`.
2. Start your dev server: `npm run dev`.
3. **The webhook needs to be reachable from the public internet**
   (PayFast's IPN servers can't see `localhost`). Use ngrok:
   ```bash
   ngrok http 3000
   ```
   Set `NEXT_PUBLIC_SITE_URL=https://your-ngrok-id.ngrok-free.app` in
   `.env.local` so `notify_url` points to the ngrok tunnel. Restart
   `npm run dev` after changing the env file.
4. From `/build`, complete the flow → click pay → use a test card → return.
5. Check your dev console for `[payments][stub] recordPayment` entries.
6. Try a tampering test:
   ```bash
   curl -X POST https://your-ngrok-id.ngrok-free.app/api/webhook/payfast \
     -d 'merchant_id=10000100&payment_status=COMPLETE&amount_gross=99.00'
   ```
   This SHOULD log `signature_mismatch` (or `missing_signature`) and not
   credit anyone. If it credits a payment, something is wrong — stop and
   investigate before going further.

## Going to production

Before flipping `PAYFAST_SANDBOX=false`:

- [ ] Get production merchant credentials from your PayFast dashboard
- [ ] Set them in **Vercel project env vars**, not in the repo
- [ ] Confirm your registered notify URL is `https://quicka.website/api/webhook/payfast`
- [ ] Run end-to-end on a real R5 test transaction (refund yourself afterwards)
- [ ] Verify the IP allowlist works: trigger one real IPN, then check the
      log shows the source IP matches `dns.resolve4("www.payfast.co.za")`
- [ ] Make sure `recordPayment` and `activateSite` are wired to real
      Supabase queries (the stubs in `src/lib/payments.ts` are TODO markers)

## What's NOT covered here

These are deliberately deferred — fix them in their own dedicated change so
you can review each in isolation:

- The PayFast subscription cancellation API (separate from the IPN flow)
- Recurring billing failure handling (PayFast retries; you may also want to
  email the customer with a payment-update link)
- POPIA: privacy notice, Information Officer registration, DPAs with
  Supabase / Resend / Cloudflare / PayFast
- Audit log table (`security_log`) — currently `logSecurityEvent` writes
  to `console.log`; wire it to Supabase when the DB is up

## Why we changed the path from `/api/payment/notify` to `/api/webhook/payfast`

Two reasons:

1. The blueprint at the repo root (`Quicka_NextJS_API_Blog.jsx`) already
   uses `webhook/payfast`, so this aligns the actual code with the spec.
2. "Webhook" describes what this is — a server-to-server callback — more
   accurately than "payment notify" (which sounds like a UI page).

If you have a registered PayFast account already pointing at the old path,
either update the notify URL in PayFast's dashboard, or keep a thin
forwarder at `src/app/api/payment/notify/route.ts` for transition.

## Need to roll back?

Save your current `src/lib/payfast.ts` and `src/app/api/payment/notify/`
as a separate commit before applying this change. The new code is
self-contained — reverting the commit cleanly restores the prior state.

# PayFast Review Checklist — `quicka.website`

A one-page summary you can attach to the PayFast support ticket that requests
the upgrade from individual to company merchant account. Walks the reviewer
through exactly what to verify and where.

## What to send the reviewer

> Subject: Merchant upgrade — individual to company — quicka.website
>
> Hi PayFast team,
>
> I'd like to upgrade my merchant account from individual to company. The
> Pty Ltd / Close Corporation that should hold the account is **Quicka**
> (registration **K2016/112724/23**), registered office **[ADDRESS]**.
> Information Officer: Andre du Toit.
>
> The live site is at https://quicka.website. Pages relevant to your review:
>
> - Home: https://quicka.website
> - About / company details: https://quicka.website/about
> - Terms of Service: https://quicka.website/terms
> - Privacy Policy (POPIA): https://quicka.website/privacy
> - Refund & Cancellation: https://quicka.website/refund
> - Contact: https://quicka.website/contact
> - End-to-end checkout demo: https://quicka.website/build (5 quick questions, then redirects to your sandbox)
>
> Attached: CIPC certificate, ID, proof of bank account in company name.
>
> Andre du Toit
> Founder

## Reviewer checklist (what they look for, where it lives)

| What PayFast verifies | Where on the site |
|---|---|
| Legal entity name matches CIPC | Footer of every page; `/about` &ldquo;Company details&rdquo; section |
| Registration number visible | Footer of every page; `/about` |
| Registered office address | `/about` and `/contact` |
| Information Officer named | `/privacy` and `/about` |
| Clear product description | Home page hero + How it works section |
| Clear pricing in ZAR | Home page Pricing section + `/build` step 4 |
| Terms of Service | `/terms` (linked from footer + `/build` step 5) |
| Privacy Policy referencing POPIA | `/privacy` (linked from footer + `/build` step 5) |
| Refund / Cancellation policy | `/refund` (linked from footer + `/payment/success`) |
| Working contact email | `mailto:hello@quicka.website` linked from footer, `/contact`, `/about` |
| Working PayFast integration | `/build` → 5 steps → &ldquo;Continue to PayFast&rdquo; → real PayFast checkout |
| Return URLs configured | After payment: `/payment/success` (with success messaging); after cancel: `/payment/cancel` (clearly states no charge) |
| IPN endpoint configured | `https://quicka.website/api/webhook/payfast` (set in your merchant settings) |

## A few things worth knowing

- **&ldquo;Demo Mode&rdquo; banner on `/build`.** While the merchant upgrade is in
  review and AI generation isn&apos;t yet shipping live customer sites, the build
  flow shows a small banner at the top explaining this. The PayFast integration
  itself is fully functional — it&apos;s only the post-payment AI generation step
  that&apos;s pending.
- **Supabase, Resend, Cloudflare** are listed as future processors in the
  Privacy Policy. They&apos;re mentioned ahead of going live so the policy is
  ready when those services are wired up. Until they are, no customer data
  reaches them.
- **All processors named in Privacy Policy.** The policy lists every Operator
  in the data flow (PayFast, Vercel, Cloudflare, Supabase, Resend, Anthropic,
  Absolute Hosting) and explicitly addresses cross-border transfers under
  section 72 of POPIA.

## After approval

Once the merchant upgrade is approved:

1. Switch `PAYFAST_SANDBOX=false` in Vercel environment variables.
2. Update `PAYFAST_MERCHANT_ID` / `PAYFAST_MERCHANT_KEY` / `PAYFAST_PASSPHRASE`
   to the production values.
3. Submit a separate request to PayFast support to enable
   **subscription billing** (recurring debit orders) — that&apos;s a different
   review and is required before you can charge R99/month plans monthly.
4. Remove the &ldquo;DEMO MODE&rdquo; banner from `src/app/build/page.tsx`
   once AI generation is also live.

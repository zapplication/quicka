# PR #3 — PayFast review-ready show page

Prepares quicka.website for PayFast&apos;s individual→company merchant upgrade
review. Adds the legal/info pages PayFast requires, wires the build flow
end-to-end through PayFast, and ships deployment docs.

## Files added

```
src/lib/company.ts                 # Single source of truth for legal entity
src/components/SiteFooter.tsx      # Shared footer used on all pages
src/components/SiteHeader.tsx      # Lightweight header for legal pages
src/components/LegalLayout.tsx     # Wrapper layout for Terms/Privacy/Refund
src/app/about/page.tsx             # About — entity details, brand story
src/app/terms/page.tsx             # Terms of Service
src/app/privacy/page.tsx           # Privacy Policy (POPIA-compliant)
src/app/refund/page.tsx            # Refund & Cancellation Policy
src/app/contact/page.tsx           # Contact — email, address, IO
docs/payfast-review-checklist.md   # What to send PayFast support
docs/vercel-deployment.md          # Vercel + DNS walkthrough
```

## Files updated

```
src/app/page.tsx                   # Footer swapped to <SiteFooter /> (legal links + entity)
src/app/build/page.tsx             # Step 5 now triggers PayfastForm; demo banner added
src/app/payment/success/page.tsx   # Polished, uses brand tokens, links to refund
src/app/payment/cancel/page.tsx    # Polished, uses brand tokens, retry CTA
```

## Customising for your CIPC certificate

**Before deploying**, open `src/lib/company.ts` and update:

1. `legalName` — only if Pty Ltd registered name differs from &ldquo;Quicka&rdquo;
2. `cipcRegNumber` — confirm format from CIPC certificate
3. `entityType` — `&ldquo;Close Corporation&rdquo;` or `&ldquo;(Pty) Ltd&rdquo;`
4. `registeredAddress.line1` — **REPLACE the placeholder** with the address on
   your CIPC certificate
5. `registeredAddress.city` / `province` / `postalCode` — fill in
6. `informationOfficer.email` — confirm or update
7. `vatNumber` — set if VAT-registered
8. `publicPhone` — optional, adds trust if provided

Every page reads from this single file, so updating once is enough.

## Build dependencies

This PR depends on:

- **PR #1** (PayFast security) — uses `<PayfastForm>` from `src/components/PayfastForm.tsx`
- **PR #2** (Tailwind v4 + brand tokens) — uses `bg-brand-bg`, `text-brand-green`, `font-serif`, etc.

**Merge order**: 1 → 2 → 3.

## Deployment

After merging, follow [docs/vercel-deployment.md](./docs/vercel-deployment.md)
to get the site live at `https://quicka.website`. Estimated 30 minutes
including DNS propagation.

## What to give PayFast

Once deployed, follow [docs/payfast-review-checklist.md](./docs/payfast-review-checklist.md)
for the support ticket template and reviewer URL list.

## Demo Mode banner

`/build` shows a small banner at the top explaining the page is a PayFast
review demo. Remove this banner from `src/app/build/page.tsx` once:

1. The merchant upgrade is approved
2. AI generation is wired (replacing the post-payment placeholder copy on the success page)

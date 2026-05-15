# PR #5 — Preview-first build flow

Rewrites `/build` to match the homepage promise: **"answer 8 questions, AI
builds your site in 60 seconds, free preview for 60 minutes, pay only if
you want to make it live."** The old flow asked for payment before showing
the customer anything, which contradicted both the marketing and Andre's
intended UX.

## The new flow

| Step | Screen | What we collect / show |
|---|---|---|
| 1 | **Email** | Lead capture (kept) |
| 2 | **Business type** | Service or Product (kept) |
| 3 | **Business name** | + live `{slug}.co.za` preview underneath |
| 4 | **Location** | City + optional province (for LocalBusiness SEO) |
| 5 | **About your business** | 1-line tagline + 2–3 sentence description (feeds AI when it lands) |
| 6 | **Logo** | Upload OR "skip, use business name as text" |
| 7 | **Photos** | Up to 5 + "fill gaps with industry photos" toggle |
| 8 | **WhatsApp** | Auto-normalises any SA mobile format to E.164 |
| Generating | **8-second loader** | Progress ticks ("Setting up your domain", "Crafting copy", "Placing photos", "Wiring WhatsApp button", "Polishing design") |
| Preview | **Live preview** | Real, styled iframe — the customer's actual data rendered as a polished one-page site |
| Decision | **Two CTAs** | **"Make it live →"** or **"Request changes"** |
| 11a | **Plan picker** (if Make it live) | Basic R99 + Growth R149 selectable, Business R249 "Coming Soon" |
| 11b | **Conversion upsell** (if Request changes) | "Changes are included monthly — pick a plan to go live and unlock 5 / 8 changes per month" |
| 12 | **PayFast checkout** | Existing `<PayfastForm>` from PR #1 |

**Payment never happens before the preview.** The decision point is the
only moment the customer chooses to spend money, and they make it AFTER
seeing their site.

## What the preview actually looks like

The preview is a real, styled HTML page assembled from the customer's
inputs — not a placeholder, not a "Your site is being built" stub. It uses
the same Quicka brand palette as the rest of the site:

- Logo (if uploaded) or business name as serif text in the nav
- Hero with tagline + first sentence of description + WhatsApp + Get-in-touch CTAs
- Photo gallery (if uploaded — empty section if not)
- About section with full description
- Contact section with WhatsApp number + city/province + WhatsApp CTA
- Footer with "powered by Quicka"

The preview rendering lives in `src/lib/preview-template.ts`. When the
AI-generation PR lands, that function gets replaced with a Claude Sonnet 4
call — the rest of the build flow stays identical.

## Plan picker: Business is "Coming Soon"

Per Andre: Growth is live (5 pages, blog, AI content, 8 changes/mo). Only
Business is on hold while the e-commerce platform isn't built.

In the plan picker:

- ✅ **Basic R99** — selectable
- ✅ **Growth R149** — selectable
- 🔒 **Business R249** — visible as a dimmed dashed-border card with a
  small "Coming Soon" pill. Not clickable. Customer sees the upgrade
  ladder but can't pay for features that don't exist yet.

Same data drives the landing page pricing section. When the e-commerce
platform lands, flip `status: "coming_soon"` → `"live"` in
`src/lib/company.ts` and both surfaces update automatically.

## Files changed

| File | Type | What |
|---|---|---|
| `src/lib/build-state.ts` | NEW | Shared types: `BuildState`, `slugifyDomain`, `normalizeE164`, `sanitize` |
| `src/lib/preview-template.ts` | NEW | Generates the preview HTML from `BuildState` |
| `src/lib/company.ts` | UPDATED | `plans` now have `status`, `tagline`, and `features` fields |
| `src/components/PhotoUpload.tsx` | NEW | Multi-photo file input → data URLs in browser memory (no server upload) |
| `src/components/LogoUpload.tsx` | NEW | Single-logo file input → data URL |
| `src/app/build/page.tsx` | REWRITE | Full new flow described above |
| `src/app/page.tsx` | TINY EDIT | Growth flipped from `comingSoon: true` to `available: true` — keeps Business on the waitlist |

## What's NOT in this PR (intentionally)

- **Real AI generation.** The preview is a static template populated with
  the customer's actual data. When PR #6 (AI gen) ships,
  `generatePreviewHtml()` gets swapped for a Claude Sonnet 4 call. Zero
  UX changes needed when that swap happens.
- **Real photo / logo upload to Supabase Storage.** Files are in-browser
  only via `FileReader` → data URLs. This is enough to render in the
  preview iframe. The PhotoUpload/LogoUpload components have stable APIs
  that won't need to change when the actual upload backend lands.
- **Domain availability check during step 3.** The slug preview just
  shows what their domain would be — it doesn't query ZACR WHOIS yet.
  Hooking it up to PR #4's `/api/domains/check` is a follow-up of
  ~20 lines once PR #4 merges.
- **"Request changes" actually doing anything.** It shows the
  conversion-upsell screen and routes to the plan picker. The actual
  in-dashboard change request flow lands with the customer dashboard
  PR (queued).
- **DEMO MODE banner removed.** Banner stays at the top of `/build`
  until BOTH the merchant upgrade is approved AND real AI generation
  ships. That's the criteria.

## How to test after merging

```
https://quicka.website/build
```

1. Walk through all 8 steps using realistic content
2. Watch the 8-second "Generating" animation
3. **Verify the preview iframe actually shows your inputs** — your business
   name, tagline, photos (if uploaded), WhatsApp link clickable, etc.
4. Click **"Make it live →"**
5. Plan picker: confirm Basic and Growth are selectable, Business shows
   greyed-out "Coming Soon"
6. Select Basic or Growth, click "Continue to PayFast →"
7. Should redirect to PayFast sandbox (existing flow)

Optional: hit `/build`, walk through steps, click **"Request changes"** on
the preview — should land on the conversion upsell with the monthly
changes pitch.

## Dependencies

- **Depends on PR #1** (`PayfastForm` component, `/api/checkout` route)
- **Depends on PR #2** (Tailwind v4 + brand tokens, the `font-serif`,
  `bg-brand-*`, `text-brand-*` utilities)
- **Depends on PR #3** (`COMPANY` constant, legal page routes referenced
  in the footer of the plan picker)

All three dependencies are already merged on `main`.

## Build size estimate

+1,300 / -270 across 7 files. Most volume is in `build/page.tsx` (one big
client component holding all 13 step renders) and the preview template's
inline styles.

# PR #12 — Basic SEO scaffolding

Adds the three things Google needs to crawl and represent Quicka properly:

1. **`/sitemap.xml`** — Next.js 14 auto-serves this from `src/app/sitemap.ts`. Lists every public marketing/legal page with reasonable priority + change frequency.
2. **`/robots.txt`** — Next.js 14 auto-serves this from `src/app/robots.ts`. Allows the marketing site, disallows `/build`, `/payment/*`, `/api/*` (transactional / tool routes that shouldn't be in search results).
3. **Schema.org Organization JSON-LD** — added to `src/app/layout.tsx` so it appears on every page. Surfaces the company name, registered address, CIPC number, and contact info in Google's knowledge graph.

## Files changed

| File | Type | Purpose |
|---|---|---|
| `src/app/sitemap.ts` | NEW | Sitemap generator (URLs read from `COMPANY.links` in `company.ts`) |
| `src/app/robots.ts` | NEW | Robots.txt generator (allows marketing, blocks tool / API routes) |
| `src/app/layout.tsx` | UPDATED | Adds Twitter card meta + canonical + schema.org Organization JSON-LD |

## How to verify after merge

Three URLs to spot-check once Vercel deploys:

```
https://quicka.website/sitemap.xml    → should list the 6 marketing pages
https://quicka.website/robots.txt     → should disallow /build, /payment/, /api/
https://quicka.website/                → view source, search for "@type":"Organization" — should appear once
```

Then paste the homepage URL into <https://search.google.com/test/rich-results> — should validate the Organization markup with no errors.

## What this enables

- **3-5× faster indexing** of new pages by Google (sitemap is the main lever)
- **"Knowledge graph" presence** for Quicka in search (the right-side card with logo, address, contact)
- **No wasted crawl budget** on tool routes (`/build`) and transactional pages (`/payment/*`)

## What's NOT in this PR

- **`/logo.png`** — the schema references `${website}/logo.png` but we haven't generated/uploaded the actual file yet. Until someone drops `public/logo.png` into the repo, Google ignores the logo field. Tiny follow-up — needs an actual brand logo first.
- **Open Graph image** (`/og-image.png`) — same reason. When shared on WhatsApp/Twitter, the previews use Quicka's screenshot today. A custom OG image would improve link previews. Defer until we have brand assets sorted.
- **Blog sitemap** — the site has no blog yet; will add when content lives.
- **Per-page descriptions** that differ from the root layout — currently inherited. Per-page-specific descriptions for `/about`, `/terms`, etc. are a polish PR later (most legal pages share the same default).

## Dependencies

Reads `COMPANY` from `src/lib/company.ts` (PR #3 + #10). No new runtime deps.

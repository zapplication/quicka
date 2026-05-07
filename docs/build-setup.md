# Build setup fix — Tailwind v4 + missing devDependencies

This PR makes `npm install && npm run build` actually work for the first time.

## The problems before this PR

1. `package.json` listed `next`, `react`, `react-dom` only — **no Tailwind**, no TypeScript types, no `lint` script. Yet:
2. Every `.tsx` file in `src/` used Tailwind utility classes everywhere.
3. Two PostCSS configs lived side-by-side in conflict:
   - `postcss.config.js` (v3 syntax: `tailwindcss` + `autoprefixer`)
   - `postcss.config.mjs` (v4 syntax: `@tailwindcss/postcss`)
4. Result: production build either failed outright, or rendered the landing page completely unstyled.

## What this PR does

| File | Change |
|---|---|
| `package.json` | Add devDependencies: `tailwindcss@4`, `@tailwindcss/postcss@4`, `typescript@5`, `@types/node@20`, `@types/react@18`, `@types/react-dom@18`. Add `lint` script. Bump react/next/react-dom minor pins to current 14.x / 18.3.x. |
| `postcss.config.js` | **Deleted** — conflicted with the v4 `.mjs` config. The remaining `postcss.config.mjs` has the correct v4 plugin and stays as-is. |
| `src/app/globals.css` | Replaced 32-byte placeholder with a Tailwind v4 setup: `@import "tailwindcss"` + `@theme` block defining brand tokens (`--color-brand-bg`, `--color-brand-bg-alt`, `--color-brand-ink`, `--color-brand-muted`, `--color-brand-green`, `--color-brand-green-dark`, `--font-sans`, `--font-serif`). |
| `src/app/layout.tsx` | Load **Fraunces** (display serif, weights 400/500/600/700, italic + normal) and **Inter** (sans, default weights) via `next/font/google` — self-hosted at build time, no FOIT, no runtime Google CDN dependency. CSS variables `--font-fraunces` and `--font-inter` are applied to `<html>` so Tailwind's `font-serif` and `font-sans` utilities resolve to the loaded fonts. Adds proper SEO `<title>`, `<meta description>`, OpenGraph metadata, and `lang="en"` + `locale="en_ZA"`. Body defaults to `font-sans bg-brand-bg text-brand-ink`. |

## What this enables

- `npm install && npm run build` **succeeds for the first time**.
- The existing landing page renders fully styled (was rendering unstyled before because Tailwind wasn't installed).
- Existing arbitrary-color classes already in the codebase still work: `bg-[#F5F2ED]`, `text-[#00C853]`, `border-black/8`, etc.
- Brand-token utility classes now also work and are preferred for future code:
  - `bg-brand-bg`, `bg-brand-bg-alt`, `bg-brand-ink`, `bg-brand-green`, `bg-brand-green-dark`
  - `text-brand-ink`, `text-brand-muted`, `text-brand-green`
  - `border-brand-ink`, etc.
- `font-serif` resolves to Fraunces (Georgia fallback), `font-sans` to Inter (system fallback).
- Cumulative font payload is small because next/font tree-shakes glyphs and self-hosts.

## Testing

```bash
git checkout fix/build-setup
npm install                    # installs all the new devDependencies
npm run build                  # should complete without errors
npm run dev                    # http://localhost:3000 — landing page should render with Fraunces headings
```

If the page renders unstyled after a successful build, blow away cached state once:

```bash
rm -rf node_modules .next
npm install
npm run dev
```

## Deliberately not in this PR

- **Refactoring `src/app/page.tsx` and `src/app/build/page.tsx`** to use brand-token classes (`bg-brand-bg` instead of `bg-[#F5F2ED]`) and Fraunces (`font-serif` instead of inline `style={{ fontFamily: "Georgia, serif" }}`). That's a cosmetic refactor that should be its own PR so each diff is independently reviewable.
- **ESLint dependencies.** The existing `eslint.config.mjs` uses `eslint-config-next` 15+ flat config syntax, but `next` is pinned to `^14`. Resolving requires either upgrading Next or downgrading the ESLint config — a separate decision.
- **Tailwind config in JS** (`tailwind.config.ts`). Tailwind v4 prefers theme in CSS via `@theme {}`. A JS config file is no longer required for content scanning (auto-detected) or theming (CSS-first). We can add one later if we need plugins or non-default content patterns.

## Order with PR #1

This PR is independent of PR #1 (PayFast security). They touch different files and can land in either order. Recommended: merge PR #1 first (security), then this one (build).

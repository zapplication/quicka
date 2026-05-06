# PR #4 — Absolute Hosting registrar integration

Wires up `.co.za` domain registration for Quicka customers via
**Absolute Hosting** (ZADNA Top Registrar 2024/2025), with **ZACR WHOIS**
covering the live availability check that Absolute's own API doesn't expose.

## What's in this PR

| Path | Purpose |
|---|---|
| `src/lib/registrar/types.ts` | Provider-agnostic types (DomainContact, AvailabilityResult, etc.) |
| `src/lib/registrar/whois.ts` | ZACR port-43 WHOIS query — fills the gap left by Absolute's API |
| `src/lib/registrar/soap.ts` | Tiny SOAP 1.1 client tailored to `API_GENERAL.asmx` |
| `src/lib/registrar/absolute.ts` | Adapter implementing the Registrar interface |
| `src/lib/registrar/index.ts` | Public Registrar interface + `getRegistrar()` |
| `src/app/api/domains/check/route.ts` | POST endpoint for live availability check (with cache + rate limit) |
| `src/app/api/domains/register/route.ts` | POST endpoint for actual registration (gated by INTERNAL_API_SECRET) |
| `scripts/test-registrar.mjs` | Smoke test — WHOIS round-trip + read-only SOAP call |
| `.env.example` | Updated with PayFast (from PR #1) + Absolute Hosting + WHOIS + internal secret |
| `docs/registrar-integration.md` | Long-form integration doc with setup checklist + Plan B notes |

## Architecture

```
       /build (live availability)               PayFast webhook (registration)
              │                                          │
              ▼                                          ▼
    POST /api/domains/check               POST /api/domains/register
    (rate-limited, cached 5min)           (auth: INTERNAL_API_SECRET header)
              │                                          │
              ▼                                          ▼
        ┌─────────────────────────────────────────────────────┐
        │           src/lib/registrar/index.ts                │
        │           Registrar interface (provider-agnostic)   │
        └────────────────────────┬────────────────────────────┘
                                 │
                                 ▼
        ┌─────────────────────────────────────────────────────┐
        │      src/lib/registrar/absolute.ts (adapter)        │
        └───────┬─────────────────────────────────────┬───────┘
                │                                     │
                ▼                                     ▼
        ┌──────────────┐                   ┌─────────────────┐
        │   whois.ts   │                   │     soap.ts     │
        │  port 43 TCP │                   │  POST/SOAP/XML  │
        └──────┬───────┘                   └────────┬────────┘
               │                                    │
               ▼                                    ▼
    whois.registry.net.za:43       www.zadomains.net/api/API_GENERAL.asmx
```

## Why ZACR WHOIS for availability checks

I enumerated Absolute Hosting's full WSDL — 39 operations, no `Domain_Check`
or `Domain_Available`. The recommended pattern in their absence is querying
ZACR's public WHOIS server directly. It's free, fast (sub-second), and
authoritative — you can't get a more correct answer about a `.za` domain's
availability than from ZACR themselves.

Tested the WHOIS classifier against 7 synthetic samples (taken / available /
rate-limited / empty) — all correct.

## Why hand-rolled SOAP, not the `soap` npm package

- No new runtime dep
- Every operation in API_GENERAL.asmx has the same shape (`zadomains_username`,
  `zadomains_password`, `fieldvalues` pipe-delimited)
- Response unwrapping is mechanical (always `<MethodResponse><MethodResult>...`)

If we ever integrate with a more varied API, we can graduate to the full
`soap` package.

## Security model

- **`/api/domains/check`** is callable from the browser (it's how the build
  flow shows live feedback). Rate-limited 30/min/IP, cached 5 minutes.
- **`/api/domains/register`** requires the `x-internal-secret` header to
  match `INTERNAL_API_SECRET` env var. Only the PayFast webhook (running on
  the same Vercel deployment, sharing the env) can call this.
- Credentials (`ABSOLUTE_HOSTING_PASSWORD`) never leave the server. The
  client never sees them.
- All input is validated server-side before being forwarded into SOAP fields.
  Pipe characters in user input are sanitised to prevent injection.

## Vercel env vars

```
ABSOLUTE_HOSTING_USERNAME=DUTO5772
ABSOLUTE_HOSTING_PASSWORD=<the rotated password — paste only in Vercel UI>
ABSOLUTE_HOSTING_API_URL=https://www.zadomains.net/api/API_GENERAL.asmx
ZACR_WHOIS_HOST=whois.registry.net.za
ZACR_WHOIS_PORT=43
INTERNAL_API_SECRET=<generate: openssl rand -hex 32>
```

## How to test before merging

```bash
git checkout fix/registrar-integration
ABSOLUTE_HOSTING_USERNAME=DUTO5772 \
ABSOLUTE_HOSTING_PASSWORD=<your password> \
node scripts/test-registrar.mjs
```

Expected (running from a machine with direct internet access):

```
✓ ZACR WHOIS: google.co.za correctly reports as taken
✓ ZACR WHOIS: quicka-test-abc123.co.za correctly reports as available
✓ Absolute Hosting SOAP: Domain_SelectAll responded (NN chars)
```

If the SOAP test fails — that's actually informative. The most likely error
modes are:
1. **Auth error** → credentials are wrong (or the rotation didn't apply yet)
2. **HTTP 500 from API_GENERAL.asmx** → fieldvalues format mismatch (the
   adapter is conservative but undocumented format quirks are possible)
3. **Network error** → firewall / proxy on your side blocking outbound HTTPS

For (2), the raw response will be in the error and we can adjust the
fieldvalues format quickly.

## Caveats / unknowns

- **Response formats are undocumented.** Each Absolute Hosting method returns
  a string with no public spec. The adapter parses defensively (tries JSON,
  pipe-delimited, plain text heuristics) and preserves the raw response on
  every result for debugging. We'll learn the actual formats as we use the
  API and harden the parser in subsequent PRs.
- **Sandbox endpoint unknown.** Absolute Hosting may offer a sandbox URL we
  could swap in via `ABSOLUTE_HOSTING_API_URL` for safe testing. I haven't
  found public docs confirming. Worth asking their reseller support — see
  the open question list in the registrar assessment.
- **Wholesale price unknown.** Their public retail is R86/year for `.co.za`.
  Reseller pricing should be slightly lower; needs to be confirmed during the
  reseller-pricing support conversation.

## Dependencies

- **None new at runtime.** Uses `node:net`, `node:crypto`, the global `fetch`.
- Compatible with **PR #1** (PayFast) — the new `/api/domains/register` route
  is meant to be called from PR #1's webhook once `activateSite()` is wired
  to it (separate, smaller PR after this one merges).
- Compatible with **PR #2** (Tailwind v4) — no UI in this PR.
- **Independent of PR #3** (show page) — no shared files.

## What's NOT in this PR

- **Wiring `/api/domains/check` into `/build` step 3.** Adds a debounced fetch
  that shows green tick / red cross as user types. ~30 lines, separate small
  PR for review clarity.
- **Wiring `/api/domains/register` into the PayFast webhook's `activateSite`.**
  Depends on Supabase being live so the webhook can look up the customer's
  contact details. Lands as part of the database PR (PR #6 in the plan).
- **DNS record management UI.** The adapter exposes `setNameservers` etc.,
  but the customer dashboard isn't built yet — that lands in PR #7.
- **POPIA Privacy Policy update.** Already mentions Absolute Hosting as a
  processor (added in PR #3) — no further changes needed in PR #4.

## Rough size

+1,100 / -2 lines across 10 files. Most of the volume is the adapter layer
(SOAP envelope construction, response parsing, defensive error handling)
and the integration doc.

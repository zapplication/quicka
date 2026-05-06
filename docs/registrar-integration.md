# Registrar integration — Absolute Hosting

How Quicka registers, renews and manages `.co.za` domains for customers.

## Why this design

Absolute Hosting's reseller API (`zadomains.net/api/API_GENERAL.asmx`) is the
core of our domain workflow. They are 100% SA-owned, ZACR-accredited, and were
named ZADNA's Top Registrar 2024/2025. Pricing is at-cost (R86/year retail
suggesting wholesale around R75/year).

The integration has **two awkward characteristics** that shape this code:

1. **It's SOAP**, not REST. Each operation is an HTTP POST with an XML
   envelope and a `SOAPAction` header.
2. **There is no `Domain_Check` method.** I enumerated all 39 operations in
   the WSDL — register, renew, transfer, set nameservers, etc. all exist, but
   no availability lookup.

The clean fixes:

- **SOAP**: hand-rolled tiny client (`src/lib/registrar/soap.ts`, ~150 lines).
  No new runtime dep. All Absolute Hosting operations follow the same pattern
  (`zadomains_username`, `zadomains_password`, `fieldvalues`) so a generic
  `soapCall(method, fieldvalues)` covers them all.
- **No availability check**: query ZACR's public WHOIS server directly on
  port 43 (`src/lib/registrar/whois.ts`, ~150 lines). The protocol is plain
  TCP, ASCII line-based, ~30 lines of work. Production-grade.

## File map

```
src/lib/registrar/
├── types.ts        Provider-agnostic types (DomainContact, AvailabilityResult, ...)
├── whois.ts        ZACR port-43 WHOIS check
├── soap.ts         Tiny SOAP 1.1 client tailored to API_GENERAL.asmx
├── absolute.ts     Adapter mapping Registrar interface → Absolute Hosting calls
└── index.ts        Public Registrar interface + getRegistrar() factory

src/app/api/domains/
├── check/route.ts     POST /api/domains/check — used by /build live as user types
└── register/route.ts  POST /api/domains/register — called only by PayFast webhook (auth via INTERNAL_API_SECRET)

scripts/
└── test-registrar.mjs   CLI smoke test — runs WHOIS + a read-only SOAP call

docs/
└── registrar-integration.md   ← you are here
```

## Setup checklist

### 1. Sign up as an Absolute Hosting reseller

If you haven't already: <https://www.zadomains.net>. Free, no setup fee. After
signup, contact their reseller support and request access to the WHMCS
Reseller program (which also unlocks API access — same credentials).

### 2. Add credentials to Vercel

In **Vercel → Project → Settings → Environment Variables**, add:

```
ABSOLUTE_HOSTING_USERNAME       = DUTO5772
ABSOLUTE_HOSTING_PASSWORD       = <your fresh password — never paste in chat>
ABSOLUTE_HOSTING_API_URL        = https://www.zadomains.net/api/API_GENERAL.asmx
ZACR_WHOIS_HOST                 = whois.registry.net.za
ZACR_WHOIS_PORT                 = 43
INTERNAL_API_SECRET             = <generate with: openssl rand -hex 32>
```

Mark all of them as available in **Production**, **Preview** and **Development**.

### 3. Run the local smoke test

```bash
ABSOLUTE_HOSTING_USERNAME=DUTO5772 \
ABSOLUTE_HOSTING_PASSWORD=*** \
node scripts/test-registrar.mjs
```

Expected output:

```
✓ ZACR WHOIS: google.co.za correctly reports as taken
✓ ZACR WHOIS: quicka-test-abc123.co.za correctly reports as available
✓ Absolute Hosting SOAP: Domain_SelectAll responded (NN chars)
```

If the SOAP test fails:
- Double-check username and password (no leading/trailing whitespace)
- The password must be the rotated one — if you forgot what it is, log into
  zadomains.net and reset
- Check error message for hints — "Invalid login" means credentials wrong;
  "User not found" means the reseller account isn't fully activated yet

### 4. Wire `/api/domains/register` into the PayFast webhook

The PayFast IPN handler (`src/app/api/webhook/payfast/route.ts`, from PR #1)
currently calls a stubbed `activateSite()`. After PR #4 is merged, update
`activateSite()` to also call `/api/domains/register` with the saved customer
contact + their chosen domain.

This wiring will be its own PR (likely PR #6 — alongside the Supabase database
work that stores customer contacts in the first place).

### 5. Wire `/api/domains/check` into `/build` step 3

Today, `/build` step 3 just slugifies the business name into a domain. After
PR #4 is merged, add a debounced `fetch('/api/domains/check', ...)` that
shows a green tick or red cross next to the domain preview.

This UX wiring will land in a small follow-up PR — keeping it separate from
the registrar plumbing for review clarity.

## Architecture invariants

- **Never call `absolute.ts` directly.** Import from `@/lib/registrar`. If we
  ever switch providers (e.g. to Domains.co.za, which has a clean REST API),
  only `index.ts` changes — every consumer stays the same.
- **Credentials never leave the server.** `/api/domains/check` and
  `/api/domains/register` run server-side only. The browser never sees
  `ABSOLUTE_HOSTING_PASSWORD`.
- **`/api/domains/register` requires INTERNAL_API_SECRET.** Without the right
  header value, every request 401s. This means the only legitimate caller is
  the PayFast webhook (which knows the secret because it shares the same
  Vercel env). A user who tries to call this from their browser will fail.
- **WHOIS is cached server-side for 5 minutes.** The cache is in-process
  (one Vercel function instance per cold start), which is enough to absorb
  user typing in the build flow. For high-scale, swap to Vercel KV.

## What's known vs unknown about Absolute Hosting

**Known (verified):**
- API endpoint, methods, parameter positions (from public WSDL)
- SOAP 1.1 / 1.2 wire format
- Auth pattern (username/password on every call)
- The 39 operations and their human-readable descriptions

**Unknown until we run real calls in sandbox:**
- Exact response format for each method (JSON? pipe-delimited? plain text?)
- Whether they have a sandbox endpoint for testing without real charges
- Exact error response shape on common failures (taken domain, bad credentials, expired domain)
- Wholesale reseller pricing (need to ask via support)

**Mitigations baked into the adapter:**
- Response parser tries JSON first, falls back to pipe-delimited, then to
  plain-text heuristics. Raw response is always preserved on the result for
  debugging unexpected formats.
- Every method that doesn't return success-looking output returns an error
  result with the raw response attached, so a real-world failure produces
  actionable diagnostic info.

## Compliance / POPIA

- Customer's name, email, phone, address are sent to Absolute Hosting
  (necessary — they're the registrant on file with ZACR).
- Absolute Hosting is a South African company hosting in SA, so this is
  intra-SA processing — no POPIA cross-border concerns.
- Our Privacy Policy already names Absolute Hosting as a Processor. ✓

## Running the WHOIS test in this sandbox vs production

If you're testing from a corporate or ISP-level firewall that blocks outbound
TCP on port 43, the WHOIS test will fail with `ENOTFOUND` or `ECONNREFUSED`.
Run from a network with direct egress (most home connections, Vercel's Node
serverless runtime, GitHub Actions, etc.).

## Plan B (in case Absolute Hosting becomes unworkable)

The clean fallback is **Domains.co.za** — modern REST + JSON API, JWT auth,
public docs at <https://docs.domains.co.za>, and they DO have a
`/domain/check` method out of the box. Slightly more expensive than Absolute
but the engineering ergonomics are dramatically better.

Switching providers means writing a second adapter
(`src/lib/registrar/domainscoza.ts`) that implements the same `Registrar`
interface, then changing one line in `src/lib/registrar/index.ts` to swap
which adapter gets returned. Estimate ~6 hours of engineering. The interface
in `index.ts` is designed to make this cheap.

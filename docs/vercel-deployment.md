# Vercel deployment guide — `quicka.website`

Step-by-step walkthrough to get the Quicka show site live at `quicka.website`,
ready for the PayFast merchant review. Estimated time: **30 minutes**, most of
which is waiting for DNS to propagate.

## 0. Before you start

- [ ] PR #1 (PayFast security), PR #2 (build setup), and PR #3 (this PR) are merged to `main`
- [ ] You have a Vercel account (free tier is fine — `vercel.com/signup`)
- [ ] You can log in to your domain registrar (Absolute Hosting / `zadomains.net`) where `quicka.website` is registered
- [ ] You have your PayFast **sandbox** credentials handy. Use sandbox first; switch to production only after merchant upgrade is approved.

## 1. Connect the GitHub repo to Vercel

1. Go to <https://vercel.com/new>
2. Click **Import Git Repository**
3. Authorise Vercel to access `zapplication/quicka` on GitHub
4. Click **Import** next to the `quicka` repo
5. **Configure Project**:
   - Framework Preset: **Next.js** (auto-detected)
   - Root Directory: leave empty
   - Build Command: leave default (`npm run build`)
   - Output Directory: leave default (`.next`)
   - Install Command: leave default (`npm install`)

## 2. Add environment variables

In the **Environment Variables** section of the import wizard, add the following.
Values for `*_KEY`/`*_PASSPHRASE` come from the PayFast sandbox dashboard. Mark
each as `Production`, `Preview`, and `Development`.

```
PAYFAST_MERCHANT_ID=10000100
PAYFAST_MERCHANT_KEY=46f0cd694581a
PAYFAST_PASSPHRASE=jt7NOE43FZPn
PAYFAST_SANDBOX=true
NEXT_PUBLIC_SITE_URL=https://quicka.website
```

The values above are PayFast&apos;s published sandbox demo credentials — safe
to use in plain text for now. **Do not put your production merchant
credentials in the repo or in chat — only paste them into Vercel&apos;s env var
form, which encrypts at rest.**

## 3. Deploy

Click **Deploy**. Vercel will:

- Install dependencies (~1–2 minutes)
- Run `npm run build` (~1–2 minutes)
- Deploy to a temporary URL like `quicka-xyz123.vercel.app`

Wait for the &ldquo;Congratulations 🎉&rdquo; screen. Click the URL it gives you
and verify:

- The home page renders with proper styling (Fraunces headings, green CTA, cream background)
- `/build` works through to step 5
- Step 5 &ldquo;Continue to PayFast&rdquo; redirects to `https://sandbox.payfast.co.za`
- After completing payment with a test card (`4000 0000 0000 0002`), it returns to `/payment/success`
- `/about`, `/terms`, `/privacy`, `/refund`, `/contact` all render

If anything is broken, check the **Deployments** tab for build/runtime logs.

## 4. Add `quicka.website` as a custom domain

1. In your Vercel project, go to **Settings → Domains**
2. Add `quicka.website` and `www.quicka.website`
3. Vercel shows you DNS records that need to be added at the domain&apos;s
   registrar (Absolute Hosting). Typically:

   ```
   Apex (quicka.website):
     Type: A
     Name: @
     Value: 76.76.21.21

   Subdomain (www.quicka.website):
     Type: CNAME
     Name: www
     Value: cname.vercel-dns.com
   ```

   *(Your exact values may differ slightly — use whatever Vercel shows you on
   the Domains page, not these examples.)*

## 5. Add the DNS records at Absolute Hosting

1. Log in to <https://www.zadomains.net> with your reseller account
2. Find the DNS management panel for `quicka.website`
3. Add the records exactly as Vercel showed you:
   - **A record** for the apex: `@` → `76.76.21.21`
   - **CNAME record** for www: `www` → `cname.vercel-dns.com`
4. Save changes

## 6. Wait for DNS propagation

Allow up to 24 hours, but typically resolves within 15–60 minutes.

Check status:

```bash
dig quicka.website +short          # should show 76.76.21.21 (or Vercel IPs)
dig www.quicka.website CNAME +short # should show cname.vercel-dns.com
```

Or use <https://dnschecker.org>.

When propagation is complete, Vercel automatically provisions a free
**Let&apos;s Encrypt SSL certificate** and `https://quicka.website` goes live.

## 7. Configure PayFast notify URL

1. Log in to your PayFast merchant dashboard (sandbox first)
2. Go to **Account Integration** (or similar)
3. Set **Notify URL** to: `https://quicka.website/api/webhook/payfast`
4. Set **Return URL** to: `https://quicka.website/payment/success`
5. Set **Cancel URL** to: `https://quicka.website/payment/cancel`
6. Save

## 8. End-to-end smoke test

From a real device (not localhost):

1. Visit <https://quicka.website>
2. Click **Build my preview**
3. Complete the 5 steps
4. Click **Continue to PayFast**
5. Complete payment with sandbox card `4000 0000 0000 0002` / any future expiry / CVV `123`
6. Confirm you land on `/payment/success`
7. Check the Vercel **Logs** tab — you should see a `/api/webhook/payfast` POST with the IPN
8. The webhook log should show `recordPayment` (currently a stub) being called with `paymentStatus: COMPLETE`

If all green, you&apos;re ready to submit the merchant upgrade to PayFast. See
[docs/payfast-review-checklist.md](./payfast-review-checklist.md) for what to
include in the support ticket.

## 9. Promotion to production credentials

**Don&apos;t do this until PayFast has approved the company merchant upgrade.**

When approval lands:

1. In Vercel **Settings → Environment Variables**:
   - Update `PAYFAST_MERCHANT_ID` to the production merchant ID
   - Update `PAYFAST_MERCHANT_KEY` to the production merchant key
   - Update `PAYFAST_PASSPHRASE` to the production passphrase
   - Change `PAYFAST_SANDBOX` from `true` to `false`
2. Redeploy (Vercel does this automatically when env vars change)
3. Run a **R5 real-money smoke test** — refund yourself afterwards
4. Update PayFast notify/return/cancel URLs in the **production** dashboard (not the sandbox one)
5. Remove the &ldquo;DEMO MODE&rdquo; banner from `src/app/build/page.tsx`
   only after AI generation is also live

## Common gotchas

- **Site loads unstyled**: PR #2 (Tailwind setup) wasn&apos;t merged. Check `package.json` for `tailwindcss` in devDependencies.
- **&ldquo;Module not found: Can&apos;t resolve @/components/PayfastForm&rdquo;**: PR #1 wasn&apos;t merged. Merge it first.
- **PayFast redirect goes to a 404**: Notify URL is wrong, or DNS hasn&apos;t propagated yet. Check `dig quicka.website` first.
- **Webhook returns 500**: Check Vercel function logs. Often an env var mismatch.
- **Custom domain shows Vercel default page after DNS propagated**: Domain not added to project. Re-check Vercel **Settings → Domains** for the `quicka.website` row showing &ldquo;Valid Configuration&rdquo;.

## Support

Email <hello@quicka.website> from Vercel&apos;s feedback widget — but for most
issues, the Vercel deploy logs and the PayFast IPN tester at
`https://sandbox.payfast.co.za` will tell you what&apos;s wrong.

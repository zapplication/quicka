import type { Metadata } from "next";
import { LegalLayout } from "@/components/LegalLayout";
import { COMPANY, formatAddress } from "@/lib/company";

export const metadata: Metadata = {
  title: `Privacy Policy — ${COMPANY.tradingName}`,
  description: `How ${COMPANY.tradingName} collects, uses and protects your personal information. POPIA-compliant privacy policy.`,
};

export default function PrivacyPage() {
  return (
    <LegalLayout
      title="Privacy Policy"
      subtitle="How we collect, use and protect your personal information — and the rights you have under POPIA."
      lastUpdated="2026-05-06"
    >
      <h2>1. Who we are (the Responsible Party)</h2>
      <p>
        The Responsible Party for the personal information processed via{" "}
        <a href={COMPANY.website}>{COMPANY.domain}</a> is{" "}
        <strong>{COMPANY.legalName}</strong> ({COMPANY.entityType}, registration{" "}
        <code>{COMPANY.cipcRegNumber}</code>), trading as &ldquo;
        {COMPANY.tradingName}&rdquo;, with registered office at {formatAddress()}.
      </p>
      <p>
        This Privacy Policy is issued in accordance with the{" "}
        <strong>Protection of Personal Information Act 4 of 2013 (&ldquo;POPIA&rdquo;)</strong>{" "}
        of the Republic of South Africa.
      </p>

      <h2>2. Information Officer</h2>
      <p>
        Our Information Officer for POPIA purposes is{" "}
        <strong>{COMPANY.informationOfficer.name}</strong>,{" "}
        {COMPANY.informationOfficer.title}. You can reach the Information Officer at{" "}
        <a href={`mailto:${COMPANY.informationOfficer.email}`}>
          {COMPANY.informationOfficer.email}
        </a>
        . The Information Officer is registered with the Information Regulator (South
        Africa).
      </p>

      <h2>3. What information we collect</h2>
      <p>We collect only what we need to provide and improve the service:</p>
      <ul>
        <li>
          <strong>Account information</strong> — your email address, business name,
          city or area of operation, and the password you choose.
        </li>
        <li>
          <strong>Business information you provide</strong> — your services or product
          descriptions, opening hours, WhatsApp number, social-media handles, and any
          photos or logo you upload.
        </li>
        <li>
          <strong>Payment metadata</strong> — your name and email pass through PayFast
          to us. <strong>We never see or store your card details.</strong> PayFast
          handles all payment information directly under their PCI-DSS-compliant
          systems.
        </li>
        <li>
          <strong>Service-related data</strong> — IP address, browser type,
          interactions with our site (so we can detect fraud, debug issues, and improve
          the service).
        </li>
        <li>
          <strong>Lead messages forwarded by your generated site</strong> — when a
          visitor uses your contact form, we relay the message to your inbox and store
          a copy temporarily so you can read it in your dashboard. Visitor data is{" "}
          <em>your</em> responsibility under POPIA, not ours.
        </li>
      </ul>

      <h2>4. Why we collect it</h2>
      <p>
        We use your personal information to:
      </p>
      <ul>
        <li>Build and host your website</li>
        <li>Register and renew your <code>.co.za</code> domain</li>
        <li>Process your subscription payments via PayFast</li>
        <li>
          Send service emails (welcome message, payment receipts, lead notifications,
          incidents, billing failures)
        </li>
        <li>
          Provide support and respond to questions sent to our support address
        </li>
        <li>
          Detect, prevent and address fraud, abuse and security incidents
        </li>
        <li>
          Comply with our legal obligations (tax, accounting, regulatory requests)
        </li>
      </ul>
      <p>
        We rely on the lawful processing grounds set out in section 11 of POPIA — most
        commonly your consent (when you sign up), the necessary performance of our
        contract with you, and our legitimate interest in operating a secure service.
      </p>

      <h2>5. Marketing communications</h2>
      <p>
        We will only send you marketing emails (e.g. announcements of new features,
        tips for getting more customers from your site) if you opt in. Every marketing
        email contains an unsubscribe link. Opting out of marketing does not affect
        service-related emails (receipts, password resets, security alerts), which we
        must send to operate your account.
      </p>

      <h2>6. Who we share your information with (Operators)</h2>
      <p>
        We use the following third parties (&ldquo;Operators&rdquo; under POPIA) to
        deliver the service. Each is contractually bound to process your information
        only on our written instructions and to maintain appropriate security
        safeguards.
      </p>
      <ul>
        <li>
          <strong>PayFast</strong> (DPO Pty Ltd, South Africa) — processes all card
          payments and recurring debit orders. PCI-DSS Level 1 compliant.{" "}
          <a href="https://payfast.io/privacy" target="_blank" rel="noopener noreferrer">
            payfast.io/privacy
          </a>
        </li>
        <li>
          <strong>Vercel</strong> (Vercel Inc., United States) — hosts the Quicka
          application platform. Servers may be located in the United States and
          European Union.{" "}
          <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">
            vercel.com/legal/privacy-policy
          </a>
        </li>
        <li>
          <strong>Cloudflare</strong> (Cloudflare Inc., global) — delivers your
          generated website to visitors via a global content delivery network.{" "}
          <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noopener noreferrer">
            cloudflare.com/privacypolicy
          </a>
        </li>
        <li>
          <strong>Supabase</strong> (Supabase Inc., United States — to be deployed soon)
          — stores account, site and lead data. We will choose the European Union (EU)
          region to keep data closer to South Africa.{" "}
          <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer">
            supabase.com/privacy
          </a>
        </li>
        <li>
          <strong>Resend</strong> (Resend Inc., United States — to be deployed soon) —
          delivers transactional emails (receipts, lead notifications, password
          resets).{" "}
          <a href="https://resend.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">
            resend.com/legal/privacy-policy
          </a>
        </li>
        <li>
          <strong>Anthropic</strong> (Anthropic PBC, United States — for AI generation)
          — receives the textual answers from your build flow to generate site copy.
          Photos and personal information beyond business name and city are not sent
          to Anthropic.{" "}
          <a href="https://www.anthropic.com/legal/privacy" target="_blank" rel="noopener noreferrer">
            anthropic.com/legal/privacy
          </a>
        </li>
        <li>
          <strong>Absolute Hosting</strong> (Pty Ltd, South Africa) — registers your{" "}
          <code>.co.za</code> domain through their ZACR-accredited registrar service.{" "}
          <a href="https://absolutehosting.co.za" target="_blank" rel="noopener noreferrer">
            absolutehosting.co.za
          </a>
        </li>
      </ul>

      <h2>7. Cross-border transfers</h2>
      <p>
        Some of the Operators above are based outside South Africa. Where this is the
        case, we transfer your information under one of the lawful bases in section 72
        of POPIA, typically:
      </p>
      <ul>
        <li>
          The Operator is bound by binding corporate rules or contractual terms that
          provide an adequate level of protection (we use the European Standard
          Contractual Clauses as a reference standard); or
        </li>
        <li>
          The transfer is necessary for the performance of the contract between you
          and us; or
        </li>
        <li>You have consented to the transfer.</li>
      </ul>

      <h2>8. How long we keep your information</h2>
      <ul>
        <li>
          <strong>While you are a customer:</strong> for the duration of your
          subscription.
        </li>
        <li>
          <strong>After you cancel:</strong> we retain account and billing records for
          5 years, in line with the <em>Tax Administration Act</em> requirements. Other
          information is deleted within 60 days unless we have a legal reason to keep
          it.
        </li>
        <li>
          <strong>Lead messages:</strong> retained for 90 days to allow you to recover
          missed enquiries; deleted thereafter.
        </li>
      </ul>

      <h2>9. Security</h2>
      <p>
        We protect your information with industry-standard safeguards: encrypted
        transmission (TLS 1.2+), encrypted storage at rest, role-based access controls,
        secret rotation, and audit logging. PayFast handles all card information so we
        never store it ourselves.
      </p>
      <p>
        If we ever suffer a security breach involving your personal information, we
        will notify both you and the Information Regulator without undue delay, as
        required by section 22 of POPIA.
      </p>

      <h2>10. Your rights under POPIA</h2>
      <p>You have the right to:</p>
      <ul>
        <li>
          <strong>Access</strong> — request a copy of the personal information we hold
          about you.
        </li>
        <li>
          <strong>Correction</strong> — ask us to correct anything inaccurate or
          incomplete.
        </li>
        <li>
          <strong>Deletion</strong> — ask us to delete your personal information
          (subject to our legal retention obligations above).
        </li>
        <li>
          <strong>Object</strong> — to processing based on legitimate interest, and to
          stop direct marketing.
        </li>
        <li>
          <strong>Lodge a complaint</strong> with the Information Regulator if you
          believe we have not complied with POPIA. Contact details:{" "}
          <a href="https://inforegulator.org.za" target="_blank" rel="noopener noreferrer">
            inforegulator.org.za
          </a>
          .
        </li>
      </ul>
      <p>
        To exercise these rights, email{" "}
        <a href={`mailto:${COMPANY.informationOfficer.email}`}>
          {COMPANY.informationOfficer.email}
        </a>
        . We respond within 30 days. Most simple requests (data export, account
        deletion) are completed faster.
      </p>

      <h2>11. Children</h2>
      <p>
        Quicka is for businesses and is not directed at children under 18. We do not
        knowingly process information about children. If you believe a child has
        provided us with personal information, please contact our Information Officer
        and we will delete it.
      </p>

      <h2>12. Cookies &amp; analytics</h2>
      <p>
        We use a small number of strictly necessary cookies to operate the site (login
        sessions, CSRF protection). We do not use third-party advertising cookies or
        cross-site tracking. If we add product analytics in future, we will update this
        policy and offer an opt-out.
      </p>

      <h2>13. Changes to this Privacy Policy</h2>
      <p>
        We may update this Privacy Policy as the service evolves or the law changes.
        Material changes will be emailed to you at least 30 days in advance. The
        &ldquo;Last updated&rdquo; date at the top of this page reflects the most
        recent revision.
      </p>

      <h2>14. Contact us</h2>
      <p>
        For any privacy or POPIA question, email our Information Officer at{" "}
        <a href={`mailto:${COMPANY.informationOfficer.email}`}>
          {COMPANY.informationOfficer.email}
        </a>{" "}
        or write to {COMPANY.legalName} at the registered office address above.
      </p>
    </LegalLayout>
  );
}

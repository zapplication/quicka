import type { Metadata } from "next";
import { LegalLayout } from "@/components/LegalLayout";
import { COMPANY, formatAddress } from "@/lib/company";

export const metadata: Metadata = {
  title: `Terms of Service — ${COMPANY.tradingName}`,
  description: `Terms of Service for ${COMPANY.tradingName} (${COMPANY.legalName}). Subscription terms, cancellation policy, governing law South Africa.`,
};

export default function TermsPage() {
  return (
    <LegalLayout
      title="Terms of Service"
      subtitle={`The agreement between you and ${COMPANY.legalName} when you use ${COMPANY.tradingName}.`}
      lastUpdated="2026-05-06"
    >
      <h2>1. Who we are</h2>
      <p>
        These Terms of Service (the &ldquo;<strong>Terms</strong>&rdquo;) form a binding
        agreement between you and <strong>{COMPANY.legalName}</strong> (
        {COMPANY.entityType}, registration number{" "}
        <code>{COMPANY.cipcRegNumber}</code>), with registered office at{" "}
        {formatAddress()}. We trade as &ldquo;{COMPANY.tradingName}&rdquo;
        and these Terms cover your use of our website at{" "}
        <a href={COMPANY.website}>{COMPANY.domain}</a> and all our services.
      </p>
      <p>
        In these Terms, &ldquo;we&rdquo;, &ldquo;us&rdquo; and &ldquo;our&rdquo; mean{" "}
        {COMPANY.legalName}. &ldquo;You&rdquo; means the person or business using our
        services.
      </p>

      <h2>2. What we do</h2>
      <p>
        {COMPANY.tradingName} is an AI-powered website builder for South African small
        businesses. After you answer a series of questions and upload optional brand
        assets (logo, photos), our system generates a complete website on your behalf.
        Each subscription includes:
      </p>
      <ul>
        <li>A custom <code>.co.za</code> domain registered in your name</li>
        <li>SSL certificate and secure HTTPS hosting</li>
        <li>A contact form that emails leads to you</li>
        <li>A WhatsApp button that connects visitors to your phone</li>
        <li>A defined number of monthly content changes (see plan tier)</li>
      </ul>

      <h2>3. Acceptance</h2>
      <p>
        By creating an account, completing the build flow, or paying a subscription,
        you confirm that you are at least 18 years old (or have the legal capacity to
        contract on behalf of a business in South Africa) and that you accept these
        Terms in full. If you do not accept these Terms, do not use the service.
      </p>

      <h2>4. Subscription &amp; pricing</h2>
      <p>
        Quicka is a monthly subscription service, billed in South African Rand (ZAR).
        Current public plans are:
      </p>
      <ul>
        <li>
          <strong>Basic — R{COMPANY.plans.Basic.priceZar}/month:</strong>{" "}
          one-page site, {COMPANY.plans.Basic.changesPerMonth} changes per month
        </li>
        <li>
          <strong>Growth — R{COMPANY.plans.Growth.priceZar}/month:</strong>{" "}
          five-page site, AI-generated blog content,{" "}
          {COMPANY.plans.Growth.changesPerMonth} changes per month
        </li>
        <li>
          <strong>Business — R{COMPANY.plans.Business.priceZar}/month:</strong>{" "}
          everything in Growth, plus photo gallery and online store,{" "}
          {COMPANY.plans.Business.changesPerMonth} changes per month
        </li>
      </ul>
      <p>
        Prices include VAT where applicable. Optional add-ons (e.g. AI-generated logo,
        business email hosting) are priced separately at checkout. Billing is processed
        by <strong>PayFast</strong>, a South African licensed payment service provider.
      </p>

      <h2>5. Free preview</h2>
      <p>
        You may build a full preview of your website without payment. The preview is
        available at a temporary URL on a <code>.{COMPANY.domain}</code> subdomain for
        up to 60 minutes. To make your site live on your custom <code>.co.za</code>{" "}
        domain, you must complete a paid subscription via PayFast.
      </p>

      <h2>6. Domain ownership &amp; registration</h2>
      <p>
        The <code>.co.za</code> domain registered for you is registered in{" "}
        <strong>your name</strong>, with you listed as the registrant. We act as your
        accredited registrar partner for the duration of your subscription.
      </p>
      <p>
        If you cancel your subscription, full domain ownership remains with you. We
        will provide an authorisation code (EPP code) for transfer to another registrar
        on request, free of charge.
      </p>

      <h2>7. Cancellation &amp; refunds</h2>
      <p>
        You may cancel your subscription at any time by emailing{" "}
        <a href={`mailto:${COMPANY.publicEmail}`}>{COMPANY.publicEmail}</a>. Cancellation
        takes effect at the end of your current billing month — your site stays live
        until then.
      </p>
      <p>
        Detailed refund terms (including our 7-day money-back guarantee on first
        payment and downtime credits) are set out in our{" "}
        <a href={COMPANY.links.refund}>Refund &amp; Cancellation Policy</a>.
      </p>

      <h2>8. Acceptable use</h2>
      <p>
        You may not use Quicka to operate a website that:
      </p>
      <ul>
        <li>Promotes or sells anything illegal in South Africa</li>
        <li>
          Contains content that is hateful, discriminatory, fraudulent, defamatory or
          infringes third-party intellectual property
        </li>
        <li>Operates as a phishing site or distributes malware</li>
        <li>
          Solicits or distributes adult sexual content involving anyone under 18 (we
          will report violations to the South African Police Service)
        </li>
        <li>Engages in unsolicited bulk email or spam</li>
      </ul>
      <p>
        We may suspend or terminate any account we reasonably believe is in breach of
        this clause. Where reasonable, we will give you written notice and an
        opportunity to remedy first.
      </p>

      <h2>9. Your content</h2>
      <p>
        You retain all rights and ownership of the text, photographs, logos and other
        content (&ldquo;Your Content&rdquo;) that you provide to us. By uploading Your
        Content you grant us a limited, non-exclusive, royalty-free licence to host,
        display and process it solely for the purpose of operating your website on our
        platform.
      </p>
      <p>
        You confirm that you have the rights to all content you upload and that nothing
        you upload infringes another person&apos;s rights. You indemnify us against any
        third-party claim arising from Your Content.
      </p>

      <h2>10. Service availability</h2>
      <p>
        We aim for 99.5% monthly uptime, excluding scheduled maintenance announced in
        advance. We use Cloudflare Pages and similar hyperscale infrastructure to
        deliver this. If your site experiences downtime exceeding 24 continuous hours
        in a billing month due to our error, you may claim a pro-rata refund — see the{" "}
        <a href={COMPANY.links.refund}>Refund Policy</a> for the procedure.
      </p>

      <h2>11. Limitation of liability</h2>
      <p>
        To the maximum extent permitted by South African law:
      </p>
      <ul>
        <li>
          We provide the service &ldquo;as is&rdquo; and make no warranty that it
          will be error-free or uninterrupted.
        </li>
        <li>
          Our total liability for any claim is limited to the amounts you paid us in
          the three (3) months preceding the event giving rise to the claim.
        </li>
        <li>
          We are not liable for any indirect, incidental or consequential loss
          (including lost profits, lost business, lost data) howsoever caused.
        </li>
      </ul>
      <p>
        Nothing in these Terms excludes or limits liability that cannot be excluded by
        South African law (including the Consumer Protection Act 68 of 2008 where it
        applies).
      </p>

      <h2>12. Privacy</h2>
      <p>
        Our use of your personal information is governed by our{" "}
        <a href={COMPANY.links.privacy}>Privacy Policy</a>, which complies with the
        Protection of Personal Information Act 4 of 2013 (&ldquo;POPIA&rdquo;).
      </p>

      <h2>13. Changes to these Terms</h2>
      <p>
        We may update these Terms from time to time. Material changes will be notified
        to you by email at least 30 days in advance. Continued use of the service after
        an update is in effect means you accept the updated Terms.
      </p>

      <h2>14. Governing law &amp; jurisdiction</h2>
      <p>
        These Terms are governed by the laws of {COMPANY.governingLaw}. Any dispute
        will first be discussed in good faith between us. If we cannot resolve it
        within 30 days, the dispute may be submitted to the appropriate court in{" "}
        {COMPANY.jurisdiction}, South Africa.
      </p>

      <h2>15. Contact</h2>
      <p>
        Questions about these Terms? Email{" "}
        <a href={`mailto:${COMPANY.publicEmail}`}>{COMPANY.publicEmail}</a> or write to
        us at the registered office address above.
      </p>
    </LegalLayout>
  );
}

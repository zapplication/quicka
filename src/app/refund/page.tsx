import type { Metadata } from "next";
import { LegalLayout } from "@/components/LegalLayout";
import { COMPANY } from "@/lib/company";

export const metadata: Metadata = {
  title: `Refund & Cancellation Policy — ${COMPANY.tradingName}`,
  description: `${COMPANY.tradingName}'s refund and cancellation policy. 7-day money-back guarantee, downtime credits, no-fault cancellation.`,
};

export default function RefundPage() {
  return (
    <LegalLayout
      title="Refunds &amp; Cancellation"
      subtitle="No surprises. No locked-in contracts. Cancel anytime with 30 days&apos; notice."
      lastUpdated="2026-05-06"
    >
      <h2>The short version</h2>
      <ul>
        <li>
          <strong>You pay only after you approve your generated site.</strong> The
          build flow includes a 60-minute free preview before any payment.
        </li>
        <li>
          <strong>7-day money-back guarantee on your first month.</strong> If you change
          your mind in the first 7 days after your first payment, email us and we
          refund the full amount, no questions asked.
        </li>
        <li>
          <strong>No long-term contract.</strong> Cancel anytime with 30 days&apos;
          notice — your site stays live until the end of your current billing month.
        </li>
        <li>
          <strong>Your domain is yours.</strong> When you cancel, the{" "}
          <code>.co.za</code> domain ownership remains with you. We provide an
          authorisation code for transfer free of charge.
        </li>
        <li>
          <strong>Downtime credit.</strong> If your site is offline for more than 24
          continuous hours in a billing month due to our error, we credit a pro-rata
          refund.
        </li>
      </ul>

      <h2>1. The free preview</h2>
      <p>
        Every customer can build a complete preview of their website without entering
        any payment information. The preview is hosted on a temporary{" "}
        <code>.{COMPANY.domain}</code> subdomain for 60 minutes. If you choose not to
        proceed, no payment is taken and the preview is automatically deleted.
      </p>

      <h2>2. Your first paid month: 7-day money-back guarantee</h2>
      <p>
        We want you to be sure. If you pay for your first month and decide within 7
        days of that first payment that Quicka isn&apos;t for you, email{" "}
        <a href={`mailto:${COMPANY.publicEmail}`}>{COMPANY.publicEmail}</a> with the
        word &ldquo;refund&rdquo; in the subject. We refund the full first-month
        payment within 5 business days, take the site offline, and end the
        subscription.
      </p>
      <p>
        After the 7-day window, the standard cancellation policy below applies.
      </p>

      <h2>3. Cancelling your subscription</h2>
      <p>
        You can cancel any time by emailing{" "}
        <a href={`mailto:${COMPANY.publicEmail}`}>{COMPANY.publicEmail}</a> from the
        email address on your account. We will:
      </p>
      <ul>
        <li>
          <strong>Confirm the cancellation</strong> within {COMPANY.responseSla}.
        </li>
        <li>
          <strong>Keep your site live</strong> until the end of your current billing
          month. You don&apos;t lose any time you&apos;ve already paid for.
        </li>
        <li>
          <strong>Stop any future debits</strong> from PayFast.
        </li>
        <li>
          <strong>Provide your domain authorisation (EPP) code</strong> at no cost,
          letting you transfer the <code>.co.za</code> to another registrar of your
          choice.
        </li>
      </ul>
      <p>
        We do not pro-rate refunds for the unused portion of the current billing
        month outside the 7-day guarantee — this is a standard practice for monthly
        subscription services.
      </p>

      <h2>4. Service downtime — pro-rata credit</h2>
      <p>
        If your generated site is offline for more than 24 continuous hours in a
        billing month due to our error (and not due to{" "}
        <em>force majeure</em>, scheduled maintenance announced in advance, or your
        action), you may claim a pro-rata refund for the affected hours.
      </p>
      <p>
        To claim:
      </p>
      <ol>
        <li>
          Email{" "}
          <a href={`mailto:${COMPANY.publicEmail}?subject=Downtime%20refund`}>
            {COMPANY.publicEmail}
          </a>{" "}
          with subject line &ldquo;Downtime refund&rdquo; within 14 days of the
          incident.
        </li>
        <li>Tell us your domain and the dates and times the site was unreachable.</li>
        <li>
          We confirm against our monitoring logs and process the credit within 7
          business days.
        </li>
      </ol>

      <h2>5. Refund mechanics</h2>
      <p>
        All refunds are processed back to the original PayFast payment method (the
        card or bank account that paid). Refunds typically reflect within 5–7 working
        days, depending on your bank.
      </p>

      <h2>6. What we don&apos;t refund</h2>
      <p>For honesty, here&apos;s what falls outside this policy:</p>
      <ul>
        <li>
          <strong>Once-off add-ons that have been delivered</strong> (e.g. AI-generated
          logo) — these are non-refundable once produced and delivered to you.
        </li>
        <li>
          <strong>Domain registration fees</strong> after the registration is final
          with the registry. We can transfer your <code>.co.za</code> to another
          registrar but the registration itself, once made, cannot be unmade.
        </li>
        <li>
          <strong>Charges incurred for breach of our acceptable use policy</strong>{" "}
          (see the{" "}
          <a href={COMPANY.links.terms}>Terms of Service</a>).
        </li>
      </ul>

      <h2>7. Disputes</h2>
      <p>
        If you disagree with a refund decision, email{" "}
        <a href={`mailto:${COMPANY.publicEmail}`}>{COMPANY.publicEmail}</a> and we will
        work to resolve it directly. Under the Consumer Protection Act 68 of 2008, you
        also have the right to refer the matter to the National Consumer Commission or
        a relevant ombud — but we hope you give us the chance to make it right first.
      </p>

      <h2>8. Changes to this policy</h2>
      <p>
        We may update this policy as the service evolves. Material changes will be
        emailed to active customers at least 30 days in advance. Customers paid up at
        the time of a change retain the policy that was in effect when they paid for
        that month.
      </p>

      <h2>Contact</h2>
      <p>
        Refund or cancellation question? Email{" "}
        <a href={`mailto:${COMPANY.publicEmail}`}>{COMPANY.publicEmail}</a>. Real human
        replies within {COMPANY.responseSla}.
      </p>
    </LegalLayout>
  );
}

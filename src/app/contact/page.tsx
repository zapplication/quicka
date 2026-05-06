import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { COMPANY, formatAddressLines } from "@/lib/company";

export const metadata: Metadata = {
  title: `Contact — ${COMPANY.tradingName}`,
  description: `Get in touch with ${COMPANY.tradingName}. Email ${COMPANY.publicEmail}.`,
};

export default function ContactPage() {
  const addressLines = formatAddressLines();

  return (
    <main className="min-h-screen flex flex-col bg-brand-bg">
      <SiteHeader />

      <article className="flex-1 w-full max-w-3xl mx-auto px-6 py-16">
        <p className="text-xs font-bold tracking-[0.22em] uppercase text-brand-green-dark mb-4">
          Contact
        </p>
        <h1 className="font-serif text-5xl text-brand-ink leading-[1.05] tracking-tight mb-6">
          Talk to a real person.
        </h1>
        <p className="text-lg text-brand-muted max-w-xl">
          We&apos;re a small team based in South Africa. We reply to every message — usually
          within {COMPANY.responseSla} on weekdays.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
          <div className="bg-white rounded-2xl p-6 border border-black/8">
            <p className="text-xs font-bold tracking-widest uppercase text-brand-muted mb-3">
              Email
            </p>
            <a
              href={`mailto:${COMPANY.publicEmail}`}
              className="font-serif text-2xl text-brand-ink hover:text-brand-green-dark no-underline transition-colors block break-all"
            >
              {COMPANY.publicEmail}
            </a>
            <p className="text-sm text-brand-muted mt-3">
              Best for billing, account changes, support requests, partnerships.
            </p>
          </div>

          {COMPANY.publicPhone ? (
            <div className="bg-white rounded-2xl p-6 border border-black/8">
              <p className="text-xs font-bold tracking-widest uppercase text-brand-muted mb-3">
                Phone
              </p>
              <a
                href={`tel:${COMPANY.publicPhone.replace(/\s/g, "")}`}
                className="font-serif text-2xl text-brand-ink hover:text-brand-green-dark no-underline transition-colors block"
              >
                {COMPANY.publicPhone}
              </a>
              <p className="text-sm text-brand-muted mt-3">
                Weekdays 8am–5pm SAST.
              </p>
            </div>
          ) : null}

          <div className="bg-white rounded-2xl p-6 border border-black/8 md:col-span-2">
            <p className="text-xs font-bold tracking-widest uppercase text-brand-muted mb-3">
              Registered office
            </p>
            <address className="not-italic text-brand-ink leading-relaxed">
              <strong>{COMPANY.legalName}</strong>
              <br />
              {addressLines.map((line, i) => (
                <span key={i} className="block">
                  {line}
                </span>
              ))}
            </address>
            <p className="text-xs text-brand-muted mt-4 font-mono">
              {COMPANY.entityType} · {COMPANY.cipcRegNumber}
            </p>
          </div>
        </div>

        <section className="mt-14 bg-brand-ink text-white rounded-2xl p-8">
          <h2 className="font-serif text-2xl mb-3 tracking-tight">
            Privacy &amp; data requests
          </h2>
          <p className="text-white/75 leading-relaxed mb-4">
            Under POPIA you have the right to access, correct or delete your personal
            information. Email our Information Officer{" "}
            <strong>{COMPANY.informationOfficer.name}</strong> directly:
          </p>
          <a
            href={`mailto:${COMPANY.informationOfficer.email}?subject=POPIA%20request`}
            className="inline-block bg-brand-green text-white px-6 py-3 rounded-full text-sm font-semibold no-underline hover:bg-brand-green-dark transition-colors"
          >
            {COMPANY.informationOfficer.email}
          </a>
        </section>
      </article>

      <SiteFooter />
    </main>
  );
}

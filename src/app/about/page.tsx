import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { COMPANY, formatAddressLines } from "@/lib/company";

export const metadata: Metadata = {
  title: `About — ${COMPANY.tradingName}`,
  description: `${COMPANY.tradingName} is a South African company building AI-powered websites for small businesses. Registered in ${COMPANY.launchMarket}.`,
};

export default function AboutPage() {
  const addressLines = formatAddressLines();

  return (
    <main className="min-h-screen flex flex-col bg-brand-bg">
      <SiteHeader />

      <article className="flex-1 w-full max-w-3xl mx-auto px-6 py-16">
        <p className="text-xs font-bold tracking-[0.22em] uppercase text-brand-green-dark mb-4">
          About
        </p>
        <h1 className="font-serif text-5xl md:text-6xl text-brand-ink leading-[1.05] tracking-tight mb-8">
          AI websites <em className="text-brand-green not-italic font-medium">made in South Africa</em>.
        </h1>

        <div className="space-y-6 text-lg text-brand-ink leading-relaxed">
          <p>
            {COMPANY.tradingName} builds beautifully designed, conversion-focused
            websites for South African small businesses. Customers answer eight
            questions, upload their logo and a few photos, and our AI generates a
            complete website in 60 seconds — including a free <code className="bg-brand-bg-alt px-1.5 py-0.5 rounded text-sm">.co.za</code> domain,
            SSL certificate, hosting, contact form and WhatsApp button. From R99 a month.
          </p>
          <p>
            We exist because South African SMBs deserve professional websites without
            the R5,000–R20,000 upfront fees and disappearing-developer stories. Every
            spaza shop, plumber, hair salon, photographer and tutor in this country can
            be online and look credible — without selling a kidney to make it happen.
          </p>
        </div>

        <section className="mt-16 bg-white rounded-2xl border border-black/8 p-8">
          <h2 className="font-serif text-2xl text-brand-ink mb-6 tracking-tight">
            Company details
          </h2>
          <dl className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-5 text-sm">
            <div>
              <dt className="text-xs font-bold tracking-widest uppercase text-brand-muted mb-1">
                Legal name
              </dt>
              <dd className="text-brand-ink font-medium">{COMPANY.legalName}</dd>
            </div>
            <div>
              <dt className="text-xs font-bold tracking-widest uppercase text-brand-muted mb-1">
                Entity type
              </dt>
              <dd className="text-brand-ink font-medium">{COMPANY.entityType}</dd>
            </div>
            <div>
              <dt className="text-xs font-bold tracking-widest uppercase text-brand-muted mb-1">
                Registration number
              </dt>
              <dd className="text-brand-ink font-medium font-mono">{COMPANY.cipcRegNumber}</dd>
            </div>
            <div className="sm:col-span-3">
              <dt className="text-xs font-bold tracking-widest uppercase text-brand-muted mb-1">
                Registered office
              </dt>
              <dd className="text-brand-ink">
                {addressLines.map((line, i) => (
                  <span key={i} className="block">
                    {line}
                  </span>
                ))}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-bold tracking-widest uppercase text-brand-muted mb-1">
                Founded
              </dt>
              <dd className="text-brand-ink font-medium">{COMPANY.founded}</dd>
            </div>
            <div>
              <dt className="text-xs font-bold tracking-widest uppercase text-brand-muted mb-1">
                Information Officer
              </dt>
              <dd className="text-brand-ink font-medium">{COMPANY.informationOfficer.name}</dd>
            </div>
            {COMPANY.vatNumber ? (
              <div>
                <dt className="text-xs font-bold tracking-widest uppercase text-brand-muted mb-1">
                  VAT number
                </dt>
                <dd className="text-brand-ink font-medium font-mono">{COMPANY.vatNumber}</dd>
              </div>
            ) : null}
          </dl>
        </section>

        <section className="mt-12">
          <h2 className="font-serif text-2xl text-brand-ink mb-4 tracking-tight">
            How to reach us
          </h2>
          <p className="text-brand-ink mb-2">
            Email:{" "}
            <a
              href={`mailto:${COMPANY.publicEmail}`}
              className="text-brand-green-dark underline underline-offset-2 hover:text-brand-green"
            >
              {COMPANY.publicEmail}
            </a>
          </p>
          {COMPANY.publicPhone ? (
            <p className="text-brand-ink mb-2">Phone: {COMPANY.publicPhone}</p>
          ) : null}
          <p className="text-brand-muted text-sm mt-4">
            We respond within {COMPANY.responseSla}. For full contact options visit{" "}
            <Link href={COMPANY.links.contact} className="text-brand-green-dark underline">
              the contact page
            </Link>
            .
          </p>
        </section>
      </article>

      <SiteFooter />
    </main>
  );
}

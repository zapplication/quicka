import Link from "next/link";
import type { Metadata } from "next";
import { SiteFooter } from "@/components/SiteFooter";
import { COMPANY } from "@/lib/company";

export const metadata: Metadata = {
  title: `Payment cancelled — ${COMPANY.tradingName}`,
  description: "Your PayFast payment was cancelled. No charge was made.",
};

export default function PaymentCancelPage() {
  return (
    <main className="min-h-screen flex flex-col bg-brand-bg">
      <header className="bg-brand-ink px-6 py-4">
        <Link href="/" className="font-serif italic text-xl text-white no-underline">
          Quick<span className="text-brand-green">a</span>
        </Link>
      </header>

      <section className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="max-w-xl w-full bg-white rounded-3xl border border-black/8 p-10 text-center">
          <div className="text-6xl mb-6">↩️</div>
          <h1 className="font-serif text-4xl text-brand-ink mb-3 tracking-tight">
            No charge — payment cancelled.
          </h1>
          <p className="text-brand-muted text-lg mb-8 leading-relaxed">
            We didn&apos;t take any payment. Your card or bank account hasn&apos;t been touched.
          </p>

          <div className="bg-brand-bg rounded-2xl p-6 text-left mb-8 border border-black/8">
            <p className="font-semibold text-brand-ink mb-2">Want to try again?</p>
            <p className="text-sm text-brand-muted">
              You can pick up where you left off and try a different card or payment method.
              First 7 days are still 100% money-back guaranteed if you decide it&apos;s not for you.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href={COMPANY.links.build}
              className="flex-1 bg-brand-green text-white py-3 px-6 rounded-full font-semibold text-sm no-underline hover:bg-brand-green-dark transition-colors text-center"
            >
              Try again →
            </Link>
            <a
              href={`mailto:${COMPANY.publicEmail}?subject=Payment%20question`}
              className="flex-1 bg-white text-brand-ink py-3 px-6 rounded-full font-semibold text-sm no-underline border border-black/12 hover:border-brand-ink/40 transition-colors text-center"
            >
              Need help?
            </a>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

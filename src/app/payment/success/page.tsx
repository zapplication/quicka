import Link from "next/link";
import type { Metadata } from "next";
import { SiteFooter } from "@/components/SiteFooter";
import { COMPANY } from "@/lib/company";

export const metadata: Metadata = {
  title: `Payment received — ${COMPANY.tradingName}`,
  description: "Thanks for your payment. Your Quicka site is being prepared.",
};

export default function PaymentSuccessPage() {
  return (
    <main className="min-h-screen flex flex-col bg-brand-bg">
      <header className="bg-brand-ink px-6 py-4">
        <Link href="/" className="font-serif italic text-xl text-white no-underline">
          Quick<span className="text-brand-green">a</span>
        </Link>
      </header>

      <section className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="max-w-xl w-full bg-white rounded-3xl border border-black/8 p-10 text-center">
          <div className="text-6xl mb-6">✅</div>
          <h1 className="font-serif text-4xl text-brand-ink mb-3 tracking-tight">
            Payment received.
          </h1>
          <p className="text-brand-muted text-lg mb-8 leading-relaxed">
            Thanks — we&apos;ve received your subscription payment via PayFast. We&apos;ll
            email you a receipt and confirmation within a few minutes.
          </p>

          <div className="bg-brand-bg rounded-2xl p-6 text-left mb-8 border border-black/8">
            <p className="font-semibold text-brand-ink mb-3">What happens next</p>
            <ul className="space-y-3 text-sm text-brand-ink">
              <li className="flex gap-3">
                <span className="text-brand-green font-bold">1.</span>
                <span>
                  Your <code className="bg-brand-bg-alt px-1.5 py-0.5 rounded text-xs">.co.za</code> domain is being registered with our partner registrar.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-brand-green font-bold">2.</span>
                <span>Our AI is building your website.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-brand-green font-bold">3.</span>
                <span>
                  We&apos;ll email you the moment your site is live (usually within 30 minutes).
                </span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/"
              className="flex-1 bg-brand-ink text-white py-3 px-6 rounded-full font-semibold text-sm no-underline hover:bg-brand-ink/90 transition-colors text-center"
            >
              Back to home
            </Link>
            <a
              href={`mailto:${COMPANY.publicEmail}`}
              className="flex-1 bg-white text-brand-ink py-3 px-6 rounded-full font-semibold text-sm no-underline border border-black/12 hover:border-brand-ink/40 transition-colors text-center"
            >
              Email support
            </a>
          </div>

          <p className="text-xs text-brand-muted mt-6">
            Need to cancel within 7 days? Email{" "}
            <a
              href={`mailto:${COMPANY.publicEmail}?subject=Refund%20request`}
              className="underline hover:text-brand-ink"
            >
              {COMPANY.publicEmail}
            </a>{" "}
            — see our{" "}
            <Link href={COMPANY.links.refund} className="underline hover:text-brand-ink">
              refund policy
            </Link>
            .
          </p>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

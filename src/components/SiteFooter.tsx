import Link from "next/link";
import { COMPANY } from "@/lib/company";

/**
 * Shared site footer used on every non-home page.
 * The home page (src/app/page.tsx) has its own bespoke footer that mirrors
 * this content — kept in sync manually so the home page can stay hand-tuned.
 */
export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-brand-ink text-white py-14 px-6 mt-auto">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href={COMPANY.links.home} className="font-serif italic text-2xl no-underline">
              Quick<span className="text-brand-green">a</span>
            </Link>
            <p className="text-white/40 text-sm mt-3 max-w-sm">
              AI websites for South African small businesses. Built in 60 seconds.
              Hosting, .co.za domain, SSL and WhatsApp button included. From R99/month.
            </p>
          </div>

          {/* Product */}
          <div>
            <p className="text-xs font-bold tracking-widest uppercase text-white/50 mb-4">Product</p>
            <ul className="space-y-2 text-sm">
              <li><Link href="/#how-it-works" className="text-white/60 hover:text-white no-underline">How it works</Link></li>
              <li><Link href="/#pricing" className="text-white/60 hover:text-white no-underline">Pricing</Link></li>
              <li><Link href={COMPANY.links.build} className="text-white/60 hover:text-white no-underline">Build my site</Link></li>
              <li><Link href={COMPANY.links.about} className="text-white/60 hover:text-white no-underline">About Quicka</Link></li>
            </ul>
          </div>

          {/* Legal & Support */}
          <div>
            <p className="text-xs font-bold tracking-widest uppercase text-white/50 mb-4">Legal &amp; support</p>
            <ul className="space-y-2 text-sm">
              <li><Link href={COMPANY.links.contact} className="text-white/60 hover:text-white no-underline">Contact</Link></li>
              <li><Link href={COMPANY.links.terms} className="text-white/60 hover:text-white no-underline">Terms of Service</Link></li>
              <li><Link href={COMPANY.links.privacy} className="text-white/60 hover:text-white no-underline">Privacy Policy (POPIA)</Link></li>
              <li><Link href={COMPANY.links.refund} className="text-white/60 hover:text-white no-underline">Refunds &amp; Cancellation</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row gap-3 justify-between items-start md:items-center text-xs text-white/40">
          <span>
            © {year} {COMPANY.legalName} · Reg {COMPANY.cipcRegNumber}
            {COMPANY.vatNumber ? ` · VAT ${COMPANY.vatNumber}` : ""}
          </span>
          <span>Built in {COMPANY.launchMarket} 🇿🇦</span>
        </div>
      </div>
    </footer>
  );
}

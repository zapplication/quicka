import Link from "next/link";

/**
 * Lightweight site header used on legal/info pages.
 * The home page has its own bespoke nav (bg blur + animated CTA) which is
 * left untouched.
 */
export function SiteHeader() {
  return (
    <header className="bg-brand-bg border-b border-black/8">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="font-serif italic text-2xl text-brand-ink no-underline">
          Quick<span className="text-brand-green">a</span>
        </Link>
        <Link
          href="/"
          className="text-sm text-brand-muted hover:text-brand-ink no-underline transition-colors"
        >
          ← Back to home
        </Link>
      </div>
    </header>
  );
}

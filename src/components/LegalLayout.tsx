import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";

interface Props {
  title: string;
  subtitle?: string;
  lastUpdated: string; // ISO date string e.g. "2026-05-06"
  children: React.ReactNode;
}

/**
 * Shared layout for the four legal-style pages (Terms, Privacy, Refund,
 * Contact). Provides consistent typography, max-width, last-updated header,
 * and shared site nav/footer.
 */
export function LegalLayout({ title, subtitle, lastUpdated, children }: Props) {
  const formatted = new Date(lastUpdated).toLocaleDateString("en-ZA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <main className="min-h-screen flex flex-col bg-brand-bg">
      <SiteHeader />

      <article className="flex-1 w-full max-w-3xl mx-auto px-6 py-16">
        <header className="mb-10 pb-8 border-b border-black/8">
          <h1 className="font-serif text-4xl md:text-5xl text-brand-ink leading-tight tracking-tight">
            {title}
          </h1>
          {subtitle ? (
            <p className="text-brand-muted text-lg mt-3">{subtitle}</p>
          ) : null}
          <p className="text-xs text-brand-muted mt-6">
            Last updated: {formatted}
          </p>
        </header>

        <div
          className="
            text-brand-ink leading-relaxed
            [&_h2]:font-serif [&_h2]:text-2xl md:[&_h2]:text-3xl [&_h2]:mt-12 [&_h2]:mb-4 [&_h2]:tracking-tight
            [&_h3]:font-serif [&_h3]:text-xl [&_h3]:mt-8 [&_h3]:mb-3
            [&_p]:mb-5 [&_p]:leading-relaxed
            [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-5 [&_ul]:space-y-2
            [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-5 [&_ol]:space-y-2
            [&_li]:leading-relaxed
            [&_a]:text-brand-green-dark [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-brand-green
            [&_strong]:font-semibold
            [&_code]:bg-brand-bg-alt [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm
          "
        >
          {children}
        </div>
      </article>

      <SiteFooter />
    </main>
  );
}

/**
 * Quicka — Next.js Landing Page
 * ================================
 * This is the server-rendered landing page for quicka.website
 * 
 * Files in this module:
 *  src/app/page.tsx                    ← Root page (SSR — Google indexes this)
 *  src/components/landing/Nav.tsx      ← Sticky navigation
 *  src/components/landing/Ticker.tsx   ← Scrolling benefits ticker
 *  src/components/landing/Hero.tsx     ← Hero section with animated words
 *  src/components/landing/Benefits.tsx ← Benefits grid
 *  src/components/landing/HowItWorks.tsx
 *  src/components/landing/Pricing.tsx  ← Pricing cards
 *  src/components/landing/Blog.tsx     ← Blog preview section
 *  src/components/landing/FAQ.tsx      ← Accordion FAQ
 *  src/components/landing/Footer.tsx
 */

/* ════════════════════════════════════════════
   FILE 1 — src/app/page.tsx
   Server component — fully rendered HTML for Google
════════════════════════════════════════════ */
export const PAGE_TSX = `
import { Nav }         from "@/components/landing/Nav";
import { Ticker }      from "@/components/landing/Ticker";
import { Hero }        from "@/components/landing/Hero";
import { Benefits }    from "@/components/landing/Benefits";
import { HowItWorks }  from "@/components/landing/HowItWorks";
import { Pricing }     from "@/components/landing/Pricing";
import { Blog }        from "@/components/landing/Blog";
import { FAQ }         from "@/components/landing/FAQ";
import { Footer }      from "@/components/landing/Footer";
import { WhatsAppBubble } from "@/components/landing/WhatsAppBubble";

// These blog posts are rendered server-side — each is a static HTML node
// In production fetch from Supabase:
// const posts = await supabase.from("blog_posts").select("*").order("created_at", { ascending: false }).limit(3)
const BLOG_POSTS = [
  {
    slug:     "get-more-customers-online-2025",
    title:    "How to Get More Customers Online in 2025",
    excerpt:  "Having a website is no longer optional for South African small businesses. Here are 5 proven ways to attract more customers online without spending a fortune.",
    date:     "March 2025",
    readTime: "3 min read",
    category: "Growth",
  },
  {
    slug:     "why-every-small-business-needs-coza-domain",
    title:    "Why Every Small Business Needs a .co.za Domain",
    excerpt:  "A professional domain builds trust with your customers and helps you rank on Google. Here is why it matters — and how to get one included free.",
    date:     "February 2025",
    readTime: "2 min read",
    category: "Domains",
  },
  {
    slug:     "5-things-your-website-must-have",
    title:    "5 Things Your Website Must Have to Convert Visitors",
    excerpt:  "Most small business websites lose customers within the first 5 seconds. Make sure yours has these essential elements that turn visitors into paying customers.",
    date:     "January 2025",
    readTime: "4 min read",
    category: "Tips",
  },
];

export default function HomePage() {
  return (
    <main>
      <Nav />
      <Ticker />
      <Hero />
      <Benefits />
      <HowItWorks />
      <Pricing />
      <Blog posts={BLOG_POSTS} />
      <FAQ />
      <Footer />
      <WhatsAppBubble phone="27600000000" />
    </main>
  );
}
`;

/* ════════════════════════════════════════════
   FILE 2 — src/components/landing/Nav.tsx
════════════════════════════════════════════ */
export const NAV_TSX = `
"use client";

import Link          from "next/link";
import { useState }  from "react";
import { Button }    from "@/components/ui";

export function Nav() {
  const [scrolled, setScrolled] = useState(false);

  if (typeof window !== "undefined") {
    window.addEventListener("scroll", () => setScrolled(window.scrollY > 20), { passive: true });
  }

  return (
    <nav className={\`fixed top-0 left-0 right-0 z-50 transition-all duration-300
      \${scrolled ? "bg-brand-bg/95 backdrop-blur-lg border-b border-black/8 shadow-sm" : "bg-transparent"}\`}>
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="font-serif text-xl text-brand-ink no-underline">
          Quicka
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {[
            { label: "How it works", href: "#how-it-works" },
            { label: "Pricing",      href: "#pricing" },
            { label: "Blog",         href: "#blog" },
          ].map(item => (
            <a key={item.href} href={item.href}
              className="text-sm text-brand-muted font-medium hover:text-brand-ink transition-colors no-underline">
              {item.label}
            </a>
          ))}
        </div>

        {/* CTA */}
        <Button variant="green" size="sm" onClick={() => {
          document.dispatchEvent(new CustomEvent("quicka:open-onboarding"));
        }}>
          Build free preview →
        </Button>
      </div>
    </nav>
  );
}
`;

/* ════════════════════════════════════════════
   FILE 3 — src/components/landing/Ticker.tsx
════════════════════════════════════════════ */
export const TICKER_TSX = `
const ITEMS = [
  "Built in 60 Seconds", "No Design Fees", "Free .co.za Domain",
  "SSL Included", "Hosting Included", "5–10 Changes/Month",
  "Mobile Optimised", "Contact Form Included", "WhatsApp Button",
  "No Hidden Costs", "Blog Included", "AI-Generated Content",
];

export function Ticker() {
  const doubled = [...ITEMS, ...ITEMS];

  return (
    <div className="bg-brand-ink overflow-hidden py-2.5 mt-16">
      <div className="flex animate-ticker w-max">
        {doubled.map((item, i) => (
          <span key={i} className="px-7 text-xs font-bold tracking-widest uppercase
            text-white whitespace-nowrap flex items-center gap-7">
            {item}
            <span className="opacity-30">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
`;

/* ════════════════════════════════════════════
   FILE 4 — src/components/landing/Hero.tsx
════════════════════════════════════════════ */
export const HERO_TSX = `
"use client";

import { useState, useEffect } from "react";
import { Button }              from "@/components/ui";

const WORDS = [
  "hair salon", "spaza shop", "food truck", "plumber",
  "tutor", "bakery", "photographer", "cleaner", "mechanic", "tailor",
];

export function Hero() {
  const [wordIndex, setWordIndex] = useState(0);
  const [visible,   setVisible]   = useState(true);

  useEffect(() => {
    const t = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setWordIndex(i => (i + 1) % WORDS.length);
        setVisible(true);
      }, 300);
    }, 2800);
    return () => clearInterval(t);
  }, []);

  const openOnboarding = () => {
    document.dispatchEvent(new CustomEvent("quicka:open-onboarding"));
  };

  return (
    <section className="min-h-screen flex flex-col justify-center relative overflow-hidden
      px-6 pt-32 pb-16">
      {/* Grid background */}
      <div className="absolute inset-0 opacity-40"
        style={{ backgroundImage: "radial-gradient(circle at 1px 1px,rgba(0,0,0,0.05) 1px,transparent 0)", backgroundSize: "28px 28px" }} />

      {/* Green glow */}
      <div className="absolute top-1/4 right-0 w-96 h-96 rounded-full opacity-20
        bg-brand-green blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-4xl">
        {/* Pill badge */}
        <div className="animate-fadeUp inline-flex items-center gap-2 bg-brand-warm
          border border-black/8 rounded-full px-3 py-1.5 mb-6 text-sm font-medium">
          <span className="bg-brand-green text-white rounded-full px-2.5 py-0.5 text-xs font-bold">
            🇿🇦 SA
          </span>
          AI websites for South African small businesses
        </div>

        {/* Headline */}
        <h1 className="font-serif text-5xl md:text-7xl font-normal leading-none
          tracking-tight mb-6">
          Your{" "}
          <span
            className="text-brand-green italic transition-opacity duration-300"
            style={{ opacity: visible ? 1 : 0 }}
          >
            {WORDS[wordIndex]}
          </span>
          <br />needs a website.
        </h1>

        {/* Subheading */}
        <p className="text-brand-muted text-lg leading-relaxed max-w-xl mb-8">
          Answer 8 quick questions. AI builds your complete website in{" "}
          <strong className="text-brand-ink">60 seconds</strong> — with your own{" "}
          <strong className="text-brand-ink">.co.za domain</strong>, contact form,
          WhatsApp button and more. From{" "}
          <strong className="text-brand-ink">R99/month</strong>.{" "}
          <strong className="text-brand-green">Preview free before you pay.</strong>
        </p>

        {/* CTA */}
        <div className="flex flex-col items-start gap-3">
          <Button variant="green" size="lg" onClick={openOnboarding}>
            ⚡ Build my free preview →
          </Button>
          <p className="text-sm text-brand-muted">
            No credit card · 60-minute free preview · No tech skills needed
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 mt-12 pt-8 border-t border-black/8 max-w-xs">
          {[
            ["60s",  "Build time"],
            ["R99",  "From/month"],
            ["R0",   "Upfront cost"],
          ].map(([num, label]) => (
            <div key={num}>
              <div className="font-serif text-3xl tracking-tight">{num}</div>
              <div className="text-xs text-brand-muted mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
`;

/* ════════════════════════════════════════════
   FILE 5 — src/components/landing/Benefits.tsx
════════════════════════════════════════════ */
export const BENEFITS_TSX = `
import { BENEFITS } from "@/lib/constants";

export function Benefits() {
  return (
    <section className="bg-brand-ink py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <p className="text-xs font-bold tracking-widest uppercase text-brand-green mb-3">
          Why Quicka
        </p>
        <h2 className="font-serif text-4xl md:text-5xl font-normal text-white
          tracking-tight leading-tight mb-3">
          Everything included.{" "}
          <em className="text-brand-green">Nothing extra.</em>
        </h2>
        <p className="text-white/40 text-sm mb-12 max-w-lg">
          Traditional web agencies charge R5,000–R20,000 upfront.
          Quicka charges nothing upfront and builds in 60 seconds.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {BENEFITS.map((b, i) => (
            <div key={i}
              className="bg-white/5 border border-white/8 rounded-2xl p-5
                hover:bg-white/8 transition-colors duration-200 cursor-default">
              <div className="text-2xl mb-3">{b.icon}</div>
              <h3 className="text-white font-semibold text-sm mb-1.5">{b.title}</h3>
              <p className="text-white/40 text-xs leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
`;

/* ════════════════════════════════════════════
   FILE 6 — src/components/landing/HowItWorks.tsx
════════════════════════════════════════════ */
export const HOW_IT_WORKS_TSX = `
"use client";

import { Button } from "@/components/ui";

const STEPS = [
  { icon: "📝", title: "Answer 8 questions",  desc: "Tell us about your business, services, photos and colours. Takes about 5 minutes." },
  { icon: "⚡", title: "AI builds your site", desc: "Our AI generates your complete website in 60 seconds with content, images and layout." },
  { icon: "👀", title: "Preview for free",    desc: "See your finished site for 60 minutes before paying a single cent." },
  { icon: "🚀", title: "Go live today",       desc: "Pay and your .co.za domain and website go live within minutes." },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-white py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <p className="text-xs font-bold tracking-widest uppercase text-brand-green mb-3">
          How it works
        </p>
        <h2 className="font-serif text-4xl md:text-5xl font-normal tracking-tight
          leading-tight mb-12">
          From zero to live{" "}
          <em className="text-brand-green">in minutes.</em>
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {STEPS.map((s, i) => (
            <div key={i} className="relative">
              {/* Step number */}
              <div className="w-8 h-8 bg-brand-green/10 text-brand-green rounded-full
                flex items-center justify-center text-xs font-bold mb-4">
                {i + 1}
              </div>
              <div className="text-3xl mb-3">{s.icon}</div>
              <h3 className="font-bold text-brand-ink mb-2">{s.title}</h3>
              <p className="text-sm text-brand-muted leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Button variant="green" size="lg" onClick={() =>
            document.dispatchEvent(new CustomEvent("quicka:open-onboarding"))
          }>
            Get started free →
          </Button>
        </div>
      </div>
    </section>
  );
}
`;

/* ════════════════════════════════════════════
   FILE 7 — src/components/landing/Pricing.tsx
════════════════════════════════════════════ */
export const PRICING_TSX = `
"use client";

import { PLANS, type PlanName } from "@/lib/constants";
import { Button }               from "@/components/ui";

const PLAN_FEATURES: Record<PlanName, string[]> = {
  Basic: [
    "1-page site",
    "Custom .co.za domain",
    "SSL certificate",
    "Up to 5 services/products",
    "Contact form → email",
    "WhatsApp button",
    "Brand colour",
    "5 changes/month",
    "Mobile optimised",
  ],
  Growth: [
    "Up to 5 pages",
    "Custom .co.za domain",
    "Everything in Basic",
    "Up to 8 services/products",
    "AI-written content",
    "3 AI blog posts",
    "Basic SEO setup",
    "Google Business help",
    "8 changes/month",
  ],
  Business: [
    "Up to 5 pages",
    "Custom .co.za domain",
    "Everything in Growth",
    "Up to 12 services/products",
    "5 AI blog posts",
    "Photo gallery",
    "Online store (12 products)",
    "WhatsApp ordering button",
    "10 changes/month",
    "Priority support",
  ],
};

const PLAN_DESC: Record<PlanName, string> = {
  Basic:    "One clean page. Everything you need to get found online.",
  Growth:   "More pages, blog and AI content to grow your reach.",
  Business: "Full online presence with store, gallery and ordering.",
};

const FEATURED: PlanName = "Growth";

export function Pricing() {
  const openOnboarding = () =>
    document.dispatchEvent(new CustomEvent("quicka:open-onboarding"));

  return (
    <section id="pricing" className="bg-brand-bg py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <p className="text-xs font-bold tracking-widest uppercase text-brand-green mb-3">
          Pricing
        </p>
        <h2 className="font-serif text-4xl md:text-5xl font-normal tracking-tight
          leading-tight mb-3">
          Simple pricing.{" "}
          <em className="text-brand-green">No surprises.</em>
        </h2>
        <p className="text-brand-muted text-sm mb-12 max-w-lg">
          Every plan includes .co.za domain, SSL, contact form and WhatsApp button.
          Preview free for 60 minutes. Cancel anytime.
        </p>

        <div className="grid md:grid-cols-3 gap-5">
          {(Object.keys(PLANS) as PlanName[]).map(planName => {
            const plan     = PLANS[planName];
            const featured = planName === FEATURED;

            return (
              <div key={planName}
                className={\`relative rounded-3xl p-8 transition-transform duration-200
                  hover:-translate-y-1
                  \${featured
                    ? "bg-brand-ink text-white"
                    : "bg-white border border-black/8"
                  }\`}>

                {/* Popular badge */}
                {featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2
                    bg-brand-green text-white text-xs font-bold tracking-wider
                    uppercase px-4 py-1 rounded-full whitespace-nowrap">
                    Most Popular
                  </div>
                )}

                {/* Plan name */}
                <p className={\`text-xs font-bold tracking-widest uppercase mb-2
                  \${featured ? "text-white/40" : "text-brand-muted"}\`}>
                  {planName}
                </p>

                {/* Price */}
                <div className="font-serif text-5xl tracking-tight leading-none mb-1">
                  R{plan.price}
                  <span className={\`text-sm font-sans
                    \${featured ? "text-white/40" : "text-brand-muted"}\`}>
                    /mo
                  </span>
                </div>

                {/* Description */}
                <p className={\`text-sm mb-6 leading-relaxed
                  \${featured ? "text-white/55" : "text-brand-muted"}\`}>
                  {PLAN_DESC[planName]}
                </p>

                {/* Features */}
                <ul className="space-y-2 mb-8">
                  {PLAN_FEATURES[planName].map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <span className="text-brand-green font-bold text-xs mt-0.5 flex-shrink-0">✓</span>
                      <span className={featured ? "text-white/80" : "text-brand-ink"}>{f}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <button
                  onClick={openOnboarding}
                  className={\`w-full py-3.5 rounded-full font-semibold text-sm
                    transition-opacity duration-150 hover:opacity-85 cursor-pointer border-none
                    \${featured
                      ? "bg-brand-green text-white"
                      : "bg-brand-ink text-white"
                    }\`}>
                  Build free preview →
                </button>
              </div>
            );
          })}
        </div>

        <p className="text-center text-xs text-brand-muted mt-6">
          All plans include a free 60-minute preview. No credit card required to preview.
        </p>
      </div>
    </section>
  );
}
`;

/* ════════════════════════════════════════════
   FILE 8 — src/components/landing/Blog.tsx
════════════════════════════════════════════ */
export const BLOG_TSX = `
import Link from "next/link";

interface BlogPost {
  slug:     string;
  title:    string;
  excerpt:  string;
  date:     string;
  readTime: string;
  category: string;
}

export function Blog({ posts }: { posts: BlogPost[] }) {
  return (
    <section id="blog" className="bg-brand-warm py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <p className="text-xs font-bold tracking-widest uppercase text-brand-green mb-3">
          Blog
        </p>
        <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
          <h2 className="font-serif text-4xl md:text-5xl font-normal tracking-tight leading-tight">
            Tips for SA{" "}
            <em className="text-brand-green">small businesses.</em>
          </h2>
          <Link href="/blog"
            className="text-sm font-semibold text-brand-green hover:underline no-underline">
            View all posts →
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {posts.map(post => (
            <Link key={post.slug} href={\`/blog/\${post.slug}\`}
              className="no-underline group">
              <article className="bg-white rounded-2xl p-6 border border-black/8
                hover:-translate-y-1 transition-all duration-200 hover:shadow-md h-full
                flex flex-col">
                {/* Meta */}
                <div className="flex gap-2 mb-4 flex-wrap">
                  <span className="text-xs text-brand-muted bg-brand-warm
                    px-3 py-1 rounded-full">{post.category}</span>
                  <span className="text-xs text-brand-muted bg-brand-warm
                    px-3 py-1 rounded-full">{post.readTime}</span>
                </div>

                {/* Title */}
                <h3 className="font-bold text-brand-ink text-base leading-snug
                  mb-3 group-hover:text-brand-green transition-colors flex-1">
                  {post.title}
                </h3>

                {/* Excerpt */}
                <p className="text-sm text-brand-muted leading-relaxed mb-4">
                  {post.excerpt}
                </p>

                {/* Read more */}
                <span className="text-sm font-semibold text-brand-green mt-auto">
                  Read more →
                </span>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
`;

/* ════════════════════════════════════════════
   FILE 9 — src/components/landing/FAQ.tsx
════════════════════════════════════════════ */
export const FAQ_TSX = `
"use client";

import { useState } from "react";

const FAQS = [
  { q: "Do I need any technical skills?",         a: "None at all. If you can use WhatsApp, you can use Quicka. We handle everything." },
  { q: "How long does it really take?",            a: "The AI generates your site in about 60 seconds. Domain activation takes a few minutes after payment." },
  { q: "Can I change my site after it goes live?", a: "Yes — you get 5, 8 or 10 changes per month depending on your plan, managed through your dashboard." },
  { q: "What if I don't have a logo?",             a: "No problem. Your site will use your business name as styled text, or you can add an AI logo for R149 once-off." },
  { q: "Can I cancel anytime?",                    a: "Yes. Month-to-month subscriptions. No contracts, no cancellation fees. 30 days notice." },
  { q: "What is included in the .co.za domain?",   a: "Your own domain (e.g. sarahshair.co.za) is included on every plan at no extra cost. It renews automatically." },
  { q: "Will my site work on mobile?",             a: "Yes — every Quicka site is fully mobile-optimised and tested across all screen sizes." },
  { q: "How does the blog work?",                  a: "Growth and Business plans include 3 or 5 AI-generated starter blog posts. You can add more posts yourself via your dashboard after going live." },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="bg-brand-bg py-20 px-6">
      <div className="max-w-2xl mx-auto">
        <p className="text-xs font-bold tracking-widest uppercase text-brand-green mb-3">
          FAQ
        </p>
        <h2 className="font-serif text-4xl md:text-5xl font-normal tracking-tight
          leading-tight mb-10">
          Common questions.
        </h2>

        <div className="divide-y divide-black/8">
          {FAQS.map((faq, i) => (
            <div key={i}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full py-5 flex items-center justify-between gap-4
                  text-left bg-transparent border-none cursor-pointer group"
              >
                <span className="font-semibold text-brand-ink group-hover:text-brand-green
                  transition-colors text-sm md:text-base">
                  {faq.q}
                </span>
                <span className={\`text-brand-green font-bold text-lg flex-shrink-0
                  transition-transform duration-200 \${open === i ? "rotate-45" : ""}\`}>
                  +
                </span>
              </button>

              {open === i && (
                <p className="pb-5 text-sm text-brand-muted leading-relaxed animate-fadeUp">
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
`;

/* ════════════════════════════════════════════
   FILE 10 — src/components/landing/Footer.tsx
════════════════════════════════════════════ */
export const FOOTER_TSX = `
import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-brand-ink py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-4 gap-10 mb-10">
          {/* Brand */}
          <div>
            <div className="font-serif text-xl text-white mb-3">Quicka</div>
            <p className="text-white/35 text-xs leading-relaxed">
              AI websites for every South African business. Built in 60 seconds.
            </p>
          </div>

          {/* Product */}
          <div>
            <p className="text-white/40 text-xs font-bold tracking-widest uppercase mb-3">Product</p>
            <div className="flex flex-col gap-2">
              {[
                { label: "How it works", href: "#how-it-works" },
                { label: "Pricing",      href: "#pricing" },
                { label: "Blog",         href: "/blog" },
              ].map(l => (
                <Link key={l.href} href={l.href}
                  className="text-white/50 text-sm hover:text-white no-underline transition-colors">
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Support */}
          <div>
            <p className="text-white/40 text-xs font-bold tracking-widest uppercase mb-3">Support</p>
            <div className="flex flex-col gap-2">
              {[
                { label: "Dashboard",     href: "/dashboard" },
                { label: "Contact us",    href: "mailto:hello@quicka.website" },
              ].map(l => (
                <a key={l.href} href={l.href}
                  className="text-white/50 text-sm hover:text-white no-underline transition-colors">
                  {l.label}
                </a>
              ))}
            </div>
          </div>

          {/* Legal */}
          <div>
            <p className="text-white/40 text-xs font-bold tracking-widest uppercase mb-3">Legal</p>
            <div className="flex flex-col gap-2">
              {[
                { label: "Privacy policy", href: "/privacy" },
                { label: "Terms of use",   href: "/terms" },
              ].map(l => (
                <Link key={l.href} href={l.href}
                  className="text-white/50 text-sm hover:text-white no-underline transition-colors">
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row
          items-center justify-between gap-3">
          <p className="text-white/25 text-xs">
            © 2025 Quicka · hello@quicka.website · quicka.website
          </p>
          <p className="text-white/20 text-xs">
            Built in South Africa 🇿🇦
          </p>
        </div>
      </div>
    </footer>
  );
}
`;

/* ════════════════════════════════════════════
   FILE 11 — src/components/landing/WhatsAppBubble.tsx
════════════════════════════════════════════ */
export const WHATSAPP_BUBBLE_TSX = `
export function WhatsAppBubble({ phone }: { phone: string }) {
  return (
    <a
      href={\`https://wa.me/\${phone}\`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full
        bg-[#25D366] flex items-center justify-center text-2xl
        shadow-lg shadow-green-500/30 hover:scale-110 transition-transform
        duration-200 no-underline"
    >
      💬
    </a>
  );
}
`;

// Demo render
export default function LandingPageDemo() {
  const files = [
    { id: "page",       label: "📄 app/page.tsx",              content: PAGE_TSX },
    { id: "nav",        label: "🧭 landing/Nav.tsx",           content: NAV_TSX },
    { id: "ticker",     label: "📢 landing/Ticker.tsx",        content: TICKER_TSX },
    { id: "hero",       label: "🦸 landing/Hero.tsx",          content: HERO_TSX },
    { id: "benefits",   label: "✅ landing/Benefits.tsx",      content: BENEFITS_TSX },
    { id: "howitworks", label: "📋 landing/HowItWorks.tsx",    content: HOW_IT_WORKS_TSX },
    { id: "pricing",    label: "💰 landing/Pricing.tsx",       content: PRICING_TSX },
    { id: "blog",       label: "📝 landing/Blog.tsx",          content: BLOG_TSX },
    { id: "faq",        label: "❓ landing/FAQ.tsx",           content: FAQ_TSX },
    { id: "footer",     label: "🦶 landing/Footer.tsx",        content: FOOTER_TSX },
    { id: "whatsapp",   label: "💬 landing/WhatsAppBubble.tsx", content: WHATSAPP_BUBBLE_TSX },
  ];

  const { useState } = require("react");
  const [active, setActive] = useState("page");
  const current = files.find(f => f.id === active);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", fontFamily: "Arial, sans-serif", background: "#F5F2ED" }}>
      <div style={{ background: "#0A0A0A", padding: "0.85rem 1.5rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <div style={{ fontStyle: "italic", fontSize: "1.2rem", color: "#fff" }}>Quick<span style={{ color: "#00C853" }}>a</span></div>
        <div style={{ width: 1, height: 18, background: "rgba(255,255,255,0.15)" }} />
        <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.35)", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase" }}>Landing Page — {files.length} files — Server Rendered (SSR)</span>
        <div style={{ marginLeft: "auto", background: "rgba(0,200,83,0.15)", color: "#00C853", fontSize: "0.72rem", fontWeight: 700, padding: "0.25rem 0.65rem", borderRadius: "100px" }}>SEO ✅</div>
      </div>
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <div style={{ width: 240, background: "#fff", borderRight: "1px solid rgba(0,0,0,0.08)", overflowY: "auto", flexShrink: 0 }}>
          <div style={{ padding: "0.85rem 1rem", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: "#7A756E", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>Landing Page Files</div>
          {files.map(f => (
            <button key={f.id} onClick={() => setActive(f.id)}
              style={{ width: "100%", padding: "0.65rem 1rem", background: active === f.id ? "rgba(0,200,83,0.08)" : "transparent", border: "none", borderLeft: `3px solid ${active === f.id ? "#00C853" : "transparent"}`, cursor: "pointer", textAlign: "left", fontSize: "0.82rem", fontWeight: active === f.id ? 700 : 400, color: active === f.id ? "#00C853" : "#0A0A0A", fontFamily: "Arial", transition: "all 0.12s" }}>
              {f.label}
            </button>
          ))}
        </div>
        <div style={{ flex: 1, overflow: "auto", background: "#1E1E1E", padding: "1.5rem" }}>
          <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: "8px 8px 0 0", padding: "0.5rem 1rem", fontSize: "0.7rem", color: "rgba(255,255,255,0.35)", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase" }}>
            {current?.label} · typescript
          </div>
          <pre style={{ background: "#1E1E1E", borderRadius: "0 0 8px 8px", padding: "1.25rem", fontSize: "0.76rem", color: "rgba(255,255,255,0.8)", lineHeight: 1.75, fontFamily: "Courier New, monospace", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
            {current?.content}
          </pre>
        </div>
      </div>
    </div>
  );
}

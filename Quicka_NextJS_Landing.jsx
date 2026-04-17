/**
 * Quicka — Next.js Project Setup Files
 * ======================================
 * Save each section to the correct file in your project root
 *
 * SETUP COMMANDS (run in order):
 *   npx create-next-app@latest quicka --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
 *   cd quicka
 *   npm install @supabase/supabase-js @supabase/ssr
 *   npm install @supabase/auth-helpers-nextjs
 *
 * Then replace the default files with the ones below.
 */

/* ════════════════════════════════════════════
   FILE 1 — next.config.ts
   Save to: next.config.ts (project root)
════════════════════════════════════════════ */
export const NEXT_CONFIG = `
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  experimental: {
    serverActions: { allowedOrigins: ["quicka.website", "app.quicka.website"] },
  },
};

export default nextConfig;
`;

/* ════════════════════════════════════════════
   FILE 2 — tailwind.config.ts
   Save to: tailwind.config.ts (project root)
════════════════════════════════════════════ */
export const TAILWIND_CONFIG = `
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Quicka brand colours
        brand: {
          green:     "#00C853",
          greenDark: "#009624",
          ink:       "#0A0A0A",
          bg:        "#F5F2ED",
          warm:      "#EDE8DF",
          muted:     "#7A756E",
          ember:     "#FF4D1C",
          amber:     "#F5A623",
          blue:      "#2563EB",
        },
      },
      fontFamily: {
        sans:  ["var(--font-familjen)", "Arial", "sans-serif"],
        serif: ["var(--font-instrument)", "Georgia", "serif"],
      },
      animation: {
        ticker:  "ticker 30s linear infinite",
        float:   "float 3s ease-in-out infinite",
        fadeUp:  "fadeUp 0.45s ease both",
        spin:    "spin 0.8s linear infinite",
      },
      keyframes: {
        ticker:  { from: { transform: "translateX(0)" },    to: { transform: "translateX(-50%)" } },
        float:   { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-8px)" } },
        fadeUp:  { from: { opacity: "0", transform: "translateY(16px)" }, to: { opacity: "1", transform: "translateY(0)" } },
      },
      borderRadius: {
        "4xl": "2rem",
      },
    },
  },
  plugins: [],
};

export default config;
`;

/* ════════════════════════════════════════════
   FILE 3 — src/app/globals.css
   Save to: src/app/globals.css
════════════════════════════════════════════ */
export const GLOBALS_CSS = `
@import "tailwindcss";

@import url('https://fonts.googleapis.com/css2?family=Familjen+Grotesk:wght@400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap');

:root {
  --font-familjen:    'Familjen Grotesk', sans-serif;
  --font-instrument:  'Instrument Serif', serif;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  scroll-behavior: smooth;
}

body {
  font-family: var(--font-familjen);
  background: #F5F2ED;
  color: #0A0A0A;
  -webkit-font-smoothing: antialiased;
}

/* Scrollbar */
::-webkit-scrollbar       { width: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #ddd; border-radius: 3px; }

/* Focus ring */
*:focus-visible {
  outline: 2px solid #00C853;
  outline-offset: 2px;
}
`;

/* ════════════════════════════════════════════
   FILE 4 — src/app/layout.tsx
   Save to: src/app/layout.tsx
   Root layout — wraps every page
════════════════════════════════════════════ */
export const ROOT_LAYOUT = `
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title:       "Quicka — AI Websites for South African Businesses",
  description: "Answer 8 questions. AI builds your complete website in 60 seconds. Free .co.za domain included. From R99/month.",
  keywords:    "website builder South Africa, cheap website co.za, AI website builder SA, small business website South Africa",
  authors:     [{ name: "Quicka" }],
  openGraph: {
    title:       "Quicka — AI Websites Built in 60 Seconds",
    description: "Your .co.za website built by AI in 60 seconds. Free preview. From R99/month.",
    url:         "https://quicka.website",
    siteName:    "Quicka",
    locale:      "en_ZA",
    type:        "website",
  },
  twitter: {
    card:        "summary_large_image",
    title:       "Quicka — AI Websites for SA Businesses",
    description: "Built in 60 seconds. Free .co.za domain. From R99/month.",
  },
  robots: {
    index:  true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-ZA">
      <body className="bg-brand-bg text-brand-ink antialiased">
        {children}
      </body>
    </html>
  );
}
`;

/* ════════════════════════════════════════════
   FILE 5 — src/lib/constants.ts
   Save to: src/lib/constants.ts
   Single source of truth for all plan data
════════════════════════════════════════════ */
export const CONSTANTS_FILE = `
// Quicka — App constants
// Single source of truth for plans, pricing, features

export const PLANS = {
  Basic: {
    name:       "Basic",
    price:      99,
    pages:      1,
    items:      5,
    changes:    5,
    blog:       0,
    store:      false,
    gallery:    false,
    waOrder:    false,
    aiContent:  false,
    seo:        false,
  },
  Growth: {
    name:       "Growth",
    price:      149,
    pages:      5,
    items:      8,
    changes:    8,
    blog:       3,
    store:      false,
    gallery:    false,
    waOrder:    false,
    aiContent:  true,
    seo:        true,
  },
  Business: {
    name:       "Business",
    price:      249,
    pages:      5,
    items:      12,
    changes:    10,
    blog:       5,
    store:      true,
    gallery:    true,
    waOrder:    true,
    aiContent:  true,
    seo:        true,
  },
} as const;

export type PlanName = keyof typeof PLANS;

export const EMAIL_UPSELL_PRICE = 49;
export const LOGO_UPSELL_PRICE  = 149;

export const BRAND_COLOURS = [
  { name: "Ocean Blue",    primary: "#1E40AF", secondary: "#DBEAFE", accent: "#3B82F6" },
  { name: "Forest Green",  primary: "#166534", secondary: "#DCFCE7", accent: "#22C55E" },
  { name: "Sunset Orange", primary: "#9A3412", secondary: "#FFEDD5", accent: "#F97316" },
  { name: "Royal Purple",  primary: "#6B21A8", secondary: "#F3E8FF", accent: "#A855F7" },
  { name: "Charcoal",      primary: "#1F2937", secondary: "#F9FAFB", accent: "#6B7280" },
] as const;

export const PROGRESS_STEPS = [
  { label: "Collecting your details",   duration: 1500 },
  { label: "Generating your content",   duration: 3000 },
  { label: "Building your pages",       duration: 3500 },
  { label: "Adding images",             duration: 2500 },
  { label: "Setting up your domain",    duration: 2000 },
  { label: "Finalising your site",      duration: 1500 },
  { label: "Your site is ready! 🎉",    duration: 500  },
] as const;

export const BENEFITS = [
  { icon: "🚀", title: "Built in 60 Seconds",    desc: "AI generates your complete site instantly" },
  { icon: "💰", title: "No Design Fees",          desc: "Zero upfront costs, ever" },
  { icon: "🔒", title: "No Hidden Costs",         desc: "One simple monthly price" },
  { icon: "🌐", title: ".co.za Domain Included",  desc: "Your own domain on every plan" },
  { icon: "🔐", title: "SSL Included",            desc: "Secure site on every plan" },
  { icon: "📱", title: "Mobile Optimised",        desc: "Looks great on any device" },
  { icon: "🏠", title: "Hosting Included",        desc: "Fast Cloudflare hosting" },
  { icon: "✏️", title: "Changes Included",        desc: "5–10 changes per month" },
  { icon: "📋", title: "Contact Form",            desc: "Leads to your email instantly" },
  { icon: "💬", title: "WhatsApp Button",         desc: "Customers contact you instantly" },
] as const;

export const SITE_URL      = process.env.NEXT_PUBLIC_SITE_URL      || "https://quicka.website";
export const DASHBOARD_URL = process.env.NEXT_PUBLIC_DASHBOARD_URL || "https://app.quicka.website";
`;

/* ════════════════════════════════════════════
   FILE 6 — src/lib/supabase/client.ts
   Save to: src/lib/supabase/client.ts
   Browser-side Supabase client
════════════════════════════════════════════ */
export const SUPABASE_CLIENT = `
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
`;

/* ════════════════════════════════════════════
   FILE 7 — src/lib/supabase/server.ts
   Save to: src/lib/supabase/server.ts
   Server-side Supabase client (for Server Components)
════════════════════════════════════════════ */
export const SUPABASE_SERVER = `
import { createServerClient } from "@supabase/ssr";
import { cookies }            from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll()            { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch { /* Server Component — ignore */ }
        },
      },
    }
  );
}
`;

/* ════════════════════════════════════════════
   FILE 8 — src/lib/supabase/middleware.ts
   Save to: src/lib/supabase/middleware.ts
════════════════════════════════════════════ */
export const SUPABASE_MIDDLEWARE = `
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll()            { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // Protect dashboard routes
  if (!user && request.nextUrl.pathname.startsWith("/dashboard")) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
`;

/* ════════════════════════════════════════════
   FILE 9 — src/middleware.ts
   Save to: src/middleware.ts (project root of src)
════════════════════════════════════════════ */
export const MIDDLEWARE = `
import { type NextRequest } from "next/server";
import { updateSession }    from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
`;

/* ════════════════════════════════════════════
   FILE 10 — .env.local
   Save to: .env.local (project root — NEVER commit)
════════════════════════════════════════════ */
export const ENV_LOCAL = `
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Anthropic (AI generation)
ANTHROPIC_API_KEY=sk-ant-your_key_here

# PayFast
NEXT_PUBLIC_PF_MERCHANT_ID=your_merchant_id
PF_MERCHANT_KEY=your_merchant_key
PF_PASSPHRASE=your_passphrase
NEXT_PUBLIC_PF_SANDBOX=true

# App URLs
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_DASHBOARD_URL=http://localhost:3000/dashboard

# Resend (emails)
RESEND_API_KEY=re_your_key_here
`;

/* ════════════════════════════════════════════
   FILE 11 — src/types/index.ts
   Save to: src/types/index.ts
   TypeScript types for the whole app
════════════════════════════════════════════ */
export const TYPES_FILE = `
import type { PlanName } from "@/lib/constants";

// ── Onboarding data ────────────────────────────────────
export interface ServiceItem {
  name:        string;
  description: string;
  price:       string;
  photo:       string | null;
}

export interface OnboardingData {
  // Step 1
  email:         string;
  emailUpsell:   boolean;
  // Step 2
  otp:           string;
  // Step 3
  plan:          PlanName;
  // Step 4
  bizType:       "Service" | "Product";
  // Step 5
  items:         ServiceItem[];
  // Step 6
  bizName:       string;
  // Step 7
  bizDesc:       string;
  // Step 8
  city:          string;
  whatsapp:      string;
  // Step 9
  facebook:      string;
  instagram:     string;
  tiktok:        string;
  // Step 10
  photos:        (string | null)[];
  useIndustryPhotos: boolean;
  // Step 11
  brandColourIndex: number;
  customColour:  boolean;
  customHex:     string;
  // Step 12
  logo:          string | null;
  logoUpsell:    boolean;
}

// ── Database types ─────────────────────────────────────
export interface Site {
  id:                  string;
  owner_id:            string;
  status:              SiteStatus;
  plan:                PlanName;
  biz_name:            string;
  biz_desc:            string;
  biz_type:            "Service" | "Product";
  city:                string;
  whatsapp:            string;
  custom_domain:       string | null;
  subdomain:           string | null;
  domain_status:       DomainStatus;
  changes_used:        number;
  changes_reset_date:  string;
  payment_fail_count:  number;
  grace_period_ends:   string | null;
  email_upsell:        boolean;
  logo_url:            string | null;
  brand_colour:        string;
  created_at:          string;
  updated_at:          string;
}

export type SiteStatus    = "draft" | "preview" | "active" | "payment_failed" | "suspended" | "cancelled";
export type DomainStatus  = "pending" | "registering" | "active" | "error";

export interface Lead {
  id:          string;
  site_id:     string;
  name:        string | null;
  phone:       string | null;
  email:       string | null;
  message:     string | null;
  read:        boolean;
  created_at:  string;
}

export interface ChangeRequest {
  id:          string;
  site_id:     string;
  description: string;
  status:      "pending" | "in_progress" | "completed";
  created_at:  string;
  completed_at: string | null;
}

export interface Profile {
  id:          string;
  email:       string;
  created_at:  string;
}
`;

/* ════════════════════════════════════════════
   SETUP INSTRUCTIONS
   Follow these steps exactly
════════════════════════════════════════════ */
export const SETUP_INSTRUCTIONS = `
QUICKA — NEXT.JS SETUP INSTRUCTIONS
======================================

STEP 1 — Create the project
  npx create-next-app@latest quicka \\
    --typescript \\
    --tailwind \\
    --eslint \\
    --app \\
    --src-dir \\
    --import-alias "@/*"
  
  cd quicka

STEP 2 — Install dependencies
  npm install @supabase/supabase-js @supabase/ssr
  npm install @supabase/auth-helpers-nextjs
  npm install resend

STEP 3 — Replace generated files
  Replace next.config.ts       with NEXT_CONFIG above
  Replace tailwind.config.ts   with TAILWIND_CONFIG above
  Replace src/app/globals.css  with GLOBALS_CSS above
  Replace src/app/layout.tsx   with ROOT_LAYOUT above

STEP 4 — Create new files
  Create src/lib/supabase/client.ts      (SUPABASE_CLIENT)
  Create src/lib/supabase/server.ts      (SUPABASE_SERVER)
  Create src/lib/supabase/middleware.ts  (SUPABASE_MIDDLEWARE)
  Create src/middleware.ts               (MIDDLEWARE)
  Create src/lib/constants.ts           (CONSTANTS_FILE)
  Create src/types/index.ts             (TYPES_FILE)
  Create .env.local                     (ENV_LOCAL — fill in your values)

STEP 5 — Test it runs
  npm run dev
  Open http://localhost:3000
  You should see the default Next.js page

STEP 6 — Ready for page files
  Foundation is complete. Next files to build:
  → src/app/page.tsx              (Landing page)
  → src/components/ui/            (Shared components)
  → src/components/landing/       (Landing page sections)
  → src/app/build/page.tsx        (Onboarding flow)
  → src/app/dashboard/page.tsx    (Customer dashboard)

FOLDER STRUCTURE TO CREATE NOW:
  mkdir -p src/components/ui
  mkdir -p src/components/landing
  mkdir -p src/components/onboarding/steps
  mkdir -p src/components/dashboard
  mkdir -p src/lib/supabase
  mkdir -p src/types
  mkdir -p src/app/build
  mkdir -p src/app/dashboard
  mkdir -p src/app/blog
  mkdir -p src/app/api/checkout
  mkdir -p src/app/api/webhook
`;

// Demo component showing the setup guide
import { useState } from "react";

export default function QuickaSetupGuide() {
  const [activeFile, setActiveFile] = useState("instructions");

  const files = [
    { id: "instructions",  label: "📋 Setup Instructions",    content: SETUP_INSTRUCTIONS,   lang: "bash" },
    { id: "next_config",   label: "⚙️ next.config.ts",        content: NEXT_CONFIG,           lang: "typescript" },
    { id: "tailwind",      label: "🎨 tailwind.config.ts",    content: TAILWIND_CONFIG,       lang: "typescript" },
    { id: "globals",       label: "💅 globals.css",           content: GLOBALS_CSS,           lang: "css" },
    { id: "layout",        label: "🏗️ app/layout.tsx",        content: ROOT_LAYOUT,           lang: "typescript" },
    { id: "constants",     label: "📦 lib/constants.ts",      content: CONSTANTS_FILE,        lang: "typescript" },
    { id: "sb_client",     label: "🔌 supabase/client.ts",    content: SUPABASE_CLIENT,       lang: "typescript" },
    { id: "sb_server",     label: "🖥️ supabase/server.ts",    content: SUPABASE_SERVER,       lang: "typescript" },
    { id: "sb_middleware", label: "🔒 supabase/middleware.ts", content: SUPABASE_MIDDLEWARE,   lang: "typescript" },
    { id: "middleware",    label: "🛡️ src/middleware.ts",      content: MIDDLEWARE,            lang: "typescript" },
    { id: "types",         label: "📐 types/index.ts",        content: TYPES_FILE,            lang: "typescript" },
    { id: "env",           label: "🔑 .env.local",            content: ENV_LOCAL,             lang: "bash" },
  ];

  const active = files.find(f => f.id === activeFile);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", fontFamily: "Arial, sans-serif", background: "#F5F2ED" }}>
      {/* Header */}
      <div style={{ background: "#0A0A0A", padding: "0.85rem 1.5rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <div style={{ fontStyle: "italic", fontSize: "1.2rem", color: "#fff" }}>Quick<span style={{ color: "#00C853" }}>a</span></div>
        <div style={{ width: 1, height: 18, background: "rgba(255,255,255,0.15)" }} />
        <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.35)", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase" }}>Next.js Foundation — TypeScript + Tailwind</span>
        <div style={{ marginLeft: "auto", background: "rgba(0,200,83,0.15)", color: "#00C853", fontSize: "0.72rem", fontWeight: 700, padding: "0.25rem 0.65rem", borderRadius: "100px" }}>
          {files.length} files
        </div>
      </div>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Sidebar */}
        <div style={{ width: 240, background: "#fff", borderRight: "1px solid rgba(0,0,0,0.08)", overflowY: "auto", flexShrink: 0 }}>
          <div style={{ padding: "0.85rem 1rem", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: "#7A756E", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>Foundation Files</div>
          {files.map(f => (
            <button key={f.id} onClick={() => setActiveFile(f.id)}
              style={{ width: "100%", padding: "0.65rem 1rem", background: activeFile === f.id ? "rgba(0,200,83,0.08)" : "transparent", border: "none", borderLeft: `3px solid ${activeFile === f.id ? "#00C853" : "transparent"}`, cursor: "pointer", textAlign: "left", fontSize: "0.82rem", fontWeight: activeFile === f.id ? 700 : 400, color: activeFile === f.id ? "#00C853" : "#0A0A0A", fontFamily: "Arial, sans-serif", transition: "all 0.12s" }}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: "auto", padding: "1.5rem", background: "#1E1E1E" }}>
          <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: "8px 8px 0 0", padding: "0.5rem 1rem", fontSize: "0.7rem", color: "rgba(255,255,255,0.35)", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", display: "flex", justifyContent: "space-between" }}>
            <span>{active?.label}</span>
            <span style={{ color: "#00C853" }}>{active?.lang}</span>
          </div>
          <pre style={{ background: "#1E1E1E", borderRadius: "0 0 8px 8px", padding: "1.25rem", fontSize: "0.76rem", color: "rgba(255,255,255,0.8)", lineHeight: 1.75, fontFamily: "Courier New, monospace", whiteSpace: "pre-wrap", wordBreak: "break-word", overflowX: "auto" }}>
            {active?.content}
          </pre>
        </div>
      </div>
    </div>
  );
}

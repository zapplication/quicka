import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import "./globals.css";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import { COMPANY, formatAddress } from "@/lib/company";

/*
  Load Quicka's brand fonts via next/font so they're inlined, self-hosted at
  build time (no FOIT, no Google CDN dependency at runtime), and exposed as
  CSS variables that Tailwind's @theme block in globals.css picks up.

  Fraunces — display serif used in headings ("Your business needs a website.")
  Inter    — neutral sans for UI/body copy.
*/

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Quicka — AI websites for South African businesses",
  description:
    "Answer 8 questions. AI builds your complete .co.za website in 60 seconds. Hosting, SSL, contact form, WhatsApp button included. From R99/month.",
  metadataBase: new URL("https://quicka.website"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Quicka — AI websites for South African businesses",
    description:
      "Built in 60 seconds. Free .co.za domain. From R99/month. Built in South Africa.",
    url: "https://quicka.website",
    siteName: "Quicka",
    locale: "en_ZA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Quicka — AI websites for South African businesses",
    description:
      "Built in 60 seconds. Free .co.za domain. From R99/month.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

/**
 * Schema.org Organization markup. Lives in the root layout so it appears
 * on every page (Google reads from any indexable page, doesn't have to be
 * just the homepage). Surfaces the company name, address, contact info,
 * and CIPC registration in Google's knowledge graph.
 *
 * Tested at https://search.google.com/test/rich-results
 */
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: COMPANY.legalName,
  alternateName: COMPANY.tradingName,
  legalName: COMPANY.legalName,
  url: COMPANY.website,
  logo: `${COMPANY.website}/logo.png`,
  description:
    "AI website builder for South African small businesses. Built in 60 seconds, free .co.za domain, from R99/month.",
  foundingDate: String(COMPANY.founded),
  founders: [
    {
      "@type": "Person",
      name: COMPANY.informationOfficer.name,
    },
  ],
  address: {
    "@type": "PostalAddress",
    streetAddress: COMPANY.registeredAddress.line1,
    addressLocality: COMPANY.registeredAddress.city,
    addressRegion: COMPANY.registeredAddress.province,
    postalCode: COMPANY.registeredAddress.postalCode,
    addressCountry: "ZA",
  },
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    email: COMPANY.publicEmail,
    availableLanguage: ["English"],
    areaServed: "ZA",
  },
  identifier: {
    "@type": "PropertyValue",
    propertyID: "CIPC",
    value: COMPANY.cipcRegNumber,
  },
  areaServed: {
    "@type": "Country",
    name: "South Africa",
  },
} as const;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${fraunces.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-brand-bg text-brand-ink">
        {children}
        <WhatsAppFloat />
      </body>
    </html>
  );
}

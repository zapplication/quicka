import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import "./globals.css";

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
  openGraph: {
    title: "Quicka — AI websites for South African businesses",
    description:
      "Built in 60 seconds. Free .co.za domain. From R99/month. Built in South Africa.",
    url: "https://quicka.website",
    siteName: "Quicka",
    locale: "en_ZA",
    type: "website",
  },
};

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
      <body className="min-h-full flex flex-col font-sans bg-brand-bg text-brand-ink">
        {children}
      </body>
    </html>
  );
}

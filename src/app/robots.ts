import type { MetadataRoute } from "next";
import { COMPANY } from "@/lib/company";

/**
 * Quicka's robots.txt. Next.js 14 auto-serves this at `/robots.txt`.
 *
 * Strategy:
 *  - Allow indexing of the marketing + legal pages.
 *  - Disallow `/build` (it's a tool, not content; Google indexing it
 *    would waste crawl budget and confuse searchers who land mid-flow).
 *  - Disallow `/payment/*` (transactional, not content).
 *  - Disallow `/api/*` (back-end endpoints, never useful in search).
 *  - Point Google at the sitemap.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/build", "/payment/", "/api/"],
      },
    ],
    sitemap: `${COMPANY.website}/sitemap.xml`,
    host: COMPANY.website,
  };
}

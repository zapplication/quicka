import type { MetadataRoute } from "next";
import { COMPANY } from "@/lib/company";

/**
 * Quicka's sitemap. Next.js 14 auto-serves this at `/sitemap.xml`.
 *
 * Every public route is listed with a reasonable lastModified date,
 * change frequency, and priority. Pages that don't index well (or that
 * we don't want search engines pushing customers to mid-flow) are
 * excluded — `/payment/success`, `/payment/cancel`, `/build`.
 *
 * Update `lastModified` when the relevant page's content materially
 * changes; Google uses this to schedule recrawls.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = COMPANY.website;
  const now = new Date();

  return [
    {
      url: `${base}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${base}${COMPANY.links.about}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${base}${COMPANY.links.terms}`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: `${base}${COMPANY.links.privacy}`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: `${base}${COMPANY.links.refund}`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: `${base}${COMPANY.links.contact}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];
}

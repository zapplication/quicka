import type { MetadataRoute } from "next";

/**
 * robots.txt for quicka.website.
 *
 * Allow everything except API routes and the build configurator
 * (which has no SEO value and renders different state per session).
 * Explicit sitemap reference helps Google discover all pages.
 */
const BASE_URL = "https://quicka.website";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/build"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}

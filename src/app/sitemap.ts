import type { MetadataRoute } from "next";

/**
 * Sitemap for quicka.website. Lists every public marketing page so
 * Google / Bing / DuckDuckGo can index us cleanly. Auto-served at
 * /sitemap.xml by Next.js App Router.
 *
 * /build is excluded — it's a configurator, not content. Including it
 * would dilute crawl budget on a route that has no static content.
 */
const BASE_URL = "https://quicka.website";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    {
      url: `${BASE_URL}/`,
      lastModified,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/refund`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/terms`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.4,
    },
  ];
}

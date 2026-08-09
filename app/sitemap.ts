import type { MetadataRoute } from "next";
import { getPriceIndexEntries } from "@/lib/priceIndex";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tangle-2.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries = await getPriceIndexEntries();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteUrl, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/recommend`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteUrl}/request`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteUrl}/prices`, changeFrequency: "weekly", priority: 0.9 },
  ];

  const priceRoutes: MetadataRoute.Sitemap = entries.map((entry) => ({
    url: `${siteUrl}/prices/${encodeURIComponent(entry.canonical_treatment_name)}`,
    lastModified: entry.last_evidence_at ?? undefined,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...priceRoutes];
}

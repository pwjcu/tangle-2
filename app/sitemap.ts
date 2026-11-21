import type { MetadataRoute } from "next";
import { getPriceIndexEntries } from "@/lib/priceIndex";
import { getStandardPriceTreatmentNames } from "@/lib/시술표준가격";
import { getPublicPriceNames, getPublicPriceTreatment, publicPriceDate } from "@/lib/공개시술가격";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tangle.kr";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries = await getPriceIndexEntries();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteUrl, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/recommend`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteUrl}/request`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteUrl}/prices`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteUrl}/clinics`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${siteUrl}/guide/breast`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${siteUrl}/global`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${siteUrl}/ai`, changeFrequency: "monthly", priority: 0.9 },
  ];

  const publicRoutes: MetadataRoute.Sitemap = getPublicPriceNames().map((name) => ({
    url: `${siteUrl}/prices/${encodeURIComponent(name)}`,
    lastModified: publicPriceDate,
    changeFrequency: "weekly",
    priority: 0.8,
  }));
  const priceRoutes: MetadataRoute.Sitemap = entries.filter((entry) => !getPublicPriceTreatment(entry.canonical_treatment_name)).map((entry) => ({
    url: `${siteUrl}/prices/${encodeURIComponent(entry.canonical_treatment_name)}`,
    lastModified: entry.last_evidence_at ?? undefined,
    changeFrequency: "weekly",
    priority: 0.8,
  }));
  const observedNames = new Set(entries.map((entry) => entry.canonical_treatment_name));
  const standardRoutes: MetadataRoute.Sitemap = getStandardPriceTreatmentNames()
    .filter((name) => !observedNames.has(name) && !getPublicPriceTreatment(name))
    .map((name) => ({
      url: `${siteUrl}/prices/${encodeURIComponent(name)}`,
      changeFrequency: "monthly",
      priority: 0.7,
    }));

  return [...staticRoutes, ...publicRoutes, ...priceRoutes, ...standardRoutes];
}

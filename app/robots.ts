import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tangle-2.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // 개인 견적/입찰 데이터가 노출될 수 있는 페이지는 색인에서 제외
      disallow: ["/my", "/hospital"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}

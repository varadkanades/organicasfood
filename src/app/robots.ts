import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api/", "/auth/", "/checkout", "/order-confirmation"],
      },
    ],
    sitemap: "https://organikasfoods.com/sitemap.xml",
  };
}

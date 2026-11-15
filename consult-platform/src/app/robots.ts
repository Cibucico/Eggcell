import type { MetadataRoute } from "next";
import { siteUrl } from "@/config/brand";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/dashboard", "/learn", "/checkout", "/api", "/auth"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}

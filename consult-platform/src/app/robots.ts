import type { MetadataRoute } from "next";
import { siteUrl } from "@/config/brand";
import { isSupabaseConfigured } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  // A prototype without a database is for review only: keep it out of search.
  if (!isSupabaseConfigured) return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/dashboard", "/learn", "/enrol", "/checkout", "/api", "/auth"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}

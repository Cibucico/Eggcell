import type { MetadataRoute } from "next";
import { brand, siteUrl } from "@/config/brand";
import { getCaseStudies, getCourses, getServices } from "@/lib/data/content";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { features } = brand;
  const [services, courses, studies] = await Promise.all([
    getServices(),
    features.training ? getCourses() : [],
    features.caseStudies ? getCaseStudies() : [],
  ]);

  const paths = [
    "",
    "/services",
    "/about",
    "/contact",
    "/legal/privacy",
    "/legal/terms",
    ...(features.booking ? ["/book"] : []),
    ...(features.training ? ["/training", "/live", "/certificates"] : []),
    ...(features.caseStudies ? ["/case-studies"] : []),
    ...(features.investors ? ["/investors"] : []),
    ...services.map((s) => `/services/${s.slug}`),
    ...courses.map((c) => `/training/${c.slug}`),
    ...studies.map((c) => `/case-studies/${c.slug}`),
  ];
  return paths.map((path) => ({ url: `${siteUrl}${path}` }));
}

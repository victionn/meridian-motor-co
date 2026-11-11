import type { MetadataRoute } from "next";
import { site } from "@/content/site";
import { getVehicleSlugs } from "@/lib/inventory";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Add routes here as pages are built.
  const cars = (await getVehicleSlugs()).map((v) => ({
    url: `${site.url}/cars/${v.slug}`,
    lastModified: v.updatedAt,
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));
  return [
    { url: site.url, changeFrequency: "monthly", priority: 1 },
    { url: `${site.url}/cars`, changeFrequency: "hourly", priority: 0.9 },
    ...cars,
  ];
}

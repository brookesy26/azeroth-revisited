import type { MetadataRoute } from "next";
import { getGuides, getClasses, siteOrigin } from "@/lib/content/repository";
export const dynamic = "force-static";
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    "",
    "news",
    "classes",
    "search",
    "sources",
    "accessibility",
    "design-system",
    ...getGuides().map((item) => item.slug),
    ...getClasses().map((item) => `classes/${item.slug}`),
  ].map((route) => ({ url: `${siteOrigin}/${route}${route ? "/" : ""}` }));
}

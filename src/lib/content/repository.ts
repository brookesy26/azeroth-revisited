import "server-only";
import guideData from "@/content/guides.json";
import newsData from "@/content/news.json";
import talentData from "@/content/talents.json";
import sources from "@/content/sources.json";
import classGuideData from "@/content/class-guides.json";
import {
  guideSchema,
  newsSchema,
  talentSchema,
  classGuidesSchema,
} from "@/types/content";

const guides = guideSchema.array().parse(guideData);
const talents = talentSchema.parse(talentData);
const classGuides = classGuidesSchema.parse(classGuideData);
export const getClassGuide = (slug: string) =>
  classGuides.classes.find((item) => item.slug === slug);
export const getClassGuideContext = () => classGuides;
export const getGuides = () => guides;
export const getGuide = (slug: string) =>
  guides.find((guide) => guide.slug === slug);
export const getNews = () => newsSchema.parse(newsData);
export function getFeaturedNews() {
  return getNews()
    .items.filter(
      (item) => !/maintenance|service issue|temporary dialog/i.test(item.title),
    )
    .filter(
      (item, index, items) =>
        items.findIndex((other) => other.title === item.title) === index,
    )
    .slice(0, 2);
}
export const getTalents = () => talents;
export const getClasses = () => talents.classes;
export const getClass = (slug: string) =>
  talents.classes.find((item) => item.slug === slug);
export function getSource(id: string) {
  if (!(id in sources)) throw new Error(`Unknown content source: ${id}`);
  return sources[id as keyof typeof sources];
}
export const siteOrigin =
  process.env.NEXT_PUBLIC_SITE_URL || "https://azeroth-revisited.pages.dev";

import { describe, expect, it } from "vitest";
import guides from "@/content/guides.json";
import news from "@/content/news.json";
import sources from "@/content/sources.json";
import talents from "@/content/talents.json";
import { guideSchema, newsSchema, talentSchema } from "@/types/content";

describe("published content integrity", () => {
  it("has valid, distinct guide routes with resolvable citations", () => {
    const parsed = guides.map((guide) => guideSchema.parse(guide));
    expect(new Set(parsed.map((guide) => guide.slug)).size).toBe(parsed.length);
    for (const guide of parsed) {
      expect(guide.sections.length).toBeGreaterThan(0);
      expect(guide.sources.length).toBeGreaterThan(0);
      for (const source of guide.sources)
        expect(Object.keys(sources)).toContain(source);
    }
  });
  it("keeps the Retail page a transition into Forever", () => {
    const guide = guides.find((item) => item.slug === "coming-from-retail");
    expect(guide).toBeDefined();
    expect(guide?.description).toMatch(/transition/i);
    expect(guide?.description).toMatch(/Forever/);
  });
  it("has a dated attributed news snapshot without duplicate links", () => {
    const parsed = newsSchema.parse(news);
    expect(Number.isNaN(Date.parse(parsed.updatedAt))).toBe(false);
    expect(new Set(parsed.items.map((item) => item.url)).size).toBe(
      parsed.items.length,
    );
    for (const item of parsed.items) {
      expect(new URL(item.url).protocol).toBe("https:");
      expect(Number.isNaN(Date.parse(item.date))).toBe(false);
    }
  });
  it("includes nine classes and internally consistent talent references", () => {
    const parsed = talentSchema.parse(talents);
    expect(parsed.classes).toHaveLength(9);
    expect(new Set(parsed.classes.map((cls) => cls.slug)).size).toBe(9);
    expect(parsed.attribution).toMatch(/CC BY 4\.0/);
    for (const cls of parsed.classes) {
      const ids = cls.trees.flatMap((tree) =>
        tree.talents.map((talent) => talent.id),
      );
      expect(new Set(ids).size).toBe(ids.length);
      for (const tree of cls.trees)
        for (const talent of tree.talents) {
          expect(talent.max_ranks).toBeGreaterThan(0);
          expect(talent.row).toBeGreaterThanOrEqual(0);
          for (const prerequisite of talent.requires)
            expect(ids).toContain(prerequisite);
        }
    }
  });
});

import { describe, expect, it } from "vitest";
import {
  budgetForLevel,
  buildError,
  parseSharedBuild,
  totalPoints,
  validateBuild,
} from "@/features/talents/rules";
import type { Talent, TalentClass } from "@/types/content";

const talent = (id: number, overrides: Partial<Talent> = {}): Talent => ({
  id,
  name: `Talent ${id}`,
  row: 0,
  column: 0,
  max_ranks: 5,
  points_required: 0,
  requires: [],
  spell_id: null,
  icon_id: null,
  ...overrides,
});
const cls: TalentClass = {
  id: 1,
  name: "Test class",
  slug: "test-class",
  page: "https://example.com/trees",
  trees: [
    {
      id: 1,
      name: "First tree",
      rows: 3,
      columns: 3,
      talents: [
        talent(1),
        talent(2, { column: 1 }),
        talent(3, { row: 1, points_required: 5, max_ranks: 1 }),
        talent(4, {
          row: 1,
          column: 1,
          points_required: 5,
          max_ranks: 1,
          requires: [1, 2],
        }),
        talent(5, { row: 2, points_required: 6, max_ranks: 1 }),
      ],
    },
    { id: 2, name: "Other tree", rows: 1, columns: 1, talents: [talent(6)] },
  ],
};
const levels = Array.from({ length: 51 }, (_, index) => index + 10);
const shared = (overrides: Record<string, unknown> = {}) =>
  "#talents=" +
  encodeURIComponent(
    JSON.stringify({
      build: "beta-1",
      class: cls.slug,
      level: 60,
      ranks: { 1: 5, 4: 1 },
      ...overrides,
    }),
  );

describe("talent allocation rules", () => {
  it("uses the provider point schedule and maximum", () => {
    expect(budgetForLevel(9, levels, 51)).toBe(0);
    expect(budgetForLevel(10, levels, 51)).toBe(1);
    expect(budgetForLevel(60, levels, 51)).toBe(51);
    expect(budgetForLevel(60, levels, 20)).toBe(20);
    expect(budgetForLevel(12, [10, 12, 15], 10)).toBe(2);
  });
  it("counts points across all trees and accepts an empty build", () => {
    expect(totalPoints({ 1: 5, 6: 2 })).toBe(7);
    expect(validateBuild(cls, {}, 0)).toBe(true);
    expect(validateBuild(cls, { 1: 5, 6: 2 }, 6)).toBe(false);
  });
  it.each([-1, 0.5, 6, NaN, Infinity])("rejects invalid ranks (%s)", (rank) => {
    expect(buildError(cls, { 1: rank }, 51)).toMatch(/rank/);
  });
  it("rejects unknown talents, even zero-ranked ones", () => {
    expect(validateBuild(cls, { 999: 0 }, 51)).toBe(false);
  });
  it("counts only earlier rows in the same tree toward gates", () => {
    expect(validateBuild(cls, { 1: 4, 3: 1, 6: 5 }, 51)).toBe(false);
    expect(validateBuild(cls, { 1: 5, 3: 1 }, 51)).toBe(true);
    expect(validateBuild(cls, { 1: 5, 3: 1, 5: 1 }, 51)).toBe(true);
  });
  it("requires at least one full-ranked alternative prerequisite", () => {
    expect(validateBuild(cls, { 1: 3, 2: 2, 4: 1 }, 51)).toBe(false);
    expect(validateBuild(cls, { 1: 5, 4: 1 }, 51)).toBe(true);
    expect(validateBuild(cls, { 2: 5, 4: 1 }, 51)).toBe(true);
  });
  it("blocks refunds that would invalidate later talents", () => {
    expect(validateBuild(cls, { 1: 5, 3: 1, 5: 1 }, 51)).toBe(true);
    expect(validateBuild(cls, { 1: 5, 3: 0, 5: 1 }, 51)).toBe(false);
    expect(validateBuild(cls, { 1: 4, 4: 1 }, 51)).toBe(false);
  });
});

describe("shared build import", () => {
  it("imports a valid build and keeps class, level and ranks", () => {
    expect(parseSharedBuild(shared(), cls, "beta-1", levels, 51)).toEqual({
      level: 60,
      ranks: { 1: 5, 4: 1 },
    });
  });
  it("ignores an empty hash and reports malformed input", () => {
    expect(parseSharedBuild("", cls, "beta-1", levels, 51)).toBeNull();
    expect(
      typeof parseSharedBuild("#talents=%E0%A4%A", cls, "beta-1", levels, 51),
    ).toBe("string");
    expect(typeof parseSharedBuild("#other=1", cls, "beta-1", levels, 51)).toBe(
      "string",
    );
  });
  it.each([
    { build: "older-beta" },
    { class: "other-class" },
    { level: 9 },
    { level: 61 },
    { level: 20.5 },
    { ranks: { 999: 1 } },
    { ranks: { 1: 2, 4: 1 } },
    { ranks: [] },
  ])("rejects unsafe imports: %j", (overrides) => {
    expect(
      typeof parseSharedBuild(shared(overrides), cls, "beta-1", levels, 51),
    ).toBe("string");
  });
});

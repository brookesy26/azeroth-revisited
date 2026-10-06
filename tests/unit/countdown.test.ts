import { describe, expect, it } from "vitest";
import { launchInstant, remainingTime } from "@/features/countdown/countdown";

describe("launch countdown", () => {
  const target = Date.parse(launchInstant);
  it("decomposes the remaining days, hours and minutes in UTC", () => {
    expect(
      remainingTime(target - (2 * 86400 + 3 * 3600 + 4 * 60) * 1000),
    ).toEqual({ days: 2, hours: 3, minutes: 4, launched: false });
  });
  it("rolls an hour boundary into minutes without rounding up", () => {
    expect(remainingTime(target - 3599999)).toEqual({
      days: 0,
      hours: 0,
      minutes: 59,
      launched: false,
    });
  });
  it.each([0, 1, 86400000])(
    "never shows negative time after launch (%i ms)",
    (offset) => {
      expect(remainingTime(target + offset)).toEqual({
        days: 0,
        hours: 0,
        minutes: 0,
        launched: true,
      });
    },
  );
  it("supports an explicit target for deterministic calculation", () => {
    expect(remainingTime(1000, 61000).minutes).toBe(1);
  });
});

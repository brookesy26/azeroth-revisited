import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import talents from "../../src/content/talents.json";

test("returning and Retail transition journeys are prominent and lead to Forever guides", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Back to Azeroth",
  );
  await page
    .getByRole("link", { name: "Returning to WoW →", exact: true })
    .click();
  await expect(page).toHaveURL(/returning-players/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Welcome back",
  );
  await page.goto("/coming-from-retail/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Coming from Retail",
  );
  await expect(page.getByRole("main")).toContainText("transition guide");
  await expect(page.getByRole("main")).toContainText("Forever");
});

test("mobile navigation closes on Escape and restores the opener", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const opener = page.getByRole("button", { name: "Toggle navigation menu" });
  await opener.click();
  const drawer = page.getByRole("dialog");
  await expect(drawer).toBeVisible();
  await expect(drawer).toHaveAccessibleName("Site navigation");
  await expect(
    drawer.getByRole("navigation", { name: "Main navigation" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(drawer).not.toBeVisible();
  await expect(opener).toBeFocused();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});

test("search can filter, explain no matches, and clear", async ({ page }) => {
  await page.goto("/search/");
  const query = page.getByRole("searchbox", {
    name: "Search Forever guides and classes",
  });
  await query.fill("Coming from Retail");
  await expect(page.getByRole("status")).toContainText("2 guides found");
  await expect(
    page.getByRole("heading", { name: "Coming from Retail? Begin again." }),
  ).toBeVisible();
  await query.fill("zzzz-no-such-guide");
  await expect(page.getByRole("status")).toContainText("0 guides found");
  await expect(page.getByText("No guide matches that search.")).toBeVisible();
  await page.getByRole("button", { name: "Clear search" }).click();
  await expect(query).toHaveValue("");
  await expect(page.getByRole("status")).toContainText("available");
});

test("talent planner allocates, validates level, shares and resets a build", async ({
  page,
}) => {
  const cls = talents.classes.find((item) => item.slug === "warrior")!;
  const firstTalent = cls.trees
    .flatMap((tree) => tree.talents)
    .find(
      (talent) =>
        talent.row === 0 &&
        talent.points_required === 0 &&
        talent.requires.length === 0,
    )!;
  await page.goto(`/classes/${cls.slug}/`);
  await expect(
    page.getByRole("heading", { name: "Warrior talent calculator" }),
  ).toBeVisible();
  await page
    .getByRole("button", {
      name: `Add a point to ${firstTalent.name}`,
      exact: true,
    })
    .click();
  await expect(
    page.getByText("1 / 51 points spent", { exact: false }),
  ).toBeVisible();
  await page.getByLabel("Character level").selectOption("9");
  await expect(page.getByRole("status")).toContainText("Remove talent points");
  await page.getByRole("button", { name: "Share build", exact: true }).click();
  const shareLink = await page
    .getByRole("textbox", { name: "Build link", exact: true })
    .inputValue();
  await page.goto(shareLink);
  await expect(
    page.getByText("1 / 51 points spent", { exact: false }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Reset build" }).click();
  await expect(
    page.getByText("0 / 51 points spent", { exact: false }),
  ).toBeVisible();
});

test("rejects a shared build from a different beta dataset", async ({
  page,
}) => {
  const hash = encodeURIComponent(
    JSON.stringify({
      build: "obsolete-beta",
      class: "warrior",
      level: 60,
      ranks: {},
    }),
  );
  await page.goto(`/classes/warrior/#talents=${hash}`);
  await expect(
    page.locator(".talent-calculator").getByRole("alert"),
  ).toContainText("different beta dataset");
});

test("homepage and transition guide have no automatically detectable WCAG A/AA violations", async ({
  page,
}) => {
  for (const route of ["/", "/coming-from-retail/"]) {
    await page.goto(route);
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(
      result.violations,
      JSON.stringify(result.violations, null, 2),
    ).toEqual([]);
  }
});

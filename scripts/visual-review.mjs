import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readdir, mkdir, writeFile, readFile } from "node:fs/promises";
import path from "node:path";

// Run after build and while the static preview is listening on port 3100.
// Screenshots and raw measurements are review material, not a conformance certificate.
const baseURL = process.env.REVIEW_URL || "http://localhost:3100";
const destination = path.resolve(process.env.REVIEW_DESTINATION || "test-results/visual-review");
await mkdir(destination, { recursive: true });
async function discover(directory, prefix = "") {
  const entries = await readdir(directory, { withFileTypes: true });
  const result = [];
  for (const entry of entries) {
    if (entry.name === "_next") continue;
    if (entry.isDirectory())
      result.push(
        ...(await discover(
          path.join(directory, entry.name),
          `${prefix}/${entry.name}`,
        )),
      );
    else if (entry.name === "index.html") result.push(`${prefix || ""}/`);
  }
  return result;
}
const discovered = [...new Set(await discover("out"))].sort();
const routes = process.env.REVIEW_ROUTES ? process.env.REVIEW_ROUTES.split(",") : discovered;
if (!routes.length)
  throw new Error("No exported routes found. Run npm run build first.");
const browser = await chromium.launch({
  channel: process.env.PW_CHANNEL || "msedge",
  headless: true,
});
const errors = [];
const responses = [];
const report = {
  createdAt: new Date().toISOString(),
  baseURL,
  engine: "chromium",
  browserVersion: browser.version(),
  channel: process.env.PW_CHANNEL || "msedge",
  routes: [],
  interactionScreenshots: [],
  errors,
  responses,
};
const viewports = [
  { width: 320, height: 800 },
  { width: 375, height: 812 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1440, height: 1000 },
  { width: 844, height: 390 },
];
const context = await browser.newContext();
const page = await context.newPage();
page.on("pageerror", (error) =>
  errors.push({ route: page.url(), error: error.message }),
);
page.on("response", (response) => {
  if (response.status() >= 400)
    responses.push({ url: response.url(), status: response.status() });
});
try {
  for (const route of routes) {
    const entry = {
      route,
      viewports: [],
      performance: null,
      axeViolations: [],
    };
    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.goto(new URL(route, baseURL).href, {
        waitUntil: "networkidle",
      });
      await page.evaluate(() => document.fonts.ready);
      // Full-page screenshots do not automatically trigger below-fold lazy images.
      await page.evaluate(async () => {
        for (
          let y = 0;
          y < document.documentElement.scrollHeight;
          y += Math.max(200, window.innerHeight - 100)
        ) {
          window.scrollTo(0, y);
          await new Promise((resolve) => window.setTimeout(resolve, 60));
        }
        await Promise.all(
          [...document.images].map((image) =>
            image.decode().catch(() => undefined),
          ),
        );
        window.scrollTo(0, 0);
      });
      const filename = `${route === "/" ? "home" : route.replaceAll("/", "-").replace(/^-|-$/g, "")}-${viewport.width}x${viewport.height}.png`;
      await page.screenshot({
        path: path.join(destination, filename),
        fullPage: true,
        animations: "disabled",
      });
      const geometry = await page.evaluate(() => ({
        documentWidth: document.documentElement.scrollWidth,
        viewportWidth: window.innerWidth,
        documentHeight: document.documentElement.scrollHeight,
      }));
      entry.viewports.push({
        ...viewport,
        screenshot: filename,
        ...geometry,
        horizontalOverflow: geometry.documentWidth > geometry.viewportWidth,
      });
      if (viewport.width === 1440) {
        const axe = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
          .analyze();
        entry.axeViolations = axe.violations.map(
          ({ id, impact, description, helpUrl, nodes }) => ({
            id,
            impact,
            description,
            helpUrl,
            nodes: nodes.map((node) => ({
              target: node.target,
              failureSummary: node.failureSummary,
            })),
          }),
        );
        // Reload the same route to measure a warm-cache document navigation.
        await page.reload({ waitUntil: "networkidle" });
        entry.performance = await page.evaluate(() => {
          const navigation = performance.getEntriesByType("navigation")[0];
          if (!navigation) return null;
          return {
            type: navigation.type,
            duration: navigation.duration,
            domContentLoadedMs: navigation.domContentLoadedEventEnd,
            loadMs: navigation.loadEventEnd,
            responseEndMs: navigation.responseEnd,
            transferSize: navigation.transferSize,
            measurement:
              "Warm-cache full document reload on local static server; not Lighthouse or client-side route timing.",
          };
        });
      }
    }
    report.routes.push(entry);
    console.log(
      `Captured ${route}: ${entry.viewports.length} sizes, ${entry.axeViolations.length} axe violations`,
    );
  }
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto(baseURL, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Toggle navigation menu" }).click();
  await page.screenshot({
    path: path.join(destination, "mobile-menu-open.png"),
    fullPage: true,
  });
  report.interactionScreenshots.push("mobile-menu-open.png");
  await page.keyboard.press("Escape");

  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(new URL("/classes/warrior/", baseURL).href, {
    waitUntil: "networkidle",
  });
  const dataset = JSON.parse(
    await readFile("src/content/talents.json", "utf8"),
  );
  const warrior = dataset.classes.find((cls) => cls.slug === "warrior");
  const first = warrior.trees
    .flatMap((tree) => tree.talents)
    .find(
      (talent) =>
        talent.row === 0 &&
        talent.points_required === 0 &&
        !talent.requires.length,
    );
  await page
    .getByRole("button", { name: `Add a point to ${first.name}`, exact: true })
    .click();
  await page.locator("#talent-detail").scrollIntoViewIfNeeded();
  await page.screenshot({
    path: path.join(destination, "warrior-selected-detail.png"),
    fullPage: true,
  });
  report.interactionScreenshots.push("warrior-selected-detail.png");
  const hash = encodeURIComponent(
    JSON.stringify({
      build: "invalid-prior-beta",
      class: "warrior",
      level: 60,
      ranks: {},
    }),
  );
  await page.goto(new URL(`/classes/warrior/#talents=${hash}`, baseURL).href, {
    waitUntil: "networkidle",
  });
  await page.locator(".talent-calculator").getByRole("alert").scrollIntoViewIfNeeded();
  await page.screenshot({
    path: path.join(destination, "warrior-invalid-shared-build.png"),
    fullPage: true,
  });
  report.interactionScreenshots.push("warrior-invalid-shared-build.png");
} finally {
  await writeFile(
    path.join(destination, "report.json"),
    `${JSON.stringify(report, null, 2)}\n`,
  );
  await browser.close();
}
console.log(`Review report saved to ${destination}`);

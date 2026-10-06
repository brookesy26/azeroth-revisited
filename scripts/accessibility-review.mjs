import { chromium, expect } from "@playwright/test";
import { mkdir, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const destination = path.resolve(process.env.QA_DESTINATION || "artifacts/qa");
await mkdir(destination, { recursive: true });
async function discover(directory, prefix = "") {
  const routes = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.name === "_next") continue;
    if (entry.isDirectory())
      routes.push(
        ...(await discover(
          path.join(directory, entry.name),
          `${prefix}/${entry.name}`,
        )),
      );
    else if (entry.name === "index.html") routes.push(`${prefix}/`);
  }
  return routes;
}
const discovered = [...new Set(await discover("out"))].sort();
const routes = process.env.QA_ROUTES
  ? process.env.QA_ROUTES.split(",")
  : discovered;
const browser = await chromium.launch({
  channel: process.env.PW_CHANNEL || "msedge",
});
const context = await browser.newContext();
const page = await context.newPage();
const report = {
  date: new Date().toISOString(),
  browser: browser.version(),
  engine: "Chromium via Edge",
  limitation:
    "Programmatic checks with actual keyboard events; no screen-reader or full manual WCAG certification. Narrow viewports model reflow at 200/400 percent zoom, not operating-system or browser UI zoom.",
  routes: [],
  keyboard: [],
  preferenceChecks: [],
  errors: [],
  failedResources: [],
};
page.on("pageerror", (error) => report.errors.push(error.message));
page.on("response", (response) => {
  if (response.status() >= 400)
    report.failedResources.push({
      url: response.url(),
      status: response.status(),
    });
});
const slug = (route) =>
  route === "/" ? "home" : route.replaceAll("/", "-").replace(/^-|-$/g, "");
async function load(route) {
  await page.goto(new URL(route, "http://localhost:3100").href, {
    waitUntil: "networkidle",
  });
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(
      [...document.images].map(async (image) => {
        image.loading = "eager";
        await image.decode().catch(() => undefined);
      }),
    );
  });
}
const spacing = `*:not(svg):not(path) { line-height: 1.5 !important; letter-spacing: .12em !important; word-spacing: .16em !important; } p { margin-bottom: 2em !important; }`;
try {
  for (const route of routes) {
    const record = {
      route,
      screenshots: {},
      reflow: [],
      spacing: null,
      headings: [],
    };
    for (const width of [1440, 375]) {
      await page.setViewportSize({
        width,
        height: width === 1440 ? 1000 : 812,
      });
      await load(route);
      const filename = `${slug(route)}-${width}.png`;
      await page.screenshot({
        path: path.join(destination, filename),
        fullPage: true,
        animations: "disabled",
      });
      record.screenshots[width] = filename;
      if (width === 1440)
        record.headings = await page
          .locator("main h1, main h2, main h3")
          .allTextContents();
    }
    for (const width of [640, 320]) {
      await page.setViewportSize({ width, height: 900 });
      record.reflow.push(
        await page.evaluate(
          (width) => ({
            width,
            documentWidth: document.documentElement.scrollWidth,
            overflow: document.documentElement.scrollWidth > innerWidth,
            approximation:
              width === 320
                ? "400% zoom on 1280px layout"
                : "200% zoom on 1280px layout",
          }),
          width,
        ),
      );
    }
    await page.setViewportSize({ width: 375, height: 812 });
    await page.addStyleTag({ content: spacing });
    record.spacing = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth > innerWidth,
      overflowingTextContainers: [
        ...document.querySelectorAll(
          "main p, main h1, main h2, main h3, main button, main a",
        ),
      ]
        .filter((element) => {
          const style = getComputedStyle(element);
          return (
            ["hidden", "clip"].includes(style.overflow) &&
            (element.scrollHeight > element.clientHeight + 1 ||
              element.scrollWidth > element.clientWidth + 1)
          );
        })
        .map((element) => ({
          text: element.textContent.slice(0, 100),
          tag: element.tagName,
        })),
    }));
    if (["/", "/classes/warrior/", "/coming-from-retail/"].includes(route))
      await page.screenshot({
        path: path.join(destination, `${slug(route)}-text-spacing.png`),
        fullPage: true,
        animations: "disabled",
      });
    report.routes.push(record);
    console.log(`Reviewed ${route}: screenshots, reflow and text spacing`);
  }

  await page.setViewportSize({ width: 375, height: 812 });
  await load("/");
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: "Skip to main content" });
  await expect(skip).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("main")).toBeFocused();
  report.keyboard.push({
    check: "Skip link first in keyboard order and moves focus to main",
    passed: true,
  });
  const opener = page.getByRole("button", { name: "Toggle navigation menu" });
  await opener.focus();
  await page.keyboard.press("Enter");
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  for (let i = 0; i < 16; i++) {
    await page.keyboard.press("Tab");
    if (
      !(await dialog.evaluate(
        (element) =>
          document.activeElement === document.body ||
          element.contains(document.activeElement),
      ))
    )
      throw new Error(
        "A background page control received keyboard focus while navigation was modal.",
      );
  }
  await page.keyboard.press("Escape");
  await expect(opener).toBeFocused();
  report.keyboard.push({
    check:
      "Mobile native dialog keeps background page controls out of Tab order; Escape closes and returns focus. Browser chrome focus boundary is permitted.",
    passed: true,
  });

  await page.setViewportSize({ width: 1440, height: 1000 });
  await load("/search/");
  const search = page.getByRole("searchbox");
  await search.focus();
  await page.keyboard.type("warrior");
  await expect(page.getByRole("status")).toContainText("1 guide found");
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("button", { name: "Clear search" }),
  ).toBeFocused();
  await page.keyboard.press("Tab");
  await page.keyboard.press("Enter");
  await page.waitForURL("**/classes/warrior/");
  const add = page.getByRole("button", {
    name: "Add a point to Improved Heroic Strike",
    exact: true,
  });
  await add.focus();
  await page.keyboard.press("Enter");
  await expect(
    page.getByText("1 / 51 points spent", { exact: false }),
  ).toBeVisible();
  await page.locator(".talent-calculator").screenshot({
    path: path.join(destination, "warrior-talent-detail.png"),
    animations: "disabled",
  });
  const remove = page.getByRole("button", {
    name: "Remove a point from Improved Heroic Strike",
    exact: true,
  });
  await remove.focus();
  const focus = await remove.evaluate((element) => {
    const style = getComputedStyle(element);
    const box = element.getBoundingClientRect();
    return {
      outlineStyle: style.outlineStyle,
      outlineWidth: style.outlineWidth,
      outlineColor: style.outlineColor,
      bottom: box.bottom,
      top: box.top,
      viewportHeight: innerHeight,
    };
  });
  await page.keyboard.press("Space");
  await expect(
    page.getByText("0 / 51 points spent", { exact: false }),
  ).toBeVisible();
  report.keyboard.push({
    check: "Keyboard search, result activation, talent allocation and refund",
    passed: true,
  });
  report.keyboard.push({
    check: "Focused talent refund control visual style and viewport position",
    evidence: focus,
    passed:
      focus.outlineStyle !== "none" &&
      focus.bottom <= focus.viewportHeight &&
      focus.top >= 0,
  });

  await page.emulateMedia({ reducedMotion: "reduce", forcedColors: "active" });
  for (const route of ["/", "/classes/warrior/", "/coming-from-retail/"]) {
    await load(route);
    const check = await page.evaluate(() => ({
      reducedMotion: matchMedia("(prefers-reduced-motion: reduce)").matches,
      forcedColors: matchMedia("(forced-colors: active)").matches,
      overflow: document.documentElement.scrollWidth > innerWidth,
      activeAnimations: document
        .getAnimations()
        .filter((animation) => animation.playState === "running").length,
      visibleControls: [
        ...document.querySelectorAll("main a, main button, main select"),
      ].filter((element) => {
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        return (
          rect.width > 0 && rect.height > 0 && style.visibility !== "hidden"
        );
      }).length,
    }));
    await page.screenshot({
      path: path.join(
        destination,
        `${slug(route)}-forced-colors-reduced-motion.png`,
      ),
      fullPage: true,
      animations: "disabled",
    });
    report.preferenceChecks.push({ route, ...check });
  }
} finally {
  await writeFile(
    path.join(destination, "accessibility-review.json"),
    JSON.stringify(report, null, 2) + "\n",
  );
  await browser.close();
}

// Contact sheets show each page's opening and footer, labelled with its route.
// Original full-page PNGs remain available for closer reading below the fold.
for (const width of [1440, 375]) {
  for (let offset = 0; offset < report.routes.length; offset += 7) {
    const group = report.routes.slice(offset, offset + 7);
    const tiles = [];
    for (let index = 0; index < group.length; index++) {
      const item = group[index];
      const file = path.join(destination, item.screenshots[width]);
      const metadata = await sharp(file).metadata();
      const topHeight = Math.min(1100, metadata.height);
      const bottomHeight = Math.min(650, metadata.height);
      const title = Buffer.from(
        `<svg width="420" height="38"><rect width="100%" height="100%" fill="#eeeeee"/><text x="12" y="26" fill="#111111" font-size="18" font-family="Arial">${item.route}</text></svg>`,
      );
      const top = await sharp(file)
        .extract({ left: 0, top: 0, width: metadata.width, height: topHeight })
        .resize({
          width: 420,
          height: 350,
          fit: "contain",
          background: "#24201a",
        })
        .png()
        .toBuffer();
      const bottom = await sharp(file)
        .extract({
          left: 0,
          top: metadata.height - bottomHeight,
          width: metadata.width,
          height: bottomHeight,
        })
        .resize({
          width: 420,
          height: 210,
          fit: "contain",
          background: "#24201a",
        })
        .png()
        .toBuffer();
      const tile = await sharp({
        create: { width: 420, height: 598, channels: 3, background: "#24201a" },
      })
        .composite([
          { input: title, top: 0, left: 0 },
          { input: top, top: 38, left: 0 },
          { input: bottom, top: 388, left: 0 },
        ])
        .png()
        .toBuffer();
      tiles.push({
        input: tile,
        left: (index % 2) * 420,
        top: Math.floor(index / 2) * 598,
      });
    }
    const sheet = `contact-${width}-${String(offset / 7 + 1).padStart(2, "0")}.png`;
    await sharp({
      create: { width: 840, height: 2392, channels: 3, background: "#444444" },
    })
      .composite(tiles)
      .png()
      .toFile(path.join(destination, sheet));
    console.log(`Contact sheet: ${sheet}`);
  }
}
console.log(`Evidence saved to ${destination}`);

import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
const browser = await chromium.launch({
  channel: process.env.PW_CHANNEL || "msedge",
});
const results = [];
try {
  for (const route of ["/", "/classes/warrior/"]) {
    const context = await browser.newContext({
      viewport: { width: 375, height: 812 },
    });
    const page = await context.newPage();
    const session = await context.newCDPSession(page);
    await session.send("Network.enable");
    await session.send("Network.clearBrowserCache");
    await session.send("Network.setCacheDisabled", { cacheDisabled: true });
    await session.send("Network.emulateNetworkConditions", {
      offline: false,
      latency: 150,
      downloadThroughput: 200000,
      uploadThroughput: 93750,
    });
    await session.send("Emulation.setCPUThrottlingRate", { rate: 4 });
    await page.goto(`http://localhost:3100${route}`, {
      waitUntil: "load",
      timeout: 120000,
    });
    await page.waitForLoadState("networkidle");
    const metrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType("navigation")[0];
      const resources = performance.getEntriesByType("resource");
      return {
        responseStartMs: navigation.responseStart,
        responseEndMs: navigation.responseEnd,
        domContentLoadedMs: navigation.domContentLoadedEventEnd,
        loadMs: navigation.loadEventEnd,
        navigationTransferBytes: navigation.transferSize,
        resourceTransferBytes: resources.reduce(
          (sum, item) => sum + item.transferSize,
          0,
        ),
        encodedResourceBytes: resources.reduce(
          (sum, item) => sum + item.encodedBodySize,
          0,
        ),
        resourceCount: resources.length,
        viewport: { width: innerWidth, height: innerHeight },
      };
    });
    results.push({ route, ...metrics });
    console.log(JSON.stringify({ route, ...metrics }));
    await context.close();
  }
} finally {
  await mkdir("artifacts/qa", { recursive: true });
  await writeFile(
    "artifacts/qa/performance-mobile.json",
    JSON.stringify(
      {
        measuredAt: new Date().toISOString(),
        browser: browser.version(),
        simulation: {
          viewport: "375×812",
          coldCache: true,
          latencyMs: 150,
          downloadMbps: 1.6,
          cpuSlowdown: 4,
        },
        limitations:
          "One cold-cache sample per route on a local static server with CDP throttling. This is simulated performance, not a Lighthouse score, Core Web Vitals assessment or real mobile device benchmark. Below-fold lazy images are not forced to load.",
        results,
      },
      null,
      2,
    ) + "\n",
  );
  await browser.close();
}

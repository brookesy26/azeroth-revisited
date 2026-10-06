import { mkdir, writeFile, readFile } from "node:fs/promises";
import { XMLParser } from "fast-xml-parser";
import { z } from "zod";

const target = new URL("../src/content/", import.meta.url);
await mkdir(target, { recursive: true });
const talentSchema = z.object({
  build: z.string(),
  generated: z.string(),
  attribution: z.string(),
  licence: z.string(),
  points_at_level_60: z.number().int().positive(),
  levels_that_grant_a_point: z.array(z.number().int()),
  classes: z
    .array(
      z.object({
        id: z.number(),
        name: z.string(),
        slug: z.string(),
        page: z.url(),
        trees: z.array(
          z.object({
            id: z.number(),
            name: z.string(),
            rows: z.number(),
            columns: z.number(),
            talents: z.array(
              z.object({
                id: z.number(),
                name: z.string().nullable(),
                row: z.number(),
                column: z.number(),
                max_ranks: z.number(),
                points_required: z.number(),
                requires: z.array(z.number()),
                spell_id: z.number().nullable(),
                icon_id: z.number().nullable(),
                description: z.array(z.string()).optional(),
              }),
            ),
          }),
        ),
      }),
    )
    .length(9),
});
async function request(url) {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(20000),
    headers: {
      "User-Agent": "AzerothRevisited/1.0 (+fan guide; attributed feed)",
    },
  });
  if (!response.ok)
    throw new Error(`Source returned ${response.status}: ${url}`);
  return response;
}
async function persist(name, task) {
  try {
    await writeFile(
      new URL(name, target),
      JSON.stringify(await task(), null, 2) + "\n",
    );
    console.log(`Updated ${name}`);
  } catch (error) {
    const existing = await readFile(new URL(name, target), "utf8").catch(
      () => null,
    );
    if (!existing) throw error;
    console.warn(`Kept last verified ${name}: ${error.message}`);
    process.exitCode = 1;
  }
}
await persist("talents.json", async () =>
  talentSchema.parse(
    await (
      await request("https://wow-forever.gg/developers/talents.json")
    ).json(),
  ),
);
await persist("news.json", async () => {
  const xml = await (
    await request("https://wow-forever.gg/official.xml")
  ).text();
  if (/<!DOCTYPE|<!ENTITY/i.test(xml))
    throw new Error("Unsafe XML declaration");
  const parser = new XMLParser({
    ignoreAttributes: true,
    processEntities: false,
  });
  const raw = parser.parse(xml).rss?.channel?.item;
  if (!raw) throw new Error("No feed items");
  const items = (Array.isArray(raw) ? raw : [raw])
    .map((item) => ({
      title: String(item.title),
      url: String(item.link),
      date: new Date(item.pubDate).toISOString(),
      source: "Blizzard",
      category: String(item.category || "Official news"),
    }))
    .filter((item) => {
      try {
        const u = new URL(item.url);
        return (
          u.protocol === "https:" &&
          (u.hostname.endsWith(".blizzard.com") ||
            u.hostname === "worldofwarcraft.com")
        );
      } catch {
        return false;
      }
    })
    .slice(0, 36);
  if (!items.length) throw new Error("No safe official news links");
  return {
    updatedAt: new Date().toISOString(),
    feed: "https://wow-forever.gg/official.xml",
    items,
  };
});

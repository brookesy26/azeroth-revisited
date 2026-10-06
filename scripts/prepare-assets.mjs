import { mkdir, writeFile } from "node:fs/promises";
import sharp from "sharp";
const directory = new URL("../public/images/", import.meta.url);
await mkdir(directory, { recursive: true });
const api = await fetch(
  "https://api.github.com/repos/Gethe/wow-ui-textures/commits/classic",
  { headers: { "User-Agent": "AzerothRevisited" } },
);
if (!api.ok) throw new Error("Cannot pin artwork source");
const { sha } = await api.json();
const base = `https://cdn.jsdelivr.net/gh/Gethe/wow-ui-textures@${sha}/`;
const files = [
  ["blackrock", "Glues/LOADINGSCREENS/LoadScreenBlackrockDepths.PNG", 1600],
  ["molten-core", "Glues/LOADINGSCREENS/LoadScreenMoltenCore.PNG", 900],
  [
    "eastern-kingdoms",
    "Glues/LOADINGSCREENS/LOADSCREENEASTERNKINGDOM.PNG",
    900,
  ],
  ...[
    "Warrior",
    "Paladin",
    "Hunter",
    "Rogue",
    "Priest",
    "Shaman",
    "Mage",
    "Warlock",
    "Druid",
  ].map((name) => [name.toLowerCase(), `ICONS/ClassIcon_${name}.PNG`, 80]),
];
const results = [];
for (let index = 0; index < files.length; index += 3)
  await Promise.all(
    files.slice(index, index + 3).map(async ([name, file, width]) => {
      const response = await fetch(base + file);
      if (!response.ok) throw new Error("Artwork download failed: " + file);
      const image = await sharp(Buffer.from(await response.arrayBuffer()))
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: 85 })
        .toBuffer();
      await writeFile(new URL(name + ".webp", directory), image);
      results.push({
        file: name + ".webp",
        source: base + file,
        credit:
          "World of Warcraft artwork © Blizzard Entertainment; mirrored by Gethe/wow-ui-textures.",
      });
    }),
  );
await writeFile(
  new URL("../docs/artwork-sources.json", import.meta.url),
  JSON.stringify({ sha, assets: results }, null, 2),
);
console.log(
  "Prepared " + results.length + " local, optimised Warcraft images.",
);

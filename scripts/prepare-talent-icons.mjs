import { mkdir, readFile, writeFile, access } from "node:fs/promises";
import sharp from "sharp";
const data = JSON.parse(
  await readFile(new URL("../src/content/talents.json", import.meta.url)),
);
const ids = [
  ...new Set(
    data.classes
      .flatMap((cls) =>
        cls.trees.flatMap((tree) =>
          tree.talents.map((talent) => talent.icon_id),
        ),
      )
      .filter(Boolean),
  ),
];
const dir = new URL("../public/images/talents/", import.meta.url);
await mkdir(dir, { recursive: true });
const failures = [];
for (let index = 0; index < ids.length; index += 12) {
  await Promise.all(
    ids.slice(index, index + 12).map(async (id) => {
      const file = new URL(`${id}.webp`, dir);
      if (
        await access(file)
          .then(() => true)
          .catch(() => false)
      )
        return;
      try {
        const url = `https://assets.wow-forever.gg/icons/${id}.png`;
        const response = await fetch(url, {
          signal: AbortSignal.timeout(20000),
        });
        if (!response.ok) throw new Error(String(response.status));
        await writeFile(
          file,
          await sharp(Buffer.from(await response.arrayBuffer()))
            .resize({ width: 56, height: 56 })
            .webp({ quality: 90 })
            .toBuffer(),
        );
      } catch (error) {
        failures.push({ id, error: error.message });
      }
    }),
  );
}
console.log(JSON.stringify({ icons: ids.length, failures }));
if (failures.length) process.exitCode = 1;

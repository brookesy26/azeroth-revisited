import sharp from "sharp";
import { readFile } from "node:fs/promises";
import path from "node:path";
const destination = path.resolve(process.argv[2] || "artifacts/qa");
const report = JSON.parse(
  await readFile(path.join(destination, "accessibility-review.json"), "utf8"),
);
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

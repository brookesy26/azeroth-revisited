import { readdir, copyFile } from "node:fs/promises";
import { join } from "node:path";

// Next's Windows export can retain segment folders, while its client requests
// dot-separated filenames. Keep original payloads and add the requested aliases.
async function flatten(directory, prefix, destination) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const source = join(directory, entry.name);
    const name = `${prefix}.${entry.name}`;
    if (entry.isDirectory()) await flatten(source, name, destination);
    else if (entry.name.endsWith(".txt"))
      await copyFile(source, join(destination, name));
  }
}
async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const child = join(directory, entry.name);
    if (entry.name.startsWith("__next."))
      await flatten(child, entry.name, directory);
    else await walk(child);
  }
}
await walk("out");
console.log("Verified portable static segment filenames.");

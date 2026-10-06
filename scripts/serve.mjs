import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
const root = resolve("out");
const port = Number(process.env.PORT || 3100);
const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css",
  ".js": "text/javascript",
  ".json": "application/json",
  ".txt": "text/plain",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".png": "image/png",
  ".xml": "application/xml",
};
createServer(async (req, res) => {
  try {
    const url = new URL(req.url, "http://localhost");
    let pathname = decodeURIComponent(url.pathname);
    let file = resolve(root, "." + pathname);
    if (file !== root && !file.startsWith(root + sep)) {
      res.writeHead(403);
      res.end();
      return;
    }
    if ((await stat(file).catch(() => null))?.isDirectory())
      file = resolve(file, "index.html");
    let data = await readFile(file).catch(() => null);
    if (!data) {
      file = resolve(root, "404.html");
      data = await readFile(file);
      res.statusCode = 404;
    }
    res.setHeader(
      "Content-Type",
      mime[extname(file)] || "application/octet-stream",
    );
    res.end(data);
  } catch {
    res.writeHead(500);
    res.end("Unable to serve this page");
  }
}).listen(port, "127.0.0.1", () =>
  console.log(`Azeroth Revisited preview: http://localhost:${port}`),
);

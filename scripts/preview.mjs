import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
import { fileURLToPath } from "node:url";

export const root = resolve(fileURLToPath(new URL("../", import.meta.url)));
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
};

// Loopback only: this preview never publishes or changes GitHub Pages.
export async function startPreview(port = 0) {
  const server = createServer(async (request, response) => {
    try {
      const pathname = decodeURIComponent(
        new URL(request.url, "http://localhost").pathname,
      );
      const file = resolve(
        root,
        `.${pathname.endsWith("/") ? `${pathname}index.html` : pathname}`,
      );
      const relative = file.slice(root.length);
      if (
        !file.startsWith(root + sep) ||
        relative.split(sep).some((part) => part.startsWith(".")) ||
        relative.split(sep).includes("node_modules")
      ) {
        response.writeHead(403).end("Forbidden");
        return;
      }
      if (!(await stat(file)).isFile()) throw new Error("Not a file");
      response.writeHead(200, {
        "Content-Type": types[extname(file)] || "application/octet-stream",
        "Cache-Control": "no-store",
      });
      response.end(await readFile(file));
    } catch {
      response.writeHead(404).end("Not found");
    }
  });
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, "127.0.0.1", resolve);
  });
  return {
    url: `http://127.0.0.1:${server.address().port}`,
    close: () => new Promise((resolve) => server.close(resolve)),
  };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const preview = await startPreview(Number(process.env.PORT || 4174));
  console.log(`Local TEHCLAND preview: ${preview.url}`);
}

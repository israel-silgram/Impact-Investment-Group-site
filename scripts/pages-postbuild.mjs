import { readdirSync, readFileSync, statSync, writeFileSync, copyFileSync } from "node:fs";
import { join } from "node:path";

const dir = process.argv[2] ?? "dist/client";
const base = (process.env.BASE_PATH ?? "/").replace(/\/+$/, "");
// Root-absolute references to files in public/ are written by hand in the source
// and so are not rewritten by Vite's `base`. Fix them up for the subpath.
const roots = ["images/", "favicon.png", "robots.txt", "methodology-pack.txt"];
const exts = [".html", ".js", ".css", ".json", ".txt", ".xml"];

let patched = 0;
const walk = (d) => {
  for (const entry of readdirSync(d)) {
    const p = join(d, entry);
    if (statSync(p).isDirectory()) {
      walk(p);
    } else if (exts.some((e) => p.endsWith(e))) {
      const before = readFileSync(p, "utf8");
      let after = before;
      for (const r of roots) {
        for (const q of ['"', "'", "`", "("]) {
          after = after.split(`${q}/${r}`).join(`${q}${base}/${r}`);
        }
      }
      if (after !== before) {
        writeFileSync(p, after);
        patched += 1;
      }
    }
  }
};

if (base) walk(dir);
// GitHub Pages serves 404.html for unknown paths; hand it the app shell so deep
// links that were not prerendered still boot the client router.
copyFileSync(join(dir, "index.html"), join(dir, "404.html"));
writeFileSync(join(dir, ".nojekyll"), "");
console.log(`pages-postbuild: base="${base || "/"}", patched ${patched} file(s)`);

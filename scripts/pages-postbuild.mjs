import { readdirSync, readFileSync, statSync, writeFileSync, copyFileSync } from "node:fs";
import { join } from "node:path";

const dir = process.argv[2] ?? "dist/client";
const base = (process.env.BASE_PATH ?? "/").replace(/\/+$/, "");
// Root-absolute references to files in public/ are written by hand in the source
// and so are not rewritten by Vite's `base`. Fix them up for the subpath.
const roots = ["images/", "favicon.png", "robots.txt", "methodology-pack.txt"];
const exts = [".html", ".js", ".css", ".json", ".txt", ".xml"];

let patched = 0;
let truncated = 0;

/*
 * THE DUPLICATED DOCUMENT TAIL (found by the wave 412 screenshot gate).
 *
 * The prerender sometimes writes the end of the streamed document twice: the
 * page closes properly with `</body></html>`, and then a partial second copy
 * of the hydration payload follows it. A browser hoists everything after the
 * first `</html>` back into <body>, where the payload's own text becomes a
 * VISIBLE line of JavaScript at the foot of the page and its unbreakable
 * string pushes the document wider than the viewport: /contact measured
 * scrollWidth 674 against innerWidth 390 on a phone, on `origin/main` as
 * much as on this branch.
 *
 * Nothing after the first `</html>` can be meaningful, so it is cut. This is
 * a GUARD, NOT A CURE: the bug is upstream in the prerender, it affected one
 * of the 29 pages on the build this was written against, and which page it
 * lands on may well move. If it starts affecting many, chase it there rather
 * than widening this.
 */
const END = "</html>";
const trimTail = (p) => {
  const before = readFileSync(p, "utf8");
  const end = before.indexOf(END);
  if (end === -1 || end + END.length >= before.length) return before;
  truncated += 1;
  const after = before.slice(0, end + END.length);
  writeFileSync(p, after);
  return after;
};

const walk = (d) => {
  for (const entry of readdirSync(d)) {
    const p = join(d, entry);
    if (statSync(p).isDirectory()) {
      walk(p);
    } else if (exts.some((e) => p.endsWith(e))) {
      const before = p.endsWith(".html") ? trimTail(p) : readFileSync(p, "utf8");
      let after = before;
      if (base) {
        for (const r of roots) {
          for (const q of ['"', "'", "`", "("]) {
            after = after.split(`${q}/${r}`).join(`${q}${base}/${r}`);
          }
        }
      }
      if (after !== before) {
        writeFileSync(p, after);
        patched += 1;
      }
    }
  }
};

walk(dir);
// GitHub Pages serves 404.html for unknown paths; hand it the app shell so deep
// links that were not prerendered still boot the client router.
copyFileSync(join(dir, "index.html"), join(dir, "404.html"));
writeFileSync(join(dir, ".nojekyll"), "");
console.log(
  `pages-postbuild: base="${base || "/"}", patched ${patched} file(s), ` +
    `trimmed a duplicated document tail from ${truncated} file(s)`,
);

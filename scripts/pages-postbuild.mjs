import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
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
/*
 * THE 404 PAGE. GitHub Pages serves 404.html for any path it does not have.
 *
 * ⚠ IT USED TO BE A COPY OF index.html, "so deep links that were not
 * prerendered still boot the client router". It did not. The home page's
 * prerendered markup ships with the home route's dehydrated router state, and
 * hydrating that against a URL the router has never heard of throws
 * `Invariant failed` before the first paint. React then unmounts the tree and
 * the visitor is left with an EMPTY WHITE PAGE: `document.body.innerHTML` is
 * 72 characters long. That is what impactinvestmentgroup.co.uk serves today
 * for every mistyped URL and every dead inbound link, and it is what
 * `origin/main` serves too; the wave 412 screenshot gate photographed it.
 *
 * It is a static page now. No app script, so there is nothing to hydrate and
 * nothing to throw. Every route on this site is prerendered (36 of them), so
 * the shell was not buying a deep link anything in the first place.
 *
 * The markup is the SAME markup NotFoundComponent renders in
 * src/routes/__root.tsx, word for word and class for class, so the strings
 * stay the owner's and every utility used here is already in the stylesheet
 * because that component uses it. If you change the component, change this.
 */
const shell = readFileSync(join(dir, "index.html"), "utf8");
const stylesheet = shell.match(/<link[^>]+rel="stylesheet"[^>]*>/)?.[0] ?? "";
const icon = shell.match(/<link[^>]+rel="icon"[^>]*>/)?.[0] ?? "";
writeFileSync(
  join(dir, "404.html"),
  `<!DOCTYPE html><html lang="en"><head><meta charSet="utf-8"/>` +
    `<meta name="viewport" content="width=device-width, initial-scale=1"/>` +
    `<title>Page not found</title>` +
    `<meta name="robots" content="noindex"/>` +
    `<meta name="theme-color" content="#FFFFFF"/>` +
    `${stylesheet}${icon}</head><body>` +
    `<div class="flex min-h-screen items-center justify-center bg-background px-4">` +
    `<div class="max-w-md text-center">` +
    `<h1 class="text-7xl font-bold text-foreground">404</h1>` +
    `<h2 class="mt-4 text-xl font-semibold text-foreground">Page not found</h2>` +
    `<p class="mt-2 text-sm text-muted-foreground">` +
    `The page you&#x27;re looking for doesn&#x27;t exist or has been moved.</p>` +
    `<div class="mt-6"><a href="${base || ""}/" ` +
    `class="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 ` +
    `text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">` +
    `Go home</a></div></div></div></body></html>`,
);
writeFileSync(join(dir, ".nojekyll"), "");
console.log(
  `pages-postbuild: base="${base || "/"}", patched ${patched} file(s), ` +
    `trimmed a duplicated document tail from ${truncated} file(s)`,
);

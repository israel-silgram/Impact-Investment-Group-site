const ts = require("typescript"), fs = require("fs");
let bad = 0;
for (const f of ["src/routes/the-problem.tsx", "src/content/problem.ts", "src/content/services.ts"]) {
  const sf = ts.createSourceFile(f, fs.readFileSync(f, "utf8"), ts.ScriptTarget.ESNext, true, ts.ScriptKind.TSX);
  const e = sf.parseDiagnostics || [];
  console.log((e.length ? "FAIL  " : "ok    ") + f + (e.length ? "  " + e.map(x => ts.flattenDiagnosticMessageText(x.messageText, " ")).join("; ") : ""));
  bad += e.length;
}
const src = fs.readFileSync("src/routes/the-problem.tsx", "utf8");
const content = fs.readFileSync("src/content/problem.ts", "utf8");
for (const [names, file, label] of [
  [[...src.matchAll(/^\s{2}(\w+),$/gm)].map(m => m[1]).filter(n => src.includes(`from "@/content/problem"`) && content.includes(`export const ${n}`)), content, "problem"],
]) void [names, file, label];
// imports actually used
const head = src.slice(0, src.indexOf("export const Route"));
const body = src.slice(src.indexOf("export const Route"));
for (const n of ["Button", "Reveal", "PreReleaseBadge", "cn", "registerRoute", "capitalAtRisk",
                 "problemClose", "problemHero", "problemSections", "Link", "createFileRoute"]) {
  const imported = new RegExp(`\\b${n}\\b`).test(head);
  const used = new RegExp(`\\b${n}\\b`).test(body);
  if (imported && !used) { console.log("  UNUSED IMPORT: " + n); bad++; }
  if (!imported && used) { console.log("  *** USED BUT NOT IMPORTED: " + n); bad++; }
}
// referenced assets exist
for (const m of src.matchAll(/"(\/images\/[^"]+)"/g))
  if (!fs.existsSync("public" + m[1])) { console.log("  MISSING ASSET: " + m[1]); bad++; }
// every character named in content has a portrait entry in the route
for (const m of content.matchAll(/character: "([\w-]+)"/g))
  if (!src.includes(`"${m[1]}"`)) { console.log("  CHARACTER WITH NO PORTRAIT ENTRY: " + m[1]); bad++; }
// the two pages must not quote different temporary-accommodation figures
const svc = fs.readFileSync("src/content/services.ts", "utf8");
const strip = (t) => t.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
const ta = [...new Set([...(strip(svc) + strip(content)).matchAll(/13[0-9],\d{3}/g)].map(m => m[0]))];
console.log("\ntemporary-accommodation figures across both pages: " + ta.join(", "));
if (ta.length > 1) { console.log("  *** PAGES DISAGREE"); bad++; }
console.log(bad ? "\n*** " + bad + " PROBLEM(S) ***" : "\n--- clean ---");
process.exit(bad ? 1 : 0);

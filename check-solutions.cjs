const ts = require("typescript"), fs = require("fs");
let bad = 0;
for (const f of ["src/routes/solutions.tsx", "src/content/solutions.ts"]) {
  const sf = ts.createSourceFile(f, fs.readFileSync(f, "utf8"), ts.ScriptTarget.ESNext, true, ts.ScriptKind.TSX);
  const e = sf.parseDiagnostics || [];
  console.log((e.length ? "FAIL  " : "ok    ") + f + (e.length ? "  " + e.map(x => ts.flattenDiagnosticMessageText(x.messageText, " ")).join("; ") : ""));
  bad += e.length;
}
const src = fs.readFileSync("src/routes/solutions.tsx", "utf8");
const content = fs.readFileSync("src/content/solutions.ts", "utf8");
const strip = t => t.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");

const block = src.slice(src.indexOf('} from "@/content/site";'), src.indexOf('} from "@/content/solutions";'));
const names = [...block.matchAll(/^\s{2}(\w+),$/gm)].map(m => m[1]);
const body = src.slice(src.indexOf("export const Route"));
console.log("\nsolutions imports (" + names.length + "): " + names.join(", "));
for (const n of names) {
  if (!new RegExp("\\b" + n + "\\b").test(body)) { console.log("  UNUSED IMPORT: " + n); bad++; }
  if (!new RegExp("export (const|interface|type) " + n + "\\b").test(content)) {
    console.log("  MISSING EXPORT in content/solutions.ts: " + n); bad++;
  }
}
for (const n of ["Button", "Reveal", "PreReleaseBadge", "cn", "registerRoute", "closingBeats", "closingStrapline", "Link"]) {
  const head = src.slice(0, src.indexOf("export const Route"));
  if (new RegExp("\\b" + n + "\\b").test(head) && !new RegExp("\\b" + n + "\\b").test(body)) {
    console.log("  UNUSED IMPORT: " + n); bad++;
  }
  if (!new RegExp("\\b" + n + "\\b").test(head) && new RegExp("\\b" + n + "\\b").test(body)) {
    console.log("  *** USED BUT NOT IMPORTED: " + n); bad++;
  }
}
for (const m of src.matchAll(/"(\/images\/[^"]+)"/g))
  if (!fs.existsSync("public" + m[1])) { console.log("  MISSING ASSET: " + m[1]); bad++; }

// the types the three orphaned components still import must survive
for (const n of ["RoleSlug", "RoleSection", "roleSections"])
  if (!new RegExp("export (const|interface|type) " + n + "\\b").test(content)) {
    console.log("  *** " + n + " REMOVED — components/solutions/* will not compile"); bad++;
  }
// all eight roles must still appear somewhere on the page
const ROLES = ["Local Authorities", "Housing Associations", "Care & Support Providers", "Investors",
               "Landlords", "Developers", "Estate Agents", "Contractors"];
const shown = strip(content);
const missing = ROLES.filter(r => !shown.includes('role: "' + r + '"'));
if (missing.length) { console.log("  *** ROLES DROPPED: " + missing.join(", ")); bad++; }
else console.log("all eight roles still present");
// the safeguarding line may not lose its clause
if (!shown.includes("supports but never substitutes")) { console.log("  *** safeguarding clause missing"); bad++; }
console.log(bad ? "\n*** " + bad + " PROBLEM(S) ***" : "\n--- clean ---");
process.exit(bad ? 1 : 0);

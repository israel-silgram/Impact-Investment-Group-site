const ts = require("typescript"), fs = require("fs");
let bad = 0;
for (const f of ["src/routes/platform.tsx", "src/content/services.ts"]) {
  const sf = ts.createSourceFile(f, fs.readFileSync(f, "utf8"), ts.ScriptTarget.ESNext, true, ts.ScriptKind.TSX);
  const e = sf.parseDiagnostics || [];
  console.log((e.length ? "FAIL  " : "ok    ") + f + (e.length ? "  " + e.map(x => ts.flattenDiagnosticMessageText(x.messageText, " ")).join("; ") : ""));
  bad += e.length;
}
const src = fs.readFileSync("src/routes/platform.tsx", "utf8");
const content = fs.readFileSync("src/content/services.ts", "utf8");
const block = src.slice(0, src.indexOf('} from "@/content/services";'));
const names = [...block.matchAll(/^\s{2}(?:type\s+)?(\w+),$/gm)].map(m => m[1]);
const body = src.slice(src.indexOf("export const Route"));
console.log("\nservices imports (" + names.length + "): " + names.join(", "));
for (const n of names) {
  if (!new RegExp("\\b" + n + "\\b").test(body)) { console.log("  UNUSED IMPORT: " + n); bad++; }
  if (!new RegExp("export (const|interface|type|function) " + n + "\\b").test(content)) {
    console.log("  MISSING EXPORT in content/services.ts: " + n); bad++;
  }
}
for (const f of [src, content]) for (const m of f.matchAll(/"(\/images\/[^"]+)"/g))
  if (!fs.existsSync("public" + m[1])) { console.log("  MISSING ASSET: " + m[1]); bad++; }
console.log(bad ? "\n*** " + bad + " PROBLEM(S) ***" : "\n--- clean ---");
process.exit(bad ? 1 : 0);

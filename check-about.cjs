const ts = require("typescript");
const fs = require("fs");

const files = ["src/routes/about.tsx", "src/content/about.ts", "src/components/about/director-card.tsx"];
let bad = 0;

for (const f of files) {
  const src = fs.readFileSync(f, "utf8");
  const sf = ts.createSourceFile(f, src, ts.ScriptTarget.ESNext, true, ts.ScriptKind.TSX);
  const errs = sf.parseDiagnostics || [];
  console.log((errs.length ? "FAIL  " : "ok    ") + f +
    (errs.length ? "  " + errs.map(e => ts.flattenDiagnosticMessageText(e.messageText, " ")).join("; ") : ""));
  bad += errs.length;
}

// Every named import in about.tsx must actually be referenced below the imports,
// and every symbol it pulls from content/about.ts must actually be exported there.
const src = fs.readFileSync("src/routes/about.tsx", "utf8");
const content = fs.readFileSync("src/content/about.ts", "utf8");
const block = src.slice(0, src.indexOf('} from "@/content/about";'));
const names = [...block.matchAll(/^\s{2}(?:type\s+)?(\w+),$/gm)].map(m => m[1]);
const body = src.slice(src.indexOf("export const Route"));

console.log("\ncontent imports (" + names.length + "): " + names.join(", "));
for (const n of names) {
  if (!new RegExp("\\b" + n + "\\b").test(body)) { console.log("  UNUSED IMPORT: " + n); bad++; }
  if (!new RegExp("export (const|interface|type|function) " + n + "\\b").test(content)) {
    console.log("  MISSING EXPORT in content/about.ts: " + n); bad++;
  }
}

// Referenced public/ assets must exist on disk.
for (const m of src.matchAll(/"(\/images\/[^"]+)"/g)) {
  const p = "public" + m[1];
  if (!fs.existsSync(p)) { console.log("  MISSING ASSET: " + m[1]); bad++; }
}
for (const m of content.matchAll(/"(\/images\/[^"]+)"/g)) {
  const p = "public" + m[1];
  if (!fs.existsSync(p)) { console.log("  MISSING ASSET (content): " + m[1]); bad++; }
}

console.log(bad ? "\n*** " + bad + " PROBLEM(S) ***" : "\n--- clean ---");
process.exit(bad ? 1 : 0);

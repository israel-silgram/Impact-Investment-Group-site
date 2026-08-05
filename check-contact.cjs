const ts = require("typescript"), fs = require("fs");
let bad = 0;
for (const f of ["src/routes/contact.tsx", "src/content/contact.ts", "src/content/faq.ts"]) {
  const sf = ts.createSourceFile(f, fs.readFileSync(f, "utf8"), ts.ScriptTarget.ESNext, true, ts.ScriptKind.TSX);
  const e = sf.parseDiagnostics || [];
  console.log((e.length ? "FAIL  " : "ok    ") + f + (e.length ? "  " + e.map(x => ts.flattenDiagnosticMessageText(x.messageText, " ")).join("; ") : ""));
  bad += e.length;
}
const src = fs.readFileSync("src/routes/contact.tsx", "utf8");
const content = fs.readFileSync("src/content/contact.ts", "utf8");
const site = fs.readFileSync("src/content/site.ts", "utf8");
const faq = fs.readFileSync("src/content/faq.ts", "utf8");
const head = src.slice(0, src.indexOf("const searchSchema"));
const body = src.slice(src.indexOf("const searchSchema"));
for (const n of ["Clock","LifeBuoy","Mail","Phone","Plus","Reveal","EnquiryForm","cn","z",
                 "contactHero","enquiryRouteIds","enquiryRoutes","whatHappensNext",
                 "faq","faqEyebrow","faqHeading","contactDetails","crisisLines","crisisNote"]) {
  const imported = new RegExp("\\b" + n + "\\b").test(head);
  const used = new RegExp("\\b" + n + "\\b").test(body);
  if (imported && !used) { console.log("  UNUSED IMPORT: " + n); bad++; }
  if (!imported && used) { console.log("  *** USED BUT NOT IMPORTED: " + n); bad++; }
}
for (const [n, file, where] of [["contactHero", content, "contact"], ["whatHappensNext", content, "contact"],
                                ["enquiryRoutes", content, "contact"], ["enquiryRouteIds", content, "contact"],
                                ["crisisLines", site, "site"], ["crisisNote", site, "site"],
                                ["contactDetails", site, "site"], ["faq", faq, "faq"]])
  if (!new RegExp("export const " + n + "\\b").test(file)) {
    console.log("  MISSING EXPORT in content/" + where + ".ts: " + n); bad++;
  }
for (const m of src.matchAll(/"(\/images\/[^"]+)"/g))
  if (!fs.existsSync("public" + m[1])) { console.log("  MISSING ASSET: " + m[1]); bad++; }

// promises the business has to keep, and the safeguarding numbers
if (!content.includes("A person reads it")) { console.log("  *** the rail lost 'a person reads it'"); bad++; }
if (!src.includes("crisisLines")) { console.log("  *** crisis numbers no longer on the page"); bad++; }
if (!faq.includes("Samaritans")) { console.log("  *** FAQ lost the crisis numbers"); bad++; }
// the six routes must all still be selectable
const routes = (content.match(/id: "(demo|waitlist|partner|investor|media|support)"/g) || []).length;
console.log("\nenquiry routes still defined: " + routes + "/6");
if (routes < 6) bad++;
console.log(bad ? "\n*** " + bad + " PROBLEM(S) ***" : "\n--- clean ---");
process.exit(bad ? 1 : 0);

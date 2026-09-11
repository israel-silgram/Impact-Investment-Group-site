/**
 * Wave 295: every string on the two new routes, printed for Callum.
 *
 * R295-5 says the copy is his to read before `main` moves, so it is printed
 * from the content file rather than pasted into the report by hand. If a word
 * changes in the product, re-run this and the report changes with it.
 *
 *   bun scripts/wave295-copy.ts
 */
import {
  consentBlock,
  contactFieldLabels,
  orgBudgetOptions,
  personalBudgetOptions,
  pickerContent,
  registerAsDivider,
  registerFailureLine,
  registerPrivacy,
  registerRoleContent,
  residentUrgentNote,
} from "../src/content/register";
import { registerRoute } from "../src/content/site";

const h = (s: string) => console.log(`\n### ${s}\n`);
const kv = (k: string, v: string) => console.log(`- **${k}** \`${v}\``);

h("The two labels (R295-2)");
kv("The button, everywhere it is drawn", registerRoute.label);
kv("The hero divider", registerAsDivider);
kv("Where the button points", registerRoute.to);

h("The picker, /register");
kv("Eyebrow", pickerContent.eyebrow);
kv("h1", pickerContent.h1);
kv("Lede", pickerContent.lede);
kv("Above the tiles", pickerContent.gridLabel);
kv("Under the tiles", pickerContent.footnote);

h("Shared across all ten role pages");
kv("Consent heading", consentBlock.heading);
kv("Consent help", consentBlock.help);
kv("Consent box 1 (unticked)", consentBlock.email.label);
kv("Consent box 2 (unticked)", consentBlock.sms.label);
kv("Privacy line", registerPrivacy.body);
kv("Privacy link", `${registerPrivacy.linkLabel} -> ${registerPrivacy.href}`);
kv("Failure line", registerFailureLine);
kv("Contact heading", "Where do we reach you?");
for (const [k, v] of Object.entries(contactFieldLabels)) kv(k, v);
kv("Success page's one other action", "See what we are building -> /platform");

h("Price bands, PROPOSED and yours to confirm");
console.log("Organisation ladder (investor, developer, housing association, local authority, care provider, support provider, broker):\n");
for (const o of orgBudgetOptions) console.log(`  - ${o}`);
console.log("\nPersonal ladder (landlord, social worker; the social worker also gets 'My employer would decide, not me'):\n");
for (const o of personalBudgetOptions) console.log(`  - ${o}`);

h("The resident page's urgent note");
kv("Heading", residentUrgentNote.heading);
kv("Body", residentUrgentNote.body);
console.log("- The three numbers under it are rendered from `crisisLines` in content/site.ts, not retyped.");

for (const role of registerRoleContent) {
  h(`/register/${role.id}`);
  kv("Eyebrow", role.eyebrow);
  kv("h1", role.h1);
  kv("Lede", role.lede);
  console.log("- **What they get for joining now**");
  for (const o of role.offer) console.log(`  - (${o.icon}) ${o.text}`);
  console.log("- **Questions**");
  for (const q of role.questions) {
    const tag = q.tail ? " *(inside the question above)*" : "";
    console.log(`  - \`${q.id}\` · ${q.kind}${tag} · **${q.label}**`);
    if (q.help) console.log(`    - help: ${q.help}`);
    if (q.placeholder) console.log(`    - placeholder: ${q.placeholder}`);
    if (q.options) for (const o of q.options) console.log(`    - [ ] ${o}`);
  }
  kv("Organisation field", role.askOrganisation ? role.organisationLabel : "NOT ASKED");
  kv("Submit button", role.submitLabel);
  kv("Success heading", role.success.heading);
  kv("Success body", role.success.body);
  console.log("- **What happens next**");
  role.success.next.forEach((n, i) => console.log(`  ${i + 1}. ${n}`));
  kv("Meta description", role.metaDescription);
}

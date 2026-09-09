/**
 * Wave 295 refuter: the answer-id contract, printed from the content file.
 *
 * The report has to tell wave 294 exactly which keys arrive under `answers`
 * for each role. Reading them off content/register.ts rather than typing them
 * out is the difference between a contract and a description of one.
 *
 *   bun scripts/wave295-contract.ts
 */
import { registerRoleContent } from "../src/content/register";

console.log("| Role | Question ids, in page order | Kinds |");
console.log("|---|---|---|");
for (const role of registerRoleContent) {
  const ids = role.questions.map((q) => `\`${q.id}\``).join(" · ");
  const kinds = role.questions.map((q) => q.kind[0]).join("");
  console.log(`| \`${role.id}\` | ${ids} | ${kinds} |`);
}

const all = new Map<string, Set<string>>();
for (const role of registerRoleContent) {
  for (const q of role.questions) {
    if (!all.has(q.id)) all.set(q.id, new Set());
    all.get(q.id)!.add(role.id);
  }
}
console.log("\n| Answer id | Kind | Roles that send it |");
console.log("|---|---|---|");
for (const [id, roles] of [...all].sort()) {
  const q = registerRoleContent.flatMap((r) => r.questions).find((x) => x.id === id)!;
  const where = roles.size === registerRoleContent.length ? "all ten" : [...roles].join(", ");
  console.log(`| \`${id}\` | ${q.kind} | ${where} |`);
}

/**
 * R295-4 counts a question the way a visitor does: a frictions multi-choice
 * "plus a free-text line" is ONE question with two answers, and it is drawn
 * that way (see `tail` in content/register.ts). So the cap is checked against
 * blocks on the page, and the id count is printed beside it.
 */
const blocks = registerRoleContent.map((r) => r.questions.filter((q) => !q.tail).length);
const idCounts = registerRoleContent.map((r) => r.questions.length);
console.log(
  `\nQuestion BLOCKS per role: min ${Math.min(...blocks)}, max ${Math.max(...blocks)} ` +
    `(R295-4 allows three to six).\n` +
    `Answer IDS per role:      min ${Math.min(...idCounts)}, max ${Math.max(...idCounts)} ` +
    `(the extra id is the frictions free-text, drawn inside its question).`,
);
if (Math.max(...blocks) > 6 || Math.min(...blocks) < 3) {
  console.error("REFUTER FAILED: a role is outside the three-to-six range.");
  process.exit(1);
}

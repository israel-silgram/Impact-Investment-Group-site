/**
 * fix-headshots.cjs — every headshot becomes a circle, Israel's becomes a
 * large circle sitting ON the card rather than being the top of the card.
 *
 * Run from the repo root:  node fix-headshots.cjs
 *
 * ── What changes ──────────────────────────────────────────────────────────
 *
 * ROW CARDS (Maria, Jonathan, Callum, Shahab): the 68px rounded square becomes
 * a 68px circle. One class.
 *
 * ISRAEL'S CARD: the photograph used to be the card — a full-bleed 4:5 crop
 * filling the top edge, with the name block underneath. It is now a 168px
 * circular portrait sitting inside the card's padding, centred, with the card's
 * own cream showing all the way round it. That is the difference between the
 * picture being part of the card and the picture being on it.
 *
 * ⚠️ THE SOURCE IMAGE CHANGES WITH THE SHAPE. It now uses `director.portrait`
 * (the 440x440 square) instead of `director.portraitLead` (the 880x1100 4:5
 * crop). A circle needs a square source — masking a 4:5 image into a circle
 * crops the top of the head off. `portraitLead` stays in content/about.ts and
 * is simply unused; if the tall card ever comes back, so does it.
 *
 * The card's text block is now centred to match the portrait above it.
 */
const fs = require("fs");

const FILE = "src/components/about/director-card.tsx";
let src = fs.readFileSync(FILE, "utf8");
const before = src;
let applied = 0;
const missed = [];

function swap(label, from, to) {
  if (!src.includes(from)) { missed.push(label); return; }
  src = src.split(from).join(to);
  applied += 1;
  console.log("  ok    " + label);
}

// 1 · The four team rows: rounded square -> circle.
swap(
  "row headshots -> circular",
  'className="size-[68px] shrink-0 rounded-[10px] object-cover"',
  'className="size-[68px] shrink-0 rounded-full object-cover"',
);
swap(
  "row initials fallback -> circular",
  'className="grid size-[68px] shrink-0 place-items-center rounded-[10px] bg-white font-heading text-xl font-bold text-navy-900"',
  'className="grid size-[68px] shrink-0 place-items-center rounded-full bg-white font-heading text-xl font-bold text-navy-900"',
);

// 2 · Israel: full-bleed 4:5 photo -> large circle on the card.
swap(
  "director portrait -> large circle on the card",
  `        <img
          src={director.portraitLead ?? director.portrait}
          alt={\`\${director.name}, \${director.role}\`}
          width={880}
          height={1100}
          className="aspect-[4/5] w-full object-cover object-[50%_18%]"
        />
        <div className="flex flex-1 flex-col p-5">`,
  `        {/* A circle needs a SQUARE source — \`portrait\` (440x440), not
            \`portraitLead\` (the 880x1100 crop), which would lose the top of
            the head to the mask. */}
        <div className="flex justify-center px-5 pt-6">
          <img
            src={director.portrait}
            alt={\`\${director.name}, \${director.role}\`}
            width={440}
            height={440}
            className="size-[168px] rounded-full object-cover ring-4 ring-white"
          />
        </div>
        <div className="flex flex-1 flex-col p-5 text-center">`,
);

// 3 · The accent rule was left-aligned under a full-width photo; centre it now
//     the card is centred.
swap(
  "accent rule centred",
  'className={cn("h-1 w-10 rounded-full", orange ? "bg-orange-600" : "bg-teal-600")}',
  'className={cn("mx-auto h-1 w-10 rounded-full", orange ? "bg-orange-600" : "bg-teal-600")}',
);

// 4 · Credential bullets read better centred under a centred portrait.
swap(
  "credential list alignment",
  'className="mt-3.5 flex flex-col gap-1.5 border-t border-[color-mix(in_oklab,var(--color-navy-900)_12%,transparent)] pt-3.5"',
  'className="mt-3.5 flex flex-col gap-1.5 border-t border-[color-mix(in_oklab,var(--color-navy-900)_12%,transparent)] pt-3.5 text-left"',
);

// ── Safety nets ───────────────────────────────────────────────────────────
if (!src.includes("director.portrait")) {
  console.error("\n*** REFUSING TO WRITE — no portrait is rendered any more.");
  process.exit(1);
}
if (src.includes("aspect-[4/5]")) {
  console.error("\n*** REFUSING TO WRITE — the 4:5 crop is still being used somewhere;");
  console.error("    masked into a circle it will cut the top of the head off.");
  process.exit(1);
}
if (src === before) { console.log("\nnothing changed — already applied?"); process.exit(0); }

fs.writeFileSync(FILE, src);
console.log("\n" + applied + "/5 changes applied to " + FILE);
if (missed.length) console.log("not found (left alone): " + missed.join(", "));
console.log("all headshots circular · square source used · safe to build");

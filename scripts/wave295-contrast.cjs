/**
 * Wave 295 refuter: every pair the orange tokens touch, measured.
 *
 * Prints the markdown table that goes in docs/WAVE295_REPORT.md, computed from
 * the hex values rather than typed out, and with the pre-wave values beside the
 * post-wave ones so a regression is visible rather than argued about.
 *
 *   node scripts/wave295-contrast.cjs
 *
 * WCAG 2.1/2.2: 4.5:1 for normal text, 3:1 for large text (24px, or 18.66px
 * bold) and for non-text marks under 1.4.11.
 */

const relLum = (hex) => {
  const h = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4]
    .map((i) => parseInt(h.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const ratioL = (l1, l2) => {
  const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
};

const ratio = (a, b) => ratioL(relLum(a), relLum(b));
const r2 = (n) => n.toFixed(2);

const NEW = {
  "orange-400": "#f0a886",
  "orange-500": "#c15f3c",
  "orange-600": "#ae4e30",
  "orange-700": "#9a4429",
};
const OLD = {
  "orange-400": "#ff7a29",
  "orange-500": "#ff7a29",
  "orange-600": "#e56600",
  "orange-700": "#c25400",
};

const GROUNDS = {
  "navy-950": "#000b1c",
  "navy-900": "#00112b",
  "navy-800": "#041c3d",
  "navy-700": "#0a2a52",
  "cream (mist-bg)": "#f7f1e6",
  "cream-card": "#efe6d6",
  white: "#ffffff",
};

/**
 * The ghosted street behind the hero. There is no flat hex for it: the
 * measurable thing is the brightest pixel of the composite, and styles.css
 * records it as white measuring 13.3:1 there. Back-solve the luminance from
 * that so this table and that comment can never disagree.
 */
const HERO_GROUND_LUM = 1.05 / 13.3 - 0.05;

const verdict = (n) =>
  n >= 4.5 ? "AA any size" : n >= 3 ? "AA large text / non-text only" : "FAILS";

console.log("### Every pair the orange tokens touch\n");
console.log(
  "| Foreground | Ground | Before | After | After verdict |\n" + "|---|---|---:|---:|---|",
);

for (const [gName, gHex] of Object.entries(GROUNDS)) {
  for (const token of Object.keys(NEW)) {
    const before = ratio(OLD[token], gHex);
    const after = ratio(NEW[token], gHex);
    const moved = r2(before) !== r2(after) ? "" : " (unchanged)";
    console.log(
      `| \`${token}\` \`${NEW[token]}\` | ${gName} \`${gHex}\` | ${r2(before)}:1 | **${r2(after)}:1**${moved} | ${verdict(after)} |`,
    );
  }
}

console.log("\n### Text ON an orange fill\n");
console.log("| Foreground | Fill | Before | After | After verdict |\n|---|---|---:|---:|---|");
for (const [fg, fgHex] of Object.entries({ white: "#ffffff", "navy-900": "#00112b" })) {
  for (const token of ["orange-500", "orange-600", "orange-700"]) {
    console.log(
      `| ${fg} | \`${token}\` \`${NEW[token]}\` | ${r2(ratio(fgHex, OLD[token]))}:1 | **${r2(ratio(fgHex, NEW[token]))}:1** | ${verdict(ratio(fgHex, NEW[token]))} |`,
    );
  }
}

console.log("\n### The hero's ghosted street, worst case\n");
console.log("| Foreground | Before | After | After verdict |\n|---|---:|---:|---|");
for (const fg of ["#ffffff", ...Object.values(NEW)]) {
  const name = Object.keys(NEW).find((k) => NEW[k] === fg) ?? "white";
  const oldHex = name === "white" ? "#ffffff" : OLD[name];
  const b = ratioL(relLum(oldHex), HERO_GROUND_LUM);
  const a = ratioL(relLum(fg), HERO_GROUND_LUM);
  console.log(`| ${name} \`${fg}\` | ${r2(b)}:1 | **${r2(a)}:1** | ${verdict(a)} |`);
}

console.log("\n### The retired hex the brief named\n");
console.log("| Pair | Ratio |\n|---|---:|");
console.log(`| white on \`#C6613F\` (brief's value) | **${r2(ratio("#ffffff", "#C6613F"))}:1** |`);
console.log(
  `| white on \`#C15F3C\` (the platform's live \`--brand-primary\`) | **${r2(ratio("#ffffff", "#C15F3C"))}:1** |`,
);
console.log(
  `| white on \`#AE4E30\` (the platform's \`--brand-primary-ink\`) | **${r2(ratio("#ffffff", "#AE4E30"))}:1** |`,
);

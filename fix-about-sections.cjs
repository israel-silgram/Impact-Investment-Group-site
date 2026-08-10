/**
 * fix-about-sections.cjs — About's Purpose and Ecosystem sections rebuilt as
 * P3 (the ladder) and E3 (navy, with the trio), and the footer arch removed.
 *
 * Run from the repo root:  node fix-about-sections.cjs
 *
 * ── P3 · WHY WE EXIST becomes a ladder ────────────────────────────────────
 *
 * Four cards in a row become four full-width rows: the figure huge on the
 * left, what it means in the middle, its source on the right. Nothing is cut —
 * every value, every `kind` label and every source link survives, and the rows
 * hold them in less height than the cards did, because a card wastes its width
 * on a 13-character number.
 *
 * The figure column is `clamp(9rem,16vw,13rem)` rather than a fixed width:
 * "176,130" and "£102m / yr" are very different lengths and a fixed column
 * either clips the long one or leaves a hole after the short one.
 *
 * ── E3 · WHAT WE DO goes navy, with a character on each step ──────────────
 *
 * ⚠️ THIS BAND WAS CREAM AND IS NOW NAVY, which means About runs cream →
 * navy → navy. The two dark bands do not merge because `Band` already draws a
 * border-t on every section, but the page has lost its alternation. If that
 * reads badly, putting `light` back on this Band is the whole of the fix.
 *
 * Petra, Peter and Pippa take a step each. `CAST` is indexed off position, so
 * re-ordering `accountableChain` re-orders the characters with it — they are
 * not pinned to a company.
 *
 * The compliance notice is untouched and still sits under the cards. On navy
 * it needs no colour change: it was already written in the dark idiom and only
 * `.section-light` was flipping it.
 *
 * ── THE ARCH GOES ─────────────────────────────────────────────────────────
 *
 * It was a transparent strip, so on any page whose last section is cream it
 * produced cream → navy corners → cream. It only ever read correctly on the
 * two pages that end dark, and styles.css already states the rule: "The
 * boundary between a light and a dark section is always a hard edge: no
 * gradients, no fades." Removing it is the consistent answer, not a retreat.
 */
const fs = require("fs");
const path = require("path");

let failed = 0;
const files = [];

function open(rel) {
  const p = path.join(process.cwd(), rel);
  if (!fs.existsSync(p)) { console.error("  MISS  " + rel + " not found"); failed += 1; return null; }
  const f = { rel, p, src: fs.readFileSync(p, "utf8") };
  files.push(f);
  return f;
}

/** Replace a whole <Band id="..."> … </Band> by index, never by regex span. */
function swapBand(f, id, replacement) {
  if (!f) return;
  const OPEN = `<Band id="${id}"`;
  const at = f.src.indexOf(OPEN);
  if (at === -1) { console.error(`  MISS  ${f.rel} :: no Band "${id}"`); failed += 1; return; }
  const lineStart = f.src.lastIndexOf("\n", at) + 1;
  const close = f.src.indexOf("</Band>", at);
  if (close === -1) { console.error(`  MISS  ${f.rel} :: no </Band> after "${id}"`); failed += 1; return; }
  const slice = f.src.slice(lineStart, close + 7);
  const o = (slice.match(/<Band\b/g) || []).length;
  const c = (slice.match(/<\/Band>/g) || []).length;
  if (o !== c) { console.error(`  MISS  ${f.rel} :: "${id}" slice unbalanced (${o}/${c})`); failed += 1; return; }
  f.src = f.src.slice(0, lineStart) + replacement + f.src.slice(close + 7);
  console.log(`  ok    ${f.rel} :: ${id} rebuilt`);
}

const about = open("src/routes/about.tsx");

/* The three characters, one per step. Indexed by position — re-ordering the
   chain re-orders the cast with it. */
if (about && !about.src.includes("const CAST")) {
  const anchor = "/** Per-card accents, so a row of data does not read as one block of colour. */";
  if (about.src.includes(anchor)) {
    about.src = about.src.replace(anchor,
`/**
 * One character per step of the chain, by POSITION not by company — re-order
 * \`accountableChain\` and the cast follows. Same three used on /the-problem and
 * /solutions, which is the point: About should not introduce new furniture.
 */
const CAST = [
  "/images/ai-team/petra-point.webp",
  "/images/ai-team/peter-present.webp",
  "/images/ai-team/pippa-present.webp",
] as const;

` + anchor);
    console.log("  ok    about.tsx :: CAST added");
  } else { console.error("  MISS  about.tsx :: cannot find the ACCENT comment to anchor CAST"); failed += 1; }
}

/* ── P3 ──────────────────────────────────────────────────────────────────── */
swapBand(about, "why-heading",
`      {/* ── 2 · Why We Exist ── navy ── THE LADDER ────────────────────────
        *
        * Four sourced figures as four full-width rows rather than four cards:
        * value left, meaning centre, source right. Every figure, every kind
        * label and every source link survives — a card just spent its width on
        * a number that needed a third of it.
        */}
      <Band id="why-heading" image="/images/why-estate-aerial.webp">
        <Head eyebrow={whyWeExist.eyebrow} title={whyWeExist.title} id="why-heading" />
        <Summary lines={summaries.whyWeExist!} tone="teal" />

        <SubHead>{problemHeading}</SubHead>
        <ul className="mt-5">
          {problemFigures.map((figure, i) => {
            const accent = ACCENT[figureAccents[i % figureAccents.length]!];
            return (
              <Reveal
                key={figure.id}
                index={i}
                as="li"
                className="border-b border-navy-700 last:border-b-0"
              >
                <div className="flex flex-col gap-2 py-4 sm:flex-row sm:items-baseline sm:gap-7">
                  {/* Fluid, not fixed: "176,130" and "£102m / yr" are very
                      different lengths, and a fixed column either clips the
                      long one or leaves a hole after the short one. */}
                  <p
                    className={cn(
                      "shrink-0 font-heading text-[clamp(1.75rem,3.4vw,2.5rem)] font-extrabold leading-none tracking-[-0.035em] sm:w-[clamp(9rem,16vw,13rem)]",
                      accent.text,
                    )}
                  >
                    {figure.value}
                  </p>
                  <div className="min-w-0 flex-1">
                    <p className={cn("eyebrow", accent.text)}>{figure.kind}</p>
                    <p className="mt-1 text-[14px] leading-snug text-white">{figure.label}</p>
                  </div>
                  {/* A figure without its source does not go on this page. */}
                  <a
                    href={figure.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex shrink-0 items-start gap-1 text-[11px] font-semibold leading-snug text-teal-400 transition-colors duration-200 hover:text-white sm:max-w-[17rem]"
                  >
                    <span>Source: {figure.source}</span>
                    <ArrowUpRight aria-hidden="true" className="mt-px size-3 shrink-0" />
                  </a>
                </div>
              </Reveal>
            );
          })}
        </ul>
      </Band>`);

/* ── E3 ──────────────────────────────────────────────────────────────────── */
swapBand(about, "what-heading",
`      {/* ── 3 · What We Do ── navy ── THE TRIO ────────────────────────────
        *
        * ⚠️ THIS BAND USED TO BE CREAM. About now runs cream → navy → navy.
        * The two dark bands do not merge — Band draws a border-t on every
        * section — but the alternation is gone. Putting \`light\` back on this
        * Band is the whole of the fix if that reads badly.
        */}
      <Band id="what-heading">
        <Head eyebrow={whatWeDo.eyebrow} title={whatWeDo.title} id="what-heading" />
        <p className="mt-4 max-w-[44ch] text-[clamp(1.375rem,2.4vw,1.625rem)] font-semibold leading-[1.32] text-white">
          Three companies. <strong className="font-bold text-orange-500">One chain.</strong> No gap
          for a person to fall through.
        </p>

        <ol className="mt-8 grid items-stretch gap-4 md:grid-cols-3">
          {accountableChain.map((step, i) => {
            const accent = chainAccents[i % chainAccents.length]!;
            const line = accent === "orange" ? "text-orange-500" : "text-teal-400";
            const chip =
              accent === "orange"
                ? "bg-orange-500/16 text-orange-500"
                : "bg-teal-400/16 text-teal-400";
            return (
              <Reveal key={step.id} index={i} as="li" className="h-full">
                {/* pb-[104px] reserves the character's corner. Without it the
                    chip and the artwork fight for the same 100px. */}
                <div
                  className={cn(
                    "panel relative flex h-full flex-col overflow-hidden p-6 pb-[104px]",
                    accent === "orange" ? "border-orange-500/40" : "border-teal-600/40",
                  )}
                >
                  <p className={cn("eyebrow", line)}>{\`0\${i + 1}\`}</p>
                  <h4 className="heading-tight mt-1.5 max-w-[16ch] font-heading text-[clamp(1.125rem,1.7vw,1.3125rem)] font-extrabold tracking-[-0.015em] text-white">
                    {step.claim}
                  </h4>
                  <p className="mt-2.5 max-w-[32ch] text-[12.5px] leading-relaxed text-mist">
                    {step.detail}
                  </p>
                  <p
                    className={cn(
                      "mt-3 w-fit rounded-full px-3 py-1.5 font-heading text-[10.5px] font-extrabold uppercase tracking-[0.1em]",
                      chip,
                    )}
                  >
                    {step.name}
                  </p>
                  <img
                    src={CAST[i % CAST.length]}
                    alt=""
                    aria-hidden="true"
                    loading="lazy"
                    width={281}
                    height={560}
                    className="pointer-events-none absolute -bottom-2 -right-4 h-[136px] w-auto"
                  />
                </div>
              </Reveal>
            );
          })}
        </ol>

        {/* The compliance notice. It is a NOTICE, not body copy — the shield,
            the tinted strip and the bolded negatives are all there so it reads
            as one. See content/about.ts for what may and may not be cut. */}
        <div className="mt-7 flex items-start gap-3 rounded-[var(--radius-panel)] border border-navy-700 bg-navy-800/40 p-4">
          <ShieldAlert
            aria-hidden="true"
            className="mt-px size-[17px] shrink-0 text-slate-muted"
            strokeWidth={1.8}
          />
          <p className="max-w-[104ch] text-[12.5px] leading-relaxed text-slate-muted">
            <Emphasise text={chainNotice} terms={chainNoticeEmphasis} />
          </p>
        </div>
      </Band>`);

/* ── the arch ────────────────────────────────────────────────────────────── */
const footer = open("src/components/site-footer.tsx");
if (footer) {
  const at = footer.src.indexOf("THE ARCH");
  if (at === -1) {
    console.log("  skip  site-footer.tsx :: the arch is already gone");
  } else {
    const start = footer.src.lastIndexOf("{/*", at);
    const end = footer.src.indexOf("</div>", footer.src.indexOf("</svg>", at));
    if (start === -1 || end === -1) {
      console.error("  MISS  site-footer.tsx :: cannot bound the arch block");
      failed += 1;
    } else {
      const lineStart = footer.src.lastIndexOf("\n", start);
      footer.src = footer.src.slice(0, lineStart) + footer.src.slice(end + 6);
      console.log("  ok    site-footer.tsx :: arch removed");
    }
  }
}

/* ── refuse on anything missing ──────────────────────────────────────────── */
if (about) {
  for (const [what, needle] of [
    ["the four sourced figures", "problemFigures.map"],
    ["their source links", "figure.href"],
    ["the three chain steps", "accountableChain.map"],
    ["the compliance notice", "chainNotice"],
    ["Who We Are", "whoWeAre.title"],
    ["the team", "team.slice(1).map"],
  ]) if (!about.src.includes(needle)) { console.error("*** " + what + " has gone from About"); failed += 1; }
  const o = (about.src.match(/<Band\b/g) || []).length;
  const c = (about.src.match(/<\/Band>/g) || []).length;
  if (o !== c) { console.error(`*** about.tsx: ${o} <Band> vs ${c} </Band>`); failed += 1; }
}
if (footer) {
  const o = (footer.src.match(/<div\b/g) || []).length;
  const c = (footer.src.match(/<\/div>/g) || []).length;
  if (o !== c) { console.error(`*** site-footer.tsx: ${o} <div> vs ${c} </div>`); failed += 1; }
  if (!footer.src.includes("funnel-heading")) { console.error("*** the funnel has gone from the footer"); failed += 1; }
}
for (const img of ["public/images/ai-team/petra-point.webp","public/images/ai-team/peter-present.webp","public/images/ai-team/pippa-present.webp"]) {
  if (!fs.existsSync(path.join(process.cwd(), img))) { console.error("*** missing image: " + img); failed += 1; }
}

console.log("");
if (failed) {
  console.error("═".repeat(62));
  console.error(`  ${failed} PROBLEM(S) — NOTHING WRITTEN. Send me the MISS lines.`);
  console.error("═".repeat(62));
  process.exit(1);
}
for (const f of files) fs.writeFileSync(f.p, f.src);
console.log("═".repeat(62));
console.log("  applied. Purpose is now the ladder, the Ecosystem is navy with");
console.log("  the trio, and the arch is gone — hard edges everywhere.");
console.log("═".repeat(62));

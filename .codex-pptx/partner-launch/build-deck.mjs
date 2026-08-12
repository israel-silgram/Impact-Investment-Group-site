import fs from "node:fs/promises";
import path from "node:path";
import { Presentation, PresentationFile } from "@oai/artifact-tool";

const W = 1280;
const H = 720;

const C = {
  navy950: "#000B1C",
  navy900: "#00112B",
  navy800: "#041C3D",
  navy700: "#0A2A52",
  navy600: "#143C6B",
  orange: "#FF7A29",
  orangeDark: "#C25400",
  teal: "#2FBAAA",
  tealDark: "#17796F",
  cream: "#F7F1E6",
  creamCard: "#EFE6D6",
  white: "#FFFFFF",
  mist: "#C6D2E4",
  slate: "#647289",
  slateInk: "#4E5A6E",
};

const FONT_HEAD = "Aptos Display";
const FONT_BODY = "Aptos";
const FONT_MONO = "Aptos Mono";

const ROOT = "C:/Users/sus3jamals/repositories/impact-property-connect";
const TMP = `${ROOT}/.codex-pptx/partner-launch`;
const OUT = `${ROOT}/Partner_Page_Launch_Presentation.pptx`;
const ASSETS = {
  logoDark: `${ROOT}/public/images/brand/logo-lockup-reverse.webp`,
  logoLight: `${ROOT}/public/images/brand/logo-lockup.webp`,
  petra: `${ROOT}/public/images/ai-team/petra-present.webp`,
  peter: `${ROOT}/public/images/ai-team/peter-present.webp`,
  pippa: `${ROOT}/public/images/ai-team/pippa-present.webp`,
  dropdown: "C:/Users/sus3jamals/AppData/Local/Temp/partners-dropdown-desktop.png",
  partnerDesktop: "C:/Users/sus3jamals/AppData/Local/Temp/partner-desktop-viewport.png",
  partnerDiagram: "C:/Users/sus3jamals/AppData/Local/Temp/partner-diagram-view.png",
  mobileMenu: "C:/Users/sus3jamals/AppData/Local/Temp/partners-mobile-menu-fixed.png",
  footer: "C:/Users/sus3jamals/AppData/Local/Temp/footer-partners-desktop.png",
};

const roles = [
  "Investor",
  "Landlord",
  "Developer",
  "Housing Association",
  "Local Authority",
  "Care Provider",
  "Support Provider",
  "Social Worker",
  "Broker",
  "Resident",
];

async function imageBytes(file) {
  const b = await fs.readFile(file);
  return b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength);
}

function contentType(file) {
  const ext = path.extname(file).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  return "image/webp";
}

function addText(slide, text, x, y, w, h, options = {}) {
  const shape = slide.shapes.add({
    geometry: "textbox",
    name: options.name,
    position: { left: x, top: y, width: w, height: h, rotation: options.rotation || 0 },
    fill: "none",
    line: { style: "solid", fill: "none", width: 0 },
  });
  shape.text = text;
  shape.text.style = {
    fontFamily: options.fontFamily || FONT_BODY,
    fontSize: options.fontSize || 20,
    bold: Boolean(options.bold),
    color: options.color || C.white,
    alignment: options.align || "left",
  };
  return shape;
}

function addRect(slide, x, y, w, h, fill, options = {}) {
  return slide.shapes.add({
    geometry: options.geometry || "roundRect",
    name: options.name,
    position: { left: x, top: y, width: w, height: h, rotation: options.rotation || 0 },
    fill,
    line: {
      style: options.lineStyle || "solid",
      fill: options.lineFill || "none",
      width: options.lineWidth || 0,
    },
    borderRadius: options.radius === undefined ? "rounded-xl" : options.radius,
    shadow: options.shadow || "shadow-none",
  });
}

function addLine(slide, x1, y1, x2, y2, color, width = 2, style = "solid") {
  const left = Math.min(x1, x2);
  const top = Math.min(y1, y2);
  const right = Math.max(x1, x2);
  const bottom = Math.max(y1, y2);
  return slide.shapes.add({
    geometry: "line",
    position: {
      left,
      top,
      width: Math.max(0.1, right - left),
      height: Math.max(0.1, bottom - top),
      horizontalFlip: x2 < x1,
      verticalFlip: y2 < y1,
    },
    fill: "none",
    line: { style, fill: color, width },
  });
}

function addDot(slide, x, y, r, fill, lineFill = fill) {
  return slide.shapes.add({
    geometry: "ellipse",
    position: { left: x - r, top: y - r, width: r * 2, height: r * 2 },
    fill,
    line: { style: "solid", fill: lineFill, width: 1 },
  });
}

async function addImage(slide, file, x, y, w, h, fit = "contain") {
  return slide.images.add({
    blob: await imageBytes(file),
    contentType: contentType(file),
    alt: path.basename(file),
    fit,
    position: { left: x, top: y, width: w, height: h },
  });
}

function addSection(slide, section, label, dark = true) {
  addText(slide, section, 72, 38, 210, 24, {
    fontSize: 14,
    bold: true,
    color: dark ? C.teal : C.tealDark,
    fontFamily: FONT_MONO,
  });
  addText(slide, label.toUpperCase(), 292, 38, 600, 24, {
    fontSize: 14,
    bold: true,
    color: dark ? C.mist : C.slate,
    fontFamily: FONT_MONO,
  });
}

function addPageMarker(slide, number, dark = true, story = "") {
  addText(slide, String(number).padStart(2, "0"), 1182, 660, 42, 22, {
    fontSize: 13,
    bold: true,
    align: "right",
    color: dark ? C.mist : C.slate,
    fontFamily: FONT_MONO,
  });
  if (story) {
    addText(slide, story, 72, 660, 500, 22, {
      fontSize: 12,
      bold: true,
      color: dark ? C.teal : C.tealDark,
      fontFamily: FONT_MONO,
    });
  }
}

function addNotes(slide, body, sources) {
  slide.speakerNotes.textFrame.setText(`${body}\n\n[Sources]\n${sources.map((s) => `- ${s}`).join("\n")}`);
  slide.speakerNotes.setVisible(true);
}

function addArrowGlyph(slide, x, y, color, size = 26) {
  addText(slide, "→", x, y, 40, 36, { fontSize: size, bold: true, color, align: "center" });
}

function addRoleLabel(slide, n, label, x, y, dark = true, active = false, w = 205) {
  const ink = active ? C.orange : dark ? C.white : C.navy900;
  addText(slide, String(n).padStart(2, "0"), x, y + 2, 32, 24, {
    fontSize: 12,
    bold: true,
    color: active ? C.orange : dark ? C.teal : C.tealDark,
    fontFamily: FONT_MONO,
  });
  addText(slide, label, x + 36, y, w - 36, 30, {
    fontSize: label.length > 18 ? 17 : 19,
    bold: true,
    color: ink,
    fontFamily: FONT_HEAD,
  });
}

async function main() {
  await fs.mkdir(TMP, { recursive: true });
  for (const file of Object.values(ASSETS)) await fs.access(file);

  const deck = Presentation.create({ slideSize: { width: W, height: H } });

  // Slide 1 — Section 1: minimal VIP welcome.
  {
    const s = deck.slides.add();
    s.background.fill = C.navy900;
    addRect(s, 0, 0, W, 12, C.orange, { geometry: "rect", radius: 0 });
    await addImage(s, ASSETS.logoDark, 72, 42, 210, 56, "contain");
    addText(s, "PARTNER PAGE LAUNCH  ·  12 AUGUST 2026", 72, 142, 520, 28, {
      fontSize: 16,
      bold: true,
      color: C.teal,
      fontFamily: FONT_MONO,
    });
    addText(s, "Ten partners.", 72, 186, 650, 82, {
      fontSize: 68,
      bold: true,
      color: C.white,
      fontFamily: FONT_HEAD,
    });
    addText(s, "One essential network.", 72, 264, 760, 88, {
      fontSize: 68,
      bold: true,
      color: C.orange,
      fontFamily: FONT_HEAD,
    });
    addText(
      s,
      "A launch designed to give every partner a visible, respected place in the platform.",
      76,
      378,
      660,
      72,
      { fontSize: 24, color: C.mist },
    );

    addRect(s, 810, 118, 380, 470, C.navy800, {
      lineFill: C.navy600,
      lineWidth: 1,
      radius: 34,
    });
    addLine(s, 840, 526, 1160, 526, C.navy600, 2);
    addDot(s, 895, 216, 72, C.navy700, C.tealDark);
    addDot(s, 1000, 216, 72, C.navy700, C.navy600);
    addDot(s, 1105, 216, 72, C.navy700, C.tealDark);
    await addImage(s, ASSETS.petra, 824, 136, 145, 310, "contain");
    await addImage(s, ASSETS.peter, 929, 136, 145, 310, "contain");
    await addImage(s, ASSETS.pippa, 1034, 136, 145, 310, "contain");
    addText(s, "FIND", 846, 548, 92, 30, { fontSize: 16, bold: true, color: C.orange, align: "center" });
    addText(s, "PRICE", 954, 548, 92, 30, { fontSize: 16, bold: true, color: C.teal, align: "center" });
    addText(s, "PROVE", 1062, 548, 92, 30, { fontSize: 16, bold: true, color: C.teal, align: "center" });
    addPageMarker(s, 1, true, "SECTION 01  /  VIP WELCOME");
    addNotes(
      s,
      "Open by positioning the partners as the launch itself—not as an audience being asked to admire a technical release.",
      [
        "Internal implementation commit d7896011d31277d88eab93e43698d5a68ea5050a.",
        "Internal brand and character assets from public/images/brand and public/images/ai-team.",
      ],
    );
  }

  // Slide 2 — guest list / essential roles.
  {
    const s = deck.slides.add();
    s.background.fill = C.cream;
    addSection(s, "SECTION 01", "VIP welcome", false);
    addText(s, "Partners are not a dropdown.", 72, 104, 600, 58, {
      fontSize: 46,
      bold: true,
      color: C.navy900,
      fontFamily: FONT_HEAD,
    });
    addText(s, "They are the platform.", 72, 158, 560, 58, {
      fontSize: 46,
      bold: true,
      color: C.orangeDark,
      fontFamily: FONT_HEAD,
    });
    addText(
      s,
      "Every role now receives its own language, its own route and a visible place in the shared impact model.",
      74,
      246,
      470,
      118,
      { fontSize: 23, color: C.slateInk },
    );
    addRect(s, 74, 404, 390, 4, C.tealDark, { geometry: "rect", radius: 0 });
    addText(s, "A dedicated front door says: we built this with you in mind.", 74, 430, 440, 86, {
      fontSize: 26,
      bold: true,
      color: C.navy900,
      fontFamily: FONT_HEAD,
    });

    addText(s, "THE NETWORK GUEST LIST", 650, 92, 420, 26, {
      fontSize: 14,
      bold: true,
      color: C.tealDark,
      fontFamily: FONT_MONO,
    });
    addLine(s, 650, 128, 1178, 128, C.tealDark, 2);
    for (let i = 0; i < roles.length; i++) {
      const col = i < 5 ? 0 : 1;
      const row = i % 5;
      addRoleLabel(s, i + 1, roles[i], 650 + col * 270, 158 + row * 82, false, i === 9, 250);
      addLine(s, 650 + col * 270, 194 + row * 82, 884 + col * 270, 194 + row * 82, C.creamCard, 2);
    }
    addText(s, "10", 1060, 542, 112, 72, {
      fontSize: 60,
      bold: true,
      color: C.orangeDark,
      align: "right",
      fontFamily: FONT_HEAD,
    });
    addText(s, "essential roles", 935, 604, 236, 28, {
      fontSize: 18,
      bold: true,
      color: C.navy900,
      align: "right",
    });
    addPageMarker(s, 2, false, "SECTION 01  /  VIP WELCOME");
    addNotes(
      s,
      "Move across the guest list slowly. The point is not that ten pages exist; it is that ten different partner identities are recognised without flattening them into one generic audience.",
      ["Internal product source: src/content/partners.ts (ten partner archetypes and role names)."],
    );
  }

  // Slide 3 — Section 2: dropdown as a front door.
  {
    const s = deck.slides.add();
    s.background.fill = C.navy900;
    addSection(s, "SECTION 02", "A front door for every role", true);
    addText(s, "Your role now has a front door.", 72, 102, 560, 112, {
      fontSize: 50,
      bold: true,
      color: C.white,
      fontFamily: FONT_HEAD,
    });
    const beats = [
      ["01", "Recognised by name"],
      ["02", "Explained in context"],
      ["03", "Connected to impact"],
    ];
    beats.forEach(([n, label], i) => {
      const y = 278 + i * 94;
      addText(s, n, 74, y, 42, 28, { fontSize: 15, bold: true, color: C.orange, fontFamily: FONT_MONO });
      addText(s, label, 124, y - 4, 370, 38, { fontSize: 26, bold: true, color: C.white, fontFamily: FONT_HEAD });
      if (i < 2) addLine(s, 94, y + 40, 94, y + 78, C.tealDark, 2);
    });
    addText(s, "The new Partners menu makes the network visible before a visitor reads a single page.", 74, 566, 470, 62, {
      fontSize: 19,
      color: C.mist,
    });

    addRect(s, 602, 96, 606, 510, C.navy800, { lineFill: C.tealDark, lineWidth: 1, radius: 26, shadow: "shadow-lg" });
    await addImage(s, ASSETS.dropdown, 622, 116, 566, 470, "cover");
    addText(s, "DESKTOP PARTNER ENTRY", 948, 570, 226, 20, { fontSize: 11, bold: true, color: C.teal, align: "right", fontFamily: FONT_MONO });
    addPageMarker(s, 3, true, "SECTION 02  /  ROLE ENTRY");
    addNotes(
      s,
      "Use the three beats as a reveal. Then point to the real navigation capture and show how the partner identity is visible at the exact moment of entry.",
      [
        "Internal implementation: src/components/site-header.tsx.",
        "Internal localhost QA capture: partners-dropdown-desktop.png, 12 August 2026.",
      ],
    );
  }

  // Slide 4 — role page narrative.
  {
    const s = deck.slides.add();
    s.background.fill = C.cream;
    addSection(s, "SECTION 02", "A front door for every role", false);
    addText(s, "Each page speaks the partner’s language.", 72, 92, 890, 58, {
      fontSize: 46,
      bold: true,
      color: C.navy900,
      fontFamily: FONT_HEAD,
    });
    addText(s, "Not a generic profile. A role-specific journey from identity to impact.", 74, 154, 780, 42, {
      fontSize: 21,
      color: C.slateInk,
    });

    addRect(s, 72, 226, 610, 350, C.white, { lineFill: C.creamCard, lineWidth: 2, radius: 24, shadow: "shadow-md" });
    await addImage(s, ASSETS.partnerDesktop, 88, 242, 578, 318, "cover");
    addText(s, "LIVE ROLE PAGE", 92, 534, 160, 20, { fontSize: 11, bold: true, color: C.tealDark, fontFamily: FONT_MONO });

    const journey = [
      ["01", "Who you are"],
      ["02", "What you can do"],
      ["03", "How you create impact"],
      ["04", "Where you connect"],
    ];
    journey.forEach(([n, label], i) => {
      const y = 230 + i * 90;
      addText(s, n, 742, y + 4, 38, 24, { fontSize: 13, bold: true, color: i === 3 ? C.orangeDark : C.tealDark, fontFamily: FONT_MONO });
      addText(s, label, 792, y, 330, 38, { fontSize: 25, bold: true, color: C.navy900, fontFamily: FONT_HEAD });
      if (i < 3) {
        addLine(s, 759, y + 38, 759, y + 76, C.creamCard, 3);
        addText(s, "↓", 741, y + 48, 36, 30, { fontSize: 18, bold: true, color: C.tealDark, align: "center" });
      }
    });
    addText(s, "Every page closes with a custom organisational view—not a stock diagram.", 742, 566, 420, 62, {
      fontSize: 18,
      bold: true,
      color: C.orangeDark,
    });
    addPageMarker(s, 4, false, "SECTION 02  /  ROLE EXPERIENCE");
    addNotes(
      s,
      "Walk the audience through the four-part page journey. Stress that the final organisational view changes with the role, which is what makes the partner feel seen rather than templated.",
      [
        "Internal implementation: src/components/partners/partner-page.tsx.",
        "Internal route example: src/routes/partner-with-housing-association.tsx.",
        "Internal localhost QA capture: partner-desktop-viewport.png, 12 August 2026.",
      ],
    );
  }

  // Slide 5 — Section 3: three role impact chains.
  {
    const s = deck.slides.add();
    s.background.fill = C.navy900;
    addSection(s, "SECTION 03", "The shared impact journey", true);
    addText(s, "Impact becomes a chain, not a claim.", 72, 94, 830, 58, {
      fontSize: 47,
      bold: true,
      color: C.white,
      fontFamily: FONT_HEAD,
    });
    addText(s, "Each partner page makes the route from contribution to outcome visible.", 74, 154, 760, 40, {
      fontSize: 21,
      color: C.mist,
    });

    const rows = [
      { role: "INVESTOR", input: "Capital + criteria", output: "Suitable homes · delivery · reporting", color: C.orange },
      { role: "HOUSING ASSOCIATION", input: "Demand + matched property", output: "Lease · management · resident home", color: C.teal },
      { role: "RESIDENT", input: "Needs + preferences", output: "Suitable home · support · outcomes", color: C.white },
    ];
    rows.forEach((row, i) => {
      const y = 252 + i * 126;
      addLine(s, 250, y + 46, 1002, y + 46, i === 0 ? C.orange : C.tealDark, 3);
      addDot(s, 250, y + 46, 8, row.color, row.color);
      addDot(s, 632, y + 46, 8, row.color, row.color);
      addDot(s, 1002, y + 46, 8, row.color, row.color);
      addText(s, row.input, 92, y + 20, 300, 36, { fontSize: 20, bold: true, color: C.mist });
      addRect(s, 492, y + 8, 280, 76, C.navy800, { lineFill: row.color, lineWidth: 2, radius: 18 });
      addText(s, row.role, 514, y + 29, 236, 30, { fontSize: row.role.length > 14 ? 20 : 23, bold: true, color: row.color, align: "center", fontFamily: FONT_HEAD });
      addText(s, row.output, 892, y + 18, 300, 56, { fontSize: 18, bold: true, color: C.white, align: "right" });
    });
    addText(s, "INPUT", 92, 220, 120, 22, { fontSize: 12, bold: true, color: C.teal, fontFamily: FONT_MONO });
    addText(s, "ESSENTIAL ROLE", 528, 220, 210, 22, { fontSize: 12, bold: true, color: C.teal, align: "center", fontFamily: FONT_MONO });
    addText(s, "VISIBLE OUTCOME", 958, 220, 234, 22, { fontSize: 12, bold: true, color: C.teal, align: "right", fontFamily: FONT_MONO });
    addPageMarker(s, 5, true, "SECTION 03  /  IMPACT CHAINS");
    addNotes(
      s,
      "Read one row end to end, then let the audience scan the other two. The diagrams make the partner contribution explicit while keeping the outcome visible.",
      ["Internal product source: src/content/partners.ts (Investor, Housing Association and Resident diagram definitions)."],
    );
  }

  // Slide 6 — resident-centred network.
  {
    const s = deck.slides.add();
    s.background.fill = C.cream;
    addSection(s, "SECTION 03", "The shared impact journey", false);
    addText(s, "The network grows. The person stays central.", 72, 90, 1110, 60, {
      fontSize: 42,
      bold: true,
      color: C.navy900,
      fontFamily: FONT_HEAD,
    });
    addText(s, "Nine specialist roles connect around one human purpose: a suitable home with joined-up support.", 74, 152, 940, 42, {
      fontSize: 21,
      color: C.slateInk,
    });

    const cx = 640;
    const cy = 414;
    const orbit = [
      ["Investor", 270, 248],
      ["Landlord", 446, 220],
      ["Developer", 642, 210],
      ["Housing Association", 864, 230],
      ["Local Authority", 1012, 308],
      ["Care Provider", 1010, 492],
      ["Support Provider", 820, 574],
      ["Social Worker", 546, 586],
      ["Broker", 304, 512],
    ];
    // Connections first so they remain behind all labels.
    orbit.forEach(([, x, y], i) => addLine(s, x + 90, y + 18, cx, cy, i % 3 === 0 ? C.orange : C.tealDark, i % 3 === 0 ? 2.5 : 1.5));
    addDot(s, cx, cy, 112, C.navy900, C.orange);
    addDot(s, cx, cy, 96, C.navy800, C.tealDark);
    addText(s, "RESIDENT", cx - 90, cy - 28, 180, 42, { fontSize: 28, bold: true, color: C.white, align: "center", fontFamily: FONT_HEAD });
    addText(s, "home · support · outcomes", cx - 112, cy + 16, 224, 36, { fontSize: 15, bold: true, color: C.teal, align: "center" });
    orbit.forEach(([label, x, y], i) => {
      const ww = label.length > 15 ? 180 : 142;
      addRect(s, x, y, ww, 52, i % 3 === 0 ? C.creamCard : C.white, { lineFill: i % 3 === 0 ? C.orangeDark : C.creamCard, lineWidth: 1, radius: 16 });
      addText(s, label, x + 10, y + 13, ww - 20, 28, { fontSize: label.length > 16 ? 15 : 17, bold: true, color: C.navy900, align: "center" });
    });
    addText(s, "Every partner remains essential because every connection carries a different responsibility.", 290, 638, 700, 30, {
      fontSize: 18,
      bold: true,
      color: C.orangeDark,
      align: "center",
    });
    addPageMarker(s, 6, false, "SECTION 03  /  PERSON-CENTRED NETWORK");
    addNotes(
      s,
      "Use the visual to reinforce that the resident is not a supply category. Each surrounding role stays distinct, and the value comes from coordination rather than role-blurring.",
      [
        "Internal product source: src/content/partners.ts (ten role descriptions and Resident positioning).",
        "The three-cluster interpretation is a presentation synthesis of the role descriptions, not a new operating claim.",
      ],
    );
  }

  // Slide 7 — Section 4, story beat 1: choose a role.
  {
    const s = deck.slides.add();
    s.background.fill = C.navy900;
    addSection(s, "SECTION 04", "Platform architecture story  ·  1/4", true);
    addText(s, "Choose a role. Follow its value.", 72, 92, 760, 58, {
      fontSize: 48,
      bold: true,
      color: C.white,
      fontFamily: FONT_HEAD,
    });
    addText(s, "Pick any archetype—the platform gives it a clear entry, workflow and impact destination.", 74, 152, 900, 40, {
      fontSize: 21,
      color: C.mist,
    });

    const centreX = 640;
    const centreY = 424;
    const nodes = [
      ["Investor", 180, 250, C.orange],
      ["Landlord", 180, 350, C.orange],
      ["Developer", 180, 450, C.orange],
      ["Housing Association", 388, 546, C.teal],
      ["Local Authority", 590, 562, C.teal],
      ["Care Provider", 790, 546, C.teal],
      ["Support Provider", 990, 500, C.teal],
      ["Social Worker", 1016, 366, C.white],
      ["Broker", 1016, 250, C.white],
      ["Resident", 832, 212, C.orange],
    ];
    nodes.forEach(([, x, y, color]) => addLine(s, centreX, centreY, x + 82, y + 25, color, color === C.white ? 1.3 : 2));
    addDot(s, centreX, centreY, 126, C.navy800, C.teal);
    addDot(s, centreX, centreY, 104, C.navy900, C.navy600);
    addText(s, "IMPACT", centreX - 96, centreY - 48, 192, 40, { fontSize: 30, bold: true, color: C.white, align: "center", fontFamily: FONT_HEAD });
    addText(s, "PLATFORM", centreX - 96, centreY - 8, 192, 40, { fontSize: 30, bold: true, color: C.orange, align: "center", fontFamily: FONT_HEAD });
    addText(s, "10 routes · one network", centreX - 110, centreY + 44, 220, 28, { fontSize: 15, bold: true, color: C.teal, align: "center" });
    nodes.forEach(([label, x, y, color], i) => {
      const longLabel = label.length > 11;
      const nodeWidth = longLabel ? 186 : 164;
      const nodeHeight = longLabel ? 60 : 52;
      addRect(s, x, y, nodeWidth, nodeHeight, C.navy800, { lineFill: color, lineWidth: color === C.white ? 1 : 2, radius: 16 });
      addText(s, String(i + 1).padStart(2, "0"), x + 9, y + 16, 42, 18, { fontSize: 10, bold: true, color, fontFamily: FONT_MONO });
      addText(s, label, x + 50, y + (longLabel ? 8 : 12), nodeWidth - 60, longLabel ? 42 : 30, { fontSize: longLabel ? 13 : 17, bold: true, color: C.white });
    });
    addText(s, "SUPPLY", 182, 220, 120, 20, { fontSize: 11, bold: true, color: C.orange, fontFamily: FONT_MONO });
    addText(s, "DELIVERY", 392, 628, 160, 20, { fontSize: 11, bold: true, color: C.teal, fontFamily: FONT_MONO });
    addText(s, "PEOPLE + ACCESS", 1002, 190, 180, 20, { fontSize: 11, bold: true, color: C.mist, align: "right", fontFamily: FONT_MONO });
    addPageMarker(s, 7, true, "ARCHITECTURE STORY  01  →  02  →  03  →  04");
    addNotes(
      s,
      "Make this interactive: ask the audience to name one archetype they want to follow. Use Housing Association if no one chooses, then advance to the worked example.",
      [
        "Internal product source: src/content/partners.ts (ten archetypes and dedicated routes).",
        "The supply/delivery/people grouping is an audience navigation device inferred from the role descriptions.",
      ],
    );
  }

  // Slide 8 — story beat 2: one custom impact diagram.
  {
    const s = deck.slides.add();
    s.background.fill = C.cream;
    addSection(s, "SECTION 04", "Platform architecture story  ·  2/4", false);
    addText(s, "One role in. Three outcomes out.", 72, 92, 760, 58, {
      fontSize: 48,
      bold: true,
      color: C.navy900,
      fontFamily: FONT_HEAD,
    });
    addText(s, "The architecture changes its logic for every archetype—not just the title.", 74, 152, 820, 40, {
      fontSize: 21,
      color: C.slateInk,
    });

    // Horizontal impact path: rails first, then entity shapes.
    addLine(s, 314, 386, 496, 386, C.tealDark, 4);
    addLine(s, 738, 386, 934, 386, C.orangeDark, 4);
    addArrowGlyph(s, 392, 362, C.tealDark, 28);
    addArrowGlyph(s, 820, 362, C.orangeDark, 28);
    addText(s, "INPUTS", 90, 240, 220, 24, { fontSize: 12, bold: true, color: C.tealDark, fontFamily: FONT_MONO });
    addRect(s, 88, 286, 226, 74, C.white, { lineFill: C.creamCard, lineWidth: 1, radius: 18 });
    addText(s, "Housing demand", 110, 309, 182, 30, { fontSize: 20, bold: true, color: C.navy900, align: "center" });
    addRect(s, 88, 406, 226, 74, C.white, { lineFill: C.creamCard, lineWidth: 1, radius: 18 });
    addText(s, "Matched property", 110, 429, 182, 30, { fontSize: 20, bold: true, color: C.navy900, align: "center" });

    addText(s, "SELECTED ARCHETYPE", 498, 240, 240, 24, { fontSize: 12, bold: true, color: C.orangeDark, align: "center", fontFamily: FONT_MONO });
    addRect(s, 496, 286, 242, 194, C.navy900, { lineFill: C.tealDark, lineWidth: 3, radius: 28, shadow: "shadow-lg" });
    addText(s, "04", 518, 312, 44, 26, { fontSize: 14, bold: true, color: C.orange, fontFamily: FONT_MONO });
    addText(s, "Housing", 518, 350, 198, 40, { fontSize: 31, bold: true, color: C.white, align: "center", fontFamily: FONT_HEAD });
    addText(s, "Association", 518, 390, 198, 40, { fontSize: 31, bold: true, color: C.teal, align: "center", fontFamily: FONT_HEAD });
    addText(s, "One connected role", 518, 442, 198, 24, { fontSize: 14, bold: true, color: C.mist, align: "center" });

    addText(s, "VISIBLE OUTCOMES", 934, 240, 250, 24, { fontSize: 12, bold: true, color: C.tealDark, fontFamily: FONT_MONO });
    const outs = ["Lease & tenancy", "Housing management", "Resident home"];
    outs.forEach((label, i) => {
      const y = 276 + i * 104;
      addRect(s, 934, y, 250, 72, i === 2 ? C.orangeDark : C.navy800, { lineFill: i === 2 ? C.orangeDark : C.navy600, lineWidth: 1, radius: 18 });
      addText(s, `0${i + 1}`, 950, y + 25, 42, 20, { fontSize: 11, bold: true, color: i === 2 ? C.cream : C.teal, fontFamily: FONT_MONO });
      addText(s, label, 996, y + 20, 170, 30, { fontSize: 18, bold: true, color: C.white });
    });

    addText(s, "9 more archetypes carry their own inputs, responsibilities and impact outcomes.", 266, 548, 748, 34, {
      fontSize: 22,
      bold: true,
      color: C.orangeDark,
      align: "center",
      fontFamily: FONT_HEAD,
    });
    roles.filter((r) => r !== "Housing Association").forEach((label, i) => {
      addText(s, label, 96 + (i % 5) * 218, 604 + Math.floor(i / 5) * 28, 205, 22, {
        fontSize: 13,
        bold: true,
        color: C.slateInk,
        align: "center",
      });
    });
    addPageMarker(s, 8, false, "ARCHITECTURE STORY  01  →  02  →  03  →  04");
    addNotes(
      s,
      "Trace the Housing Association path left to right. If the audience selected a different role, explain that the same page architecture swaps in that role's own inputs and outcomes.",
      ["Internal product source: src/content/partners.ts (Housing Association diagram and all ten role-specific diagram definitions)."],
    );
  }

  // Slide 9 — story beat 3: integration surfaces.
  {
    const s = deck.slides.add();
    s.background.fill = C.navy900;
    addSection(s, "SECTION 04", "Platform architecture story  ·  3/4", true);
    addText(s, "The partner network is discoverable everywhere.", 72, 92, 1120, 58, {
      fontSize: 42,
      bold: true,
      color: C.white,
      fontFamily: FONT_HEAD,
    });
    addText(s, "Integration turns ten standalone pages into one connected site experience.", 74, 152, 850, 40, {
      fontSize: 21,
      color: C.mist,
    });

    addRect(s, 74, 226, 470, 300, C.navy800, { lineFill: C.navy600, lineWidth: 1, radius: 24 });
    await addImage(s, ASSETS.dropdown, 88, 240, 442, 272, "cover");
    addText(s, "HEADER ENTRY", 92, 492, 160, 20, { fontSize: 11, bold: true, color: C.teal, fontFamily: FONT_MONO });

    addRect(s, 738, 226, 470, 300, C.navy800, { lineFill: C.navy600, lineWidth: 1, radius: 24 });
    await addImage(s, ASSETS.footer, 752, 240, 442, 272, "cover");
    addText(s, "FOOTER DIRECTORY", 756, 492, 180, 20, { fontSize: 11, bold: true, color: C.teal, fontFamily: FONT_MONO });

    addLine(s, 544, 376, 600, 376, C.teal, 3);
    addLine(s, 680, 376, 738, 376, C.teal, 3);
    addDot(s, 640, 376, 70, C.orange, C.orange);
    addText(s, "10", 596, 324, 88, 62, { fontSize: 52, bold: true, color: C.navy900, align: "center", fontFamily: FONT_HEAD });
    addText(s, "LIVE ROUTES", 582, 390, 116, 24, { fontSize: 12, bold: true, color: C.navy900, align: "center", fontFamily: FONT_MONO });

    const rail = ["HEADER", "DIRECT URL", "SITEMAP", "FOOTER"];
    addLine(s, 184, 590, 1096, 590, C.tealDark, 3);
    rail.forEach((label, i) => {
      const x = 184 + i * 304;
      addDot(s, x, 590, 12, i === 1 ? C.orange : C.teal, i === 1 ? C.orange : C.teal);
      addText(s, label, x - 78, 614, 156, 24, { fontSize: 13, bold: true, color: C.white, align: "center", fontFamily: FONT_MONO });
    });
    addPageMarker(s, 9, true, "ARCHITECTURE STORY  01  →  02  →  03  →  04");
    addNotes(
      s,
      "Use the horizontal rail as the integration story: partners can enter through navigation, direct URLs, search discovery via the sitemap, or the footer directory.",
      [
        "Internal implementation: src/components/site-header.tsx and src/components/site-footer.tsx.",
        "Internal implementation: src/routes/partner-with-*.tsx and src/routes/sitemap[.]xml.ts.",
        "Internal localhost QA captures: partners-dropdown-desktop.png and footer-partners-desktop.png, 12 August 2026.",
      ],
    );
  }

  // Slide 10 — story beat 4: QA proof and close.
  {
    const s = deck.slides.add();
    s.background.fill = C.cream;
    addSection(s, "SECTION 04", "Platform architecture story  ·  4/4", false);
    addText(s, "The experience holds together across devices.", 72, 88, 920, 58, {
      fontSize: 46,
      bold: true,
      color: C.navy900,
      fontFamily: FONT_HEAD,
    });
    addText(s, "The launch was verified as a connected journey—not just ten pages that render.", 74, 148, 850, 40, {
      fontSize: 21,
      color: C.slateInk,
    });

    // Desktop display.
    addRect(s, 74, 238, 610, 314, C.navy900, { lineFill: C.navy600, lineWidth: 3, radius: 18, shadow: "shadow-lg" });
    await addImage(s, ASSETS.partnerDesktop, 92, 256, 574, 278, "cover");
    addRect(s, 288, 552, 184, 16, C.navy700, { geometry: "rect", radius: 0 });
    addRect(s, 238, 568, 284, 12, C.navy800, { radius: 8 });
    addText(s, "DESKTOP", 92, 508, 110, 20, { fontSize: 11, bold: true, color: C.teal, fontFamily: FONT_MONO });

    // Phone display.
    addRect(s, 734, 218, 188, 382, C.navy900, { lineFill: C.navy600, lineWidth: 3, radius: 28, shadow: "shadow-lg" });
    await addImage(s, ASSETS.mobileMenu, 748, 242, 160, 330, "cover");
    addDot(s, 828, 584, 8, C.navy600, C.navy600);

    addText(s, "10/10", 970, 244, 220, 76, { fontSize: 62, bold: true, color: C.orangeDark, align: "right", fontFamily: FONT_HEAD });
    addText(s, "partner routes live", 966, 318, 224, 30, { fontSize: 19, bold: true, color: C.navy900, align: "right" });
    addLine(s, 966, 374, 1190, 374, C.tealDark, 3);
    addText(s, "DESKTOP + MOBILE", 966, 402, 224, 24, { fontSize: 13, bold: true, color: C.tealDark, align: "right", fontFamily: FONT_MONO });
    addText(s, "QA passed", 966, 436, 224, 42, { fontSize: 30, bold: true, color: C.navy900, align: "right", fontFamily: FONT_HEAD });
    addText(s, "Navigation · page flow · diagrams · partner directory", 952, 492, 238, 72, { fontSize: 17, color: C.slateInk, align: "right" });

    addRect(s, 74, 612, 1116, 4, C.orangeDark, { geometry: "rect", radius: 0 });
    addText(s, "The architecture is ready. Now every partner can see where they belong.", 74, 628, 1060, 34, {
      fontSize: 23,
      bold: true,
      color: C.navy900,
      fontFamily: FONT_HEAD,
    });
    addText(s, "ARCHITECTURE STORY  ·  COMPLETE", 72, 690, 500, 18, {
      fontSize: 11,
      bold: true,
      color: C.tealDark,
      fontFamily: FONT_MONO,
    });
    addText(s, "10", 1182, 690, 42, 18, {
      fontSize: 11,
      bold: true,
      color: C.slate,
      align: "right",
      fontFamily: FONT_MONO,
    });
    addNotes(
      s,
      "Close by resolving the opening promise. The platform now recognises ten partner identities, carries their impact logic through the site and holds together on desktop and mobile.",
      [
        "Internal QA, 12 August 2026: all ten partner routes returned HTTP 200.",
        "Internal QA, 12 August 2026: desktop and mobile navigation and page layouts visually inspected.",
        "Internal localhost captures: partner-desktop-viewport.png and partners-mobile-menu-fixed.png.",
      ],
    );
  }

  const renderDir = `${TMP}/renders`;
  await fs.mkdir(renderDir, { recursive: true });
  for (const [index, slide] of deck.slides.items.entries()) {
    const stem = `slide-${String(index + 1).padStart(2, "0")}`;
    const png = await deck.export({ slide, format: "png", scale: 1 });
    await fs.writeFile(`${renderDir}/${stem}.png`, new Uint8Array(await png.arrayBuffer()));
    const layout = await slide.export({ format: "layout" });
    await fs.writeFile(`${renderDir}/${stem}.layout.json`, await layout.text());
  }
  const montage = await deck.export({ format: "webp", montage: true, scale: 1 });
  await fs.writeFile(`${TMP}/montage.webp`, new Uint8Array(await montage.arrayBuffer()));

  const pptx = await PresentationFile.exportPptx(deck);
  await pptx.save(OUT);
  console.log(`Wrote ${OUT}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

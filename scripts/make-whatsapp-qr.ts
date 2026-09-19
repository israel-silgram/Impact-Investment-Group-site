/**
 * Draws the WhatsApp community QR as a static SVG, at build time.
 *
 *     bun run qr
 *
 * Run it whenever `whatsappCommunity.url` changes, and commit the result: the
 * SVG it writes is the file the registration page serves, so a stale image is
 * a QR that quietly points at a retired invite.
 *
 * ⚠️ WHY THIS IS A SCRIPT AND NOT A COMPONENT. Encoding the QR in the browser
 * would put a whole encoder in the bundle to draw one image that never changes,
 * and an external QR service would hand a third party the invite link plus the
 * IP of everyone who loads the registration page. Neither is worth it for a
 * fixed 25-by-25 grid. `qrcode` is a devDependency for exactly this reason:
 * nothing under src/ imports it.
 *
 * The URL is read from the site content rather than typed here, so this file
 * is not the second copy of the invite link.
 *
 * Black on white is the QR standard rather than a brand choice. It is left at
 * the package default deliberately: a tinted QR is a QR that some scanners
 * refuse, and the card around it carries the brand instead.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

import QRCode from "qrcode";

import { whatsappCommunity } from "../src/content/site";

const OUT = resolve(process.cwd(), "public/images/whatsapp-community-qr.svg");

const svg = await QRCode.toString(whatsappCommunity.url, {
  type: "svg",
  // 1 module of quiet zone rather than the default 4. The card supplies the
  // white space around the image, and 4 modules of it inside a 160px box costs
  // roughly a quarter of the width the scanner actually reads.
  margin: 1,
});

await mkdir(dirname(OUT), { recursive: true });
await writeFile(OUT, svg, "utf8");

console.log(`Wrote ${OUT} (${svg.length} bytes) for ${whatsappCommunity.url}`);

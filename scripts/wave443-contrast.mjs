/** Site colour gate. Resolves the real CSS declarations, not a copied palette. */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';

const baseline = process.argv.includes('--baseline');
const raw = baseline
  ? execFileSync('git', ['show', 'bb39b3ed:src/styles.css'], { encoding: 'utf8' })
  : readFileSync('src/styles.css', 'utf8');
const css = raw.replace(/\/\*[\s\S]*?\*\//g, '');
const declarations = new Map([...css.matchAll(/(--[\w-]+)\s*:\s*([^;{}]+);/g)].map((m) => [m[1], m[2].trim()]));
function value(name, seen = new Set()) {
  if (/^#[\da-f]{6}$/i.test(name)) return name.toUpperCase();
  if (seen.has(name)) throw new Error(`Cyclic colour: ${name}`);
  seen.add(name);
  const definition = declarations.get(name);
  if (!definition) throw new Error(`Missing colour: ${name}`);
  const alias = definition.match(/^var\((--[\w-]+)\)$/);
  if (alias) return value(alias[1], seen);
  if (!/^#[\da-f]{6}$/i.test(definition)) throw new Error(`Unresolved colour: ${name} = ${definition}`);
  return definition.toUpperCase();
}
const luminance = (hex) => {
  const channels = hex.slice(1).match(/../g).map((v) => parseInt(v, 16) / 255)
    .map((v) => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  return channels.reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0);
};
const ratio = (a, b) => (Math.max(luminance(a), luminance(b)) + 0.05)
  / (Math.min(luminance(a), luminance(b)) + 0.05);
const checks = [];
for (const ground of ['--color-white', '--color-page', '--color-page-alt', '--color-cream-card']) {
  for (const ink of ['--color-ink', '--color-ink-muted', '--color-orange-700', '--color-teal-600']) {
    checks.push([ink, ground, 4.5]);
  }
}
checks.push(
  ['--color-white', '--color-orange-600', 4.5],
  ['--color-white', '--primary', 4.5],
  ['--color-white', '--sidebar-primary', 4.5],
  ['--color-white', '--color-navy-950', 4.5],
  ['--color-white', '--color-navy-800', 4.5],
  ['--color-teal-400', '--color-navy-950', 4.5],
  ['--color-orange-500', '--color-page', 3],
  ['--color-orange-500', '--color-page-alt', 3],
  ['--color-orange-500', '--color-cream-card', 3],
  ['--color-orange-500', '--color-navy-950', 3],
  ['--color-ink-soft', '--color-white', 4.5],
  ['--color-ink-soft', '--color-page', 4.5],
  ['--color-destructive-on-light', '--color-page-alt', 4.5],
);
const rows = checks.map(([fg, bg, floor]) => {
  const foreground = value(fg); const background = value(bg);
  const contrast = ratio(foreground, background);
  return { fg, bg, foreground, background, floor, contrast, pass: contrast >= floor };
});
const failures = rows.filter((row) => !row.pass).map((row) => `${row.fg} on ${row.bg}: ${row.contrast.toFixed(3)}`);
const expected = {
  '--brand-primary': '#E15E31', '--brand-primary-ink': '#BB441B', '--brand-primary-soft': '#FFF0EB',
  '--brand-primary-light': '#F07E56', '--brand-primary-on-ink': '#FFA181', '--brand-teal': '#208A87',
  '--brand-teal-ink': '#1A706E', '--brand-teal-soft': '#EBF6F6', '--brand-teal-on-ink': '#66C4C2',
  '--brand-ink': '#0A2C60', '--brand-slate': '#647289', '--bg-canvas': '#FDFDFB',
  '--bg-tint': '#FBF6F0', '--bg-cream': '#F5EDE4', '--dv-track': '#F3EAE0',
};
if (!baseline) for (const [name, hex] of Object.entries(expected)) {
  if (value(name) !== hex) failures.push(`Platform v4 parity failed: ${name}`);
}
const retired = /#(?:c15f3c|ae4e30|f0a886|9a4429|f27216|bf4b1b|ffefb2|00112b|041c3d|0a2a52|143c6b|2fbaaa|1e9e8f|17796f|ff6b00|25d1c2|ff7a29)\b|rgba?\(\s*(?:255[, ]+107[, ]+0|37[, ]+209[, ]+194|0[, ]+17[, ]+43)\s*[,/)]/ig;
function scan(dir) {
  const hits = [];
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) hits.push(...scan(path));
    else if (/\.(?:css|tsx?|jsx?|html|svg)$/.test(entry)) {
      const source = readFileSync(path, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
      const matches = [...source.matchAll(retired)].map((m) => m[0]);
      if (matches.length) hits.push({ file: path, values: [...new Set(matches)] });
    }
  }
  return hits;
}
const sourceHits = baseline ? [] : scan('src');
if (sourceHits.length) failures.push('Retired colours remain in source');
const buildIndex = process.argv.indexOf('--build');
const buildHits = buildIndex >= 0 ? scan(process.argv[buildIndex + 1]) : null;
if (buildHits?.length) failures.push('Retired colours remain in built text assets');
console.log(JSON.stringify({ baseline, pairs: rows.length, rows, sourceHits, buildHits, failures }, null, 2));
if (failures.length && !baseline) process.exitCode = 1;

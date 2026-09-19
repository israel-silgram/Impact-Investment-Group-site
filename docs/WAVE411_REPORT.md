# Wave 411 report: the WhatsApp community invite on the registration page

**Branch** `feat/wave411-whatsapp-invite`, cut from `origin/main` `9adb0bb`, built in the
worktree `C:\Users\Israel\Documents\repos\iigs-uc411`. The repo's own checkout on `main` was
not touched; every git command in this wave was run against the worktree.

**Number claimed** by pushing an empty commit (`789658b`) before the first edit. 411 was the
lowest free number when claimed: the site remote carried no `wave4xx` branch but this one,
the platform remote (`iip-land-night`, fetched first) carried 407 to 410, and `Landing-Queue.md`
records 391 to 406 as reserved by the two plans. No collision.

---

## 1. The constant

`src/content/site.ts`, beside `siteName` and typed like its neighbours with `as const`:

```ts
export const whatsappCommunity = {
  url: "https://chat.whatsapp.com/DXa179wyz2xI2ffqr3Xjte",
  label: "Join our investor WhatsApp community",
} as const;
```

The invite URL exists once in the repository. The card reads it and the QR script reads it,
so rotating the invite is a one-line edit followed by `bun run qr`, rather than an edit plus a
regenerated image that somebody has to remember to regenerate.

## 2. The script

`scripts/make-whatsapp-qr.ts`, run by the new `qr` script in `package.json`
(`"qr": "bun run scripts/make-whatsapp-qr.ts"`). It imports `whatsappCommunity` from the site
content, calls `qrcode`'s `toString(url, { type: "svg", margin: 1 })` and writes
`public/images/whatsapp-community-qr.svg`. Run once; the SVG is committed.

- `qrcode@1.5.4` and `@types/qrcode@1.5.6` are **devDependencies**. Nothing under `src/`
  imports either, so no encoder reaches the browser bundle and no external QR service is
  called with the invite link or the visitor's IP.
- Output: **1,929 bytes**, `viewBox="0 0 35 35"`, QR version 4, 33 modules plus one module of
  quiet zone each side.
- Black on white, the package default. That is the QR standard rather than a brand choice, and
  a tinted QR is one some scanners refuse. No hex is authored anywhere in this wave.

**Verified, not assumed.** The committed SVG was compared byte for byte against a fresh encode
of the constant: identical. The same check against a different URL produces a different SVG, so
the check can fail. No scanner decode was possible on this machine (no `zxingcpp`, `pyzbar` or
`cv2` installed), so this is an encoder-consistency check: it proves the committed image is what
`qrcode` produces for this constant, not that a phone camera resolves it.

## 3. The card

`src/routes/register.$role.tsx`, immediately after `<RegistrationFlow />` and before the
section closes.

The registration route in `site.ts` is `registerRoute.to = "/register"`, but `/register` is the
ten-tile role picker and carries no form. The form lives on `/register/$role`, which is the file
the brief's placement rule describes ("after the form", "never competes with the form's primary
button") and the only page where the required screenshot, showing the form with the card below
it, can exist. The card is therefore on the role pages.

Built from patterns already on the site, nothing invented:

- Card: `rounded-[var(--radius-panel)] border border-navy-700 bg-navy-800/50 p-5 sm:p-8`, the
  quieter of the two register-page card treatments (`waitlist-form.tsx:473`), deliberately not
  the heavier `registration-panel` the form itself uses.
- Button: the site's own `<Button variant="secondary">` (teal outline, `button.tsx`) rendered
  `asChild` over an `<a>`. Not orange, so the page's one orange action is still the form's
  `Create account & continue`.
- Width `max-w-[820px]`, matching the form's own wrapper.

Content, exactly the four strings and nothing more: heading `Prefer WhatsApp?`; the line
`Join our investor community for one sourced deal a day and the figures behind it.`; the QR;
the button `Open WhatsApp`.

Rendered HTML, read off the prerendered build:

```html
<a href="https://chat.whatsapp.com/DXa179wyz2xI2ffqr3Xjte" target="_blank" rel="noopener"
   aria-label="Join our investor WhatsApp community" class="...">Open WhatsApp</a>

<img src="/images/whatsapp-community-qr.svg" width="160" height="160"
     alt="QR code for the Impact Investment Group WhatsApp community"
     class="hidden shrink-0 rounded-[10px] sm:block"/>
```

`hidden sm:block` is the site's existing breakpoint, 640px. No new breakpoint. On a phone the
QR is absent and the button does the whole job, because nobody scans the screen they are
holding.

## 4. Gate, measured in this worktree

| Gate | Command | Exit | Numbers |
|---|---|---|---|
| Lint | `bun run lint` (`eslint .`) | **1** | 25,444 errors / 15 warnings as checked out; **515 / 15** on an LF-normalised tree |
| Lint, this wave's files | `bunx eslint` on the three source files | **0** | 0 errors, 0 warnings |
| Typecheck | `bunx tsc --noEmit` | **2** | 22 errors, 0 in this wave's files |
| Build | `STATIC_BUILD=true bun run build` | **0** | 2,179 modules, 36 pages prerendered, 29 HTML files |
| Prerender postbuild | `node scripts/pages-postbuild.mjs dist/client` | **0** | base `/`, patched 0 files |

**Lint and typecheck are red on `origin/main` too, by exactly the same numbers.** This was
measured rather than assumed. `git archive origin/main` was expanded into a scratch directory,
normalised to LF, and linted: **515 errors / 15 warnings, exit 1**. This wave's four files were
then copied over it and it was linted again: **515 errors / 15 warnings, exit 1**. Delta zero.
`tsc --noEmit` gives **22 errors** at both. The scratch directory was deleted.

Two separate things make the raw lint number large, and neither is this wave:

1. **`core.autocrlf=true`** in this repository's config checks every file out with CRLF while
   the blobs are LF, and prettier's default `endOfLine: "lf"` flags every line of every file.
   That is 25,444 errors, every one of them `Delete ␍`, on a clean checkout of `main` as much
   as on this branch. The lintable files whose blobs are LF were normalised to LF in the
   worktree for the measurement; `git diff --stat` across the whole tree afterwards listed only
   this wave's four files, so that normalisation changed no content and nothing unintended is
   in the commit.
2. **Pre-existing formatting drift**, chiefly `src/routes/the-problem.tsx`, plus files committed
   with CRLF in the blob. This is the residual 515.

Neither was touched. Fixing them is a repo-wide reformat and is not this wave's business.

## 5. The required searches

```
rg -n 'chat.whatsapp.com' src public scripts
  src/content/site.ts:51   * has been rotated on the other. `rg chat.whatsapp.com` outside this file and
  src/content/site.ts:60     url: "https://chat.whatsapp.com/DXa179wyz2xI2ffqr3Xjte",

rg -n 'qrcode' src
  (no matches)
```

Both hits are inside `site.ts`: line 60 is the constant, line 51 is the doc comment that names
this very check. Nothing outside `site.ts` carries the URL.

One precision worth recording: the generated SVG does **not** match a text search for the URL,
because a QR code stores its payload as modules rather than as text. The brief expected the
search to return the constant and the SVG; it returns the constant only, and that is the
stronger result rather than a weaker one.

## 6. Screenshots

`docs/screenshots/wave411/register-1280.png` and `docs/screenshots/wave411/register-390.png`,
of `/register/investor`, full page, taken from the static build by
`scripts/wave411-screenshots.py` (committed, following `wave295-screenshots.py` and
`wave298-screenshots.py`).

The script asserts what the images are meant to prove and exits non-zero if any of it is false,
because a shot of a page where the QR silently failed to load looks much like a shot of one
where it worked:

```
1280: wrote docs\screenshots\wave411\register-1280.png (form=True, qr=True,  button=True)
390:  wrote docs\screenshots\wave411\register-390.png  (form=True, qr=False, button=True)
```

Both images were then opened and read rather than trusted. At 1280 the card sits below the
form's orange `Create account & continue`, with the QR at 160px on the right and the teal
outline button on the left. At 390 the card is below the form, the QR is gone and the button
remains.

## 7. Dashes

**0 of 223.** No U+2014 and no U+2013 on any line this wave authored: 75 added lines across
`src/` and `package.json`, 44 in `scripts/make-whatsapp-qr.ts`, 104 in
`scripts/wave411-screenshots.py`. `bun.lock` is generated and excluded from the count. British
spelling throughout. No new colour, no hard-coded hex, no emoji.

---

## 8. Open for Callum

**One accessibility conflict, built as briefed and flagged rather than quietly changed.**

The brief specifies the constant's `label` as the link's `aria-label`, so that the constant is
used whole. That makes the accessible name `Join our investor WhatsApp community` while the
visible text is `Open WhatsApp`. **WCAG 2.5.3 Label in Name (Level A) requires the accessible
name to contain the visible label**, and this one does not. The practical cost is to speech
input: someone saying "click Open WhatsApp" will not match the link. `README.md` sets WCAG 2.2
AA as the site's standard, so these two instructions disagree.

It is built as briefed. The fix, if wanted, is one line: drop `aria-label` from the `<a>` and
put it on the `<aside>` instead, which labels the region, keeps the constant used whole and
leaves the link's accessible name as its visible text. Awaiting a ruling.

**The card renders for all ten roles.** The copy is investor-facing ("our investor community"),
and the brief named no role condition, so none was invented. It therefore appears on the
resident and social worker pages too. If it should be investor-only, or the copy should be
role-neutral, that is a decision rather than a bug, and a one-line guard.

**Not done, because it was not asked for:** nothing else on the site changed. No other route,
no change to the form or to any copy elsewhere.

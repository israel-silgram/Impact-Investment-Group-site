# Task 01 — Foundation: tokens, navigation, remove Book a Demo

Read `CLAUDE.md` first if you have not already. This task is the foundation every other
task depends on. Do it fully before moving on.

**Scope:** design tokens, the site header, and removing "Book a Demo" site-wide.
Do not restructure sections or rewrite copy in this task.

---

## 1. Fix the design tokens

Edit `src/styles.css`. Change the existing tokens in the `@theme` block — do not add a
parallel set of new names.

```diff
  /* Orange — the action colour. */
  --color-orange-400: #ff7a29;
- --color-orange-500: #ee4d00;
- --color-orange-600: #d9430a;
+ --color-orange-500: #ff7a29;   /* Mock-up 1 amber — the approved brand orange */
+ --color-orange-600: #e56600;   /* button fills only — white text passes contrast here */
```

```diff
- --color-mist-bg: #ebf1f8; /* light section background */
+ --color-mist-bg: #f7f1e6;  /* CREAM — light section background */
+ --color-cream-card: #efe6d6; /* cards sitting on the cream */
```

Then in the `:root` shadcn layer, follow the change through:

```diff
- --primary: #ee4d00;
+ --primary: #ff7a29;
```

Check `--destructive: #d9430a` — if it is being used for anything that is not a genuine
destructive/error state, point it at `--color-orange-600` instead.

### Why these exact values

- `#ff7a29` is Mock-up 1's orange, sampled from the file. `#ee4d00` is Mock-up 2's, which
  is redder. Mock-up 1 is the approved brand reference, so it wins.
- White on `#ff7a29` measures **2.6:1** and fails WCAG. White on `#e56600` measures
  **3.4:1** and passes for large text. That is the only reason two oranges exist — never
  put white text on `orange-500`.
- `--color-mist-bg` was pale **blue**. The client asked for **cream**. This one change is
  the bulk of what "add the cream" means.

### After changing the tokens

Search the codebase for hard-coded hex values and replace them with tokens:

```
rg -n "#(ee4d00|d9430a|ebf1f8|00112b|041c3d)" src/
```

Anything found in a component is a bug — components must reference tokens only.

---

## 2. Verify contrast did not break

These are measured, not estimates. After the token change, confirm nothing violates them:

| Combination | Ratio | Rule |
|---|---|---|
| White on `navy-900` | 18.8:1 | Fine |
| `navy-900` on cream `#f7f1e6` | 16.8:1 | Fine |
| `orange-500` `#ff7a29` on `navy-900` | ~6.9:1 | Fine for headings and body |
| `teal-400` on `navy-900` | ~7:1 | Fine for stats and labels |
| White on `orange-600` | 3.4:1 | Large text only — 16px semibold minimum |
| White on `orange-500` | 2.6:1 | **FAILS — never do this** |
| `orange-500` on cream | 2.3:1 | **FAILS — never use orange for text on cream** |

On the cream sections, orange is permitted **only** as an icon accent or a button fill.
Text on cream is `navy-900` or `teal-600`.

---

## 3. Rebuild the site header

File: `src/components/site-header.tsx`

The navigation is currently `The Problem · Our Solutions · The Platform · About · Log in ·
Book a Demo`. Replace it with exactly this, in this order:

```
Logo  ·  About Us  ·  Our Services  ·  The Problem  ·  The Solution  ·  Contact Us  ·  [Register Here]  ·  Log in
```

Route mapping — these pages already exist, so link to them rather than creating anything:

| Label | Route |
|---|---|
| About Us | `/about` |
| Our Services | `/platform` |
| The Problem | `/the-problem` |
| The Solution | `/solutions` |
| Contact Us | `/contact` |

Rules:

- **There is no Homepage nav item.** The logo is the home link.
- Nav links: 15px, weight 500, white on navy, orange underline on hover, `orange-500` text
  when the route is active.
- **Register Here** is a primary pill button using `orange-600` with white text. It links to
  the registration flow (use the same destination as the existing "Register Your Interest").
- **Log in** is a plain text link, far right, lighter weight — as in both mock-ups.
- Update the mobile nav to match. Same order, same labels.

---

## 4. Remove "Book a Demo" site-wide

The client asked for this specifically and it is still present in at least three places.

```
rg -n -i "book a demo" src/
```

Remove every instance. Where it was a call to action, replace it with **Register Here**
pointing at the registration flow. Known locations:

- The site header
- The Live UK Demand section on the homepage
- The final CTA block ("Join the UK's Housing, Care and Support Ecosystem")

Check `src/content/*.ts` as well — the copy lives in those data files, not only in
components.

---

## 5. Definition of done

- [ ] `src/styles.css` tokens updated; no hard-coded brand hexes anywhere in `src/`
- [ ] Light sections render **cream**, not pale blue
- [ ] Nav shows the six items in the correct order, no Homepage item, Register Here as a button
- [ ] Mobile nav matches
- [ ] `rg -i "book a demo" src/` returns nothing
- [ ] `npm run lint` passes and `npm run build` succeeds
- [ ] Page still renders correctly at 375px, 768px, 1280px and 1600px

When finished, report: what changed, anything you could not do and why, and which of the
client's notes in `CLAUDE.md` this satisfies.

**Do not commit or push.** Leave the changes in the working tree for review.

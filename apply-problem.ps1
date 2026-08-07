# Run from the repo root:  .\apply-problem.ps1
#
#   1 · The Problem — The scale goes cream/orange, The cost of waiting goes
#       navy/teal and gains Peter on the right, Why it stays broken is deleted,
#       The opportunity keeps Pippa on the left and is separated from the close
#   2 · Councils carousel no longer pauses on hover
#   3 · "What happens next" comes off /contact
#
# Every edit is anchored on a string that appears once in its file, and each
# one reports whether it landed.

$root = Get-Location
$report = @()

function Save($rel, $before, $after, $label) {
  if ($after -eq $before) { Write-Host ("  --   " + $label + "  (no match)") ; return $false }
  [IO.File]::WriteAllText((Join-Path $script:root $rel), $after)
  Write-Host ("  ok   " + $label)
  return $true
}

# ══ 1 · src/content/problem.ts ════════════════════════════════════════════
$rel = 'src\content\problem.ts'
$p = Join-Path $root $rel
$s = [IO.File]::ReadAllText($p); $b0 = $s

# ── "The scale" moves to the cream ground ────────────────────────────────
# Petra's section was navy, which is what put teal on it: the eyebrow, and the
# value at the end of every row, both read `section.light ? orange : teal`.
# Cream flips all of it to orange and navy ink in one move — there is no teal
# left on the section to remove by hand.
$s = $s.Replace(
  '    character: "petra-point",',
  "    character: `"petra-point`",`n    light: true,")

# ── "The cost of waiting" moves to the navy ground and gains Peter ───────
# Navy is what makes this section teal throughout — same one-line mechanism in
# reverse. Peter comes across from the section below, which is being deleted.
$s = $s -replace '(?s)light: true,\s*\n\s*// character: deliberately absent[^\n]*', 'character: "peter-present",'

# ── "Why it stays broken" is deleted outright ───────────────────────────
# The five-parties content is not lost — /solutions makes the same argument at
# more length under "Who touches which layer", which is where it belongs. This
# page is now scale → cost → opportunity, which is a cleaner run at it: how
# big, what it costs, what is funded.
$s = $s -replace '(?s)\s*\{\s*\n\s*id: "cause",.*?character: "peter-present",\s*\n\s*\},', ''

# ── The standing note about section 2 is now out of date ────────────────
$note = @'
⚠️ THE CHARACTER ON "THE COST OF WAITING" IS A DECISION THAT WAS REVERSED.
 *
 * This section carried no character for a while, deliberately: it holds
 * "176,130 children living in temporary accommodation", and the rule was that
 * a character may point at data but not at suffering. Peter was moved here at
 * Callum's instruction in Aug 2026.
 *
 * The original concern is written down here rather than deleted, because it is
 * the thing to reach for if this ever draws comment: a cartoon presenting a
 * count of children in temporary accommodation is the kind of screenshot that
 * travels. `peter-present` is the mildest pose of the three — presenting, not
 * pointing and not smiling at the number — which is why it is the one used.
 * Removing `character` from this section is the whole of the rollback.
'@
$s = $s -replace '(?s)⚠️ A CHARACTER MAY POINT AT DATA.*?hardship\.', $note

Save $rel $b0 $s 'problem.ts — scale to cream, cost to navy + Peter, cause deleted' | Out-Null

# ══ 2 · src/routes/the-problem.tsx ════════════════════════════════════════
$rel = 'src\routes\the-problem.tsx'
$p = Join-Path $root $rel
$s = [IO.File]::ReadAllText($p); $b0 = $s

# ── Which side each character stands on ──────────────────────────────────
# Was "left on every section except the last". With three sections that gives
# left, left, right — and the brief is left, RIGHT, left. Straight alternation
# off the index gives exactly that, and it keeps giving the right answer if a
# section is ever added or removed, which the old rule did not.
$s = $s.Replace(
  'const onLeft = i !== problemSections.length - 1;',
  'const onLeft = i % 2 === 0;')

# ── The enormous figure follows the section's accent ─────────────────────
# The eyebrow and the row values already did this; the headline was the one
# element still hardcoded to orange on the navy ground, which is why Peter's
# section would otherwise have read teal, teal, ORANGE. teal-400 on navy-900
# is well clear of AA at 44–80px extrabold.
$s = $s.Replace(
  'section.light ? "text-orange-700" : "text-orange-500",',
  'section.light ? "text-orange-700" : "text-teal-400",')

# ── The close stops running into "The opportunity" ───────────────────────
# The missing top rule here used to be deliberate: section four and the close
# are both cream, and dropping the border made them read as one continuous
# ground. The brief is now the opposite — the opportunity has to read as its
# own section and the CTA as something separate — so the rule goes back.
# `.section-light` remaps border-navy-700 to a pale slate rule, so this is the
# same border every other section on the page carries.
$s = $s.Replace(
  '<section aria-labelledby="problem-cta" className="section-light">',
  '<section aria-labelledby="problem-cta" className="section-light border-t border-navy-700">')

# The section list at the top of the file, which now describes a page that
# does not exist.
$map = @'
* 1 · The scale             cream   1.34m    Petra, left
 * 2 · The cost of waiting    navy    £2.7bn   Peter, right
 * 3 · The opportunity        cream   £39bn    Pippa, left
 * 4 · Close                  cream   the same CTA as /about and /platform
'@
$s = $s -replace '(?s)\* 1 · The scale.*?\* 5 · Close[^\n]*', $map

Save $rel $b0 $s 'the-problem.tsx — sides, accent colour, close separated' | Out-Null

# ══ 3 · src/styles.css — carousel keeps running under the cursor ══════════
$rel = 'src\styles.css'
$p = Join-Path $root $rel
$s = [IO.File]::ReadAllText($p); $b0 = $s

# WCAG 2.2.2 wants a way to stop motion that runs past five seconds. Hover was
# that mechanism and is now gone, so the one that remains is the
# prefers-reduced-motion block below, which stops the lane dead and wraps it —
# that is a user-agent-level control and is the accepted alternative. The
# focus-within rule is left in place; it costs nothing.
$s = $s -replace '\.logo-marquee:hover \.logo-marquee__track,\s*\n', ''

Save $rel $b0 $s 'styles.css — marquee no longer pauses on hover' | Out-Null

# ══ 4 · src/routes/contact.tsx — "What happens next" comes off ════════════
$rel = 'src\routes\contact.tsx'
$p = Join-Path $root $rel
$s = [IO.File]::ReadAllText($p); $b0 = $s

# The eyebrow and the three-step list. The crisis panel below it in the same
# rail is untouched — that one is care information, not marketing.
$s = $s -replace '(?s)<p className="eyebrow tracking-\[0\.14em\] text-orange-700">What happens next</p>.*?</ul>', ''

# The import would now be unused, which fails the build under noUnusedLocals.
# `whatHappensNext` stays exported from content/contact.ts — restoring the
# block is this import plus the list.
$s = $s -replace '\n\s*whatHappensNext,', ''

Save $rel $b0 $s 'contact.tsx — What happens next removed' | Out-Null

# ══ checks ════════════════════════════════════════════════════════════════
Write-Host ''
$pt = [IO.File]::ReadAllText((Join-Path $root 'src\content\problem.ts'))
if ($pt.Contains('id: "cause"'))            { Write-Host '*** "Why it stays broken" is STILL THERE' }
if (-not $pt.Contains('peter-present'))     { Write-Host '*** Peter is not on any section' }
if (([regex]::Matches($pt, 'light: true')).Count -ne 3) { Write-Host ('*** expected 3 light sections, found ' + ([regex]::Matches($pt,'light: true')).Count) }
$ct = [IO.File]::ReadAllText((Join-Path $root 'src\routes\contact.tsx'))
if ($ct.Contains('whatHappensNext'))        { Write-Host '*** whatHappensNext is still referenced in contact.tsx' }

git status --short

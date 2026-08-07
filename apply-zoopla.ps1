# Run from the repo root:  .\apply-zoopla.ps1
#
# Adds "Powered by Zoopla" to the foot of the hero and re-balances the hero's
# height budget for the extra line.
#
# Safe to run whether or not apply.ps1 has already been run — it detects which
# state styles.css and hero.tsx are in and does only what is missing.

$root = Get-Location
$changed = @()

# ── styles.css ────────────────────────────────────────────────────────────
# The hero is sized as: viewport, minus the header, minus a fixed stack
# (captions + the Register-as rule + the role tiles + padding). The photograph
# takes what is left. The Zoopla line grows that fixed stack, so the constant
# grows with it — 30rem to 31.5rem — otherwise the section runs 24px past the
# fold on a short screen. pb-10 -> pb-6 below pays for the rest of it.
$p = Join-Path $root 'src\styles.css'
$s = [IO.File]::ReadAllText($p)
$before = $s

if ($s.Contains('max-width: calc(var(--hero-photo-h) * 3.75 + 2.5rem);')) {
  # apply.ps1 has not been run — do the whole hero-sizing change here, at the
  # constant this version needs.
  $s = $s.Replace(
    '    max-width: calc(var(--hero-photo-h) * 3.75 + 2.5rem);',
    '    max-width: none; }  .hero-band img { max-height: clamp(13rem, calc(100svh - 31.5rem), 40rem);')
  $s = $s + @'

/* ─────────────────────────────────────────────────────────────────────────
   WIDE-MONITOR CONTAINER STEP-UP

   Every page container is either max-w-[1440px] or max-w-[1200px]. Both are
   fixed pixel caps, so past ~1700px the page stops growing and the rest of the
   screen becomes margin. These step both up.

   Written against the utility class rather than a new container class: every
   container already carries one of these two, so this reaches all of them
   without editing a component. Unlayered on purpose — Tailwind v4 emits
   utilities inside @layer utilities, and unlayered CSS beats layered CSS
   whatever the source order.

   ⚠️ ONLY page containers may use these two widths. Give a CARD
   max-w-[1200px] and it grows on wide screens too. */
@media (min-width: 1700px) {
  .max-w-\[1440px\] { max-width: 1600px; }
  .max-w-\[1200px\] { max-width: 1320px; }
}
@media (min-width: 2100px) {
  .max-w-\[1440px\] { max-width: 1760px; }
  .max-w-\[1200px\] { max-width: 1440px; }
}
'@
} else {
  $s = $s.Replace('calc(100svh - 30rem)', 'calc(100svh - 31.5rem)')
}

if ($s -ne $before) { [IO.File]::WriteAllText($p, $s); $changed += 'src/styles.css' }

# ── hero.tsx ──────────────────────────────────────────────────────────────
$p = Join-Path $root 'src\components\home\hero.tsx'
$s = [IO.File]::ReadAllText($p)
$before = $s

# Full-viewport section, if apply.ps1 has not already done it.
$s = $s.Replace(
  'className="relative isolate overflow-hidden bg-navy-900"',
  'className="relative isolate flex flex-col justify-center overflow-hidden bg-navy-900 md:min-h-[calc(100svh_-_77px)]"')

# Room for the new line.
$s = $s.Replace(
  'className="relative z-10 mx-auto w-full max-w-[1440px] px-5 pb-10 sm:px-8"',
  'className="relative z-10 mx-auto w-full max-w-[1440px] px-5 pb-6 sm:px-8"')

# The line itself, after the role grid. hero.tsx has exactly one <ul>.
if (-not $s.Contains('zoopla-white.webp')) {
  $block = @"
</ul>

          {/*
           * Data provenance, at the foot of the hero rather than the top.
           *
           * It went here and not beside the header because the gap between the
           * header and the photographs is 32px — a credit line in it collides
           * with the Register Here button directly above. At the foot it closes
           * the section, sits on the fold, and competes with nothing.
           *
           * White wordmark on transparent, keyed from the supplied artwork.
           * Zoopla's own file is white-on-purple; the purple would fight the
           * navy, and their reversed mark is the one meant for dark grounds.
           *
           * THE AGREEMENT THAT BACKS THIS CLAIM sits with the backend team —
           * it is a Zoopla data agreement for the platform, and the line was
           * added on their instruction (Callum, Aug 2026). Recording it here
           * because this is a claim about a commercial relationship carrying
           * a third party's trademark, and the next person to read this file
           * will otherwise have to go and ask.
           *
           * Still worth doing once: check Zoopla's brand guidelines for the
           * reversed mark, minimum size and clear space. Deleting this block
           * is the whole of the rollback.
           */}
          <p className="mt-6 flex items-center justify-center gap-2.5">
            <span className="font-heading text-[10px] font-bold uppercase tracking-[0.16em] text-white/55">
              Powered by
            </span>
            <img
              src="/images/brand/zoopla-white.webp"
              alt="Zoopla"
              width={548}
              height={120}
              className="h-[18px] w-auto opacity-90"
            />
          </p>
"@
  $s = $s.Replace('</ul>', $block)
}

if ($s -ne $before) { [IO.File]::WriteAllText($p, $s); $changed += 'src/components/home/hero.tsx' }

# ── report ────────────────────────────────────────────────────────────────
if ($changed.Count -eq 0) { Write-Host 'nothing changed — already applied?' }
else { Write-Host ('patched: ' + ($changed -join ', ')) }

$h = [IO.File]::ReadAllText((Join-Path $root 'src\components\home\hero.tsx'))
if (-not $h.Contains('zoopla-white.webp')) { Write-Host '*** the Zoopla line did NOT go in — send me the end of hero.tsx' }
if (-not $h.Contains('100svh_-_77px')) { Write-Host '*** the full-viewport class did NOT go in' }

git status --short

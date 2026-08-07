# Run from the repo root:  .\apply.ps1
# 1 · hero fills the viewport   2 · containers grow on wide monitors

# ── styles.css ────────────────────────────────────────────────────────────
$p = Join-Path (Get-Location) 'src\styles.css'
$s = [IO.File]::ReadAllText($p)

# The band no longer derives its WIDTH from the photo height — that is what
# made it narrow to 1319px on a 1920 screen while the role tiles below ran to
# 1376px. Width now comes from the page container like every other section,
# and the height is capped instead, so a short screen crops the photograph
# rather than shrinking the whole band away from the page edges.
$s = $s.Replace(
  '    max-width: calc(var(--hero-photo-h) * 3.75 + 2.5rem);',
  '    max-width: none; }  .hero-band img { max-height: clamp(13rem, calc(100svh - 30rem), 40rem);')

$css = @'

/* ─────────────────────────────────────────────────────────────────────────
   WIDE-MONITOR CONTAINER STEP-UP

   Every page container is either max-w-[1440px] (full-bleed sections, the
   header, the hero) or max-w-[1200px] (the narrower reading bands). Both are
   fixed pixel caps, so past ~1700px the page stops growing and the rest of
   the screen becomes margin — 560px of empty navy either side on a 2560px
   monitor.

   Written against the utility class rather than a new container class on
   purpose: every container already carries one of these two, so this reaches
   all of them without editing a single component.

   Unlayered on purpose. Tailwind v4 emits utilities inside @layer utilities,
   and unlayered CSS beats layered CSS whatever the source order — so these
   win without !important.

   ⚠️ ONLY page containers may use these two widths. Verified across the
   routes: every use is an `mx-auto w-full` wrapper. Give a CARD max-w-[1200px]
   and it will grow on wide screens too — cards get their own width. */
@media (min-width: 1700px) {
  .max-w-\[1440px\] { max-width: 1600px; }
  .max-w-\[1200px\] { max-width: 1320px; }
}
@media (min-width: 2100px) {
  .max-w-\[1440px\] { max-width: 1760px; }
  .max-w-\[1200px\] { max-width: 1440px; }
}
'@
[IO.File]::WriteAllText($p, $s + $css)

# ── hero.tsx ──────────────────────────────────────────────────────────────
# min-height, not height: if the content genuinely cannot fit (a very short
# window) the section grows rather than crushing the photographs. justify-center
# balances the leftover space on a tall monitor instead of stretching anything.
$p = Join-Path (Get-Location) 'src\components\home\hero.tsx'
$s = [IO.File]::ReadAllText($p)
$s = $s.Replace(
  'className="relative isolate overflow-hidden bg-navy-900"',
  'className="relative isolate flex flex-col justify-center overflow-hidden bg-navy-900 md:min-h-[calc(100svh_-_77px)]"')
[IO.File]::WriteAllText($p, $s)

git status --short

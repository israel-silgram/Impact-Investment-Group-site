# Run from the repo root:  .\apply-cream-footer.ps1
#
# The register funnel and the footer become ONE CREAM BLOCK with an arched top,
# on every page. Safe to run whether or not apply-footer-funnel.ps1 was run —
# it detects what is already there.
#
# ── The arch ──────────────────────────────────────────────────────────────
#
# Drawn as an SVG on a TRANSPARENT strip above the cream, not as a border-radius
# on the footer. That matters: the sections above the footer are cream on some
# pages and navy on others, and a rounded corner needs to know what colour sits
# behind it. A transparent strip does not — whatever the last section is shows
# through the two top corners, so this is right on every route without the
# footer having to know which page it is on.
#
# preserveAspectRatio="none" lets one path stretch to any width, so the dome
# holds its shape from a laptop to a 2560 monitor.
#
# ── Why cream ─────────────────────────────────────────────────────────────
#
# `.section-light` is doing all the work. It repaints the ground AND remaps the
# whole dark palette to the light one — white text to navy ink, navy cards to
# white cards, mist to slate. That is why almost nothing inside the footer needs
# touching by hand.
#
# TWO THINGS IT CANNOT REMAP, and both are handled below:
#   · THE LOGO is an image, and an image has no colour utility to rewrite. The
#     footer must ask for the on-cream file or it renders white on cream —
#     invisible.
#   · ORANGE-500 becomes navy ink on cream (it is 2.3:1 there and would fail).
#     The middle beat moves to orange-700, which is 4.1:1 — AA for large text,
#     and the beats are 26px+ extrabold, so they qualify.

$root = Get-Location
function Say($ok, $m) { if ($ok) { Write-Host ("  ok   " + $m) } else { Write-Host ("  --   " + $m + "  (no match)") } }

# ══ 1 · site-footer.tsx ═══════════════════════════════════════════════════
$rel = 'src\components\site-footer.tsx'
$p = Join-Path $root $rel
$s = [IO.File]::ReadAllText($p)
$b0 = $s

# ── 1a · the logo has to switch colourway ────────────────────────────────
$was = $s
$s = $s.Replace('<Logo variant="on-navy" />', '<Logo variant="on-cream" />')
Say ($s -ne $was) 'logo -> on-cream'

# ── 1b · the arch, and the cream wrapper ─────────────────────────────────
$open = @"
<footer className="relative isolate">
      {/*
       * THE ARCH. A dome cut across the top of the footer so the register
       * funnel and the footer read as one block rising out of the page rather
       * than as two more stacked bands.
       *
       * Transparent strip, cream path — see the note at the top of
       * apply-cream-footer.ps1 for why it is not a border-radius. The single
       * cubic peaks dead centre: control points at y=-32 put the apex on y=0
       * exactly, which is what stops it looking like a wave.
       *
       * aria-hidden and no title: it is a shape, not information.
       */}
      <div
        aria-hidden="true"
        className="relative -mb-px h-[clamp(40px,5vw,84px)] w-full overflow-hidden"
      >
        <svg
          viewBox="0 0 1440 96"
          preserveAspectRatio="none"
          className="absolute inset-0 size-full"
        >
          <path d="M0 96 C 400 -32 1040 -32 1440 96 Z" fill="var(--color-mist-bg)" />
        </svg>
      </div>

      <div className="section-light">
"@
$was = $s
$s = $s.Replace('<footer className="border-t border-navy-700 bg-navy-950">', $open)
Say ($s -ne $was) 'arch + cream wrapper opened'

$was = $s
$s = $s.Replace('</footer>', "  </div>`n    </footer>")
Say ($s -ne $was) 'cream wrapper closed'

# ── 1c · the funnel ──────────────────────────────────────────────────────
if ($s.Contains('funnel-heading')) {
  # Already there from apply-footer-funnel.ps1 — it just has to go cream.
  $was = $s
  $s = $s.Replace('(i === 1 ? "text-orange-500" : "text-white") +', '(i === 1 ? "text-orange-700" : "text-white") +')
  $s = $s.Replace('className="border-b border-navy-800"', 'className="border-b border-navy-700"')
  Say ($s -ne $was) 'existing funnel recoloured for cream'
} else {
  # Not there — add it, cream from the start.
  $s = $s.Replace('import { Logo } from "@/components/logo";',
    "import { Logo } from `"@/components/logo`";`nimport { Button } from `"@/components/ui/button`";`nimport { PreReleaseBadge } from `"@/components/ui/pre-release-badge`";")
  $s = $s.Replace('  contactDetails,', "  closingBeats,`n  contactDetails,")
  $s = $s.Replace('  siteDescription,', "  registerRoute,`n  siteDescription,")

  $funnel = @"
<div className="section-light">
        {/*
         * THE FUNNEL. One copy, at the top of the footer, on every page — it
         * used to be a <section> rebuilt at the foot of five routes.
         *
         * No rule above it and one below: nothing separates it from the page's
         * last section, and the rule underneath groups it with the footer
         * columns. It reads as the top of the footer, not a sixth section.
         *
         * The beats are set tight (26–40px against the 28–50 the cream closes
         * used) because this now carries the columns beneath it as well. The
         * statement still runs on one line at 1440 and breaks between whole
         * beats below that — never mid-phrase.
         */}
        <section aria-labelledby="funnel-heading" className="border-b border-navy-700">
          <div className="mx-auto w-full max-w-[1440px] px-5 py-10 text-center sm:px-8">
            <h2 id="funnel-heading" className="sr-only">
              Register your interest
            </h2>
            <PreReleaseBadge className="justify-center" />
            <p className="mt-4">
              {closingBeats.map((beat, i) => (
                <span
                  key={beat}
                  aria-hidden="true"
                  className={
                    "heading-tight inline-block font-heading text-[clamp(1.625rem,3.4vw,2.5rem)] font-extrabold leading-[1.06] tracking-[-0.025em] " +
                    (i === 1 ? "text-orange-700" : "text-white") +
                    (i < 2 ? " mr-2" : "")
                  }
                >
                  {beat}
                </span>
              ))}
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Button variant="primary" asChild>
                <Link to={registerRoute.to} search={registerRoute.search}>
                  {registerRoute.label}
                </Link>
              </Button>
              <Button variant="secondary" asChild withArrow={false}>
                <Link to="/contact" search={{ enquiry: "partner", type: "partner" }}>
                  Become a Partner
                </Link>
              </Button>
            </div>
          </div>
        </section>
"@
  $was = $s
  $s = $s.Replace('<div className="section-light">', $funnel)
  Say ($s -ne $was) 'funnel added, cream'
}

if ($s -ne $b0) { [IO.File]::WriteAllText($p, $s) }

# ══ 2 · the pages give up their own closing funnels ═══════════════════════
function Strip($rel, $edits) {
  $p = Join-Path $script:root $rel
  if (-not (Test-Path $p)) { Write-Host ("  --   " + $rel + " not found"); return }
  $s = [IO.File]::ReadAllText($p); $b = $s
  foreach ($e in $edits) {
    $was = $s
    $s = $s -replace $e.rx, ''
    Say ($s -ne $was) ($rel + ' :: ' + $e.label)
  }
  if ($s -ne $b) { [IO.File]::WriteAllText($p, $s) }
}

# These two sections were the funnel and nothing else.
Strip 'src\routes\the-problem.tsx' @(
  @{ label = 'close section removed'; rx = '(?s)\{/\*\s*\*\s*── 5 · Close.*?</section>' })
Strip 'src\routes\solutions.tsx' @(
  @{ label = 'close section removed'; rx = '(?s)\{/\* ── 5 · Close.*?</section>' })

# These keep their own content and lose only the duplicated ask.
Strip 'src\routes\index.tsx' @(
  @{ label = 'badge removed';   rx = '\n\s*<PreReleaseBadge className="mt-7 justify-center" />' },
  @{ label = 'buttons removed'; rx = '(?s)\n\s*\{/\* size="default" not "lg".*?\n\s*<div className="mt-4 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">.*?</div>' })
Strip 'src\routes\about.tsx' @(
  @{ label = 'badge removed';   rx = '\n\s*<PreReleaseBadge className="mt-8 justify-center" />' },
  @{ label = 'buttons removed'; rx = '(?s)\n\s*<div className="mt-4 flex flex-wrap items-center justify-center gap-3">.*?</div>' })
Strip 'src\routes\platform.tsx' @(
  @{ label = 'buttons + note removed'; rx = '(?s)\n\s*<div className="mt-6 flex flex-wrap items-center justify-center gap-3">.*?<p className="mt-3 text-\[12\.5px\] text-slate-ink">\{servicesClose\.ctaNote\}</p>' })

# ══ checks ════════════════════════════════════════════════════════════════
Write-Host ''
$f = [IO.File]::ReadAllText((Join-Path $root 'src\components\site-footer.tsx'))
if (-not $f.Contains('funnel-heading'))      { Write-Host '*** the footer has NO funnel' }
if (-not $f.Contains('section-light'))       { Write-Host '*** the footer is NOT cream' }
if (-not $f.Contains('M0 96 C 400 -32'))     { Write-Host '*** the arch is missing' }
if ($f.Contains('variant="on-navy"'))        { Write-Host '*** the footer logo is still the white file — it will be invisible on cream' }
if (([regex]::Matches($f, '</div>')).Count -lt ([regex]::Matches($f, '<div')).Count) { Write-Host '*** unbalanced <div> in site-footer.tsx — send me the file' }
$pl = [IO.File]::ReadAllText((Join-Path $root 'src\routes\platform.tsx'))
if (-not $pl.Contains('capitalAtRisk'))      { Write-Host '*** CAPITAL AT RISK HAS GONE FROM /platform — stop and tell me' }

git status --short

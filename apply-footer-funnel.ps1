# Run from the repo root:  .\apply-footer-funnel.ps1
#
# The funnel — "Coming soon · Register your interest", the three beats and the
# two actions — moves OUT of every page and INTO the footer, once.
#
# ── Why into the footer and not just restyled ─────────────────────────────
#
# It was the same block, rebuilt five times, in five files, with five slightly
# different paddings and two different orange tokens. Every page ended on it,
# and because each copy was a <section> with its own ground it read as one more
# section rather than as the end of the page. One copy at the top of the footer
# fixes both: the page stops on its own content, and the ask sits where a
# visitor already looks for it.
#
# ── What each page keeps ──────────────────────────────────────────────────
#
#   home        the closing headline and its four statements — those are
#               content, and Callum has asked twice for them to stay
#   about       "Why Partner With Us?", the three beats as its heading, and
#               the summary — that is section four of the page, not a funnel
#   platform    the closing headline AND the capital-at-risk paragraph
#   the-problem nothing — that section was the funnel and nothing else
#   solutions   nothing — same
#   contact     never had one
#
# ⚠️ THE CAPITAL-AT-RISK PARAGRAPH ON /platform IS NOT TOUCHED. It is the only
# page-level copy of it and the footer's own legal block is separate. If a
# future pass removes the rest of that section, that paragraph moves — it does
# not go.

$root = Get-Location

function Patch($rel, $edits) {
  $p = Join-Path $script:root $rel
  $s = [IO.File]::ReadAllText($p)
  $b0 = $s
  foreach ($e in $edits) {
    $was = $s
    if ($e.rx) { $s = $s -replace $e.rx, $e.to } else { $s = $s.Replace($e.from, $e.to) }
    if ($s -eq $was) { Write-Host ("  --   " + $rel + " :: " + $e.label + "  (no match)") }
    else { Write-Host ("  ok   " + $rel + " :: " + $e.label) }
  }
  if ($s -ne $b0) { [IO.File]::WriteAllText($p, $s) }
}

# ══ 1 · The footer gains the funnel ═══════════════════════════════════════
$rel = 'src\components\site-footer.tsx'
$p = Join-Path $root $rel
$s = [IO.File]::ReadAllText($p)
$b0 = $s

if (-not $s.Contains('funnel-heading')) {

  # Imports. `cn` is deliberately NOT used below — the class strings are
  # concatenated by hand instead, so this does not have to know whether
  # site-footer.tsx already imports it.
  $s = $s.Replace(
    'import { Logo } from "@/components/logo";',
    "import { Logo } from `"@/components/logo`";`nimport { Button } from `"@/components/ui/button`";`nimport { PreReleaseBadge } from `"@/components/ui/pre-release-badge`";")

  $s = $s.Replace('  contactDetails,', "  closingBeats,`n  contactDetails,")
  $s = $s.Replace('  siteDescription,', "  registerRoute,`n  siteDescription,")

  $funnel = @"
<footer className="border-t border-navy-700 bg-navy-950">
      {/*
       * ── The funnel ────────────────────────────────────────────────────
       *
       * This is the ask, and it is the last thing on every page. It used to be
       * a <section> at the foot of each route — five copies of the same block.
       *
       * It shares the footer's own navy-950 ground and carries no rule above
       * it, only one below. That is the whole point: nothing separates it from
       * the page's last section, and the rule under it groups it with the
       * footer columns rather than with the content above. It reads as the top
       * of the footer, not as a sixth section.
       *
       * The middle beat is orange-500. On this ground that is 7.2:1. Do not
       * copy the orange-700 the cream versions used — on navy it is muddy.
       */}
      <section aria-labelledby="funnel-heading" className="border-b border-navy-800">
        <div className="mx-auto w-full max-w-[1440px] px-5 py-11 text-center sm:px-8">
          <h2 id="funnel-heading" className="sr-only">
            Register your interest
          </h2>
          <PreReleaseBadge className="justify-center" />
          <p className="mt-5">
            {closingBeats.map((beat, i) => (
              <span
                key={beat}
                aria-hidden="true"
                className={
                  "heading-tight inline-block font-heading text-[clamp(1.5rem,3.6vw,2.5rem)] font-extrabold leading-[1.08] tracking-[-0.025em] " +
                  (i === 1 ? "text-orange-500" : "text-white") +
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
  $s = $s.Replace('<footer className="border-t border-navy-700 bg-navy-950">', $funnel)

  if ($s -ne $b0) { [IO.File]::WriteAllText($p, $s); Write-Host '  ok   site-footer.tsx :: funnel added' }
  else { Write-Host '  --   site-footer.tsx :: NOTHING MATCHED' }
} else { Write-Host '  --   site-footer.tsx :: funnel already there' }

# ══ 2 · /the-problem — the close was the funnel and nothing else ══════════
Patch 'src\routes\the-problem.tsx' @(
  @{ label = 'close section removed'; rx = '(?s)\{/\*\s*\*\s*── 5 · Close.*?</section>'; to = '' },
  @{ label = 'unused Link import';    from = 'import { createFileRoute, Link } from "@tanstack/react-router";'; to = 'import { createFileRoute } from "@tanstack/react-router";' },
  @{ label = 'unused Button import';  rx = '\nimport \{ Button \} from "@/components/ui/button";'; to = '' },
  @{ label = 'unused badge import';   rx = '\nimport \{ PreReleaseBadge \} from "@/components/ui/pre-release-badge";'; to = '' },
  @{ label = 'unused site import';    rx = '\nimport \{ closingBeats, closingStrapline, registerRoute \} from "@/content/site";'; to = '' },
  @{ label = 'problemClose import';   from = 'import { problemClose, problemHero, problemSections } from "@/content/problem";'; to = 'import { problemHero, problemSections } from "@/content/problem";' }
)

# ══ 3 · /solutions — same, the close was the funnel ═══════════════════════
Patch 'src\routes\solutions.tsx' @(
  @{ label = 'close section removed'; rx = '(?s)\{/\* ── 5 · Close.*?</section>'; to = '' }
)

# ══ 4 · Homepage — keeps the headline and the four statements ═════════════
Patch 'src\routes\index.tsx' @(
  @{ label = 'badge removed';   rx = '\n\s*<PreReleaseBadge className="mt-7 justify-center" />'; to = '' },
  @{ label = 'buttons removed'; rx = '(?s)\n\s*\{/\* size="default" not "lg".*?\n\s*<div className="mt-4 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">.*?</div>'; to = '' }
)

# ══ 5 · /about — keeps "Why Partner With Us?", the beats and the summary ══
Patch 'src\routes\about.tsx' @(
  @{ label = 'badge removed';   rx = '\n\s*<PreReleaseBadge className="mt-8 justify-center" />'; to = '' },
  @{ label = 'buttons removed'; rx = '(?s)\n\s*<div className="mt-4 flex flex-wrap items-center justify-center gap-3">.*?</div>'; to = '' }
)

# ══ 6 · /platform — keeps the headline AND capital at risk ════════════════
Patch 'src\routes\platform.tsx' @(
  @{ label = 'buttons + note removed'; rx = '(?s)\n\s*<div className="mt-6 flex flex-wrap items-center justify-center gap-3">.*?<p className="mt-3 text-\[12\.5px\] text-slate-ink">\{servicesClose\.ctaNote\}</p>'; to = '' }
)

# ══ checks ════════════════════════════════════════════════════════════════
Write-Host ''
$f = [IO.File]::ReadAllText((Join-Path $root 'src\components\site-footer.tsx'))
if (-not $f.Contains('funnel-heading'))  { Write-Host '*** the footer has NO funnel' }
if (-not $f.Contains('closingBeats'))    { Write-Host '*** closingBeats not imported into the footer' }
$pl = [IO.File]::ReadAllText((Join-Path $root 'src\routes\platform.tsx'))
if (-not $pl.Contains('capitalAtRisk'))  { Write-Host '*** CAPITAL AT RISK HAS GONE FROM /platform — stop and tell me' }
foreach ($r in @('src\routes\the-problem.tsx','src\routes\solutions.tsx')) {
  $t = [IO.File]::ReadAllText((Join-Path $root $r))
  if ($t.Contains('PreReleaseBadge')) { Write-Host ('*** ' + $r + ' still renders the badge — funnel may show twice') }
}

git status --short

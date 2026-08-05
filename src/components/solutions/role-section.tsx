import * as React from "react";
import { Link } from "@tanstack/react-router";
import * as Icons from "lucide-react";
import { ArrowRight, ChevronDown } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptySlot } from "@/components/ui/empty-slot";
import { IconCircle } from "@/components/ui/icon-circle";
import { LiveWindow } from "@/components/ui/live-window";
import { Reveal } from "@/components/ui/reveal";
import { cn } from "@/lib/utils";
import type { RoleSection } from "@/content/solutions";
import { roleIcons } from "./role-utils";

const bulletIcon = (name: string): LucideIcon =>
  (Icons as unknown as Record<string, LucideIcon>)[name] ?? Icons.Circle;

function PortalPreview({ role }: { role: RoleSection }) {
  const { portal } = role;
  return (
    <LiveWindow ariaLabel={`${role.title} portal preview — ${portal.state}`}>
      <div className="flex items-baseline justify-between gap-4">
        <p className="eyebrow text-teal-400">{portal.state}</p>
        <p className="text-[12px] text-slate-muted">
          {portal.columns[0]} · {portal.columns[1]}
        </p>
      </div>
      <ul className="mt-4 flex flex-col gap-2">
        {portal.rows.map((row) => (
          <li
            key={row.primary}
            className="flex items-center justify-between gap-4 rounded-[var(--radius-panel)] border border-navy-700 bg-navy-900/50 px-4 py-3"
          >
            <span className="min-w-0">
              <span className="block truncate font-heading text-sm font-semibold text-white">
                {row.primary}
              </span>
              <span className="block truncate text-[12px] text-slate-muted">{row.secondary}</span>
            </span>
            <span className="shrink-0 font-heading text-sm font-semibold text-teal-400">
              {row.value}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-[12px] text-slate-muted">{portal.footnote}</p>
      <div className="mt-5">
        <Button variant="secondary" size="sm" asChild>
          <Link to="/platform">
            {portal.linkLabel}
            <ArrowRight aria-hidden="true" className="ml-1" />
          </Link>
        </Button>
      </div>
    </LiveWindow>
  );
}

/** The shared template every role section uses — the consistency is the point. */
function RoleBody({ role }: { role: RoleSection }) {
  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-2 lg:gap-10">
      <div className="flex flex-col gap-8">
        <div>
          <h3 className="eyebrow text-slate-muted">What the platform does for me</h3>
          <ul className="mt-5 flex flex-col gap-4">
            {role.bullets.map((bullet) => (
              <li
                key={bullet.text}
                className="flex items-center gap-4 text-sm leading-relaxed text-mist"
              >
                <IconCircle icon={bulletIcon(bullet.icon)} size="brand" tone={bullet.tone} />
                <span>{bullet.text}</span>
              </li>
            ))}
          </ul>
          {role.terms ? (
            <p className="measure mt-5 text-sm leading-relaxed text-mist">{role.terms}</p>
          ) : null}
          {role.qualifier ? (
            <p className="measure mt-3 text-[12px] leading-relaxed text-slate-muted">
              {role.qualifier}
            </p>
          ) : null}
          {role.riskLine ? (
            <p className="measure mt-4 text-[12px] leading-relaxed text-slate-muted">
              {role.riskLine}
            </p>
          ) : null}
        </div>

        <div>
          <h3 className="eyebrow text-slate-muted">Proof</h3>
          <EmptySlot
            className="mt-4"
            label="Case study slot · empty until real"
            detail="Published once a named partner has signed off the outcome."
          />
        </div>

        <div>
          <Button variant="ghost" asChild withArrow>
            <Link to="/contact" search={{ enquiry: role.enquiry, role: role.slug }}>
              Speak to the team
            </Link>
          </Button>
        </div>
      </div>

      <div>
        <h3 className="eyebrow text-slate-muted">Your portal</h3>
        <div className="mt-4">
          <PortalPreview role={role} />
        </div>
      </div>
    </div>
  );
}

export function RoleSectionBlock({ role }: { role: RoleSection }) {
  const [open, setOpen] = React.useState(!role.compact);
  const Icon = roleIcons[role.slug];
  const bodyId = `${role.slug}-body`;

  return (
    <Reveal
      as="section"
      id={role.slug}
      aria-labelledby={`${role.slug}-heading`}
      className="scroll-mt-28 border-t border-navy-700 py-12 lg:py-16"
    >
      <div className="flex items-start gap-4">
        <IconCircle icon={Icon} size="sm" />
        <div className="min-w-0">
          <p className="eyebrow text-teal-400">
            {role.number} · {role.title}
          </p>
          <h2
            id={`${role.slug}-heading`}
            className="heading-tight mt-3 text-balance text-[clamp(1.5rem,2.6vw,2.25rem)] font-bold text-white"
          >
            {role.promise}
          </h2>
        </div>
      </div>

      {role.compact ? (
        <>
          <button
            type="button"
            aria-expanded={open}
            aria-controls={bodyId}
            onClick={() => setOpen((v) => !v)}
            className="mt-6 flex min-h-11 w-full cursor-pointer items-center justify-between gap-4 rounded-[var(--radius-panel)] border border-navy-700 bg-navy-900/50 px-5 text-left transition-colors duration-200 hover:border-navy-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-400"
          >
            <span className="py-3 text-sm text-mist">{role.cardLine}</span>
            <span className="flex items-center gap-2 font-heading text-xs font-semibold uppercase tracking-[0.08em] text-teal-400">
              {open ? "Close" : "See detail"}
              <ChevronDown
                aria-hidden="true"
                className={cn("size-4 transition-transform duration-200", open && "rotate-180")}
              />
            </span>
          </button>
          <div id={bodyId} hidden={!open}>
            {open ? <RoleBody role={role} /> : null}
          </div>
        </>
      ) : (
        <RoleBody role={role} />
      )}
    </Reveal>
  );
}

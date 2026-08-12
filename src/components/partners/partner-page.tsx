import { Link } from "@tanstack/react-router";
import {
  ArrowDown,
  ArrowRight,
  Building2,
  CheckCircle2,
  CircleDollarSign,
  Handshake,
  HardHat,
  HeartHandshake,
  Home,
  Landmark,
  Network,
  User,
  UserRoundCheck,
  Users,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import type { PartnerProfile } from "@/content/partners";

const iconMap: Record<string, LucideIcon> = {
  Building2,
  CircleDollarSign,
  Handshake,
  HardHat,
  HeartHandshake,
  Home,
  Landmark,
  User,
  UserRoundCheck,
  Users,
};

function RoleIcon({
  profile,
  className = "size-7",
}: {
  profile: PartnerProfile;
  className?: string;
}) {
  const Icon = iconMap[profile.icon] ?? Network;
  return <Icon aria-hidden="true" className={className} />;
}

function Connector({ vertical = false }: { vertical?: boolean }) {
  return vertical ? (
    <ArrowDown aria-hidden="true" className="mx-auto size-5 text-teal-400 lg:hidden" />
  ) : (
    <ArrowRight aria-hidden="true" className="hidden size-6 shrink-0 text-teal-400 lg:block" />
  );
}

export function PartnerPage({ profile }: { profile: PartnerProfile }) {
  const headingId = `partner-${profile.id}-heading`;

  return (
    <main>
      <section
        aria-labelledby={headingId}
        className="relative isolate overflow-hidden border-b border-navy-700 bg-navy-900"
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-size-[42px_42px] [mask-image:linear-gradient(to_bottom,black,transparent_92%)]"
        />
        <div
          aria-hidden="true"
          className="absolute -right-24 top-4 -z-10 size-[430px] rounded-full bg-teal-500/10 blur-3xl"
        />
        <div className="mx-auto grid min-h-[470px] w-full max-w-[1200px] items-center gap-10 px-5 py-20 sm:px-8 lg:grid-cols-[minmax(0,1fr)_340px]">
          <Reveal>
            <p className="eyebrow tracking-[0.15em] text-teal-400">Partner with us</p>
            <h1
              id={headingId}
              className="heading-tight mt-3 max-w-[13ch] text-balance text-[clamp(2.75rem,7vw,5.8rem)] font-extrabold leading-[0.94] tracking-[-0.04em] text-white"
            >
              Partner with a <span className="text-orange-500">{profile.label}.</span>
            </h1>
            <p className="mt-6 max-w-[58ch] text-[18px] leading-relaxed text-mist sm:text-[20px]">
              {profile.summary}
            </p>
          </Reveal>

          <Reveal index={1} className="relative mx-auto w-full max-w-[330px]">
            <div className="relative overflow-hidden rounded-[28px] border border-teal-400/35 bg-navy-800 p-7 shadow-[0_30px_80px_rgba(0,0,0,0.28)]">
              <div
                aria-hidden="true"
                className="absolute -right-10 -top-10 size-36 rounded-full bg-orange-500/12 blur-2xl"
              />
              <span className="grid size-16 place-items-center rounded-2xl bg-teal-400 text-navy-950">
                <RoleIcon profile={profile} className="size-8" />
              </span>
              <p className="mt-8 text-[12px] font-semibold uppercase tracking-[0.16em] text-teal-400">
                One connected role
              </p>
              <p className="mt-2 font-heading text-[30px] font-extrabold leading-tight text-white">
                {profile.pluralLabel}
              </p>
              <div className="mt-6 flex items-center gap-3 border-t border-navy-600 pt-5 text-[14px] text-mist">
                <Network aria-hidden="true" className="size-5 shrink-0 text-orange-500" />
                Connected through the Impact Investment Platform
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section aria-labelledby="who-they-are" className="section-light border-b border-navy-700">
        <div className="mx-auto grid w-full max-w-[1200px] gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[0.72fr_1.28fr] lg:py-20">
          <Reveal>
            <p className="eyebrow tracking-[0.14em] text-orange-700">01 · Their role</p>
            <h2
              id="who-they-are"
              className="heading-tight mt-3 text-[clamp(2rem,4vw,3.4rem)] font-extrabold leading-none text-navy-900"
            >
              Who they are.
            </h2>
          </Reveal>
          <Reveal index={1}>
            <p className="max-w-[66ch] text-[20px] leading-[1.65] text-slate">
              {profile.whoTheyAre}
            </p>
          </Reveal>
        </div>
      </section>

      <section
        aria-labelledby="how-they-use-platform"
        className="border-b border-navy-700 bg-navy-900"
      >
        <div className="mx-auto w-full max-w-[1200px] px-5 py-16 sm:px-8 lg:py-20">
          <Reveal>
            <p className="eyebrow tracking-[0.14em] text-teal-400">02 · Through the platform</p>
            <h2
              id="how-they-use-platform"
              className="heading-tight mt-3 max-w-[18ch] text-[clamp(2rem,4vw,3.4rem)] font-extrabold leading-none text-white"
            >
              What they can do — and how.
            </h2>
            <p className="mt-5 max-w-[76ch] text-[17px] leading-relaxed text-mist">
              {profile.platformIntro}
            </p>
          </Reveal>

          <ol className="mt-10 grid gap-4 lg:grid-cols-3">
            {profile.platformSteps.map((step, index) => (
              <Reveal
                key={step}
                index={index}
                as="li"
                className="group relative overflow-hidden rounded-2xl border border-navy-600 bg-navy-800 p-6 transition-colors hover:border-teal-400/70"
              >
                <span className="font-mono text-[12px] font-semibold text-teal-400">
                  0{index + 1}
                </span>
                <p className="mt-8 font-heading text-[20px] font-bold leading-snug text-white">
                  {step}
                </p>
                <ArrowRight
                  aria-hidden="true"
                  className="mt-6 size-5 text-orange-500 transition-transform group-hover:translate-x-1"
                />
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="partner-impact" className="section-light border-b border-navy-700">
        <div className="mx-auto grid w-full max-w-[1200px] gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:py-20">
          <Reveal>
            <p className="eyebrow tracking-[0.14em] text-orange-700">03 · Shared impact</p>
            <h2
              id="partner-impact"
              className="heading-tight mt-3 max-w-[15ch] text-[clamp(2rem,4vw,3.4rem)] font-extrabold leading-none text-navy-900"
            >
              How they make an impact.
            </h2>
            <p className="mt-5 max-w-[54ch] text-[17px] leading-relaxed text-slate">
              {profile.impactIntro}
            </p>
          </Reveal>

          <div className="space-y-3">
            {profile.impactPoints.map((point, index) => (
              <Reveal
                key={point}
                index={index}
                className="flex gap-4 rounded-2xl border border-navy-900/12 bg-white/65 p-5"
              >
                <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-full bg-teal-500/12 text-teal-700">
                  <CheckCircle2 aria-hidden="true" className="size-5" />
                </span>
                <p className="font-heading text-[18px] font-bold leading-snug text-navy-900">
                  {point}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section-light border-b border-navy-700">
        <div className="mx-auto flex w-full max-w-[1200px] flex-col items-start justify-between gap-6 px-5 py-12 sm:px-8 lg:flex-row lg:items-center">
          <div>
            <p className="eyebrow tracking-[0.14em] text-orange-700">Start a conversation</p>
            <h2 className="heading-tight mt-2 text-[clamp(1.65rem,3vw,2.4rem)] font-extrabold text-navy-900">
              Could this be your place in the network?
            </h2>
          </div>
          <Button variant="primary" asChild>
            <Link
              to="/contact"
              search={{
                enquiry:
                  profile.id === "investor"
                    ? "investor"
                    : profile.id === "resident"
                      ? "support"
                      : "partner",
                type:
                  profile.id === "investor"
                    ? "investor"
                    : profile.id === "resident"
                      ? "support"
                      : "partner",
              }}
            >
              Talk to the team
            </Link>
          </Button>
        </div>
      </section>

      <section aria-labelledby="partner-diagram" className="relative overflow-hidden bg-navy-950">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.028)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.028)_1px,transparent_1px)] bg-size-[36px_36px]"
        />
        <div className="relative mx-auto w-full max-w-[1200px] px-5 py-16 sm:px-8 lg:py-20">
          <Reveal className="text-center">
            <p className="eyebrow tracking-[0.14em] text-teal-400">04 · Organisational view</p>
            <h2
              id="partner-diagram"
              className="heading-tight mt-3 text-[clamp(2rem,4vw,3.4rem)] font-extrabold text-white"
            >
              Where {profile.pluralLabel.toLowerCase()} connect.
            </h2>
          </Reveal>

          <Reveal index={1} className="mt-12">
            <div className="grid items-center gap-5 lg:grid-cols-[1fr_auto_0.8fr_auto_1.35fr]">
              <div className="grid gap-3">
                {profile.diagram.inputs.map((item) => (
                  <div
                    key={item}
                    className="rounded-xl border border-navy-600 bg-navy-800 px-5 py-4 text-center font-heading text-[16px] font-bold text-white"
                  >
                    {item}
                  </div>
                ))}
              </div>
              <Connector />
              <Connector vertical />
              <div className="relative rounded-[24px] border-2 border-teal-400 bg-teal-400/10 px-6 py-8 text-center shadow-[0_0_45px_rgba(37,209,194,0.12)]">
                <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-teal-400 text-navy-950">
                  <RoleIcon profile={profile} />
                </span>
                <p className="mt-4 font-heading text-[22px] font-extrabold text-white">
                  {profile.diagram.centre}
                </p>
              </div>
              <Connector />
              <Connector vertical />
              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                {profile.diagram.outputs.map((item, index) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 rounded-xl border border-navy-600 bg-navy-800 px-5 py-4 text-left text-[14px] font-semibold text-white"
                  >
                    <span className="font-mono text-[11px] text-orange-500">0{index + 1}</span>
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <p className="mt-7 text-center text-[13px] leading-relaxed text-slate-muted">
              A simplified relationship view. Exact responsibilities depend on the agreed housing
              and delivery model.
            </p>
          </Reveal>
        </div>
      </section>
    </main>
  );
}

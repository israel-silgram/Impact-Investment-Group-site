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
  Info,
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

const stageVisuals: Record<PartnerProfile["stage"], { image: string; label: string }> = {
  need: { image: "/images/human-insight.jpg", label: "Need, assessment and direction" },
  property: {
    image: "/images/solution-street-blueprint.webp",
    label: "Property, capital and delivery",
  },
  delivery: { image: "/images/human-partnership.jpg", label: "Housing, care and support" },
  outcome: { image: "/images/hero-lives.webp", label: "The person and the outcome" },
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

const investorJourney = [
  {
    number: "01",
    label: "Verified need",
    detail: "Evidence defines where a home is genuinely required.",
  },
  {
    number: "02",
    label: "Responsible capital",
    detail: "The investor assesses the opportunity and completes due diligence.",
  },
  {
    number: "03",
    label: "Property delivery",
    detail: "A suitable home is acquired, improved or created.",
  },
  {
    number: "04",
    label: "Connected partners",
    detail: "Housing, care and support responsibilities are brought together.",
  },
  {
    number: "05",
    label: "A home with purpose",
    detail: "Capital becomes real housing capacity for a person or family.",
  },
] as const;

const investorRoleIcons = [CircleDollarSign, CheckCircle2, Building2, Handshake] as const;

function InvestorNetworkVisual() {
  return (
    <Reveal className="mt-10">
      <div className="overflow-hidden rounded-3xl border-2 border-orange-500 bg-navy-900 shadow-[0_30px_90px_rgba(0,0,0,0.3)]">
        <div className="grid gap-5 border-b border-navy-600 px-5 py-6 sm:px-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="eyebrow tracking-[0.13em] text-orange-500">The capital journey</p>
            <h3 className="heading-tight mt-2 text-[clamp(1.7rem,3.4vw,2.8rem)] font-extrabold leading-none text-white">
              Follow capital from evidence to impact.
            </h3>
          </div>
          <p className="max-w-[44ch] text-[13px] leading-relaxed text-slate-muted lg:text-right">
            A clear view of the people, property and checks that connect investment with a useful
            home. This is not a promise of return.
          </p>
        </div>

        <figure aria-labelledby="investor-network-caption">
          <div className="relative overflow-hidden bg-navy-950">
            <img
              src="/images/partners/investor-connected-network.png"
              alt="An illustrated housing network connecting verified need, investment, property delivery, housing and support partners with a completed occupied home"
              className="aspect-[16/9] w-full object-cover"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_62%,rgba(0,18,43,0.88)_100%)]"
            />
            <div className="absolute bottom-5 left-5 hidden items-center gap-3 rounded-xl border border-teal-400/45 bg-navy-950/90 px-4 py-3 backdrop-blur-sm sm:flex">
              <span className="grid size-9 place-items-center rounded-full bg-orange-500 text-navy-950">
                <CircleDollarSign aria-hidden="true" className="size-5" />
              </span>
              <div>
                <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.14em] text-teal-400">
                  Investor decision point
                </p>
                <p className="mt-1 font-heading text-[14px] font-bold text-white">
                  Evidence first. Capital second.
                </p>
              </div>
            </div>
          </div>

          <figcaption
            id="investor-network-caption"
            className="grid gap-3 bg-navy-950 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-5"
          >
            {investorJourney.map((step, index) => (
              <div
                key={step.number}
                className={`group relative min-h-[165px] rounded-2xl border-2 p-5 transition-transform duration-300 hover:-translate-y-1 ${
                  index === 1
                    ? "border-orange-500 bg-orange-500 text-navy-950"
                    : "border-orange-500 bg-mist-bg text-navy-900"
                }`}
              >
                <span
                  className={`font-mono text-[10px] font-semibold ${
                    index === 1 ? "text-navy-950" : "text-teal-700"
                  }`}
                >
                  {step.number}
                </span>
                <p className="mt-5 font-heading text-[17px] font-extrabold leading-tight">
                  {step.label}
                </p>
                <p
                  className={`mt-2 text-[12px] leading-relaxed ${
                    index === 1 ? "text-navy-900" : "text-slate"
                  }`}
                >
                  {step.detail}
                </p>
                {index < investorJourney.length - 1 ? (
                  <ArrowRight
                    aria-hidden="true"
                    className={`absolute right-4 top-5 hidden size-4 lg:block ${
                      index === 1 ? "text-navy-950" : "text-orange-700"
                    }`}
                  />
                ) : null}
              </div>
            ))}
          </figcaption>
        </figure>
      </div>
    </Reveal>
  );
}

export function PartnerPage({ profile }: { profile: PartnerProfile }) {
  const headingId = `partner-${profile.id}-heading`;
  const isResident = profile.id === "resident";
  const isInvestor = profile.id === "investor";
  const visual = stageVisuals[profile.stage];

  return (
    <main>
      <section
        aria-labelledby={headingId}
        className={`section-light relative isolate overflow-hidden border-b border-navy-700 ${
          isInvestor ? "min-h-[540px]" : "min-h-[610px]"
        }`}
      >
        <img
          src={visual.image}
          alt=""
          className="absolute inset-y-0 right-0 -z-10 h-full w-full object-cover object-center opacity-20 [mask-image:linear-gradient(to_left,black_20%,transparent_95%)] sm:w-[68%] sm:opacity-32 lg:w-[58%]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-20 bg-[linear-gradient(90deg,var(--color-mist-bg)_0%,var(--color-mist-bg)_40%,rgba(245,239,228,0.68)_72%,rgba(245,239,228,0.26)_100%)]"
        />

        <div
          className={`mx-auto flex w-full max-w-[1200px] items-center px-5 sm:px-8 ${
            isInvestor ? "min-h-[540px] py-12" : "min-h-[610px] py-16"
          }`}
        >
          <Reveal className="max-w-[730px]">
            <Link
              to="/partners"
              className="eyebrow inline-flex items-center gap-2 tracking-[0.15em] text-teal-700 transition-colors hover:text-orange-700"
            >
              <span aria-hidden="true">←</span> The partner ecosystem
            </Link>
            {isInvestor ? (
              <div className="mt-7 inline-flex items-center gap-3">
                <span aria-hidden="true" className="h-0.5 w-9 bg-orange-700" />
                <p className="eyebrow tracking-[0.16em] text-teal-800">Investor pathway</p>
              </div>
            ) : (
              <div className="mt-7 flex items-center gap-3">
                <span className="grid size-11 place-items-center bg-navy-900 text-teal-400">
                  <RoleIcon profile={profile} className="size-5" />
                </span>
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.13em] text-orange-700">
                  {visual.label}
                </p>
              </div>
            )}
            <h1
              id={headingId}
              className={`heading-tight mt-5 max-w-[14ch] text-balance font-extrabold leading-[0.94] tracking-[-0.04em] text-navy-900 ${
                isInvestor
                  ? "text-[clamp(2.8rem,5.8vw,5.2rem)]"
                  : "text-[clamp(2.8rem,6.4vw,5.7rem)]"
              }`}
            >
              {isResident ? (
                <>
                  The person at the <span className="text-orange-700">centre.</span>
                </>
              ) : (
                <>
                  Partner with <span className="text-orange-700">{profile.pluralLabel}.</span>
                </>
              )}
            </h1>
            <p
              className={`mt-6 max-w-[58ch] text-[18px] leading-relaxed sm:text-[20px] ${
                isInvestor
                  ? "border-l-4 border-orange-700 pl-4 font-semibold text-navy-800"
                  : "text-slate"
              }`}
            >
              {profile.summary}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button variant="primary" asChild>
                <a href="#role">Understand the role</a>
              </Button>
              <Button variant="secondary" asChild withArrow={false}>
                <Link to="/partners">See all ten partners</Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      <section
        id="role"
        aria-labelledby="role-heading"
        className="relative scroll-mt-20 overflow-hidden bg-navy-900"
      >
        {!isInvestor ? (
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-size-[42px_42px]"
          />
        ) : null}
        <div className="relative mx-auto w-full max-w-[1200px] px-5 py-16 sm:px-8 lg:py-20">
          {isInvestor ? (
            <>
              <Reveal className="mx-auto max-w-[820px] text-center">
                <p className="eyebrow tracking-[0.14em] text-teal-400">01 · The investor role</p>
                <h2
                  id="role-heading"
                  className="heading-tight mt-3 text-[clamp(2.2rem,5vw,4rem)] font-extrabold leading-none text-white"
                >
                  Capital with a <span className="text-orange-500">clear purpose.</span>
                </h2>
                <p className="mx-auto mt-5 max-w-[72ch] text-[16px] leading-relaxed text-mist sm:text-[18px]">
                  {profile.whoTheyAre}
                </p>
              </Reveal>

              <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {profile.rolePoints.map((point, index) => {
                  const Icon = investorRoleIcons[index] ?? CircleDollarSign;

                  return (
                    <Reveal
                      key={point}
                      index={index}
                      className="group min-h-[210px] rounded-2xl border-2 border-orange-500 bg-mist-bg p-5 text-navy-900 shadow-[0_14px_35px_rgba(0,0,0,0.2)] transition-transform duration-300 hover:-translate-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="grid size-12 place-items-center rounded-full bg-gradient-to-br from-orange-300 to-orange-600 shadow-[inset_0_2px_2px_rgba(255,255,255,0.7),0_6px_14px_rgba(0,0,0,0.16)]">
                          <Icon aria-hidden="true" className="size-6" strokeWidth={1.8} />
                        </span>
                        <span className="font-mono text-[10px] font-bold text-teal-700">
                          0{index + 1}
                        </span>
                      </div>
                      <p className="mt-7 font-heading text-[18px] font-extrabold leading-snug">
                        {point}
                      </p>
                    </Reveal>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr]">
              <Reveal>
                <p className="eyebrow tracking-[0.14em] text-teal-400">01 · The role</p>
                <h2
                  id="role-heading"
                  className="heading-tight mt-3 text-[clamp(2.2rem,5vw,4rem)] font-extrabold leading-none text-white"
                >
                  {isResident ? "Who I am and what I may need." : "What this partner brings."}
                </h2>
                <p className="mt-6 max-w-[58ch] text-[17px] leading-relaxed text-mist">
                  {profile.whoTheyAre}
                </p>
              </Reveal>

              <div className="grid gap-px overflow-hidden border border-navy-600 bg-navy-600 sm:grid-cols-2">
                {profile.rolePoints.map((point, index) => (
                  <Reveal
                    key={point}
                    index={index}
                    className="min-h-[170px] bg-navy-800 p-5 sm:p-6"
                  >
                    <span className="font-mono text-[11px] font-semibold text-orange-500">
                      0{index + 1}
                    </span>
                    <p className="mt-8 font-heading text-[19px] font-bold leading-snug text-white">
                      {point}
                    </p>
                  </Reveal>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <section
        aria-labelledby="platform-heading"
        className="section-light border-b border-navy-700"
      >
        <div className="mx-auto w-full max-w-[1200px] px-5 py-16 sm:px-8 lg:py-20">
          <Reveal className="mx-auto max-w-[820px] text-center">
            <p className="eyebrow tracking-[0.14em] text-orange-700">02 · Through the platform</p>
            <h2
              id="platform-heading"
              className="heading-tight mt-3 text-[clamp(2.2rem,5vw,4rem)] font-extrabold leading-none text-navy-900"
            >
              {isInvestor ? (
                <>
                  Three clear moves. <span className="text-orange-700">One traceable route.</span>
                </>
              ) : (
                "One role. Three clear moves."
              )}
            </h2>
            <p className="mx-auto mt-5 max-w-[70ch] text-[16px] leading-relaxed text-slate">
              {profile.platformIntro}
            </p>
          </Reveal>

          <ol
            className={`mt-10 grid gap-4 lg:grid-cols-3 ${
              isInvestor
                ? "section-dark investor-dark-panel rounded-3xl bg-navy-900 p-4 sm:p-6"
                : ""
            }`}
          >
            {profile.platformSteps.map((step, index) => (
              <Reveal
                key={step}
                index={index}
                as="li"
                className={`group relative p-6 transition-transform duration-300 hover:-translate-y-1 ${
                  isInvestor
                    ? "min-h-[210px] rounded-2xl border-2 border-orange-500 bg-mist-bg text-navy-900 shadow-[0_16px_38px_rgba(0,0,0,0.2)]"
                    : "border-t-4 border-teal-500 bg-white/75 shadow-[0_15px_40px_rgba(3,21,45,0.07)]"
                }`}
              >
                <span
                  className={`grid size-10 place-items-center rounded-full font-mono text-[11px] font-bold ${
                    isInvestor ? "bg-orange-500 text-navy-950" : "bg-transparent text-orange-700"
                  }`}
                >
                  0{index + 1}
                </span>
                <p className="mt-7 font-heading text-[20px] font-extrabold leading-snug text-navy-900">
                  {step}
                </p>
                {index < profile.platformSteps.length - 1 ? (
                  <ArrowRight
                    aria-hidden="true"
                    className={`mt-7 size-5 lg:absolute lg:-right-4 lg:top-1/2 lg:z-10 lg:mt-0 lg:-translate-y-1/2 ${
                      isInvestor ? "text-orange-500" : "text-teal-700"
                    }`}
                  />
                ) : null}
              </Reveal>
            ))}
          </ol>

          <Reveal
            className={`mt-10 grid gap-6 bg-navy-900 p-6 sm:p-8 lg:grid-cols-[0.9fr_1.1fr] ${
              isInvestor
                ? "section-dark investor-dark-panel rounded-3xl border border-navy-600"
                : ""
            }`}
          >
            <div>
              <p className="eyebrow tracking-[0.13em] text-teal-400">Why join the ecosystem?</p>
              <p className="mt-4 text-[16px] leading-relaxed text-mist">{profile.whyJoin}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {profile.ecosystemBenefits.map((benefit) => (
                <div
                  key={benefit}
                  className={
                    isInvestor
                      ? "rounded-xl border border-orange-500/55 bg-navy-800 p-4"
                      : "border-l-2 border-orange-500 pl-4"
                  }
                >
                  <p className="font-heading text-[15px] font-bold leading-snug text-white">
                    {benefit}
                  </p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section
        aria-labelledby="network-heading"
        className={`relative overflow-hidden ${isInvestor ? "bg-navy-900" : "bg-navy-950"}`}
      >
        {!isInvestor ? (
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-size-[36px_36px]"
          />
        ) : null}
        <div className="relative mx-auto w-full max-w-[1200px] px-5 py-16 sm:px-8 lg:py-20">
          <Reveal className={isInvestor ? "mx-auto max-w-[820px] text-center" : "max-w-[780px]"}>
            <p className="eyebrow tracking-[0.14em] text-teal-400">03 · The connected network</p>
            <h2
              id="network-heading"
              className="heading-tight mt-3 text-[clamp(2.2rem,5vw,4rem)] font-extrabold leading-none text-white"
            >
              {isInvestor ? (
                <>
                  Capital connected to the <span className="text-orange-500">full journey.</span>
                </>
              ) : (
                "No role works alone."
              )}
            </h2>
            <p
              className={`mt-5 max-w-[68ch] text-[16px] leading-relaxed text-mist ${
                isInvestor ? "mx-auto" : ""
              }`}
            >
              {profile.impactIntro}
            </p>
          </Reveal>

          {isInvestor ? (
            <InvestorNetworkVisual />
          ) : (
            <>
              <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {profile.relationships.map((relationship, index) => (
                  <Reveal
                    key={relationship.partner}
                    index={index}
                    className="border-t-2 border-teal-400 bg-navy-800 p-5"
                  >
                    <p className="font-heading text-[18px] font-extrabold text-white">
                      {relationship.partner}
                    </p>
                    <p className="mt-3 text-[13px] leading-relaxed text-slate-muted">
                      {relationship.detail}
                    </p>
                  </Reveal>
                ))}
              </div>

              <Reveal className="mt-10">
                <p className="eyebrow text-center tracking-[0.13em] text-orange-500">
                  Organisational view
                </p>
                <div className="mt-6 grid items-center gap-4 lg:grid-cols-[1fr_auto_0.85fr_auto_1.3fr]">
                  <div className="grid gap-2">
                    {profile.diagram.inputs.map((item) => (
                      <div
                        key={item}
                        className="border border-navy-600 bg-navy-800 px-5 py-4 text-center font-heading text-[15px] font-bold text-white"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                  <Connector />
                  <Connector vertical />
                  <div className="border-2 border-teal-400 bg-teal-400/10 px-6 py-8 text-center shadow-[0_0_45px_rgba(37,209,194,0.12)]">
                    <span className="mx-auto grid size-14 place-items-center bg-teal-400 text-navy-950">
                      <RoleIcon profile={profile} />
                    </span>
                    <p className="mt-4 font-heading text-[21px] font-extrabold text-white">
                      {profile.diagram.centre}
                    </p>
                  </div>
                  <Connector />
                  <Connector vertical />
                  <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-1">
                    {profile.diagram.outputs.map((item, index) => (
                      <div
                        key={item}
                        className="flex items-center gap-3 border border-navy-600 bg-navy-800 px-5 py-4 text-[13px] font-semibold text-white"
                      >
                        <span className="font-mono text-[10px] text-orange-500">0{index + 1}</span>
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>
            </>
          )}

          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            {profile.impactPoints.map((point, index) => (
              <Reveal
                key={point}
                index={index}
                className={`flex gap-3 transition-transform duration-300 hover:-translate-y-1 ${
                  isInvestor
                    ? "rounded-2xl border-2 border-orange-500 bg-mist-bg p-5 text-navy-900"
                    : "border border-navy-600 bg-navy-900/75 p-4"
                }`}
              >
                <CheckCircle2
                  aria-hidden="true"
                  className={`mt-0.5 size-5 shrink-0 ${isInvestor ? "text-teal-700" : "text-teal-400"}`}
                />
                <p
                  className={`font-heading text-[15px] font-bold leading-snug ${
                    isInvestor ? "text-navy-900" : "text-white"
                  }`}
                >
                  {point}
                </p>
              </Reveal>
            ))}
          </div>

          {profile.importantNote ? (
            <Reveal
              className={`mt-8 flex gap-4 border border-orange-500/30 bg-orange-500/7 p-4 ${
                isInvestor ? "rounded-2xl" : ""
              }`}
            >
              <Info aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-orange-500" />
              <p className="text-[12px] leading-relaxed text-slate-muted">
                {profile.importantNote}
              </p>
            </Reveal>
          ) : null}

          <Reveal className="mt-12 border-t border-navy-600 pt-10 text-center">
            <p className="mx-auto max-w-[850px] font-heading text-[clamp(1.5rem,3vw,2.5rem)] font-extrabold leading-tight text-white">
              {profile.closingLine}
            </p>
            <p className="mt-3 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-teal-400">
              {profile.motto}
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <Button variant="primary" asChild>
                <Link
                  to="/contact"
                  search={{
                    enquiry:
                      profile.id === "investor" ? "investor" : isResident ? "support" : "partner",
                    type:
                      profile.id === "investor" ? "investor" : isResident ? "support" : "partner",
                  }}
                >
                  {isResident ? "Talk about your housing need" : "Start a partnership conversation"}
                </Link>
              </Button>
              <Button variant="secondary" asChild withArrow={false}>
                <Link to="/partners">Explore all ten roles</Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}

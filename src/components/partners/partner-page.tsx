import { Link } from "@tanstack/react-router";
import { useState } from "react";
import {
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

interface PlatformPresentation {
  lead: string;
  accent: string;
  labels: [string, string, string];
  readoutTitles: [string, string, string];
}

const platformPresentations: Record<string, PlatformPresentation> = {
  investor: {
    lead: "See exactly what your capital is",
    accent: "building towards.",
    labels: ["Evidence", "Structure", "Outcome"],
    readoutTitles: ["Start with the need.", "Test the structure.", "Keep the outcome visible."],
  },
  landlord: {
    lead: "See exactly where your property",
    accent: "fits.",
    labels: ["Property", "Fit", "Delivery"],
    readoutTitles: ["Start with the property.", "Check the fit.", "Follow delivery."],
  },
  developer: {
    lead: "See how a housing brief becomes",
    accent: "a completed home.",
    labels: ["Brief", "Plan", "Outcome"],
    readoutTitles: [
      "Start with the brief.",
      "Build the delivery plan.",
      "Keep sight of the outcome.",
    ],
  },
  "housing-association": {
    lead: "Connect need, property and tenancy in",
    accent: "one delivery plan.",
    labels: ["Need", "Tenancy", "Delivery"],
    readoutTitles: ["Confirm the need.", "Shape the housing route.", "Coordinate delivery."],
  },
  "local-authority": {
    lead: "Turn verified local need into",
    accent: "a coordinated response.",
    labels: ["Need", "Response", "Outcome"],
    readoutTitles: ["Define the need.", "Connect the response.", "Keep outcomes visible."],
  },
  "care-provider": {
    lead: "Keep care requirements connected to",
    accent: "the right home.",
    labels: ["Care need", "Home", "Outcome"],
    readoutTitles: ["Start with assessed need.", "Check the home.", "Coordinate the outcome."],
  },
  "support-provider": {
    lead: "Connect practical support from placement to",
    accent: "real progress.",
    labels: ["Support need", "Placement", "Progress"],
    readoutTitles: ["Define the support need.", "Connect the placement.", "Keep progress visible."],
  },
  "social-worker": {
    lead: "Keep the person's needs visible through",
    accent: "every step.",
    labels: ["Assessment", "Coordination", "Review"],
    readoutTitles: ["Start with the person.", "Follow the coordination.", "Review the outcome."],
  },
  broker: {
    lead: "See how each opportunity finds",
    accent: "the right route.",
    labels: ["Opportunity", "Match", "Progress"],
    readoutTitles: ["Open the opportunity.", "Check the match.", "Follow it forward."],
  },
  resident: {
    lead: "See how your needs shape the journey towards",
    accent: "a suitable home.",
    labels: ["My needs", "My home", "My future"],
    readoutTitles: [
      "Start with what matters to me.",
      "Connect the right home.",
      "Keep my future central.",
    ],
  },
};

interface ConnectedNetworkPresentation {
  lead: string;
  accent: string;
  image: string;
  alt: string;
}

const connectedNetworkPresentations: Record<string, ConnectedNetworkPresentation> = {
  investor: {
    lead: "See where capital",
    accent: "connects.",
    image: "/images/partners/connected-network-investor.png",
    alt: "Four connected housing checkpoints with Property Investor expanded in a detailed information drawer.",
  },
  landlord: {
    lead: "See where property",
    accent: "connects.",
    image: "/images/partners/connected-network-landlord.png",
    alt: "Four connected housing checkpoints with Property Landlord expanded in a detailed information drawer.",
  },
  developer: {
    lead: "See where development",
    accent: "connects.",
    image: "/images/partners/connected-network-developer.png",
    alt: "Four connected housing checkpoints with Property Developer expanded in a detailed information drawer.",
  },
  "housing-association": {
    lead: "See where housing delivery",
    accent: "connects.",
    image: "/images/partners/connected-network-housing-association.png",
    alt: "Four connected housing checkpoints with Housing Association expanded in a detailed information drawer.",
  },
  "local-authority": {
    lead: "See where local need",
    accent: "connects.",
    image: "/images/partners/connected-network-local-authority.png",
    alt: "Four connected housing checkpoints with Local Authority expanded in a detailed information drawer.",
  },
  "care-provider": {
    lead: "See where specialist care",
    accent: "connects.",
    image: "/images/partners/connected-network-care-provider.png",
    alt: "Four connected housing checkpoints with Care Provider expanded in a detailed information drawer.",
  },
  "support-provider": {
    lead: "See where practical support",
    accent: "connects.",
    image: "/images/partners/connected-network-support-provider.png",
    alt: "Four connected housing checkpoints with Support Provider expanded in a detailed information drawer.",
  },
  "social-worker": {
    lead: "See where advocacy",
    accent: "connects.",
    image: "/images/partners/connected-network-social-worker.png",
    alt: "Four connected housing checkpoints with Social Worker expanded in a detailed information drawer.",
  },
  broker: {
    lead: "See where introductions",
    accent: "connect.",
    image: "/images/partners/connected-network-broker.png",
    alt: "Four connected housing checkpoints with Property and Housing Broker expanded in a detailed information drawer.",
  },
  resident: {
    lead: "See how the network connects",
    accent: "around you.",
    image: "/images/partners/connected-network-resident.png",
    alt: "Four connected housing checkpoints with Resident, Individual or Family expanded in a detailed information drawer.",
  },
};

function ConnectedNetworkDiagram({ profile }: { profile: PartnerProfile }) {
  const presentation =
    connectedNetworkPresentations[profile.id] ?? connectedNetworkPresentations.investor;

  return (
    <Reveal className="mt-10">
      <figure className="overflow-hidden rounded-3xl border border-navy-600 bg-navy-950 shadow-[0_30px_90px_rgba(0,0,0,0.28)]">
        <img
          src={presentation.image}
          alt={presentation.alt}
          loading="lazy"
          className="aspect-[16/9] w-full object-cover"
        />
      </figure>
    </Reveal>
  );
}

interface RolePresentation {
  eyebrow: string;
  lead: string;
  accent: string;
  guideLabels: [string, string, string, string];
}

const rolePresentations: Record<string, RolePresentation> = {
  investor: {
    eyebrow: "The investor role",
    lead: "Capital with a",
    accent: "clear purpose.",
    guideLabels: ["Fund", "Test", "Connect", "Track"],
  },
  landlord: {
    eyebrow: "The landlord role",
    lead: "Property with a",
    accent: "clear route.",
    guideLabels: ["List", "Check", "Connect", "Track"],
  },
  developer: {
    eyebrow: "The developer role",
    lead: "Delivery shaped by",
    accent: "real need.",
    guideLabels: ["Plan", "Test", "Deliver", "Track"],
  },
  "housing-association": {
    eyebrow: "The housing association role",
    lead: "Housing delivery with",
    accent: "every role connected.",
    guideLabels: ["Need", "Tenancy", "Connect", "Track"],
  },
  "local-authority": {
    eyebrow: "The local authority role",
    lead: "Local need becomes",
    accent: "a coordinated response.",
    guideLabels: ["Need", "Commission", "Connect", "Review"],
  },
  "care-provider": {
    eyebrow: "The care provider role",
    lead: "Care requirements connected to",
    accent: "the right home.",
    guideLabels: ["Assess", "Care", "Connect", "Review"],
  },
  "support-provider": {
    eyebrow: "The support provider role",
    lead: "Practical support connected to",
    accent: "the whole journey.",
    guideLabels: ["Assess", "Support", "Connect", "Progress"],
  },
  "social-worker": {
    eyebrow: "The social worker role",
    lead: "Keep the person visible in",
    accent: "every decision.",
    guideLabels: ["Assess", "Advocate", "Connect", "Review"],
  },
  broker: {
    eyebrow: "The broker role",
    lead: "Bring the right partners to",
    accent: "the same opportunity.",
    guideLabels: ["Find", "Match", "Connect", "Track"],
  },
  resident: {
    eyebrow: "The resident role",
    lead: "Your needs remain at",
    accent: "the centre.",
    guideLabels: ["Need", "Home", "Support", "Outcome"],
  },
};

const roleGuideImages = [
  "/images/ai-team/petra.webp",
  "/images/ai-team/peter.webp",
  "/images/ai-team/pippa.webp",
  "/images/ai-team/pippa.webp",
] as const;

function PartnerRoleLedger({ profile }: { profile: PartnerProfile }) {
  const presentation = rolePresentations[profile.id] ?? rolePresentations.investor;

  return (
    <section
      id="role"
      aria-labelledby="role-heading"
      className="relative scroll-mt-20 overflow-hidden bg-navy-900"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-size-[42px_42px]"
      />
      <div className="relative mx-auto w-full max-w-[1200px] px-5 py-16 sm:px-8 lg:py-20">
        <Reveal className="mx-auto max-w-[850px] text-center">
          <p className="eyebrow tracking-[0.14em] text-teal-400">
            01 · {presentation.eyebrow}
          </p>
          <h2
            id="role-heading"
            className="heading-tight mt-3 text-[clamp(2.2rem,5vw,4rem)] font-extrabold leading-none text-white"
          >
            {presentation.lead}{" "}
            <span className="text-orange-500">{presentation.accent}</span>
          </h2>
          <p className="mx-auto mt-5 max-w-[72ch] text-[16px] leading-relaxed text-mist sm:text-[18px]">
            {profile.whoTheyAre}
          </p>
        </Reveal>

        <div className="mt-11 grid items-end gap-8 lg:grid-cols-[1fr_310px] lg:gap-10">
          <div className="grid gap-3">
            {profile.rolePoints.map((point, index) => (
              <Reveal
                key={point}
                index={index}
                className="group grid min-h-[100px] grid-cols-[58px_1fr_auto] items-center gap-3 rounded-2xl border-2 border-orange-500 bg-mist-bg px-4 py-4 text-navy-900 shadow-[0_14px_34px_rgba(0,0,0,0.18)] transition-all duration-300 hover:translate-x-2 hover:shadow-[0_20px_44px_rgba(0,0,0,0.28)] sm:grid-cols-[72px_1fr_104px] sm:px-5"
              >
                <span className="font-heading text-[30px] font-extrabold text-orange-700">
                  0{index + 1}
                </span>
                <p className="font-heading text-[16px] font-extrabold leading-snug sm:text-[18px]">
                  {point}
                </p>
                <span className="flex items-center justify-end gap-2 font-mono text-[9px] font-semibold uppercase tracking-[0.08em] text-teal-800">
                  <span className="hidden sm:inline">
                    {presentation.guideLabels[index] ?? "Guide"}
                  </span>
                  <span className="grid size-10 shrink-0 place-items-end overflow-hidden rounded-full border-2 border-orange-500 bg-navy-800">
                    <img
                      src={roleGuideImages[index] ?? roleGuideImages[0]}
                      alt=""
                      className="h-[115%] w-full object-contain object-bottom"
                    />
                  </span>
                </span>
              </Reveal>
            ))}
          </div>

          <Reveal className="relative mx-auto min-h-[330px] w-full max-w-[340px] lg:min-h-[390px]">
            <img
              src="/images/ai-team/petra.webp"
              alt="Orange property guide"
              className="absolute bottom-0 left-0 z-30 w-[58%] object-contain drop-shadow-[0_22px_24px_rgba(0,0,0,0.34)]"
            />
            <img
              src="/images/ai-team/peter.webp"
              alt="Blue investment guide"
              className="absolute bottom-0 left-[25%] z-20 w-[58%] object-contain drop-shadow-[0_22px_24px_rgba(0,0,0,0.34)]"
            />
            <img
              src="/images/ai-team/pippa.webp"
              alt="Green impact guide"
              className="absolute bottom-0 right-0 z-10 w-[58%] object-contain drop-shadow-[0_22px_24px_rgba(0,0,0,0.34)]"
            />
            <p className="absolute inset-x-0 -bottom-4 z-40 text-center font-mono text-[10px] font-semibold uppercase tracking-[0.11em] text-teal-400">
              {presentation.guideLabels.join(" · ")}
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function PartnerPlatformStack({ profile }: { profile: PartnerProfile }) {
  const [activeStep, setActiveStep] = useState(0);
  const presentation = platformPresentations[profile.id] ?? platformPresentations.investor;

  return (
    <section
      aria-labelledby="platform-heading"
      className="relative isolate overflow-hidden bg-navy-950"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-20 bg-[linear-gradient(rgba(37,209,194,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(37,209,194,0.035)_1px,transparent_1px)] bg-size-[44px_44px]"
      />
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-[48%] -z-10 size-[660px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-teal-400/5 blur-[110px]"
      />

      <div className="relative mx-auto w-full max-w-[1200px] px-5 py-16 sm:px-8 lg:py-20">
        <Reveal className="mx-auto max-w-[880px] text-center">
          <p className="eyebrow tracking-[0.16em] text-teal-400">02 · Through the platform</p>
          <h2
            id="platform-heading"
            className="heading-tight mx-auto mt-4 max-w-[17ch] text-[clamp(2.7rem,5.6vw,5rem)] font-extrabold leading-[0.94] tracking-[-0.04em] text-white"
          >
            {presentation.lead} <span className="text-orange-500">{presentation.accent}</span>
          </h2>
          <p className="mx-auto mt-5 max-w-[62ch] text-[16px] font-semibold leading-relaxed text-mist sm:text-[18px]">
            {profile.platformIntro}
          </p>
        </Reveal>

        <div
          className="relative mx-auto mt-14 max-w-[1020px] sm:mt-16"
          role="group"
          aria-label={`${profile.label} platform journey`}
        >
          <div
            aria-hidden="true"
            className="absolute left-7 top-7 h-[calc(100%-3.5rem)] w-1 bg-white/15 sm:hidden"
          >
            <div
              className="w-full bg-[linear-gradient(180deg,#25d1c2,#ff6b00)] shadow-[0_0_20px_rgba(255,107,0,0.55)] transition-[height] duration-500"
              style={{ height: `${activeStep * 50}%` }}
            />
          </div>
          <div
            aria-hidden="true"
            className="absolute left-[16.666%] right-[16.666%] top-7 hidden h-1 bg-white/15 sm:block"
          >
            <div
              className="h-full bg-[linear-gradient(90deg,#25d1c2,#ff6b00)] shadow-[0_0_20px_rgba(255,107,0,0.55)] transition-[width] duration-500"
              style={{ width: `${activeStep * 50}%` }}
            />
          </div>

          <div className="relative grid gap-6 sm:grid-cols-3 sm:gap-8">
            {profile.platformSteps.map((step, index) => {
              const selected = activeStep === index;

              return (
                <button
                  key={step}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setActiveStep(index)}
                  onMouseEnter={() => setActiveStep(index)}
                  className="group grid grid-cols-[56px_1fr] items-center gap-4 text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-400 sm:block sm:text-center"
                >
                  <span
                    className={`relative z-10 grid size-14 place-items-center rounded-full border-[3px] font-mono text-[12px] font-bold transition-all duration-300 sm:mx-auto sm:mb-5 ${
                      selected
                        ? "scale-110 border-orange-500 bg-orange-500 text-navy-950 shadow-[0_0_26px_rgba(255,107,0,0.55)]"
                        : "border-mist bg-navy-950 text-white group-hover:border-teal-400"
                    }`}
                  >
                    0{index + 1}
                  </span>
                  <span>
                    <span className="block font-heading text-[20px] font-extrabold text-white">
                      {presentation.labels[index]}
                    </span>
                    <span className="mt-1 block text-[13px] font-medium text-slate-muted">
                      {presentation.readoutTitles[index]}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <Reveal className="mx-auto mt-12 max-w-[720px] sm:mt-14">
          <div
            aria-live="polite"
            className="border-l-4 border-orange-500 bg-navy-800/86 px-6 py-5 shadow-[0_20px_55px_rgba(0,0,0,0.28)] backdrop-blur-sm sm:px-8 sm:py-6"
          >
            <div className="flex items-center gap-3">
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-teal-400">
                Active checkpoint
              </span>
              <span aria-hidden="true" className="h-px flex-1 bg-teal-400/30" />
              <span className="font-mono text-[10px] font-bold text-orange-500">
                0{activeStep + 1} / 03
              </span>
            </div>
            <p className="mt-4 font-heading text-[clamp(1.45rem,2.5vw,2rem)] font-extrabold leading-tight text-white">
              {presentation.readoutTitles[activeStep]}
            </p>
            <p className="mt-2 text-[15px] font-medium leading-relaxed text-mist sm:text-[16px]">
              {profile.platformSteps[activeStep]}
            </p>
          </div>
        </Reveal>

        <p className="mx-auto mt-8 max-w-[760px] text-center text-[13px] font-medium text-teal-400">
          {profile.whyJoin}
        </p>
      </div>
    </section>
  );
}

export function PartnerPage({ profile }: { profile: PartnerProfile }) {
  const headingId = `partner-${profile.id}-heading`;
  const isResident = profile.id === "resident";
  const isInvestor = profile.id === "investor";
  const visual = stageVisuals[profile.stage];
  const networkPresentation =
    connectedNetworkPresentations[profile.id] ?? connectedNetworkPresentations.investor;

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

      <PartnerRoleLedger profile={profile} />

      <PartnerPlatformStack profile={profile} />

      <section
        aria-labelledby="network-heading"
        className="relative overflow-hidden bg-navy-900"
      >
        <div className="relative mx-auto w-full max-w-[1200px] px-5 py-16 sm:px-8 lg:py-20">
          <Reveal className="mx-auto max-w-[820px] text-center">
            <p className="eyebrow tracking-[0.14em] text-teal-400">03 · The connected network</p>
            <h2
              id="network-heading"
              className="heading-tight mt-3 text-[clamp(2.2rem,5vw,4rem)] font-extrabold leading-none text-white"
            >
              {networkPresentation.lead}{" "}
              <span className="text-orange-500">{networkPresentation.accent}</span>
            </h2>
            <p className="mx-auto mt-5 max-w-[68ch] text-[16px] leading-relaxed text-mist">
              {profile.impactIntro}
            </p>
          </Reveal>

          <ConnectedNetworkDiagram profile={profile} />

          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            {profile.impactPoints.map((point, index) => (
              <Reveal
                key={point}
                index={index}
                className="flex gap-3 rounded-2xl border-2 border-orange-500 bg-mist-bg p-5 text-navy-900 transition-transform duration-300 hover:-translate-y-1"
              >
                <CheckCircle2
                  aria-hidden="true"
                  className="mt-0.5 size-5 shrink-0 text-teal-700"
                />
                <p className="font-heading text-[15px] font-bold leading-snug text-navy-900">
                  {point}
                </p>
              </Reveal>
            ))}
          </div>

          {profile.importantNote ? (
            <Reveal
              className="mt-8 flex gap-4 rounded-2xl border border-orange-500/30 bg-orange-500/7 p-4"
            >
              <Info aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-orange-500" />
              <p className="text-[12px] leading-relaxed text-slate-muted">
                {profile.importantNote}
              </p>
            </Reveal>
          ) : null}

        </div>
      </section>
    </main>
  );
}

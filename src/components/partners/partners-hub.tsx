import { Link } from "@tanstack/react-router";
import {
  ArrowDown,
  ArrowRight,
  Building2,
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
import { partnerProfiles, type PartnerProfile } from "@/content/partners";
import { cn } from "@/lib/utils";

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

const roleDetails: Record<string, { description: string; icon: string }> = {
  "local-authority": {
    description: "Identifies local need and coordinates the response.",
    icon: "from-teal-300 to-teal-600 text-navy-950",
  },
  "social-worker": {
    description: "Assesses, advocates and keeps the person visible.",
    icon: "from-orange-300 to-orange-600 text-navy-950",
  },
  broker: {
    description: "Connects evidenced demand with credible opportunities.",
    icon: "from-sky-300 to-sky-600 text-navy-950",
  },
  investor: {
    description: "Provides responsible capital for suitable homes.",
    icon: "from-amber-300 to-orange-600 text-navy-950",
  },
  landlord: {
    description: "Makes existing homes available where they are needed.",
    icon: "from-emerald-300 to-teal-600 text-navy-950",
  },
  developer: {
    description: "Creates, converts or adapts suitable property.",
    icon: "from-yellow-300 to-amber-500 text-navy-950",
  },
  "housing-association": {
    description: "Provides the housing and tenancy structure.",
    icon: "from-blue-300 to-sky-600 text-navy-950",
  },
  "care-provider": {
    description: "Delivers specialist or regulated care.",
    icon: "from-rose-300 to-orange-500 text-navy-950",
  },
  "support-provider": {
    description: "Builds stability, skills and independence.",
    icon: "from-lime-300 to-teal-500 text-navy-950",
  },
  resident: {
    description: "A suitable home, the right support and a stronger future.",
    icon: "from-orange-300 to-orange-600 text-navy-950",
  },
};

const ecosystemStages = [
  {
    number: "01",
    label: "Need, assessment and direction",
    roles: ["local-authority", "social-worker"],
    columns: "sm:grid-cols-2",
    node: "bg-teal-500",
  },
  {
    number: "02",
    label: "Property, capital and connections",
    roles: ["broker", "investor", "landlord", "developer"],
    columns: "sm:grid-cols-2 lg:grid-cols-4",
    node: "bg-orange-500",
  },
  {
    number: "03",
    label: "Housing, care and support delivery",
    roles: ["housing-association", "care-provider", "support-provider"],
    columns: "sm:grid-cols-3",
    node: "bg-teal-500",
  },
  {
    number: "04",
    label: "The person and the outcome",
    roles: ["resident"],
    columns: "mx-auto max-w-[650px]",
    node: "bg-orange-500",
  },
] as const;

function getProfile(id: string) {
  return partnerProfiles.find((profile) => profile.id === id)!;
}

function RoleIcon({ profile }: { profile: PartnerProfile }) {
  const Icon = iconMap[profile.icon] ?? Network;
  return <Icon aria-hidden="true" className="size-7" strokeWidth={1.8} />;
}

function FlowConnector() {
  return (
    <div aria-hidden="true" className="flex h-12 items-center justify-center">
      <ArrowDown className="size-5 text-mist" strokeWidth={1.8} />
    </div>
  );
}

function PartnerCard({ profile, outcome = false }: { profile: PartnerProfile; outcome?: boolean }) {
  const detail = roleDetails[profile.id] ?? roleDetails["broker"]!;

  return (
    <Link
      to={profile.path}
      className={cn(
        "group relative flex min-h-[145px] flex-col items-center justify-center rounded-2xl border-2 border-orange-500 p-4 text-center transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-600",
        outcome
          ? "bg-mist-bg text-navy-900 shadow-[0_12px_28px_rgba(0,0,0,0.24)] hover:-translate-y-1"
          : "bg-mist-bg text-navy-900 shadow-[0_8px_20px_rgba(0,0,0,0.18)] hover:-translate-y-1 hover:shadow-[0_14px_28px_rgba(0,0,0,0.26)]",
      )}
    >
      <span
        className={cn(
          "grid size-12 place-items-center rounded-full bg-gradient-to-br shadow-[inset_0_2px_2px_rgba(255,255,255,0.65),0_5px_12px_rgba(0,22,51,0.15)] transition-transform duration-300 group-hover:scale-110",
          detail.icon,
        )}
      >
        <span className="drop-shadow-sm">
          <RoleIcon profile={profile} />
        </span>
      </span>

      <h3 className="mt-3 font-heading text-[16px] font-extrabold leading-tight">
        {profile.label}
      </h3>
      <p className={cn("mt-1.5 max-w-[32ch] text-[11px] leading-relaxed", "text-slate")}>
        {detail.description}
      </p>

      <span
        className={cn(
          "absolute right-3 top-3 grid size-7 place-items-center rounded-full opacity-0 transition-opacity group-hover:opacity-100",
          outcome ? "bg-orange-500 text-navy-950" : "bg-white text-navy-900",
        )}
      >
        <ArrowRight aria-hidden="true" className="size-3.5" />
      </span>
    </Link>
  );
}

export function PartnersHub() {
  return (
    <main>
      <section className="section-light relative isolate overflow-hidden">
        <img
          src="/images/ecosystem-band.jpg"
          alt=""
          className="absolute inset-y-0 right-0 -z-10 hidden h-full w-[60%] object-cover opacity-70 mix-blend-multiply [mask-image:linear-gradient(to_left,black_35%,transparent_100%)] lg:block"
        />
        <div className="mx-auto flex min-h-[500px] w-full max-w-[1200px] items-center px-5 py-12 sm:px-8 lg:py-14">
          <Reveal className="max-w-[760px]">
            <div className="inline-flex items-center gap-3">
              <span aria-hidden="true" className="h-0.5 w-9 bg-orange-700" />
              <p className="eyebrow tracking-[0.16em] text-teal-800">
                10 roles. 4 stages. 1 outcome.
              </p>
            </div>
            <h1 className="heading-tight mt-5 max-w-[12ch] text-balance text-[clamp(2.75rem,6vw,5.35rem)] font-extrabold leading-[0.94] tracking-[-0.04em] text-navy-900">
              Ten roles. <span className="text-orange-700">One connected journey.</span>
            </h1>
            <p className="mt-6 max-w-[48ch] border-l-4 border-orange-700 pl-4 text-[17px] font-semibold leading-relaxed text-navy-800 sm:text-[19px]">
              Ten roles working together to turn housing need into the right home, with people at
              the centre.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button variant="primary" asChild>
                <a href="#ecosystem">Explore the ecosystem</a>
              </Button>
              <Button variant="secondary" asChild withArrow={false}>
                <Link to="/contact" search={{ enquiry: "partner", type: "partner" }}>
                  Become a partner
                </Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      <section
        id="ecosystem"
        aria-labelledby="ecosystem-heading"
        className="scroll-mt-20 bg-navy-900"
      >
        <div className="mx-auto w-full max-w-[1080px] px-5 py-14 sm:px-8 lg:py-20">
          <Reveal className="mx-auto max-w-[760px] text-center">
            <p className="eyebrow tracking-[0.14em] text-teal-400">One connected ecosystem</p>
            <h2
              id="ecosystem-heading"
              className="heading-tight mx-auto mt-3 text-balance text-[clamp(2.2rem,4.6vw,3.8rem)] font-extrabold leading-[0.98] text-white"
            >
              <span className="block">Ten partners.</span>
              <span className="block text-orange-500 sm:whitespace-nowrap">
                One connected outcome.
              </span>
            </h2>
            <p className="mx-auto mt-5 max-w-[58ch] text-[16px] leading-relaxed text-mist sm:text-[18px]">
              See how each role moves a housing need towards a suitable home. Select any partner to
              explore its part.
            </p>
          </Reveal>

          <div className="mx-auto mt-10 max-w-[960px]">
            {ecosystemStages.map((stage, stageIndex) => {
              const outcome = stage.roles[0] === "resident";

              return (
                <div key={stage.number}>
                  <Reveal index={stageIndex}>
                    <div className="mb-4 flex items-center justify-center gap-3 text-center">
                      <span
                        className={cn(
                          "grid size-8 place-items-center rounded-full font-mono text-[10px] font-bold text-navy-950",
                          stage.node,
                        )}
                      >
                        {stage.number}
                      </span>
                      <h3 className="font-heading text-[17px] font-extrabold text-white sm:text-[18px]">
                        {stage.label}
                      </h3>
                    </div>

                    <div className={cn("grid gap-3", stage.columns)}>
                      {stage.roles.map((roleId) => (
                        <PartnerCard key={roleId} profile={getProfile(roleId)} outcome={outcome} />
                      ))}
                    </div>
                  </Reveal>

                  {stageIndex < ecosystemStages.length - 1 ? <FlowConnector /> : null}
                </div>
              );
            })}
          </div>

          <Reveal className="mx-auto mt-10 max-w-[820px] border-t border-navy-600 pt-8">
            <div className="flex flex-col items-center justify-between gap-6 text-center sm:flex-row sm:text-left">
              <div>
                <p className="font-heading text-[20px] font-extrabold text-white">
                  Select any partner to explore its role.
                </p>
                <div className="mt-3 flex flex-wrap justify-center gap-x-5 gap-y-2 sm:justify-start">
                  <span className="inline-flex items-center gap-2 text-[11px] text-slate-muted">
                    <i className="size-2 rounded-full bg-teal-500" /> Need and delivery
                  </span>
                  <span className="inline-flex items-center gap-2 text-[11px] text-slate-muted">
                    <i className="size-2 rounded-full bg-orange-500" /> Property and capital
                  </span>
                  <span className="inline-flex items-center gap-2 text-[11px] text-slate-muted">
                    <i className="size-2 rounded-full bg-navy-900" /> Person and outcome
                  </span>
                </div>
              </div>
              <Button variant="primary" asChild>
                <Link to="/contact" search={{ enquiry: "partner", type: "partner" }}>
                  Talk to the team
                </Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}

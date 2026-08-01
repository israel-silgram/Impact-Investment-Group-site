import { Link } from "@tanstack/react-router";
import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";

import heroProvidingHomes from "@/assets/hero-1-providing-homes.png.asset.json";
import heroDeliveringSupport from "@/assets/hero-2-delivering-support.png.asset.json";
import heroTransformingLives from "@/assets/hero-3-transforming-lives.png.asset.json";
import { registerRoles } from "@/content/audiences";
import { cn } from "@/lib/utils";

/**
 * HomeHero — the approved Mock-up 1 composition: three headlines, three
 * photographs, a "Register as" divider and ten role cards. No buttons, no
 * statistics, no scroll indicator. The role cards are the call to action.
 */

const headlines = [
  { id: "homes", text: "Providing Homes", orange: false },
  { id: "support", text: "Delivering Support", orange: true },
  { id: "lives", text: "Transforming Lives", orange: false },
] as const;

const photos = [
  {
    id: "homes",
    src: heroProvidingHomes.url,
    alt: "An agent handing keys to a young couple outside a brick terrace",
  },
  {
    id: "support",
    src: heroDeliveringSupport.url,
    alt: "A carer sitting with an older woman in a warmly lit living room",
  },
  {
    id: "lives",
    src: heroTransformingLives.url,
    alt: "A family of four smiling outside their front door",
  },
] as const;

/**
 * Per-role icon treatment. Base glyph is white; where the mock-up picks out a
 * detail in orange — the coin, the flag, the hearts, the handshake — that one
 * element is rendered in orange-500 and nothing else is.
 */
const roleIcons: Record<
  string,
  { base: keyof typeof Icons; accent?: keyof typeof Icons; baseOrange?: boolean }
> = {
  investor: { base: "HandCoins", accent: "PoundSterling" },
  landlord: { base: "House" },
  developer: { base: "Construction" },
  "housing-association": { base: "House", accent: "Users" },
  "local-authority": { base: "Landmark", accent: "Flag" },
  "care-provider": { base: "HandHeart", accent: "Heart" },
  "support-provider": { base: "UsersRound" },
  "social-worker": { base: "UserRound", accent: "Heart" },
  broker: { base: "Handshake", baseOrange: true },
  resident: { base: "UserRound" },
};

const icon = (name?: keyof typeof Icons): LucideIcon =>
  name ? ((Icons as unknown as Record<string, LucideIcon>)[name] ?? Icons.Circle) : Icons.Circle;

function RoleIcon({ roleId }: { roleId: string }) {
  const spec = roleIcons[roleId] ?? { base: "Circle" as const };
  const Base = icon(spec.base);
  const Accent = spec.accent ? icon(spec.accent) : null;

  return (
    <span
      aria-hidden="true"
      className="relative grid size-14 shrink-0 place-items-center rounded-full border-[1.5px] border-white/28"
    >
      <Base
        size={26}
        strokeWidth={1.6}
        className={spec.baseOrange ? "text-orange-500" : "text-white"}
      />
      {Accent ? (
        <Accent
          size={13}
          strokeWidth={2}
          className="absolute bottom-1.5 right-1.5 text-orange-500"
        />
      ) : null}
    </span>
  );
}

export function HomeHero() {
  return (
    <section aria-labelledby="hero-heading" className="bg-navy-900">
      <div className="mx-auto w-full max-w-[1440px] px-5 pb-[88px] pt-16 sm:px-8">
        <h1 id="hero-heading" className="sr-only">
          Providing homes, delivering support, transforming lives
        </h1>

        {/* Row 1 — three headlines */}
        <div className="grid grid-cols-1 md:grid-cols-3">
          {headlines.map((line, i) => (
            <p
              key={line.id}
              className={cn(
                "px-4 py-3 text-center font-heading font-extrabold leading-tight tracking-[-0.02em] text-[28px] md:whitespace-nowrap md:text-[34px] lg:text-[48px]",
                i > 0 && "border-t border-white/22 md:border-t-0 md:border-l",
                line.orange ? "text-orange-500" : "text-white",
              )}
            >
              {line.text}
            </p>
          ))}
        </div>

        {/* Row 2 — three photographs */}
        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">
          {photos.map((photo) => (
            <img
              key={photo.id}
              src={photo.src}
              alt={photo.alt}
              width={1670}
              height={1044}
              sizes="(min-width: 768px) 33vw, 100vw"
              className="aspect-[16/10] w-full rounded-xl border border-white/14 object-cover"
            />
          ))}
        </div>

        {/* Row 3 — "Register as" divider */}
        <div className="mt-11 flex items-center justify-center gap-4">
          <span aria-hidden="true" className="h-0.5 w-16 bg-orange-500 sm:w-[90px]" />
          <p id="register-as" className="text-[15px] font-normal text-white">
            Register as
          </p>
          <span aria-hidden="true" className="h-0.5 w-16 bg-orange-500 sm:w-[90px]" />
        </div>

        {/* Row 4 — ten role cards */}
        <ul
          aria-labelledby="register-as"
          className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 wide:grid-cols-10"
        >
          {registerRoles.map((role) => {
            const className =
              "flex h-full min-h-11 flex-col items-center gap-3 rounded-xl border border-white/16 px-3 py-5 text-center transition-colors duration-200 hover:border-orange-500/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-400";
            const body = (
              <>
                <RoleIcon roleId={role.id} />
                <span className="text-[15px] font-semibold leading-snug text-white">
                  {role.label}
                </span>
                <span className="text-[13px] font-normal leading-[1.4] text-white/62">
                  {role.detail}
                </span>
              </>
            );
            return (
              <li key={role.id} className="h-full">
                {role.target.kind === "solutions" ? (
                  <Link to="/solutions" hash={role.target.hash} className={className}>
                    {body}
                  </Link>
                ) : (
                  <Link
                    to="/contact"
                    search={{ enquiry: role.target.enquiry }}
                    className={className}
                  >
                    {body}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * The role glyph, drawn identically in the hero and on /register.
 *
 * ⚠️ THIS MAP USED TO LIVE INSIDE hero.tsx. Wave 295 gave the wait list its
 * own picker page showing the same ten roles, and two copies of this map would
 * have drifted the first time anybody changed an icon: the hero would show a
 * landlord a house and the picker would show them something else, on two pages
 * one click apart. It is one map now, in one place.
 *
 * The treatment is the brand's: a 24px Lucide glyph centred in a ring, stroke
 * 1.6, white on navy, with EXACTLY ONE detail element in the accent colour and
 * never two. `accent` is that one element; `baseOrange` is for the roles whose
 * whole glyph is the accent (the handshake), where there is nothing to pick
 * out of it.
 *
 * The accents are orange because every one of them is a person, a heart or a
 * hand. Teal belongs to data, and there is no data in a role tile.
 */
export const roleIcons: Record<
  string,
  { base: keyof typeof Icons; accent?: keyof typeof Icons; baseOrange?: boolean }
> = {
  investor: { base: "HandCoins", accent: "PoundSterling" },
  landlord: { base: "House" },
  developer: { base: "HardHat" },
  "housing-association": { base: "House", accent: "Users" },
  "local-authority": { base: "Landmark", accent: "Flag" },
  "care-provider": { base: "HandHeart", accent: "Heart" },
  "support-provider": { base: "UsersRound" },
  "social-worker": { base: "UserRound", accent: "Heart" },
  broker: { base: "Handshake", baseOrange: true },
  resident: { base: "UserRound" },
};

/** Resolves a Lucide name to its component, falling back rather than throwing. */
export const icon = (name?: keyof typeof Icons): LucideIcon =>
  name ? ((Icons as unknown as Record<string, LucideIcon>)[name] ?? Icons.Circle) : Icons.Circle;

/**
 * The ring is 48px in the hero, where ten of them share one row, and 60px on
 * the picker, where the tile is the whole page and the brand spec's 60px fits.
 */
export function RoleIcon({ roleId, size = "sm" }: { roleId: string; size?: "sm" | "lg" }) {
  const spec = roleIcons[roleId] ?? { base: "Circle" as const };
  const Base = icon(spec.base);
  const Accent = spec.accent ? icon(spec.accent) : null;
  const large = size === "lg";

  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative grid shrink-0 place-items-center rounded-full border-[1.5px] border-white/28",
        large ? "size-[60px]" : "size-12",
      )}
    >
      <Base
        size={large ? 26 : 24}
        strokeWidth={1.6}
        className={spec.baseOrange ? "text-orange-500" : "text-white"}
      />
      {Accent ? (
        <Accent
          size={large ? 13 : 12}
          strokeWidth={2}
          className={cn(
            "absolute text-orange-500",
            large ? "bottom-1.5 right-1.5" : "bottom-1 right-1",
          )}
        />
      ) : null}
    </span>
  );
}

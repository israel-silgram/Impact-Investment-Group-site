import {
  ArrowLeftRight,
  Baby,
  BrainCircuit,
  Building2,
  ChartNoAxesColumn,
  Circle,
  CircleDollarSign,
  ClipboardList,
  Clock,
  Database,
  Flag,
  GitCompareArrows,
  Hammer,
  HandCoins,
  HandHeart,
  Handshake,
  HardHat,
  Heart,
  HeartHandshake,
  Home,
  House,
  Landmark,
  Map,
  MapPin,
  MessageSquareQuote,
  Network,
  PoundSterling,
  Search,
  Share2,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  TrendingUp,
  User,
  UserRound,
  UserRoundCheck,
  Users,
  UsersRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

/**
 * ── THE ICON REGISTRY ──────────────────────────────────────────
 *
 * Every Lucide glyph this site names IN CONTENT rather than in code, in one
 * explicit map, because a bundler cannot see through the alternative.
 *
 * ⚠ WHY THIS FILE EXISTS, WITH THE NUMBER. Six files did
 * `import * as Icons from "lucide-react"` and four of them then did
 * `Icons[someStringFromContent]`. A dynamic index into a namespace import is
 * the one shape Rollup has to give up on: any export might be reached, so it
 * keeps them all. `lucide-react` shipped as a **596KB chunk on every route**,
 * the largest single item in the home page's 3.37MB, for a site that draws
 * about sixty glyphs in total and names 38 of them from content.
 *
 * Found by the wave 414 phone pass, where 596KB of icons on a slow 4G
 * connection is most of a second before anything is readable.
 *
 * THE RULE. A glyph named by a STRING in `src/content` is listed here. A glyph
 * named in JSX is a named import in the file that draws it, as normal. Adding
 * a content icon means adding a line here, and that line is the whole price of
 * a bundle that contains what the site uses.
 *
 * The lookup falls back to `Circle` rather than throwing, which is what every
 * call site did before this file and is still the right answer: a missing
 * glyph is a content typo, and a page that renders with a plain ring is a
 * better way to find one than a page that does not render.
 */
export const ICONS: Record<string, LucideIcon> = {
  ArrowLeftRight,
  Baby,
  BrainCircuit,
  Building2,
  ChartNoAxesColumn,
  Circle,
  CircleDollarSign,
  ClipboardList,
  Clock,
  Database,
  Flag,
  GitCompareArrows,
  Hammer,
  HandCoins,
  HandHeart,
  Handshake,
  HardHat,
  Heart,
  HeartHandshake,
  Home,
  House,
  Landmark,
  Map,
  MapPin,
  MessageSquareQuote,
  Network,
  PoundSterling,
  Search,
  Share2,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  TrendingUp,
  User,
  UserRound,
  UserRoundCheck,
  Users,
  UsersRound,
};

/** Resolve a content-supplied name to its component. */
export function iconByName(name?: string): LucideIcon {
  return (name ? ICONS[name] : undefined) ?? Circle;
}

/** The names this registry knows, for a content check that wants to assert. */
export type RegisteredIconName = keyof typeof ICONS;

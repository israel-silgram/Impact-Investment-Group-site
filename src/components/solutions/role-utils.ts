import * as React from "react";
import {
  Building2,
  CircleDollarSign,
  HardHat,
  Hammer,
  Handshake,
  HeartHandshake,
  Home,
  Landmark,
  type LucideIcon,
} from "lucide-react";
import type { RoleSlug } from "@/content/solutions";

export const roleIcons: Record<RoleSlug, LucideIcon> = {
  "local-authorities": Landmark,
  "housing-associations": Building2,
  "care-support-providers": HeartHandshake,
  investors: CircleDollarSign,
  landlords: Home,
  developers: HardHat,
  "estate-agents": Handshake,
  contractors: Hammer,
};

/** Smooth scroll to a section and write the anchor into the URL. */
export function useAnchorScroll() {
  return React.useCallback((slug: string) => {
    const node = document.getElementById(slug);
    if (!node) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    node.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
    if (typeof window.history?.replaceState === "function") {
      window.history.replaceState(null, "", `#${slug}`);
    }
  }, []);
}

/** Marks the section currently in view, for the sticky rail. */
export function useActiveSection(slugs: string[]) {
  const [active, setActive] = React.useState(slugs[0] ?? "");

  React.useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible?.target.id) setActive(visible.target.id);
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: 0 },
    );
    for (const slug of slugs) {
      const node = document.getElementById(slug);
      if (node) observer.observe(node);
    }
    return () => observer.disconnect();
  }, [slugs.join("|")]);

  return active;
}

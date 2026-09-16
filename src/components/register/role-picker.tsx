import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";

import { RoleIcon } from "@/components/register/role-icon";
import { registerRoles } from "@/content/audiences";
import { cn } from "@/lib/utils";

/**
 * The ten tiles on /register.
 *
 * Same roles and same glyphs as the hero, drawn larger because here they are
 * the page rather than a strip under three photographs. R295-3 is explicit
 * that this page carries the heading, one line of lede and the tiles, and
 * nothing else: a second thing to look at on a chooser is a second thing to
 * hesitate over.
 *
 * The resident route has a centred, illuminated card of its own.
 */
export function RolePicker({ labelledBy }: { labelledBy: string }) {
  return (
    <ul aria-labelledby={labelledBy} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {registerRoles.map((role) => (
        <li
          key={role.id}
          className={cn(
            "flex",
            role.id === "resident" && "relative mt-6 justify-center sm:col-span-2 lg:col-span-3",
          )}
        >
          <Link
            to="/register/$role"
            params={{ role: role.id }}
            className={cn(
              "group flex min-h-11 w-full items-center gap-4 rounded-[14px] border bg-navy-800/60 p-5 text-left transition-all duration-200 ease-out",
              "motion-safe:hover:-translate-y-0.5 hover:bg-navy-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-400",
              role.tone === "route-out"
                ? "registration-resident max-w-[540px] justify-center gap-5 border-teal-400 px-6 py-7 sm:py-8"
                : "border-navy-700 hover:border-orange-500/70",
            )}
          >
            <RoleIcon roleId={role.id} size="lg" />
            <span className="flex min-w-0 flex-col gap-1">
              <span className="font-heading text-[19px] font-semibold leading-snug text-white">
                {role.label}
              </span>
              <span className="text-[14px] leading-[1.45] text-mist">{role.detail}</span>
            </span>
            {role.id === "resident" && (
              <ArrowUpRight
                aria-hidden="true"
                className="ml-auto size-6 shrink-0 text-teal-400 transition-transform motion-safe:group-hover:-translate-y-1 motion-safe:group-hover:translate-x-1"
              />
            )}
          </Link>
        </li>
      ))}
    </ul>
  );
}

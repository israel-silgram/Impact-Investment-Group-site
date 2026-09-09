import { Link } from "@tanstack/react-router";

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
 * The resident tile keeps its teal ring. It is a way out of a page built for
 * organisations, not another pitch, and it has to look different to be one.
 */
export function RolePicker({ labelledBy }: { labelledBy: string }) {
  return (
    <ul aria-labelledby={labelledBy} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {registerRoles.map((role) => (
        <li key={role.id} className="flex">
          <Link
            to="/register/$role"
            params={{ role: role.id }}
            className={cn(
              "group flex min-h-11 w-full items-center gap-4 rounded-[14px] border bg-navy-800/60 p-5 text-left transition-all duration-200 ease-out",
              "hover:-translate-y-0.5 hover:bg-navy-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-400",
              role.tone === "route-out"
                ? "border-teal-600 hover:border-teal-500"
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
          </Link>
        </li>
      ))}
    </ul>
  );
}

import * as React from "react";
import { Link } from "@tanstack/react-router";
import { HandHeart } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { RegisterRoleContent } from "@/content/register";

/**
 * What the page becomes once the answers are away.
 *
 * Three jobs and no more: say it arrived, say what happens next, and offer the
 * ONE other thing worth doing. That one thing is /platform, because somebody
 * who has just told us what they need is the person most likely to want to
 * read what is being built. It is a secondary action, not a second orange one:
 * the page's orange action has already been taken.
 *
 * `next` is deliberately not a tick list. The brand rule is that a tick is an
 * icon, and the site replaced every checkmark with one; these are numbered
 * because they happen in order.
 *
 * ── HOW ANYBODY NOT LOOKING AT THE SCREEN FINDS OUT ───────────────────────
 *
 * ⚠️ THIS PANEL REPLACES THE FORM IN PLACE, so nothing navigates and nothing
 * announces. Without the two things below, a screen-reader user pressed
 * submit, heard silence, and had no way to know whether it sent; a keyboard
 * user's focus was on a button that no longer exists, which drops focus to the
 * top of the document.
 *
 *   `role="status"` on the region that carries the heading and the body, so
 *   the outcome is read out when it appears. Status and not `alert`: this is
 *   good news, and `alert` is assertive enough to cut off whatever is being
 *   read at the time.
 *
 *   `tabIndex={-1}` plus a focus() in an effect, so the keyboard lands on the
 *   panel rather than nowhere, and the next Tab goes to the one action here.
 */
export function SuccessState({ role }: { role: RegisterRoleContent }) {
  const panel = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    panel.current?.focus();
  }, []);

  return (
    <div
      ref={panel}
      tabIndex={-1}
      className="rounded-[var(--radius-panel)] border border-teal-600 bg-teal-950 p-6 sm:p-8 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-400"
    >
      <div role="status">
        <span className="grid size-11 place-items-center rounded-full border border-teal-500">
          {/* Affirmation, not a tick. The heading already says it arrived. */}
          <HandHeart aria-hidden="true" className="size-5 text-teal-400" />
        </span>

        <h2 className="mt-5 font-heading text-[26px] font-bold text-white">
          {role.success.heading}
        </h2>
        <p className="measure mt-3 text-[15px] leading-relaxed text-mist">{role.success.body}</p>
      </div>

      <p className="eyebrow mt-8 text-teal-400">What happens next</p>
      <ol className="mt-4 flex flex-col gap-3">
        {role.success.next.map((line, index) => (
          <li key={line} className="flex items-start gap-3">
            <span
              aria-hidden="true"
              className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border border-teal-600 font-mono text-[11px] font-bold text-teal-400"
            >
              {index + 1}
            </span>
            <span className="text-[15px] leading-relaxed text-mist">{line}</span>
          </li>
        ))}
      </ol>

      <div className="mt-8">
        <Button variant="secondary" asChild withArrow={false}>
          <Link to="/platform">See what we are building</Link>
        </Button>
      </div>
    </div>
  );
}

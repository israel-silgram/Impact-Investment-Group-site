import * as React from "react";
import { Minus, Plus } from "lucide-react";
import * as Accordion from "@radix-ui/react-accordion";
import { cn } from "@/lib/utils";

export interface DisclosureItem {
  id: string;
  question: string;
  answer: React.ReactNode;
}

/**
 * Accordion for FAQs and method sections.
 *
 * ── WAVE 413: THREE THINGS, AND ALL THREE ARE ABOUT NOT LOSING YOUR PLACE ─
 *
 * 1. THE ROW TAKES 250ms rather than the library's 200, on the site's own
 *    easing. The height is one of this wave's two exceptions to
 *    transform-and-opacity, and it is not a choice: a disclosure has to push
 *    what is under it down the page, that IS the animation, and no transform
 *    moves the rest of the document. One property, one element, only while
 *    somebody is pressing a row.
 *
 * 2. THE MARKER TURNS. Plus and Minus used to be swapped with `hidden` and
 *    `block`, which is a state change with no motion in it whatsoever: on a
 *    row you have just pressed, the one thing that should confirm the press
 *    was the only thing that did not move. They cross-fade through 180 degrees
 *    over the same 250ms now, so the row and its marker are one gesture. Both
 *    glyphs are always painted and opacity picks between them, so there is no
 *    state in which the marker is missing.
 *
 * 3. THE ROW YOU OPENED STAYS WHERE YOU CAN SEE IT. Opening a row further down
 *    a long list grows the document above wherever the browser had settled,
 *    and the row you pressed can end up behind the sticky header. If its
 *    trigger has gone above the condensed bar once the row is open, it is
 *    scrolled back to just under it. Only then: a row that is already visible
 *    is never moved, because moving a page nobody asked to move is worse than
 *    the problem.
 */

/** The row's own duration, in ms. Must match --duration-enter in styles.css. */
const ROW_MS = 250;
/**
 * The bar's height, in px, read off the page rather than copied.
 *
 * WAVE 414: this was a hard 56, matching a `--header-height-condensed` that no
 * longer exists. The bar is static now and 56 on a phone but 72 from 640px, so
 * a constant would be wrong at one width or the other. The live element is the
 * only thing that knows, and a sticky bar at the top of the document is
 * exactly what `getBoundingClientRect().height` is cheap to ask.
 */
const HEADER_FALLBACK = 56;

function headerHeight(): number {
  const bar = document.querySelector("header");
  return bar ? bar.getBoundingClientRect().height : HEADER_FALLBACK;
}
/** Breathing room between the bar and the row it would otherwise hide. */
const CLEARANCE = 12;

export function Disclosure({ items, className }: { items: DisclosureItem[]; className?: string }) {
  const root = React.useRef<HTMLDivElement | null>(null);
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const keepInView = (value: string) => {
    // Closing a row never moves anything: the document only shrinks below the
    // row, so whatever you were reading stays where it was.
    if (!value) return;
    if (timer.current) clearTimeout(timer.current);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    timer.current = setTimeout(
      () => {
        timer.current = null;
        const trigger = root.current?.querySelector<HTMLElement>(
          `[data-disclosure-trigger="${value}"]`,
        );
        if (!trigger) return;
        const top = trigger.getBoundingClientRect().top;
        const floor = headerHeight() + CLEARANCE;
        if (top >= floor) return;
        window.scrollBy({ top: top - floor, behavior: reduced ? "auto" : "smooth" });
      },
      reduced ? 0 : ROW_MS,
    );
  };

  return (
    <div ref={root}>
      <Accordion.Root
        type="single"
        collapsible
        onValueChange={keepInView}
        className={cn("w-full", className)}
      >
        {items.map((item) => (
          <Accordion.Item
            key={item.id}
            value={item.id}
            className="border-b border-rule first:border-t"
          >
            <Accordion.Header className="m-0">
              <Accordion.Trigger
                data-disclosure-trigger={item.id}
                className="group flex min-h-[56px] w-full cursor-pointer items-center justify-between gap-4 py-4 text-left font-heading text-base font-semibold text-ink transition-colors duration-200 hover:text-ink-muted"
              >
                <span className="min-w-0">{item.question}</span>
                <span
                  aria-hidden="true"
                  className="disclosure-marker relative grid size-6 shrink-0 place-items-center"
                >
                  <Plus data-mark="closed" className="size-5 text-teal-600" />
                  <Minus data-mark="open" className="size-5 text-teal-600" />
                </span>
              </Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content className="disclosure-content overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
              <div className="measure pb-5 text-sm leading-relaxed text-ink-muted">
                {item.answer}
              </div>
            </Accordion.Content>
          </Accordion.Item>
        ))}
      </Accordion.Root>
    </div>
  );
}

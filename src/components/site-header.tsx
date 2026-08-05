import * as React from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";

import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { primaryNav, registerRoute } from "@/content/site";
import { cn } from "@/lib/utils";

/**
 * The platform itself is not open yet, so "Log in" lands on the same
 * registration route until a real sign-in destination exists.
 */
const loginSearch = { enquiry: "waitlist", type: "waitlist" } as const;

export function SiteHeader() {
  const [scrolled, setScrolled] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const panelRef = React.useRef<HTMLDivElement | null>(null);
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);

  const [overLight, setOverLight] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 8);
      // Context-aware chrome: the header never inverts to white — the logo and
      // the orange action need the dark ground — but it gains a slate rule when
      // the section beneath it is a light one, so it does not float.
      const below = document.elementFromPoint(window.innerWidth / 2, 84);
      setOverLight(Boolean(below?.closest(".section-light")));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // Close on route change.
  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Focus trap + escape while the overlay is open.
  React.useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    document.body.style.overflow = "hidden";
    const focusables = () =>
      Array.from(
        panel?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      );
    focusables()[0]?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
        return;
      }
      if (event.key !== "Tab") return;
      const items = focusables();
      if (items.length === 0) return;
      const first = items[0]!;
      const last = items[items.length - 1]!;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 bg-navy-900/92 backdrop-blur-md transition-colors duration-200",
        overLight
          ? "border-b border-[color-mix(in_oklab,var(--color-slate)_25%,transparent)]"
          : scrolled
            ? "border-b border-navy-700"
            : "border-b border-transparent",
      )}
    >
      <div className="mx-auto flex min-h-[76px] w-full max-w-[1440px] items-center justify-between gap-4 px-5 sm:px-8">
        <Link to="/" className="shrink-0 rounded-md" aria-label="Impact Investment Platform — home">
          <Logo variant="on-navy" />
        </Link>

        <nav aria-label="Main" className="hidden xl:block">
          <ul className="flex items-center gap-7">
            {primaryNav.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  activeOptions={{ exact: true }}
                  className="nav-link inline-flex min-h-11 items-center whitespace-nowrap text-[15px] font-medium text-white transition-colors duration-200"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden items-center gap-5 xl:flex">
          <Button variant="primary" size="sm" asChild withArrow={false}>
            <Link to={registerRoute.to} search={registerRoute.search}>
              {registerRoute.label}
            </Link>
          </Button>
          <Link
            to="/contact"
            search={loginSearch}
            className="inline-flex min-h-11 items-center whitespace-nowrap text-[15px] font-normal text-mist transition-colors duration-200 hover:text-white"
          >
            Log in
          </Link>
        </div>

        <button
          ref={triggerRef}
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="inline-grid size-11 cursor-pointer place-items-center rounded-full border border-navy-600 text-white transition-colors duration-200 hover:bg-navy-800 xl:hidden"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open ? (
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
          className="fixed inset-0 top-0 z-50 flex flex-col bg-navy-950 px-5 pb-8 pt-6 xl:hidden"
        >
          <div className="flex items-center justify-between">
            <Logo variant="on-navy" />
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => {
                setOpen(false);
                triggerRef.current?.focus();
              }}
              className="inline-grid size-11 cursor-pointer place-items-center rounded-full border border-navy-600 text-white"
            >
              <X className="size-5" />
            </button>
          </div>

          <nav aria-label="Mobile" className="mt-12 flex-1">
            <ul className="flex flex-col gap-7">
              {primaryNav.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    activeOptions={{ exact: true }}
                    className="font-heading text-[28px] font-semibold text-white data-[status=active]:text-orange-500"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex flex-col items-center gap-5">
            <Button variant="primary" asChild className="w-full" withArrow={false}>
              <Link to={registerRoute.to} search={registerRoute.search}>
                {registerRoute.label}
              </Link>
            </Button>
            <Link
              to="/contact"
              search={loginSearch}
              className="inline-flex min-h-11 items-center text-[15px] font-normal text-mist"
            >
              Log in
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}

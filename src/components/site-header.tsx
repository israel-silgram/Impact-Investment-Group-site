import * as React from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronDown, Menu, X } from "lucide-react";

import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { partnerProfiles } from "@/content/partners";
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
  const [partnersOpen, setPartnersOpen] = React.useState(false);
  const [mobilePartnersOpen, setMobilePartnersOpen] = React.useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const panelRef = React.useRef<HTMLDivElement | null>(null);
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);
  const partnersCloseTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const openPartnersMenu = () => {
    if (partnersCloseTimerRef.current) clearTimeout(partnersCloseTimerRef.current);
    setPartnersOpen(true);
  };

  const schedulePartnersMenuClose = () => {
    if (partnersCloseTimerRef.current) clearTimeout(partnersCloseTimerRef.current);
    partnersCloseTimerRef.current = setTimeout(() => setPartnersOpen(false), 220);
  };

  React.useEffect(() => {
    // WAVE 412: the header is light on every route, so it no longer has to
    // ask what is under it. The probe that used to run here read
    // elementFromPoint on every scroll frame to decide whether to draw a rule;
    // the rule is now always there, and the only thing scroll changes is the
    // shadow that lifts the bar off the content sliding beneath it.
    const onScroll = () => {
      setScrolled(window.scrollY > 8);
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
    setPartnersOpen(false);
    setMobilePartnersOpen(false);
  }, [pathname]);

  React.useEffect(
    () => () => {
      if (partnersCloseTimerRef.current) clearTimeout(partnersCloseTimerRef.current);
    },
    [],
  );

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
    /*
     * WAVE 412: A LIGHT HEADER.
     *
     * White at 92% with a blur behind it, so the page reads through the bar
     * as it scrolls rather than hiding under a navy slab. The 8% that is not
     * white is what makes the blur visible at all; at 100% there is nothing
     * to see through. `supports-[backdrop-filter]` keeps the bar opaque on
     * browsers that cannot blur, where 92% white over moving content is
     * simply muddy.
     *
     * The rule underneath is permanent. It is the only thing separating a
     * white bar from a white page, so it cannot be a scroll state.
     */
    <header
      className={cn(
        "sticky top-0 z-50 border-b border-rule bg-header transition-shadow duration-200",
        "supports-[backdrop-filter]:backdrop-blur-md",
        scrolled && "shadow-[var(--shadow-card)]",
      )}
    >
      <div className="mx-auto flex min-h-[76px] w-full max-w-[1440px] items-center justify-between gap-4 px-5 sm:px-8">
        <Link to="/" className="shrink-0 rounded-md" aria-label="Impact Investment Platform — home">
          <Logo variant="on-cream" />
        </Link>

        <nav aria-label="Main" className="hidden self-stretch xl:block">
          <ul className="flex h-full items-center gap-7">
            {primaryNav.map((item) => (
              <React.Fragment key={item.to}>
                {item.to === "/partners" ? (
                  <li
                    className="flex h-full items-center"
                    onMouseEnter={openPartnersMenu}
                    onMouseLeave={schedulePartnersMenuClose}
                  >
                    <DropdownMenu modal={false} open={partnersOpen} onOpenChange={setPartnersOpen}>
                      <DropdownMenuTrigger asChild>
                        <Link
                          to="/partners"
                          className={cn(
                            "nav-link inline-flex h-full cursor-pointer items-center gap-1.5 whitespace-nowrap text-[15px] font-medium text-ink transition-colors duration-200",
                            /* orange-700, not 500: this is 15px TEXT on a
                               white bar, where 500 is 4.23:1 and 700 is
                               6.50:1. The underline under it stays 500,
                               because a 2px rule is a graphic and answers to
                               3:1 rather than 4.5:1. */
                            (pathname === "/partners" || pathname.startsWith("/partner-with-")) &&
                              "text-orange-700",
                          )}
                        >
                          Partners
                          <ChevronDown
                            aria-hidden="true"
                            className={cn(
                              "size-3.5 transition-transform",
                              partnersOpen && "rotate-180",
                            )}
                          />
                        </Link>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="center"
                        sideOffset={0}
                        onMouseEnter={openPartnersMenu}
                        onMouseLeave={schedulePartnersMenuClose}
                        className="w-[660px] rounded-none border-x border-b border-t-2 border-x-rule border-b-rule border-t-orange-500 bg-page p-0 text-ink shadow-[var(--shadow-card-hover)]"
                      >
                        <div className="flex items-center justify-between border-b border-rule px-5 py-3.5">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-teal-600">
                            Partners
                          </p>
                          <span className="font-mono text-[9px] uppercase tracking-[0.08em] text-ink-soft">
                            10 partner pathways
                          </span>
                        </div>

                        <div className="grid grid-cols-[250px_1fr]">
                          <div className="flex min-h-[360px] flex-col bg-orange-600 p-6 text-white">
                            <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.13em]">
                              One network
                            </p>
                            <div className="mt-auto">
                              <p className="font-heading text-[34px] font-extrabold leading-none">
                                Find where you fit.
                              </p>
                              <p className="mt-3 max-w-[25ch] text-[12px] font-medium leading-relaxed">
                                Explore each partner pathway or start with the full ecosystem.
                              </p>
                              <DropdownMenuItem
                                asChild
                                className="mt-5 cursor-pointer rounded-none p-0 text-page focus:bg-ink focus:text-page"
                              >
                                {/* The one navy left on this bar, and it is
                                    deliberate: a navy button inside the orange
                                    feature block. White on navy-900 is
                                    18.83:1, and nothing lighter would separate
                                    from the orange behind it. */}
                                <Link
                                  to="/partners"
                                  className="group flex min-h-12 w-full items-center gap-3 bg-ink px-4 py-3 text-page transition-colors hover:bg-navy-800"
                                >
                                  <NetworkMark />
                                  <span className="text-[13px] font-semibold">
                                    Explore the ecosystem
                                  </span>
                                  <ArrowMark />
                                </Link>
                              </DropdownMenuItem>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 content-start gap-0.5 p-3">
                            {partnerProfiles.map((partner, index) => (
                              <DropdownMenuItem
                                key={partner.id}
                                asChild
                                className="cursor-pointer rounded-none p-0 focus:bg-page-alt focus:text-ink"
                              >
                                <Link
                                  to={partner.path}
                                  className={cn(
                                    "group relative flex min-h-14 w-full items-center gap-2.5 px-3 py-2 text-[12px] font-semibold leading-tight text-ink-muted transition-colors hover:bg-page-alt hover:text-ink",
                                    pathname === partner.path &&
                                      "bg-page-alt text-ink before:absolute before:inset-y-2 before:left-0 before:w-0.5 before:bg-orange-500",
                                  )}
                                >
                                  <span className="w-5 shrink-0 font-mono text-[9px] text-orange-700">
                                    {String(index + 1).padStart(2, "0")}
                                  </span>
                                  <span>{partner.label}</span>
                                  <ArrowMark />
                                </Link>
                              </DropdownMenuItem>
                            ))}
                          </div>
                        </div>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </li>
                ) : null}
                {item.to !== "/partners" ? (
                  <li>
                    <Link
                      to={item.to}
                      activeOptions={{ exact: true }}
                      className="nav-link inline-flex min-h-11 items-center whitespace-nowrap text-[15px] font-medium text-ink transition-colors duration-200"
                    >
                      {item.label}
                    </Link>
                  </li>
                ) : null}
              </React.Fragment>
            ))}
          </ul>
        </nav>

        <div className="hidden items-center gap-5 xl:flex">
          <Button variant="primary" size="sm" asChild withArrow={false}>
            <Link to={registerRoute.to}>{registerRoute.label}</Link>
          </Button>
          <Link
            to="/contact"
            search={loginSearch}
            className="inline-flex min-h-11 items-center whitespace-nowrap text-[15px] font-normal text-ink transition-colors duration-200 hover:text-orange-700"
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
          className="inline-grid size-11 cursor-pointer place-items-center rounded-full border border-rule text-ink transition-colors duration-200 hover:bg-page-alt xl:hidden"
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
          className="absolute inset-x-0 top-0 z-50 flex h-dvh flex-col bg-page px-5 pb-8 pt-6 xl:hidden"
        >
          <div className="flex items-center justify-between">
            <Logo variant="on-cream" />
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => {
                setOpen(false);
                triggerRef.current?.focus();
              }}
              className="inline-grid size-11 cursor-pointer place-items-center rounded-full border border-rule text-ink"
            >
              <X className="size-5" />
            </button>
          </div>

          <nav aria-label="Mobile" className="mt-8 min-h-0 flex-1 overflow-y-auto py-4">
            <ul className="flex flex-col gap-6">
              {primaryNav.map((item) => (
                <React.Fragment key={item.to}>
                  {item.to === "/partners" ? (
                    <li>
                      <button
                        type="button"
                        aria-expanded={mobilePartnersOpen}
                        aria-controls="mobile-partner-links"
                        onClick={() => setMobilePartnersOpen((value) => !value)}
                        className={cn(
                          "flex w-full items-center justify-between font-heading text-[28px] font-semibold text-ink",
                          (pathname === "/partners" || pathname.startsWith("/partner-with-")) &&
                            "text-orange-700",
                        )}
                      >
                        Partners
                        <ChevronDown
                          aria-hidden="true"
                          className={cn(
                            "size-5 transition-transform",
                            mobilePartnersOpen && "rotate-180",
                          )}
                        />
                      </button>
                      {mobilePartnersOpen ? (
                        <ol
                          id="mobile-partner-links"
                          className="mt-4 grid gap-1 border-l border-teal-600/35 pl-4"
                        >
                          <li>
                            <Link
                              to="/partners"
                              className="flex min-h-10 items-center gap-3 rounded-none px-2 text-[15px] font-semibold text-ink hover:bg-page-alt"
                            >
                              <NetworkMark />
                              Explore the ecosystem
                            </Link>
                          </li>
                          {partnerProfiles.map((partner, index) => (
                            <li key={partner.id}>
                              <Link
                                to={partner.path}
                                className="flex min-h-10 items-center gap-3 rounded-none px-2 text-[15px] font-semibold text-ink-muted hover:bg-page-alt hover:text-ink"
                              >
                                <span className="font-mono text-[10px] text-orange-700">
                                  {String(index + 1).padStart(2, "0")}
                                </span>
                                {partner.label}
                              </Link>
                            </li>
                          ))}
                        </ol>
                      ) : null}
                    </li>
                  ) : null}
                  {item.to !== "/partners" ? (
                    <li>
                      <Link
                        to={item.to}
                        activeOptions={{ exact: true }}
                        className="font-heading text-[28px] font-semibold text-ink data-[status=active]:text-orange-700"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ) : null}
                </React.Fragment>
              ))}
            </ul>
          </nav>

          <div className="flex flex-col items-center gap-5">
            <Button variant="primary" asChild className="w-full" withArrow={false}>
              <Link to={registerRoute.to}>{registerRoute.label}</Link>
            </Button>
            <Link
              to="/contact"
              search={loginSearch}
              className="inline-flex min-h-11 items-center text-[15px] font-normal text-ink"
            >
              Log in
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}

function ArrowMark() {
  return (
    <span aria-hidden="true" className="ml-auto text-[13px] text-teal-600">
      →
    </span>
  );
}

function NetworkMark() {
  return (
    <span
      aria-hidden="true"
      className="grid size-5 place-items-center border border-teal-600/45 text-[10px] text-teal-600"
    >
      10
    </span>
  );
}

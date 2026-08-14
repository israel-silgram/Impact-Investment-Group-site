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

  const [overLight, setOverLight] = React.useState(false);

  const openPartnersMenu = () => {
    if (partnersCloseTimerRef.current) clearTimeout(partnersCloseTimerRef.current);
    setPartnersOpen(true);
  };

  const schedulePartnersMenuClose = () => {
    if (partnersCloseTimerRef.current) clearTimeout(partnersCloseTimerRef.current);
    partnersCloseTimerRef.current = setTimeout(() => setPartnersOpen(false), 220);
  };

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
                            "nav-link inline-flex h-full cursor-pointer items-center gap-1.5 whitespace-nowrap text-[15px] font-medium text-white transition-colors duration-200",
                            (pathname === "/partners" || pathname.startsWith("/partner-with-")) &&
                              "text-orange-500",
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
                        className="w-[660px] rounded-none border-x border-b border-t-2 border-x-navy-600 border-b-navy-600 border-t-orange-500 bg-navy-950 p-0 text-white shadow-[0_28px_65px_rgba(0,0,0,0.42)]"
                      >
                        <div className="flex items-center justify-between border-b border-navy-700 px-5 py-3.5">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-teal-400">
                            Partners
                          </p>
                          <span className="font-mono text-[9px] uppercase tracking-[0.08em] text-slate-muted">
                            10 partner pathways
                          </span>
                        </div>

                        <div className="grid grid-cols-[250px_1fr]">
                          <div className="flex min-h-[360px] flex-col bg-orange-500 p-6 text-navy-950">
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
                                className="mt-5 cursor-pointer rounded-none p-0 text-white focus:bg-navy-800 focus:text-white"
                              >
                                <Link
                                  to="/partners"
                                  className="group flex min-h-12 w-full items-center gap-3 bg-navy-950 px-4 py-3 text-white transition-colors hover:bg-navy-800"
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
                                className="cursor-pointer rounded-none p-0 focus:bg-navy-800 focus:text-white"
                              >
                                <Link
                                  to={partner.path}
                                  className={cn(
                                    "group relative flex min-h-14 w-full items-center gap-2.5 px-3 py-2 text-[12px] font-semibold leading-tight text-mist transition-colors hover:bg-navy-800 hover:text-white",
                                    pathname === partner.path &&
                                      "bg-navy-800 text-white before:absolute before:inset-y-2 before:left-0 before:w-0.5 before:bg-orange-500",
                                  )}
                                >
                                  <span className="w-5 shrink-0 font-mono text-[9px] text-orange-500">
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
                      className="nav-link inline-flex min-h-11 items-center whitespace-nowrap text-[15px] font-medium text-white transition-colors duration-200"
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
          className="absolute inset-x-0 top-0 z-50 flex h-dvh flex-col bg-navy-950 px-5 pb-8 pt-6 xl:hidden"
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
                          "flex w-full items-center justify-between font-heading text-[28px] font-semibold text-white",
                          (pathname === "/partners" || pathname.startsWith("/partner-with-")) &&
                            "text-orange-500",
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
                          className="mt-4 grid gap-1 border-l border-teal-400/35 pl-4"
                        >
                          <li>
                            <Link
                              to="/partners"
                              className="flex min-h-10 items-center gap-3 rounded-none px-2 text-[15px] font-semibold text-white hover:bg-navy-800"
                            >
                              <NetworkMark />
                              Explore the ecosystem
                            </Link>
                          </li>
                          {partnerProfiles.map((partner, index) => (
                            <li key={partner.id}>
                              <Link
                                to={partner.path}
                                className="flex min-h-10 items-center gap-3 rounded-none px-2 text-[15px] font-semibold text-mist hover:bg-navy-800 hover:text-white"
                              >
                                <span className="font-mono text-[10px] text-orange-500">
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
                        className="font-heading text-[28px] font-semibold text-white data-[status=active]:text-orange-500"
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

function ArrowMark() {
  return (
    <span aria-hidden="true" className="ml-auto text-[13px] text-teal-400">
      →
    </span>
  );
}

function NetworkMark() {
  return (
    <span
      aria-hidden="true"
      className="grid size-5 place-items-center border border-teal-400/45 text-[10px] text-teal-400"
    >
      10
    </span>
  );
}

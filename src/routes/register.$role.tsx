import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import * as Icons from "lucide-react";
import { ArrowLeft, LifeBuoy } from "lucide-react";

import { RoleIcon, icon as resolveIcon } from "@/components/register/role-icon";
import { WaitlistForm } from "@/components/register/waitlist-form";
import { Reveal } from "@/components/ui/reveal";
import { getRegisterRole, residentUrgentNote } from "@/content/register";
import { crisisLines, crisisNote } from "@/content/site";

/**
 * /register/<role> — one page per role, asking that role its own questions.
 *
 * ONE h1, which is the role's own headline and not a field name. The offer
 * strip above the form is the argument for filling it in; the form is the
 * form. Everything either page says comes from content/register.ts.
 *
 * The resident page carries the crisis numbers above the questions. They are
 * in the footer of every page already, and they are here as well for the same
 * reason contact.tsx repeats them: this is a page somebody in difficulty can
 * land on, and a number they have to go looking for is a number they may not
 * find. That repetition is correct.
 */
export const Route = createFileRoute("/register/$role")({
  // The ten ids are a closed set. Anything else is a 404 rather than an empty
  // page, so a mistyped or retired link fails loudly instead of quietly.
  loader: ({ params }) => {
    const role = getRegisterRole(params.role);
    if (!role) throw notFound();
    return { role };
  },
  component: RegisterRolePage,
  head: ({ params }) => {
    const role = getRegisterRole(params.role);
    if (!role) return {};
    const title = `${role.h1} — The Impact Investment Platform`;
    const path = `/register/${role.id}`;
    return {
      meta: [
        { title },
        { name: "description", content: role.metaDescription },
        { property: "og:title", content: title },
        { property: "og:description", content: role.metaDescription },
        { property: "og:type", content: "website" },
        { property: "og:url", content: path },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: path }],
    };
  },
});

function OfferIcon({ name }: { name: string }) {
  const Glyph = resolveIcon(name as keyof typeof Icons);
  return (
    <span
      aria-hidden="true"
      className="grid size-11 shrink-0 place-items-center rounded-full border-[1.5px] border-white/28"
    >
      <Glyph size={20} strokeWidth={1.6} className="text-teal-400" />
    </span>
  );
}

function RegisterRolePage() {
  const { role } = Route.useLoaderData();

  return (
    <main>
      <section className="mx-auto w-full max-w-[1200px] px-5 py-12 sm:px-8 lg:py-20">
        <Reveal>
          <Link
            to="/register"
            className="inline-flex min-h-11 items-center gap-2 text-[14px] font-medium text-mist transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-400"
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            All roles
          </Link>

          <div className="mt-6 flex items-start gap-4">
            <RoleIcon roleId={role.id} size="lg" />
            <div className="min-w-0">
              <p className="eyebrow text-teal-400">{role.eyebrow}</p>
              <h1 className="heading-tight mt-3 text-balance text-[clamp(1.75rem,3.2vw,2.75rem)] font-bold text-white">
                {role.h1}
              </h1>
            </div>
          </div>

          <p className="measure mt-5 text-[17px] leading-relaxed text-mist">{role.lede}</p>
        </Reveal>

        {/* The offer. Teal, not orange: these are reasons, not the action. */}
        <Reveal index={1} className="mt-10">
          <ul className="grid gap-4 md:grid-cols-3">
            {role.offer.map((item) => (
              <li
                key={item.text}
                className="flex items-start gap-4 rounded-[14px] border border-navy-700 bg-navy-800/50 p-5"
              >
                <OfferIcon name={item.icon} />
                <span className="text-[15px] leading-relaxed text-mist">{item.text}</span>
              </li>
            ))}
          </ul>
        </Reveal>

        {role.id === "resident" ? (
          <Reveal index={2} className="mt-10">
            <aside className="rounded-[14px] border border-teal-600 bg-teal-950 p-5 sm:p-6">
              <div className="flex items-start gap-3">
                <LifeBuoy aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-teal-400" />
                <div>
                  <h2 className="font-heading text-[19px] font-semibold text-white">
                    {residentUrgentNote.heading}
                  </h2>
                  <p className="measure mt-2 text-[15px] leading-relaxed text-mist">
                    {residentUrgentNote.body}
                  </p>
                  <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
                    {crisisLines.map((line) => (
                      <li key={line.label} className="text-[15px] text-white">
                        <span className="font-semibold">{line.label}</span>{" "}
                        <span className="font-mono text-teal-400">{line.detail}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 text-[14px] font-semibold text-white">{crisisNote}</p>
                </div>
              </div>
            </aside>
          </Reveal>
        ) : null}

        <Reveal index={3} className="mt-12">
          <WaitlistForm role={role} />
        </Reveal>
      </section>
    </main>
  );
}

import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { ArrowLeft, LifeBuoy } from "lucide-react";

import { RoleIcon } from "@/components/register/role-icon";
import { RegistrationFlow } from "@/components/register/registration-flow";
import { getRegisterRole, residentUrgentNote } from "@/content/register";
import { crisisLines, crisisNote } from "@/content/site";

/**
 * /register/<role>: one page per role, asking that role its own questions.
 *
 * The flow owns the single h1 and shows account details before preferences.
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
    // A pipe, not an em dash. The rest of the site's titles use an em
    // dash and these two deliberately do not: this wave authors none.
    const title = `${role.h1} | The Impact Investment Platform`;
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

function RegisterRolePage() {
  const { role } = Route.useLoaderData();

  return (
    <div className="registration-page">
      <section className="mx-auto w-full max-w-[1040px] px-5 py-8 sm:px-8 lg:py-12">
        <div className="mx-auto mb-8 flex max-w-[820px] flex-wrap items-center justify-between gap-4">
          <Link
            to="/register"
            className="inline-flex min-h-11 items-center gap-2 text-[14px] font-medium text-mist transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-400"
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            All roles
          </Link>

          <div className="flex items-center gap-3">
            <RoleIcon roleId={role.id} />
            <p className="font-heading text-lg font-semibold text-white">{role.label}</p>
          </div>
        </div>

        {role.id === "resident" ? (
          <div className="mx-auto mb-8 max-w-[820px]">
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
          </div>
        ) : null}

        <RegistrationFlow key={role.id} role={role} />
      </section>
    </div>
  );
}

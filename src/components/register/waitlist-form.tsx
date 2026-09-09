import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { ConsentBlock } from "@/components/register/consent-block";
import { SuccessState } from "@/components/register/success-state";
import {
  contactFieldLabels,
  registerFailureLine,
  type RegisterQuestion,
  type RegisterRoleContent,
} from "@/content/register";
import { apiUrl } from "@/lib/api";
import { cn } from "@/lib/utils";

/**
 * The wait-list questionnaire. One component, ten roles: the questions come
 * from content/register.ts and nothing about a role is encoded here.
 *
 * ── WHAT IS REQUIRED, AND WHY SO LITTLE ───────────────────────────────────
 *
 * Name and email are required, because a wait list with no address on it is a
 * list of nobody. Organisation is required for the nine roles that have one,
 * because it is what makes a registration checkable. EVERY QUESTION ABOVE IS
 * OPTIONAL, deliberately. A half-answered registration is worth enormously
 * more than an abandoned one, and a required question a visitor cannot answer
 * on the spot ("how many placements a year?") is the one that loses them.
 *
 * The single exception is a coherence rule, not a gate: tick the text-me box
 * and leave the phone blank and the form asks for the number, because the
 * alternative is promising somebody a text we have no way to send.
 *
 * ── WHERE IT POSTS ────────────────────────────────────────────────────────
 *
 * Cross-origin to the platform backend, exactly like the contact form and for
 * the same reason: the deployed site is static, it has no server, and its own
 * /api file routes are absent from the build. See src/lib/api.ts.
 */

export interface WaitlistFormValues {
  name: string;
  email: string;
  organisation?: string;
  phone?: string;
  consentEmail: boolean;
  consentSms: boolean;
  /**
   * ⚠️ `unknown`, and NOT `string | string[]`, because that is not what
   * react-hook-form puts here. An untouched radio group reads back as `null`
   * and an untouched checkbox group as `false` or as an array with `false` in
   * every unticked slot. Typing this narrowly is what hid a bug that made the
   * form unsubmittable: the zod record rejected those values, the error landed
   * on `answers` where nothing renders it, and the submit button did nothing
   * at all. `buildWaitlistPayload` is the one place that narrows them.
   */
  answers: Record<string, unknown>;
}

/**
 * Lengths match the platform's site-enquiry model field for field, so a
 * submission that passes here cannot be a 422 there. `role` is not a free
 * field on this form: it comes from the URL segment and is one of ten ids.
 */
function schemaFor(role: RegisterRoleContent) {
  const organisation = role.askOrganisation
    ? z.string().trim().min(2, "Please name your organisation").max(150)
    : z.string().trim().max(150).optional();

  return z
    .object({
      name: z.string().trim().min(2, "Please give your full name").max(100),
      email: z.string().trim().email("Please use an email address we can reach you on").max(255),
      organisation,
      phone: z.string().trim().max(40, "That is longer than a phone number").optional(),
      consentEmail: z.boolean(),
      consentSms: z.boolean(),
      // Every question is optional, so this has to accept what an untouched
      // control reads back as: `null` from a radio group, `false` from a
      // checkbox, and `false` in the unticked slots of a checkbox array. The
      // lengths are the platform's; the browser caps them at the input too.
      answers: z
        .record(
          z.union([
            z.string().max(2000),
            z.array(z.union([z.string().max(300), z.boolean()])),
            z.boolean(),
            z.null(),
          ]),
        )
        .optional()
        .default({}),
    })
    .superRefine((values, ctx) => {
      if (values.consentSms && !values.phone?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["phone"],
          message: "Add a number so we can text you, or untick the text box.",
        });
      }
    });
}

/**
 * The wire payload. Blank answers are dropped rather than sent empty, so a
 * stored registration says what somebody actually told us and not which boxes
 * they walked past. Keys are the question ids from content/register.ts, which
 * are snake_case and stable; the envelope around them is camelCase, matching
 * the shape the site's existing enquiry POST already uses.
 */
export function buildWaitlistPayload(role: RegisterRoleContent, values: WaitlistFormValues) {
  const answers: Record<string, string | string[]> = {};

  for (const question of role.questions) {
    const value = values.answers?.[question.id];
    if (Array.isArray(value)) {
      // react-hook-form fills the unticked slots of a checkbox array with
      // `false`, so this drops everything that is not a real answer.
      const picked = value.filter(
        (entry): entry is string => typeof entry === "string" && entry !== "",
      );
      if (picked.length > 0) answers[question.id] = picked;
    } else if (typeof value === "string" && value.trim() !== "") {
      answers[question.id] = value.trim();
    }
  }

  const phone = values.phone?.trim();
  const organisation = values.organisation?.trim();

  return {
    role: role.id,
    name: values.name.trim(),
    email: values.email.trim(),
    ...(organisation ? { organisation } : {}),
    ...(phone ? { phone } : {}),
    answers,
    consentEmail: Boolean(values.consentEmail),
    consentSms: Boolean(values.consentSms),
    source: "site-register",
  };
}

const fieldClass =
  "min-h-11 w-full rounded-[10px] border border-navy-600 bg-navy-950 px-4 py-3 text-[15px] text-white placeholder:text-slate-muted focus-visible:border-teal-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-400";

const optionClass =
  "flex min-h-11 cursor-pointer items-start gap-3 rounded-[10px] border border-navy-700 bg-navy-950 px-4 py-3 text-[15px] leading-snug text-mist transition-colors hover:border-teal-500 has-checked:border-teal-500 has-checked:bg-teal-950";

function FieldLabel({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label
      htmlFor={htmlFor}
      className="font-heading text-sm font-semibold uppercase tracking-[0.08em] text-mist"
    >
      {children}
    </label>
  );
}

function ErrorText({ id, children }: { id: string; children?: string | undefined }) {
  if (!children) return null;
  return (
    <p id={id} role="alert" className="text-[13px] font-medium text-orange-400">
      {children}
    </p>
  );
}

/**
 * One question. `single` and `multi` are real radios and checkboxes rather
 * than a select, because a select hides its options and these options ARE the
 * question: a landlord who cannot see "guaranteed rent on a long lease" in the
 * list does not know it is on offer.
 */
function Question({
  question,
  register,
  tail,
}: {
  question: RegisterQuestion;
  register: ReturnType<typeof useForm<WaitlistFormValues>>["register"];
  /** Rendered inside this question's fieldset. See `tail` in content/register.ts. */
  tail?: React.ReactNode;
}) {
  const name = `answers.${question.id}` as const;
  const helpId = question.help ? `${question.id}-help` : undefined;

  if (question.kind === "single" || question.kind === "multi") {
    return (
      <fieldset>
        <legend className="font-heading text-[19px] font-semibold leading-snug text-white">
          {question.label}
        </legend>
        {question.help ? (
          <p id={helpId} className="mt-1.5 text-[14px] leading-relaxed text-slate-muted">
            {question.help}
          </p>
        ) : null}
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {(question.options ?? []).map((option) => (
            <label key={option} className={optionClass}>
              <input
                type={question.kind === "single" ? "radio" : "checkbox"}
                value={option}
                className="mt-0.5 size-4 shrink-0 accent-teal-500"
                aria-describedby={helpId}
                {...register(name)}
              />
              <span>{option}</span>
            </label>
          ))}
        </div>
        {tail ? <div className="mt-4">{tail}</div> : null}
      </fieldset>
    );
  }

  const inputId = `q-${question.id}`;
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={inputId}
        className={cn(
          "font-heading leading-snug",
          // A tail sits inside the question above it, so it is labelled like a
          // part of that question and not like another one. Same 19px weight
          // as a heading here and the page would read as seven questions
          // again, which is the whole thing the tail exists to avoid.
          question.tail
            ? "text-[15px] font-medium text-mist"
            : "text-[19px] font-semibold text-white",
        )}
      >
        {question.label}
      </label>
      {question.help ? (
        <p id={helpId} className="text-[14px] leading-relaxed text-slate-muted">
          {question.help}
        </p>
      ) : null}
      {question.kind === "textarea" ? (
        <textarea
          id={inputId}
          rows={4}
          maxLength={question.maxLength ?? 2000}
          placeholder={question.placeholder}
          aria-describedby={helpId}
          className={cn(fieldClass, "min-h-[110px] resize-y")}
          {...register(name)}
        />
      ) : (
        <input
          id={inputId}
          type="text"
          maxLength={question.maxLength ?? 200}
          placeholder={question.placeholder}
          aria-describedby={helpId}
          className={fieldClass}
          {...register(name)}
        />
      )}
    </div>
  );
}

export function WaitlistForm({ role }: { role: RegisterRoleContent }) {
  const [sent, setSent] = React.useState(false);
  const [failed, setFailed] = React.useState(false);

  const resolver = React.useMemo(
    () => zodResolver(schemaFor(role) as unknown as z.ZodType<WaitlistFormValues>),
    [role],
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<WaitlistFormValues>({
    resolver,
    defaultValues: {
      name: "",
      email: "",
      organisation: "",
      phone: "",
      // ⚠️ BOTH FALSE. Never pre-tick a consent: it is not a consent if it is.
      consentEmail: false,
      consentSms: false,
      answers: {},
    },
  });

  const onSubmit = async (values: WaitlistFormValues) => {
    setFailed(false);
    try {
      const res = await fetch(apiUrl("/public/waitlist"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildWaitlistPayload(role, values)),
      });
      if (!res.ok) throw new Error("Request failed");
      setSent(true);
    } catch {
      setFailed(true);
    }
  };

  if (sent) return <SuccessState role={role} />;

  return (
    <form
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      className="rounded-[var(--radius-panel)] border border-navy-700 bg-navy-800/50 p-5 sm:p-8"
    >
      <div className="flex flex-col gap-10">
        {role.questions
          .filter((question) => !question.tail)
          .map((question) => {
            // A tail question belongs to the block before it. Looked up in the
            // ORIGINAL list, so the pairing follows the content file's order
            // and not an index computed over the filtered one.
            const next = role.questions[role.questions.indexOf(question) + 1];
            const tailQuestion = next?.tail ? next : undefined;
            return (
              <Question
                key={question.id}
                question={question}
                register={register}
                tail={
                  tailQuestion ? (
                    <Question question={tailQuestion} register={register} />
                  ) : undefined
                }
              />
            );
          })}
      </div>

      <hr className="mt-10 border-navy-700" />

      <h2 className="mt-10 font-heading text-[19px] font-semibold text-white">
        Where do we reach you?
      </h2>

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <FieldLabel htmlFor="name">{contactFieldLabels.name}</FieldLabel>
          <input
            id="name"
            className={fieldClass}
            autoComplete="name"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "name-error" : undefined}
            {...register("name")}
          />
          <ErrorText id="name-error">{errors.name?.message}</ErrorText>
        </div>

        <div className="flex flex-col gap-2">
          <FieldLabel htmlFor="email">{contactFieldLabels.email}</FieldLabel>
          <input
            id="email"
            type="email"
            className={fieldClass}
            autoComplete="email"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : "email-help"}
            {...register("email")}
          />
          <p id="email-help" className="text-[13px] leading-snug text-slate-muted">
            {contactFieldLabels.emailHelp}
          </p>
          <ErrorText id="email-error">{errors.email?.message}</ErrorText>
        </div>

        {role.askOrganisation ? (
          <div className="flex flex-col gap-2">
            <FieldLabel htmlFor="organisation">{contactFieldLabels.organisation}</FieldLabel>
            <input
              id="organisation"
              className={fieldClass}
              autoComplete="organization"
              aria-invalid={!!errors.organisation}
              aria-describedby={errors.organisation ? "organisation-error" : "organisation-help"}
              {...register("organisation")}
            />
            <p id="organisation-help" className="text-[13px] leading-snug text-slate-muted">
              {role.organisationLabel}
            </p>
            <ErrorText id="organisation-error">{errors.organisation?.message}</ErrorText>
          </div>
        ) : null}

        <div className="flex flex-col gap-2">
          <FieldLabel htmlFor="phone">{contactFieldLabels.phone}</FieldLabel>
          <input
            id="phone"
            type="tel"
            className={fieldClass}
            autoComplete="tel"
            aria-invalid={!!errors.phone}
            aria-describedby={errors.phone ? "phone-error" : "phone-help"}
            {...register("phone")}
          />
          <p id="phone-help" className="text-[13px] leading-snug text-slate-muted">
            {contactFieldLabels.phoneHelp}
          </p>
          <ErrorText id="phone-error">{errors.phone?.message}</ErrorText>
        </div>
      </div>

      <div className="mt-8">
        <ConsentBlock register={register} />
      </div>

      <div className="mt-8 flex flex-col gap-4">
        <div>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? "Sending…" : role.submitLabel}
          </Button>
        </div>
        {failed ? (
          <p role="alert" className="text-[14px] font-medium text-orange-400">
            {registerFailureLine}
          </p>
        ) : null}
      </div>
    </form>
  );
}

import type { UseFormRegister } from "react-hook-form";

import { consentBlock, registerPrivacy } from "@/content/register";
import type { WaitlistFormValues } from "@/components/register/waitlist-form";

/**
 * The alerts invitation and the privacy line.
 *
 * ⚠️ NEITHER BOX IS REQUIRED AND NEITHER IS TICKED. The form submits with both
 * left alone and records neither, and there is no validation rule that could
 * ever stop it. That is the design, not an oversight: the answers above are
 * what this page exists to collect, and a person who does not want an email is
 * still a person whose answers we want. A pre-ticked box would also not be a
 * consent under UK GDPR, which is the other reason it will not be added later.
 *
 * The privacy line is not a link to a privacy notice, because the site does
 * not have one yet. See the note on `registerPrivacy` in content/register.ts.
 */
export function ConsentBlock({ register }: { register: UseFormRegister<WaitlistFormValues> }) {
  return (
    <fieldset className="rounded-[var(--radius-panel)] border border-navy-600 bg-navy-950 p-5 sm:p-6">
      <legend className="px-1 font-heading text-[17px] font-semibold text-white">
        {consentBlock.heading}
      </legend>
      <p className="mt-2 text-[14px] leading-relaxed text-slate-muted">{consentBlock.help}</p>

      <div className="mt-4 flex flex-col gap-2">
        <label
          htmlFor={consentBlock.email.id}
          className="flex min-h-11 cursor-pointer items-start gap-3 rounded-[10px] border border-navy-700 p-4 text-[15px] leading-relaxed text-mist transition-colors hover:border-teal-500 has-checked:border-teal-500 has-checked:bg-teal-950"
        >
          <input
            id={consentBlock.email.id}
            type="checkbox"
            className="mt-1 size-4 shrink-0 accent-teal-500"
            {...register("consentEmail")}
          />
          <span>{consentBlock.email.label}</span>
        </label>

        <label
          htmlFor={consentBlock.sms.id}
          className="flex min-h-11 cursor-pointer items-start gap-3 rounded-[10px] border border-navy-700 p-4 text-[15px] leading-relaxed text-mist transition-colors hover:border-teal-500 has-checked:border-teal-500 has-checked:bg-teal-950"
        >
          <input
            id={consentBlock.sms.id}
            type="checkbox"
            className="mt-1 size-4 shrink-0 accent-teal-500"
            {...register("consentSms")}
          />
          <span>{consentBlock.sms.label}</span>
        </label>
      </div>

      <p className="mt-5 text-[13px] leading-relaxed text-slate-muted">
        {registerPrivacy.body}{" "}
        <a
          href={registerPrivacy.href}
          target="_blank"
          rel="noreferrer"
          className="text-teal-400 underline underline-offset-4 hover:text-white"
        >
          {registerPrivacy.linkLabel}
        </a>
      </p>
    </fieldset>
  );
}

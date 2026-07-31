import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CalendarClock, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  previewSlots,
  entityTypeOptions,
  enquiryRoutes,
  investorAcknowledgement,
  privacyLine,
  roleOptions,
  ticketSizeOptions,
  type EnquiryRouteId,
} from "@/content/contact";

/**
 * One form for all six enquiry routes. The selected route changes the fields,
 * the routing and the promised reply time — there are no separate forms.
 */

const base = {
  name: z.string().trim().min(2, "Please give your full name").max(100),
  email: z
    .string()
    .trim()
    .email("Use a valid work email address")
    .max(255),
  organisation: z.string().trim().min(2, "Please name your organisation").max(150),
  role: z.string().trim().min(1, "Please select your role"),
};

function schemaFor(route: EnquiryRouteId) {
  const message = z
    .string()
    .trim()
    .min(10, "Please give us a little more detail")
    .max(2000);

  switch (route) {
    case "investor":
      return z.object({
        ...base,
        ticketSize: z.string().trim().min(1, "Please choose a ticket size"),
        acknowledgement: z.literal(true, {
          errorMap: () => ({ message: "Please confirm you understand the risk statement" }),
        }),
      });
    case "partner":
      return z.object({
        ...base,
        message,
        holdings: z
          .string()
          .trim()
          .min(10, "Tell us what you hold or what you need")
          .max(2000),
        entityType: z.string().trim().min(1, "Please choose an entity type"),
      });
    case "media":
      return z.object({
        ...base,
        message,
        deadline: z.string().trim().min(1, "Please give your deadline"),
      });
    case "waitlist":
      return z.object({ ...base, message, slot: z.string().optional() });
    default:
      return z.object({ ...base, message });
  }
}

type FormValues = {
  name: string;
  email: string;
  organisation: string;
  role: string;
  message?: string;
  slot?: string;
  ticketSize?: string;
  acknowledgement?: boolean;
  holdings?: string;
  entityType?: string;
  deadline?: string;
};

const fieldClass =
  "min-h-11 w-full rounded-[10px] border border-navy-600 bg-navy-950 px-4 py-3 text-sm text-white placeholder:text-slate-muted focus-visible:border-teal-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-400";

function Label({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
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

export function EnquiryForm({
  route,
  prefilledRole,
}: {
  route: EnquiryRouteId;
  prefilledRole?: string;
}) {
  const config = enquiryRoutes.find((r) => r.id === route) ?? enquiryRoutes[0]!;
  const [sent, setSent] = React.useState(false);
  const [failed, setFailed] = React.useState(false);

  const resolver = React.useMemo(
    () => zodResolver(schemaFor(route) as unknown as z.ZodType<FormValues>),
    [route],
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver,
    defaultValues: { role: prefilledRole ?? "" },
  });

  // Changing route changes the field set; clear stale errors but keep identity.
  React.useEffect(() => {
    setSent(false);
    setFailed(false);
  }, [route]);

  const onSubmit = async (values: FormValues) => {
    setFailed(false);
    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, route, routedTo: config.routedTo }),
      });
      if (!res.ok) throw new Error("Request failed");
      setSent(true);
      reset({ role: prefilledRole ?? "" });
    } catch {
      setFailed(true);
    }
  };

  if (sent) {
    return (
      <div className="rounded-[var(--radius-panel)] border border-teal-600 bg-teal-950 p-8">
        <span className="grid size-11 place-items-center rounded-full border border-teal-500">
          <Check aria-hidden="true" className="size-5 text-teal-400" />
        </span>
        <h3 className="mt-5 font-heading text-xl font-bold text-white">Enquiry received</h3>
        <p className="measure mt-3 text-sm leading-relaxed text-mist">
          Routed to our {config.routedTo.toLowerCase()}. {config.reply}.
        </p>
        <div className="mt-6">
          <Button variant="secondary" onClick={() => setSent(false)}>
            Send another enquiry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      className="rounded-[var(--radius-panel)] border border-navy-700 bg-navy-800/50 p-6 sm:p-8"
    >
      <p className="eyebrow text-teal-400">{config.label}</p>
      <p className="mt-2 text-sm text-slate-muted">
        Routed to our {config.routedTo.toLowerCase()} · {config.reply.toLowerCase()}
      </p>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="name">Name</Label>
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
          <Label htmlFor="email">Work email</Label>
          <input
            id="email"
            type="email"
            className={fieldClass}
            autoComplete="email"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined}
            {...register("email")}
          />
          <ErrorText id="email-error">{errors.email?.message}</ErrorText>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="organisation">Organisation</Label>
          <input
            id="organisation"
            className={fieldClass}
            autoComplete="organization"
            aria-invalid={!!errors.organisation}
            aria-describedby={errors.organisation ? "organisation-error" : undefined}
            {...register("organisation")}
          />
          <ErrorText id="organisation-error">{errors.organisation?.message}</ErrorText>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="role">Your role</Label>
          <select
            id="role"
            className={cn(fieldClass, "cursor-pointer")}
            aria-invalid={!!errors.role}
            aria-describedby={errors.role ? "role-error" : undefined}
            {...register("role")}
          >
            <option value="">Select your role</option>
            {roleOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <ErrorText id="role-error">{errors.role?.message}</ErrorText>
        </div>

        {route === "partner" ? (
          <div className="flex flex-col gap-2">
            <Label htmlFor="entityType">Entity type</Label>
            <select
              id="entityType"
              className={cn(fieldClass, "cursor-pointer")}
              aria-invalid={!!errors.entityType}
              aria-describedby={errors.entityType ? "entityType-error" : undefined}
              {...register("entityType")}
            >
              <option value="">Select an entity type</option>
              {entityTypeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <ErrorText id="entityType-error">{errors.entityType?.message}</ErrorText>
          </div>
        ) : null}

        {route === "media" ? (
          <div className="flex flex-col gap-2">
            <Label htmlFor="deadline">Your deadline</Label>
            <input
              id="deadline"
              type="datetime-local"
              className={fieldClass}
              aria-invalid={!!errors.deadline}
              aria-describedby={errors.deadline ? "deadline-error" : undefined}
              {...register("deadline")}
            />
            <ErrorText id="deadline-error">{errors.deadline?.message}</ErrorText>
          </div>
        ) : null}

        {route === "investor" ? (
          <div className="flex flex-col gap-2">
            <Label htmlFor="ticketSize">Ticket size</Label>
            <select
              id="ticketSize"
              className={cn(fieldClass, "cursor-pointer")}
              aria-invalid={!!errors.ticketSize}
              aria-describedby={errors.ticketSize ? "ticketSize-error" : undefined}
              {...register("ticketSize")}
            >
              <option value="">Select a ticket size</option>
              {ticketSizeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <ErrorText id="ticketSize-error">{errors.ticketSize?.message}</ErrorText>
          </div>
        ) : null}
      </div>

      {/* Message · relabelled per route, replaced entirely for investors */}
      {route !== "investor" ? (
        <div
          className={cn(
            "mt-6 grid gap-6",
            route === "waitlist" && "lg:grid-cols-[1.4fr_1fr] lg:items-start",
          )}
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="message">
              {route === "waitlist" ? "What would you like to see?" : "Message"}
            </Label>
            <textarea
              id="message"
              rows={6}
              className={cn(fieldClass, "min-h-[140px] resize-y")}
              aria-invalid={!!errors.message}
              aria-describedby={errors.message ? "message-error" : undefined}
              {...register("message")}
            />
            <ErrorText id="message-error">{errors.message?.message}</ErrorText>
          </div>

          {route === "waitlist" ? (
            <fieldset className="rounded-[var(--radius-panel)] border border-navy-600 bg-navy-950 p-5">
              <legend className="px-1 font-heading text-sm font-semibold uppercase tracking-[0.08em] text-mist">
                Or pick a slot
              </legend>
              <div className="mt-3 flex flex-col gap-2">
                {previewSlots.map((slot) => (
                  <label
                    key={slot}
                    className="flex min-h-11 cursor-pointer items-center gap-3 rounded-[10px] border border-navy-700 px-4 text-sm text-mist transition-colors hover:border-teal-500 has-checked:border-teal-500 has-checked:bg-teal-950"
                  >
                    <input
                      type="radio"
                      value={slot}
                      className="size-4 accent-teal-500"
                      {...register("slot")}
                    />
                    {slot}
                  </label>
                ))}
              </div>
              <p className="mt-4 text-[12px] leading-snug text-slate-muted">
                Example slots · illustrative
              </p>
              <div className="mt-3 flex items-center gap-3 rounded-[10px] border border-dashed border-navy-600 p-4">
                <CalendarClock aria-hidden="true" className="size-4 shrink-0 text-teal-500" />
                <span className="text-[12px] leading-snug text-slate-muted">
                  Calendar embed slot — live availability appears here once the booking calendar is
                  connected.
                </span>
              </div>
            </fieldset>
          ) : null}
        </div>
      ) : null}

      {route === "partner" ? (
        <div className="mt-6 flex flex-col gap-2">
          <Label htmlFor="holdings">What do you hold or what do you need?</Label>
          <textarea
            id="holdings"
            rows={4}
            className={cn(fieldClass, "min-h-[110px] resize-y")}
            aria-invalid={!!errors.holdings}
            aria-describedby={errors.holdings ? "holdings-error" : undefined}
            {...register("holdings")}
          />
          <ErrorText id="holdings-error">{errors.holdings?.message}</ErrorText>
        </div>
      ) : null}

      {route === "investor" ? (
        <div className="mt-6 flex flex-col gap-2">
          <label className="flex min-h-11 cursor-pointer items-start gap-3 rounded-[10px] border border-navy-600 bg-navy-950 p-4 text-sm leading-relaxed text-mist">
            <input
              type="checkbox"
              className="mt-0.5 size-4 shrink-0 accent-teal-500"
              aria-invalid={!!errors.acknowledgement}
              aria-describedby={errors.acknowledgement ? "acknowledgement-error" : undefined}
              {...register("acknowledgement")}
            />
            <span>{investorAcknowledgement}</span>
          </label>
          <ErrorText id="acknowledgement-error">{errors.acknowledgement?.message}</ErrorText>
        </div>
      ) : null}

      <div className="mt-8 flex flex-col gap-3">
        <div>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting
              ? "Sending…"
              : route === "waitlist"
                ? "Join the wait list"
                : "Send enquiry"}
          </Button>
        </div>
        <p className="font-heading text-sm font-semibold text-mist">{config.reply}</p>
        <p className="text-[12px] leading-snug text-slate-muted">{privacyLine}</p>
        {failed ? (
          <p role="alert" className="text-[13px] font-medium text-orange-400">
            That did not send. Please try again, or email hello@impactig.co.uk directly.
          </p>
        ) : null}
      </div>
    </form>
  );
}

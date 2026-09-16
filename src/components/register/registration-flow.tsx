import * as React from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  HandHeart,
  LockKeyhole,
  Mail,
  MapPin,
  ShieldCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  CONSENT_VERSION,
  consentBlock,
  registerPrivacy,
  RESIDENT_SPECIAL_CATEGORY_OPTIONS,
  residentHealthConsent,
  type RegisterQuestion,
  type RegisterRoleContent,
} from "@/content/register";
import { registrationJourney as copy } from "@/content/registration-journey";
import {
  createRegistration,
  normaliseRegistrationPhone,
  RegistrationError,
  saveRegistrationPreferences,
  type AccountDetails,
  type RegistrationFailure,
  type SurveyAnswers,
} from "@/lib/registration";
import { cn } from "@/lib/utils";

type AccountField = "email" | "phone" | "password" | "confirmPassword";
type Details = Record<AccountField, string>;
const emptyDetails: Details = { email: "", phone: "", password: "", confirmPassword: "" };
const fieldClass =
  "registration-input min-h-14 w-full rounded-xl border border-navy-600 bg-navy-950 px-4 py-3 text-base text-white placeholder:text-slate-muted focus-visible:border-teal-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-400";

function sensitiveAnswers(answers: SurveyAnswers): boolean {
  return Object.entries(RESIDENT_SPECIAL_CATEGORY_OPTIONS).some(([id, options]) => {
    const value = answers[id];
    const selected = Array.isArray(value) ? value : value ? [value] : [];
    return selected.some((option) => (options as readonly string[]).includes(option));
  });
}

function getQuestions(role: RegisterRoleContent): RegisterQuestion[] {
  // Location first for investors, without changing the stored answer keys.
  const questions =
    role.id === "investor"
      ? [
          ...role.questions.filter((q) => q.id === "preferred_regions"),
          ...role.questions.filter((q) => q.id === "regions"),
          ...role.questions.filter((q) => q.id !== "regions" && q.id !== "preferred_regions"),
        ]
      : [...role.questions];
  return [
    ...questions,
    { id: "profile_name", label: copy.name, kind: "text", maxLength: 100 },
    ...(role.askOrganisation
      ? [
          {
            id: "profile_organisation",
            label: copy.organisation,
            help: role.organisationLabel,
            kind: "text" as const,
            maxLength: 150,
          },
        ]
      : []),
  ];
}

function QuestionInput({
  question,
  value,
  onChange,
}: {
  question: RegisterQuestion;
  value: string | string[] | undefined;
  onChange: (value: string | string[]) => void;
}) {
  if (question.kind === "single" || question.kind === "multi") {
    const selected = Array.isArray(value) ? value : value ? [value] : [];
    return (
      <fieldset
        aria-labelledby="registration-heading"
        aria-describedby={question.help ? "question-help" : undefined}
        className="grid gap-3 sm:grid-cols-2"
      >
        <legend className="sr-only">{question.label}</legend>
        {(question.options ?? []).map((option) => (
          <label
            key={option}
            className="registration-option relative flex min-h-20 cursor-pointer items-center gap-4 rounded-2xl border border-navy-600 bg-navy-950/70 p-5 text-base leading-relaxed text-mist transition-all hover:border-teal-400 has-checked:border-teal-400 has-checked:bg-teal-950 has-checked:text-white has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-teal-400"
          >
            <input
              type={question.kind === "multi" ? "checkbox" : "radio"}
              name={question.id}
              value={option}
              checked={selected.includes(option)}
              className="size-5 shrink-0 accent-teal-400"
              onChange={(event) =>
                onChange(
                  question.kind === "single"
                    ? option
                    : event.target.checked
                      ? [...selected, option]
                      : selected.filter((item) => item !== option),
                )
              }
            />
            <span>{option}</span>
          </label>
        ))}
      </fieldset>
    );
  }
  const shared = {
    id: "question-answer",
    value: typeof value === "string" ? value : "",
    maxLength: question.maxLength ?? 200,
    placeholder: question.placeholder,
    "aria-labelledby": "registration-heading",
    "aria-describedby": question.help ? "question-help" : undefined,
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onChange(event.target.value),
    className: cn(fieldClass, "min-h-20 text-lg sm:text-xl"),
  };
  return question.kind === "textarea" ? (
    <textarea {...shared} rows={4} className={cn(shared.className, "resize-y")} />
  ) : (
    <input
      {...shared}
      type="text"
      autoComplete={
        question.id === "profile_name"
          ? "name"
          : question.id === "profile_organisation"
            ? "organization"
            : "off"
      }
    />
  );
}

export function RegistrationFlow({ role }: { role: RegisterRoleContent }) {
  const [stage, setStage] = React.useState<"account" | "survey" | "done">("account");
  const [details, setDetails] = React.useState<Details>(emptyDetails);
  const [errors, setErrors] = React.useState<Partial<Record<AccountField, string>>>({});
  const [showPassword, setShowPassword] = React.useState(false);
  const [consentEmail, setConsentEmail] = React.useState(false);
  const [consentSms, setConsentSms] = React.useState(false);
  const [consentHealth, setConsentHealth] = React.useState(false);
  const [healthError, setHealthError] = React.useState(false);
  const [answers, setAnswers] = React.useState<SurveyAnswers>({});
  const [index, setIndex] = React.useState(0);
  const [busy, setBusy] = React.useState(false);
  const [ready, setReady] = React.useState(false);
  const [accountFrozen, setAccountFrozen] = React.useState(false);
  const [failure, setFailure] = React.useState<RegistrationFailure | null>(null);
  const [saved, setSaved] = React.useState(false);
  const [honeypot, setHoneypot] = React.useState("");
  // These capabilities live only in memory. Passwords never leave the account request.
  const token = React.useRef("");
  const requestId = React.useRef("");
  const accountAttempt = React.useRef<AccountDetails | null>(null);
  const locked = React.useRef(false);
  const heading = React.useRef<HTMLHeadingElement>(null);
  const hasMoved = React.useRef(false);
  const questions = React.useMemo(() => getQuestions(role), [role]);
  const question = questions[index]!;
  const needsHealthConsent = role.id === "resident" && sensitiveAnswers(answers);

  // Static HTML must never submit named password fields as a native GET
  // before React has attached the account submit handler.
  React.useEffect(() => {
    setReady(true);
  }, []);

  React.useEffect(() => {
    if (!hasMoved.current) {
      hasMoved.current = true;
      return;
    }
    heading.current?.focus({ preventScroll: true });
    heading.current?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
      block: "start",
    });
  }, [stage, index]);

  async function submitAccount(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (locked.current) return;
    const nextErrors: Partial<Record<AccountField, string>> = {};
    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(details.email.trim()) ||
      details.email.trim().length > 255
    )
      nextErrors.email = copy.errors.email;
    const phone = normaliseRegistrationPhone(details.phone);
    if (!phone) nextErrors.phone = copy.errors.phone;
    if (
      details.password.length < 10 ||
      details.password.length > 128 ||
      !/\p{L}/u.test(details.password) ||
      !/[0-9]/.test(details.password)
    )
      nextErrors.password = copy.errors.password;
    if (details.password !== details.confirmPassword || !details.confirmPassword)
      nextErrors.confirmPassword = copy.errors.confirmPassword;
    setErrors(nextErrors);
    const firstError = (Object.keys(nextErrors) as AccountField[])[0];
    if (firstError) {
      document.getElementById(firstError)?.focus();
      return;
    }
    if (honeypot) {
      setFailure("rejected");
      return;
    }
    locked.current = true;
    setBusy(true);
    setFailure(null);
    try {
      requestId.current ||= crypto.randomUUID();
      accountAttempt.current ??= {
        request_id: requestId.current,
        role: role.id,
        email: details.email.trim(),
        phone: phone!,
        password: details.password,
        consent_email: consentEmail,
        consent_sms: consentSms,
        consent_version: CONSENT_VERSION,
        source: "site-register",
      };
      token.current = await createRegistration(accountAttempt.current);
      accountAttempt.current = null;
      setDetails(emptyDetails);
      setShowPassword(false);
      setStage("survey");
    } catch (error) {
      const kind = error instanceof RegistrationError ? error.kind : "network";
      setFailure(kind);
      if (kind === "network" || accountFrozen) {
        // The server may have committed before the response was lost.
        // Retry the identical payload; changed details cannot be confirmed.
        setAccountFrozen(true);
      } else {
        accountAttempt.current = null;
        requestId.current = "";
      }
    } finally {
      locked.current = false;
      setBusy(false);
    }
  }

  async function saveStep(finish = false, skip = false) {
    if (locked.current || !token.current) return;
    const nextAnswers = { ...answers };
    if (skip) delete nextAnswers[question.id];
    const sensitive = role.id === "resident" && sensitiveAnswers(nextAnswers);
    if (sensitive && !consentHealth) {
      setHealthError(true);
      document.getElementById("health-consent")?.focus();
      return;
    }
    locked.current = true;
    setBusy(true);
    setFailure(null);
    setHealthError(false);
    const wireAnswers: SurveyAnswers = {};
    for (const q of role.questions) {
      const value = nextAnswers[q.id];
      if (typeof value === "string" && value.trim()) wireAnswers[q.id] = value.trim();
      if (Array.isArray(value) && value.length) wireAnswers[q.id] = value;
    }
    if (sensitive) wireAnswers["health_data_consent"] = "yes";
    try {
      await saveRegistrationPreferences(
        token.current,
        wireAnswers,
        finish,
        typeof nextAnswers["profile_name"] === "string" ? nextAnswers["profile_name"] : undefined,
        typeof nextAnswers["profile_organisation"] === "string"
          ? nextAnswers["profile_organisation"]
          : undefined,
      );
      setAnswers(nextAnswers);
      setSaved(true);
      if (finish || index === questions.length - 1) {
        token.current = "";
        setStage("done");
      } else {
        setIndex((current) => current + 1);
      }
    } catch (error) {
      setFailure(error instanceof RegistrationError ? error.kind : "network");
    } finally {
      locked.current = false;
      setBusy(false);
    }
  }

  const failureMessage =
    failure === "password" ? copy.errors.weakPassword : failure ? copy.errors[failure] : null;

  return (
    <div className="registration-flow mx-auto w-full max-w-[820px]">
      <ol
        aria-label="Registration progress"
        className="mx-auto mb-8 flex max-w-md items-center justify-center gap-3 text-sm sm:gap-5"
      >
        <li
          aria-current={stage === "account" ? "step" : undefined}
          className={cn(
            "flex items-center gap-2",
            stage === "account" ? "text-white" : "text-teal-400",
          )}
        >
          <span className="grid size-8 place-items-center rounded-full border border-current font-mono text-xs">
            01
          </span>
          Your account
        </li>
        <li aria-hidden="true" className="h-px flex-1 bg-navy-600" />
        <li
          aria-current={stage === "survey" ? "step" : undefined}
          className={cn(
            "flex items-center gap-2",
            stage === "account" ? "text-mist" : "text-white",
          )}
        >
          <span className="grid size-8 place-items-center rounded-full border border-current font-mono text-xs">
            02
          </span>
          Your preferences
        </li>
      </ol>

      {stage === "account" ? (
        <div className="registration-panel rounded-3xl border border-navy-600 bg-navy-800 p-6 sm:p-10">
          <div className="registration-step">
            <span
              aria-hidden="true"
              className="mb-5 inline-grid size-12 place-items-center rounded-2xl border border-teal-500/50 bg-teal-950 text-teal-400"
            >
              <LockKeyhole size={22} />
            </span>
            <h1
              ref={heading}
              id="registration-heading"
              tabIndex={-1}
              className="registration-heading font-heading text-[clamp(2rem,4vw,3rem)] font-bold leading-tight text-white"
            >
              {copy.accountTitle}
            </h1>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-mist">{copy.accountIntro}</p>
            <form onSubmit={submitAccount} noValidate className="mt-8" aria-busy={busy}>
              <fieldset
                disabled={busy || !ready || accountFrozen}
                className="grid gap-x-5 gap-y-6 sm:grid-cols-2"
              >
                <legend className="sr-only">Your account details</legend>
                {(["email", "phone", "password", "confirmPassword"] as const).map((field) => (
                  <div key={field}>
                    <label htmlFor={field} className="mb-2 block text-sm font-semibold text-white">
                      {copy[field]}
                    </label>
                    <div className="relative">
                      <input
                        id={field}
                        name={field}
                        type={
                          field === "email"
                            ? "email"
                            : field === "phone"
                              ? "tel"
                              : showPassword
                                ? "text"
                                : "password"
                        }
                        autoComplete={
                          field === "email" ? "email" : field === "phone" ? "tel" : "new-password"
                        }
                        maxLength={field === "email" ? 255 : field === "phone" ? 40 : 128}
                        required
                        value={details[field]}
                        aria-invalid={!!errors[field]}
                        aria-describedby={
                          errors[field]
                            ? `${field}-error`
                            : field === "password"
                              ? "password-help"
                              : undefined
                        }
                        className={cn(
                          fieldClass,
                          (field === "password" || field === "confirmPassword") && "pr-14",
                        )}
                        onChange={(event) => {
                          setDetails((current) => ({ ...current, [field]: event.target.value }));
                          setErrors((current) => ({ ...current, [field]: undefined }));
                        }}
                      />
                      {(field === "password" || field === "confirmPassword") && (
                        <button
                          type="button"
                          aria-label={`${showPassword ? "Hide" : "Show"} ${field === "password" ? "password" : "password confirmation"}`}
                          aria-pressed={showPassword}
                          onClick={() => setShowPassword((current) => !current)}
                          className="absolute inset-y-1 right-1 grid w-12 place-items-center rounded-lg text-mist hover:text-white focus-visible:outline-2 focus-visible:outline-teal-400"
                        >
                          {showPassword ? (
                            <EyeOff aria-hidden="true" size={19} />
                          ) : (
                            <Eye aria-hidden="true" size={19} />
                          )}
                        </button>
                      )}
                    </div>
                    {field === "password" && (
                      <p id="password-help" className="mt-2 text-sm leading-relaxed text-mist">
                        {copy.passwordHelp}
                      </p>
                    )}
                    {errors[field] && (
                      <p
                        id={`${field}-error`}
                        role="alert"
                        className="mt-2 text-sm text-destructive"
                      >
                        {errors[field]}
                      </p>
                    )}
                  </div>
                ))}
              </fieldset>
              <div aria-hidden="true" className="absolute left-[-9999px] size-px overflow-hidden">
                <label htmlFor="registration-website">Company website</label>
                <input
                  id="registration-website"
                  tabIndex={-1}
                  autoComplete="off"
                  value={honeypot}
                  onChange={(event) => setHoneypot(event.target.value)}
                />
              </div>
              <fieldset
                disabled={busy || accountFrozen}
                className="mt-7 border-t border-navy-600 pt-6"
              >
                <legend className="sr-only">{consentBlock.heading}</legend>
                <p className="mb-3 text-sm text-mist">{consentBlock.help}</p>
                {[
                  {
                    id: "registration-email-consent",
                    value: consentEmail,
                    set: setConsentEmail,
                    label: consentBlock.email.label,
                  },
                  {
                    id: "registration-sms-consent",
                    value: consentSms,
                    set: setConsentSms,
                    label: consentBlock.sms.label,
                  },
                ].map((consent) => (
                  <label
                    key={consent.id}
                    className="flex min-h-11 cursor-pointer items-start gap-3 py-2 text-sm leading-relaxed text-mist"
                  >
                    <input
                      id={consent.id}
                      type="checkbox"
                      checked={consent.value}
                      onChange={(event) => consent.set(event.target.checked)}
                      className="mt-0.5 size-5 shrink-0 accent-teal-400"
                    />
                    <span>{consent.label}</span>
                  </label>
                ))}
              </fieldset>
              <p className="mt-5 text-sm leading-relaxed text-mist">
                <a
                  href={registerPrivacy.href}
                  target="_blank"
                  rel="noreferrer"
                  className="text-teal-400 underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-teal-400"
                >
                  {registerPrivacy.linkLabel}
                </a>
              </p>
              <details className="mt-3 text-sm leading-relaxed text-mist">
                <summary className="min-h-11 cursor-pointer py-2 focus-visible:outline-2 focus-visible:outline-teal-400">
                  How we use your details
                </summary>
                <p className="pb-4">{registerPrivacy.body}</p>
              </details>
              {failureMessage && (
                <p role="alert" className="my-4 text-sm text-destructive">
                  {accountFrozen
                    ? "We couldn't confirm your registration. Your details are held for this attempt. Please try again to confirm the save."
                    : failureMessage}
                </p>
              )}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={busy || !ready}
                className="mt-4 w-full whitespace-normal"
              >
                {busy ? copy.creating : copy.create}
              </Button>
              <p className="mt-5 text-center text-sm">
                <a
                  href="https://app.impactinvestmentgroup.co.uk/auth/login"
                  className="inline-flex min-h-11 items-center text-mist underline underline-offset-4 hover:text-white focus-visible:outline-2 focus-visible:outline-teal-400"
                >
                  {copy.signIn}
                </a>
              </p>
            </form>
          </div>
        </div>
      ) : stage === "survey" ? (
        <div
          className="registration-panel rounded-3xl border border-navy-600 bg-navy-800 p-6 sm:p-10"
          aria-busy={busy}
        >
          <div className="mb-7 flex flex-wrap items-center justify-between gap-3 text-sm">
            <span className="inline-flex items-center gap-2 text-teal-400">
              <ShieldCheck aria-hidden="true" size={18} />
              Registration saved
            </span>
            <span className="font-mono text-mist">
              {String(index + 1).padStart(2, "0")} / {String(questions.length).padStart(2, "0")}
            </span>
          </div>
          <div
            role="progressbar"
            aria-label="Survey progress"
            aria-valuemin={0}
            aria-valuemax={questions.length}
            aria-valuenow={index + 1}
            aria-valuetext={`Question ${index + 1} of ${questions.length}`}
            className="mb-9 h-1 overflow-hidden rounded-full bg-navy-600"
          >
            <div
              className="registration-progress h-full rounded-full bg-teal-400"
              style={{ width: `${((index + 1) / questions.length) * 100}%` }}
            />
          </div>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void saveStep(index === questions.length - 1);
            }}
          >
            <fieldset disabled={busy} className="min-w-0">
              <legend className="sr-only">{copy.surveyIntro}</legend>
              <div key={question.id} className="registration-step min-h-[280px]">
                <p className="eyebrow mb-4 flex items-center gap-2 text-teal-400">
                  {question.id === "regions" || question.id === "location" ? (
                    <MapPin aria-hidden="true" size={16} />
                  ) : null}
                  {role.label} preferences
                </p>
                <h1
                  ref={heading}
                  id="registration-heading"
                  tabIndex={-1}
                  className="registration-heading font-heading text-[clamp(1.9rem,4vw,2.8rem)] font-bold leading-tight text-white"
                >
                  {question.label}
                </h1>
                {question.help && (
                  <p id="question-help" className="mt-3 text-base leading-relaxed text-mist">
                    {question.help}
                  </p>
                )}
                <div className="mt-7">
                  <QuestionInput
                    question={question}
                    value={answers[question.id]}
                    onChange={(value) => {
                      setAnswers((current) => ({ ...current, [question.id]: value }));
                      setSaved(false);
                      setHealthError(false);
                    }}
                  />
                </div>
              </div>
              {needsHealthConsent && (
                <div className="mt-6 rounded-2xl border border-teal-500 bg-teal-950 p-5">
                  <label className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-white">
                    <input
                      id="health-consent"
                      type="checkbox"
                      checked={consentHealth}
                      onChange={(event) => {
                        setConsentHealth(event.target.checked);
                        setHealthError(false);
                      }}
                      aria-invalid={healthError}
                      aria-describedby={healthError ? "health-error" : undefined}
                      className="mt-1 size-5 shrink-0 accent-teal-400"
                    />
                    <span>{residentHealthConsent.label}</span>
                  </label>
                  {healthError && (
                    <p id="health-error" role="alert" className="mt-3 text-sm text-destructive">
                      {residentHealthConsent.requiredMessage}
                    </p>
                  )}
                </div>
              )}
              {failureMessage && (
                <p role="alert" className="mt-5 text-sm text-destructive">
                  {failureMessage}
                </p>
              )}
              <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-navy-600 pt-6">
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => {
                    setIndex((current) => current - 1);
                    setFailure(null);
                    setHealthError(false);
                  }}
                  className="inline-flex min-h-11 items-center gap-2 rounded-lg px-2 text-sm font-semibold text-mist hover:text-white focus-visible:outline-2 focus-visible:outline-teal-400 disabled:invisible"
                >
                  <ArrowLeft aria-hidden="true" size={17} />
                  {copy.back}
                </button>
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="flex-1 whitespace-normal sm:flex-none"
                >
                  {busy
                    ? copy.saving
                    : index === questions.length - 1
                      ? copy.finish
                      : copy.continue}
                </Button>
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
                <button
                  type="button"
                  onClick={() => void saveStep(index === questions.length - 1, true)}
                  className="min-h-11 rounded-lg px-2 text-mist underline underline-offset-4 hover:text-white focus-visible:outline-2 focus-visible:outline-teal-400"
                >
                  {copy.skip}
                </button>
                <button
                  type="button"
                  onClick={() => void saveStep(true)}
                  className="min-h-11 rounded-lg px-2 text-mist underline underline-offset-4 hover:text-white focus-visible:outline-2 focus-visible:outline-teal-400"
                >
                  {copy.later}
                </button>
              </div>
            </fieldset>
          </form>
          <p role="status" className="mt-4 text-center text-sm leading-relaxed text-mist">
            {saved ? `${copy.saved}. ` : ""}
            {copy.optional}
          </p>
        </div>
      ) : (
        <div className="registration-panel registration-step rounded-3xl border border-teal-500 bg-navy-800 p-8 text-center sm:p-12">
          <span
            aria-hidden="true"
            className="mx-auto grid size-20 place-items-center rounded-full border border-teal-400 bg-teal-950 text-teal-400"
          >
            <HandHeart size={34} strokeWidth={1.6} />
          </span>
          <h1
            ref={heading}
            tabIndex={-1}
            className="registration-heading mt-7 font-heading text-4xl font-bold text-white"
          >
            {copy.doneTitle}
          </h1>
          <p role="status" className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-mist">
            {copy.doneBody}
          </p>
          <Button asChild variant="secondary" size="lg" className="mt-8">
            <Link to="/platform">
              Explore the platform
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
          <p className="mt-6 text-sm text-mist">
            <Mail aria-hidden="true" size={16} className="mr-2 inline" />
            {copy.pending}
          </p>
        </div>
      )}
    </div>
  );
}

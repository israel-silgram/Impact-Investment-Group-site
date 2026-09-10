/**
 * Wave 295 refuter: the wait-list payload is the contract, byte for byte.
 *
 * ⚠️ THIS ASSERTS, IT DOES NOT NARRATE. The first cut printed the payload and
 * left a person to read it, which is not a test: the review found the envelope
 * was camelCase against a snake_case contract and the script had been printing
 * that happily for days. It now fails the run.
 *
 *   bun scripts/wave295-payload-example.ts
 *
 * Checks, on payloads built by the SAME function the form calls:
 *   1. Every key is in the contract, and none is missing except the two the
 *      contract allows to be absent.
 *   2. Every key is snake_case.
 *   3. `consent_version` is present on every post and is the date-stamped
 *      constant, not a literal typed in here.
 *   4. `phone` is E.164 or absent, never as typed.
 *   5. A submission with neither consent box ticked is still a valid payload
 *      that records neither. That is the design, and it is the thing most
 *      likely to be "tidied" into a marketing gate later.
 *   6. The resident's special-category consent rides inside `answers`, so the
 *      envelope stays exactly the contract's keys.
 */
import {
  WAITLIST_PAYLOAD_KEYS,
  buildWaitlistPayload,
  toE164UK,
} from "../src/components/register/waitlist-form";
import { CONSENT_VERSION, getRegisterRole } from "../src/content/register";
import { apiUrl } from "../src/lib/api";

const investor = getRegisterRole("investor")!;
const resident = getRegisterRole("resident")!;

/** Absent for a role with no organisation, or when the person left it blank. */
const OPTIONAL: readonly string[] = ["phone", "organisation"];

let failures = 0;

function check(label: string, ok: boolean, detail = "") {
  if (!ok) failures += 1;
  console.log(`${ok ? "ok  " : "FAIL"} ${label}${detail ? ` :: ${detail}` : ""}`);
}

function checkEnvelope(label: string, payload: Record<string, unknown>) {
  const keys = Object.keys(payload);
  const contract = WAITLIST_PAYLOAD_KEYS as readonly string[];

  const extra = keys.filter((k) => !contract.includes(k));
  check(`${label}: no key outside the contract`, extra.length === 0, extra.join(", "));

  const missing = contract.filter((k) => !keys.includes(k) && !OPTIONAL.includes(k));
  check(`${label}: every required key present`, missing.length === 0, missing.join(", "));

  const notSnake = keys.filter((k) => !/^[a-z][a-z0-9_]*$/.test(k));
  check(`${label}: every key snake_case`, notSnake.length === 0, notSnake.join(", "));

  check(
    `${label}: consent_version is the constant`,
    payload["consent_version"] === CONSENT_VERSION,
    String(payload["consent_version"]),
  );
}

// ── 1 · Fully answered, both boxes ticked, phone typed with spaces ────────
const full = buildWaitlistPayload(investor, {
  name: "Dana Whitfield",
  email: "dana@northfieldcapital.co.uk",
  organisation: "Northfield Capital",
  phone: "07700 900123",
  consentEmail: true,
  consentSms: true,
  answers: {
    investment_focus: ["HMOs and shared supported living", "Portfolios and blocks"],
    ticket_size: "£1m to £4.9m",
    regions: "  the North West  ",
    frictions: ["Deals reach me too late to act on"],
    frictions_detail: "Lost a block in Bolton because the pack arrived nine days late.",
    tool_budget: "£400 to £999 a month",
  },
});
checkEnvelope("investor, full", full);
check("investor, full: phone is E.164", full.phone === "+447700900123", String(full.phone));
check("investor, full: regions trimmed", full.answers["regions"] === "the North West");
check("investor, full: both consents true", full.consent_email && full.consent_sms);

// ── 2 · The minimum, with NEITHER consent box ticked ──────────────────────
const bare = buildWaitlistPayload(investor, {
  name: "Sam Okafor",
  email: "sam@example.co.uk",
  organisation: "Okafor Holdings",
  phone: "",
  consentEmail: false,
  consentSms: false,
  answers: { investment_focus: [], regions: "   ", frictions_detail: "" },
});
checkEnvelope("investor, neither box", bare);
check("investor, neither box: phone omitted", !("phone" in bare));
check(
  "investor, neither box: both consents recorded false",
  bare.consent_email === false && bare.consent_sms === false,
);
check("investor, neither box: blank answers dropped", Object.keys(bare.answers).length === 0);

// ── 3 · Resident, special-category answers, consent given ─────────────────
const residentPayload = buildWaitlistPayload(resident, {
  name: "Amara Bello",
  email: "amara@example.com",
  consentEmail: true,
  consentSms: false,
  consentHealth: true,
  answers: {
    who_for: "Me and my children",
    home_needs: ["Adapted for a disability", "Near a school"],
    location: "Nottingham",
    timing: "Within a month",
  },
});
checkEnvelope("resident, special category", residentPayload);
check("resident: no organisation key", !("organisation" in residentPayload));
check(
  "resident: the health consent rides inside answers",
  residentPayload.answers["health_data_consent"] === "yes",
);

// ── 4 · Resident with nothing special category: no health key at all ──────
const residentPlain = buildWaitlistPayload(resident, {
  name: "Jo Price",
  email: "jo@example.com",
  consentEmail: false,
  consentSms: false,
  answers: { who_for: "Me", location: "Hull", timing: "Right now" },
});
checkEnvelope("resident, plain", residentPlain);
check(
  "resident, plain: no health consent recorded",
  !("health_data_consent" in residentPlain.answers),
);

// ── 5 · The phone normaliser, on every shape a person types ───────────────
const PHONES: [string, string | null][] = [
  ["07700 900123", "+447700900123"],
  ["+44 7700 900123", "+447700900123"],
  ["00447700900123", "+447700900123"],
  ["(07700) 900-123", "+447700900123"],
  ["+447700900123", "+447700900123"],
  ["0121 496 0000", "+441214960000"],
  ["", null],
  ["12345", null],
  ["+1 415 555 0123", null],
  ["not a number", null],
];
for (const [raw, want] of PHONES) {
  const got = toE164UK(raw);
  check(`phone ${JSON.stringify(raw)} -> ${want}`, got === want, String(got));
}

console.log(`\nPOST target: ${apiUrl("/public/waitlist")}`);
console.log(`Contract: ${WAITLIST_PAYLOAD_KEYS.join(", ")}`);
console.log(`consent_version: ${CONSENT_VERSION}`);

if (failures) {
  console.error(`\n${failures} assertion(s) failed.`);
  process.exit(1);
}
console.log("\nAll assertions passed.");

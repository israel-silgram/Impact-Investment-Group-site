/**
 * Wave 295 refuter: the wait-list payload, byte for byte.
 *
 * Prints the exact JSON body the browser POSTs to the platform, built by the
 * SAME function the form calls, so the contract in docs/WAVE295_REPORT.md is
 * read off the code rather than transcribed from it. Run with:
 *
 *   bun scripts/wave295-payload-example.ts
 *
 * Three cases, and the middle one is the point of the exercise: a submission
 * with BOTH consent boxes left alone is a valid submission that records
 * neither consent. If that ever stops being true, this file says so.
 */
import { buildWaitlistPayload } from "../src/components/register/waitlist-form";
import { apiUrl } from "../src/lib/api";
import { getRegisterRole } from "../src/content/register";

const investor = getRegisterRole("investor")!;
const resident = getRegisterRole("resident")!;

const show = (title: string, body: unknown) => {
  console.log(`\n─── ${title} ${"─".repeat(Math.max(0, 60 - title.length))}`);
  console.log(JSON.stringify(body, null, 2));
};

show(
  "investor, fully answered, both boxes ticked",
  buildWaitlistPayload(investor, {
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
  }),
);

show(
  "investor, minimum viable, NEITHER box ticked",
  buildWaitlistPayload(investor, {
    name: "Sam Okafor",
    email: "sam@example.co.uk",
    organisation: "Okafor Holdings",
    phone: "",
    consentEmail: false,
    consentSms: false,
    answers: { investment_focus: [], regions: "   ", frictions_detail: "" },
  }),
);

show(
  "resident, no organisation, no phone",
  buildWaitlistPayload(resident, {
    name: "Amara Bello",
    email: "amara@example.com",
    consentEmail: true,
    consentSms: false,
    answers: {
      who_for: "Me and my children",
      home_needs: ["Near a school", "Just somewhere settled and safe"],
      location: "Nottingham",
      timing: "Within a month",
    },
  }),
);

/**
 * ⚠️ THE PATH HAS NO `/api` SEGMENT. R295-4 writes it as
 * `{apiBase}/api/public/waitlist`, but the backend mounts this router at
 * `/public` (iip-backend/app/main.py includes `site_enquiry.router`, whose
 * prefix is `/public`), and the site's live contact form already posts to
 * `apiUrl("/public/enquiry")`. Wave 294 must mount the wait list beside it.
 */
console.log(`\nPOST target: ${apiUrl("/public/waitlist")}`);

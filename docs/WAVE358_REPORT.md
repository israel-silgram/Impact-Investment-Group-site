# Wave 358: account-first registration

## Behaviour

The role picker centres Resident in a separate, wider card with a teal halo, entrance animation and clear hover/focus feedback. The account-first flow applies to all ten audience routes. It asks for email, UK phone, password and confirmation before showing any preference question. Email and text choices remain separate, optional and unticked.

The backend first records a pending account and an account-linked waitlist record. It returns a short-lived capability that can save this survey only. Passwords and capabilities stay out of browser storage, URLs and survey payloads. Registration does not activate account access.

The survey displays one large question at a time, saves on Continue, supports Back, Skip and Finish for now, and preserves answers after network failures. Investor regions are structured for matching, followed by specific areas and the existing investment questions. Existing question identifiers remain unchanged. Names and organisations are optional survey steps. Resident health/third-party answers require the existing explicit consent before transmission.

## Verification

- Static production build and Pages postbuild passed; all ten role pages were prerendered. Production assets contain the production API origin, no local mock origin.
- Changed-file ESLint passed with zero errors.
- TypeScript reports 22 inherited diagnostics in unchanged `partner-page.tsx`, `about.tsx` and `vite.config.ts`; none in changed files. The prior wave report records these same files as baseline failures. A whole-repository clean typecheck is not claimed.
- Nine transport tests passed with 25 assertions. Removing the successful-save response guard made the suite fail; restoring it passed.
- Browser checks: empty fields and mismatched passwords send zero requests; account save precedes questions; selection saves; a failed save retains answers; retry succeeds; Back restores text; Skip removes a previously saved answer; Finish sends the current answer and completes.
- Resident sensitive choice without consent stays on its question and sends no survey request; consent allows progression.
- An uncertain account response locks email, phone, passwords and consent, keeps Retry available, and resends the same request identifier. This prevents an original committed account silently retaining different credentials from those shown on a retry.
- Every audience route renders the account screen. Checked desktop and 390px mobile layouts, no horizontal overflow, exactly one main and one h1 on registration routes. Screenshots are in `docs/screenshots/wave358/`.
- Account fields and submit are disabled in prerendered HTML until the submit handler is attached, preventing native GET submission of passwords before hydration.
- Motion is bounded and disabled under reduced-motion preference. Existing brand tokens, fonts and resident urgent-help block are retained.
- Consolidated independent review found the uncertain-retry issue and the account SMS preference confirmation gap. Both were fixed and re-reviewed without blockers; backend security, persistence and consent regression results are in the platform repository's wave report.

Browser submissions used a local mock API and synthetic details. No production test accounts were created, and no email or text was sent by these tests.

## Scope and release

The original site checkout was dirty and behind origin/main. Work used `iig-site-uc358` from site base `18183f2`, preserving the original changes. The separate platform change was explicitly authorised in the user's reply and built in `iip-uc358`.

Backend deployment must precede publication of this site build. Main pushes and live verification are recorded at session close. Existing account activation and SMS verification gates remain in place.

## Copy

New copy is limited to the account fields, password guidance, account/survey progress, question navigation and save/error/completion states in `registration-journey.ts` and `registration-flow.tsx`; the picker introduction; the structured investor region question; and optional profile name/organisation questions. The existing privacy, marketing-consent and resident-consent wording is reused. No new marketing or return claims are introduced.

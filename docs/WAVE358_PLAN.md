# Wave 358: account first registration

1. Base: site origin/main 18183f2. Preserve the dirty primary checkout in an isolated worktree, as instructed by the user.
2. Centre and illuminate Resident on the role picker using existing brand colours.
3. Show email, required UK phone, password and confirmation before any survey question.
4. Save a pending platform account before entering the optional survey; keep the existing activation gate.
5. Show one large question at a time, with progress, back, skip, save and finish controls.
6. Preserve stable answer keys and special-category consent, and save answers against the account.
7. Never persist passwords or survey tokens in browser storage or URLs; handle retries without losing entered answers.
8. New copy is confined to signup labels, navigation, validation, save status and account activation status.
9. Existing role questions and privacy/consent copy remain the source for the survey. No user-facing string added or changed beyond those this brief specifies.
10. Verify input validation, account-before-survey ordering, saved answers, reload boundaries, errors, all roles, keyboard access and mobile layout.
11. Build the static production site, review the diff, commit and push to main; verify the deployment separately.
12. Backend changes are explicitly authorised by the user's scope reply and owned by the backend agent in its own worktree.

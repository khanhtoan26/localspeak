---
phase: 07-comprehensive-ui-ux-redesign-design-system
fixed_at: 2026-05-11T03:02:57Z
review_path: .planning/phases/07-comprehensive-ui-ux-redesign-design-system/07-REVIEW.md
iteration: 1
findings_in_scope: 5
fixed: 5
skipped: 0
status: all_fixed
---

# Phase 07: Code Review Fix Report

**Fixed at:** 2026-05-11T03:02:57Z
**Source review:** `.planning/phases/07-comprehensive-ui-ux-redesign-design-system/07-REVIEW.md`
**Iteration:** 1

**Summary:**
- Findings in scope: 5
- Fixed: 5
- Skipped: 0

## Fixed Issues

### CR-01: E2E mock for `POST /api/saved-sessions` returns a response that fails contract schema validation

**Files modified:** `apps/web/e2e/dashboard-ui.spec.ts`, `apps/web/e2e/responsive.spec.ts`
**Commit:** 1615fe3
**Applied fix:** Updated the POST saved-session mock to return a `saved-session-create.v1` response with a complete non-null saved session shape.

### CR-02: E2E mock for `GET /api/saved-sessions` also returns an invalid response shape

**Files modified:** `apps/web/e2e/dashboard-ui.spec.ts`, `apps/web/e2e/responsive.spec.ts`
**Commit:** 4794415
**Applied fix:** Added the required `saved-session-list.v1` contract field to the GET saved-sessions mock response.

### WR-01: `page.waitForTimeout()` makes E2E tests flaky and slow

**Files modified:** `apps/web/e2e/responsive.spec.ts`
**Commit:** 1ebf53a
**Applied fix:** Replaced fixed Playwright sleeps with explicit assertions that wait for the post-analysis heading to become visible.

### WR-02: Entire fixture block duplicated verbatim between two E2E files

**Files modified:** `apps/web/e2e/dashboard-ui.spec.ts`, `apps/web/e2e/responsive.spec.ts`, `apps/web/e2e/fixtures/analysis.ts`
**Commit:** f2aa526
**Applied fix:** Extracted shared E2E analysis fixtures and `mockDashboardApi` into `apps/web/e2e/fixtures/analysis.ts` and imported the helper from both specs.

### WR-03: `handleSave` sends `ownerKey` in the request body but not in the `X-Localspeak-Owner-Key` header

**Files modified:** `apps/web/components/json-analysis/saved-sessions-panel.tsx`
**Commit:** 13d7dab
**Applied fix:** Added the `X-Localspeak-Owner-Key` header to the save request so it matches list and reopen requests.

## Skipped Issues

None.

## Validation

- `pnpm --filter web check` ran after each fix attempt. It consistently failed only on pre-existing missing module/type resolution errors in unrelated files/dependencies (`lucide-react`, `class-variance-authority`, `radix-ui`, `clsx`, and `tailwind-merge`); no errors referenced the modified files.
- `cd apps/web && pnpm exec tsc --noEmit --pretty false --moduleResolution bundler --module ESNext --target ES2022 --jsx react-jsx e2e/dashboard-ui.spec.ts e2e/responsive.spec.ts e2e/fixtures/analysis.ts` passed for the edited E2E files.
- `pnpm --filter web test:e2e -- dashboard-ui.spec.ts responsive.spec.ts` was attempted, but Playwright could not start the web server because port 3000 was already in use (`EADDRINUSE`).

---

_Fixed: 2026-05-11T03:02:57Z_
_Fixer: the agent (gsd-code-fixer)_
_Iteration: 1_

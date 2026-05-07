---
phase: 02-json-input-pronunciation-fluency-metrics
plan: 03
subsystem: web
tags: [nextjs, react, vitest, json-analysis, validation-ui]
requires:
  - phase: 02-01
    provides: JSON analysis preview/sample/response contracts
  - phase: 02-02
    provides: backend sample, preview, and analyze endpoints
provides:
  - warm JSON-mode analysis page replacing the foundation status page
  - paste-first speech assessment JSON input flow
  - sample JSON loading and .json upload handling with 2 MB limit
  - backend-owned debounced validation preview with top issues and allIssues expansion
  - warning, malformed JSON, invalid schema, and safe technical detail UI states
affects: [web, phase-2-json-analysis, phase-2-results-rendering]
tech-stack:
  added: []
  patterns:
    - client component owns local JSON syntax parsing and debounced backend preview
    - child components split input actions from validation preview rendering
    - component tests use controlled timers for debounce and schema-safe mocked responses
key-files:
  created:
    - apps/web/components/json-analysis/json-analysis-panel.tsx
    - apps/web/components/json-analysis/json-input-card.tsx
    - apps/web/components/json-analysis/validation-preview-card.tsx
    - apps/web/components/json-analysis/json-analysis-panel.test.tsx
  modified:
    - apps/web/app/page.tsx
    - apps/web/app/globals.css
key-decisions:
  - "Kept frontend authority limited to local JSON syntax parsing; backend preview controls Analyze JSON enablement."
  - "Kept technical details collapsed by default and rendered from safe parsed validation fields only."
patterns-established:
  - "JSON analysis UI fetches only same-origin /api/json-analysis/* endpoints and parses shared Zod contracts before success states."
  - "Show all issues renders preview.allIssues separately from the prioritized preview.issues list."
requirements-completed: [JSON-01, JSON-02]
duration: 18 min
completed: 2026-05-07
---

# Phase 02 Plan 03: JSON Input UI Summary

**Warm JSON-mode input page with paste, sample, upload, clear, and backend validation preview**

## Performance

- **Duration:** 18 min
- **Started:** 2026-05-07T08:10:52Z
- **Completed:** 2026-05-07T08:28:57Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments

- Added component tests covering empty state, paste debounce, malformed JSON details, backend issue prioritization/allIssues, warnings, sample loading, upload limits, clear confirmation, contract mismatch handling, and script-like text safety.
- Replaced the homepage status panel with `JsonAnalysisPanel`, a warm single-page JSON analysis shell.
- Implemented paste-first input, backend sample loading, `.json` upload with 2 MB limit, clear confirmation, 600ms backend preview debounce, and validation UI states.

## Task Commits

Each task was committed atomically:

1. **Task 1: Create web Wave 0 component tests for input, sample, upload, preview, warnings, and safe details** - `0a4d878` (test)
2. **Task 2: Implement JSON input panel, sample/upload/clear actions, backend preview, and warm validation UI** - `8c9466f` (feat)

**Plan metadata:** pending

## Files Created/Modified

- `apps/web/components/json-analysis/json-analysis-panel.test.tsx` - Vitest/Testing Library coverage for JSON input, preview, issue details, warnings, sample/upload/clear, and safety behavior.
- `apps/web/components/json-analysis/json-analysis-panel.tsx` - Client state owner for JSON text, syntax parse, backend preview, sample loading, analyze enablement, and stale-result state.
- `apps/web/components/json-analysis/json-input-card.tsx` - Textarea, upload, sample, clear, metadata, and Analyze JSON action shell.
- `apps/web/components/json-analysis/validation-preview-card.tsx` - Empty, malformed, checking, valid, warning, invalid, allIssues, and technical details rendering.
- `apps/web/app/page.tsx` - Renders `JsonAnalysisPanel`.
- `apps/web/app/globals.css` - Adds warm `.json-analysis-*` layout, card, input, button, issue, and detail styles while preserving `.status-*` classes.

## Decisions Made

- Used plain React state and existing CSS tokens rather than adding UI libraries.
- Kept a minimal "Analysis ready" placeholder after clicking Analyze JSON; full results rendering remains Plan 02-04.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Stabilized fake-timer component tests**
- **Found during:** Task 2 (Implement JSON input panel, sample/upload/clear actions, backend preview, and warm validation UI)
- **Issue:** `user-event` plus fake timers caused debounce-dependent tests to time out in this Vitest/jsdom setup.
- **Fix:** Switched the affected tests to explicit `fireEvent` interactions, deterministic timer advancement, and promise flushing.
- **Files modified:** `apps/web/components/json-analysis/json-analysis-panel.test.tsx`
- **Verification:** JSON analysis component tests passed.
- **Committed in:** `8c9466f`

---

**Total deviations:** 1 auto-fixed (1 blocking).
**Impact on plan:** Test harness stabilization only; no product scope expansion.

## Issues Encountered

The upload test required a jsdom-safe `File.text()` stub so the component could read uploaded JSON exactly as browsers do.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

Plan 02-04 can render deterministic results below the existing input/preview flow using the `analysisState` result returned by `/api/json-analysis/analyze`.

## Self-Check: PASSED

- `pnpm --filter @localspeak/contracts build` passed.
- `pnpm --filter web test -- components/json-analysis/json-analysis-panel.test.tsx` passed.
- `pnpm --filter web test -- components/status-panel.test.tsx` passed.
- `pnpm --filter web check` passed.
- `pnpm check && pnpm test` passed.

---
*Phase: 02-json-input-pronunciation-fluency-metrics*
*Completed: 2026-05-07*

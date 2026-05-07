---
phase: 02-json-input-pronunciation-fluency-metrics
plan: 01
subsystem: contracts
tags: [zod, vitest, json-analysis, pronunciation, fluency]
requires:
  - phase: 01-01
    provides: shared @localspeak/contracts package and speech assessment fixture schema
provides:
  - deterministic JSON analysis response and preview contracts
  - pronunciation metrics for word bands, phoneme averages, and repeated weak phoneme patterns
  - fluency metrics for WPM, pause ratio, pause severities, and provisional band
  - safe validation issue and warning mapping for backend/UI consumers
affects: [api, web, phase-2-json-analysis, phase-3-gemini-feedback]
tech-stack:
  added: []
  patterns:
    - strict derived analysis response schemas without full vendor payload echo
    - pure deterministic metric helpers exported from the contracts package
    - analysis-specific readiness validation layered over loose vendor passthrough schemas
key-files:
  created:
    - packages/contracts/test/json-analysis.metrics.test.ts
  modified:
    - packages/contracts/src/json-analysis.ts
    - packages/contracts/test/json-analysis.metrics.test.ts
key-decisions:
  - "Kept successful JSON analysis responses strict and derived-only so D-20 prevents full speechAssessment echo."
  - "Kept speech assessment vendor validation loose, with analysis readiness enforced in preview validation instead of changing the Phase 1 vendor schema."
patterns-established:
  - "Contracts own deterministic IELTS pronunciation/fluency thresholds through exported constants and pure helpers."
  - "Preview validation returns prioritized issues plus allIssues for expandable safe technical details."
requirements-completed: [JSON-02, JSON-03, MET-01, MET-02, MET-03, MET-04, MET-05, MET-06]
duration: 7 min
completed: 2026-05-07
---

# Phase 02 Plan 01: JSON Analysis Contracts Summary

**Derived JSON analysis contracts with deterministic pronunciation, phoneme, pause, and fluency metrics**

## Performance

- **Duration:** 7 min
- **Started:** 2026-05-07T07:48:14Z
- **Completed:** 2026-05-07T07:55:16Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Added Wave 0 Vitest coverage for locked Phase 2 decisions D-17 through D-20, fixture metric values, validation preview behavior, and warning-producing edge cases.
- Expanded `json-analysis.ts` with preview/sample/request/response schemas, safe validation issue mapping, warnings, extraction, pronunciation metrics, fluency metrics, and threshold helpers.
- Preserved Phase 1 vendor payload passthrough while adding backend-owned analysis readiness checks for non-empty `result` and per-word `phones`.

## Task Commits

Each task was committed atomically:

1. **Task 1: Create Wave 0 metric/contract regression tests before implementation** - `6e2ed37` (test)
2. **Task 2: Implement JSON analysis schemas, constants, extraction, metrics, warnings, and safe issue mapping** - `ef58a2f` (feat)

**Plan metadata:** pending

## Files Created/Modified

- `packages/contracts/test/json-analysis.metrics.test.ts` - Regression tests for fixture extraction, locked thresholds, pause severities, phoneme patterns, fluency metrics, validation issues, `allIssues`, and warnings.
- `packages/contracts/src/json-analysis.ts` - Shared Phase 2 Zod contracts, inferred types, validation preview logic, deterministic metric helpers, and derived analysis response creation.

## Decisions Made

- None - followed the locked Phase 2 context decisions D-17 through D-20 and plan requirements.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Corrected high-WPM fixture mutation**
- **Found during:** Task 2 (Implement JSON analysis schemas, constants, extraction, metrics, warnings, and safe issue mapping)
- **Issue:** The initial suspicious high-WPM test variant changed only the final word end time, which violated the base speech assessment timing schema before analysis warnings could be tested.
- **Fix:** Scaled all word, phone, and letter timings to create a valid but suspicious high-WPM payload.
- **Files modified:** `packages/contracts/test/json-analysis.metrics.test.ts`
- **Verification:** `pnpm --filter @localspeak/contracts test -- test/json-analysis.metrics.test.ts` passed.
- **Committed in:** `ef58a2f`

---

**Total deviations:** 1 auto-fixed (1 blocking).
**Impact on plan:** Kept the intended D-08 warning coverage valid without changing product behavior or scope.

## Issues Encountered

The high-WPM fixture variant initially failed base schema validation instead of reaching warning logic; scaling the full timing tree resolved it.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

Plan 02-02 can now import the shared preview/analyze contracts and call deterministic helpers from `@localspeak/contracts` for backend sample, preview, and analyze endpoints.

## Self-Check: PASSED

- `pnpm --filter @localspeak/contracts test -- test/json-analysis.metrics.test.ts` passed.
- `pnpm --filter @localspeak/contracts test -- test/speech-assessment.fixture.test.ts` passed.
- `pnpm --filter @localspeak/contracts check` passed.
- `pnpm check && pnpm test` passed.

---
*Phase: 02-json-input-pronunciation-fluency-metrics*
*Completed: 2026-05-07*

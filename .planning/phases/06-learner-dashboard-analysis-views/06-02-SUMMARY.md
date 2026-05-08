---
phase: 06-learner-dashboard-analysis-views
plan: 02
subsystem: ui
tags: [nextjs, react, dashboard, vitest, css]
requires:
  - phase: 06-learner-dashboard-analysis-views
    provides: Plan 06-01 testing fixtures and mode smoke tests
provides:
  - Phase 6 practice-path mode switch
  - Learner-first practice priority dashboard card
  - Four-card primary metric strip
affects: [json-analysis-ui, page-shell, phase-06-tests]
tech-stack:
  added: []
  patterns:
    - UI-only deterministic priority derivation
    - Accessible button-card mode switch with helper copy
key-files:
  created: []
  modified:
    - apps/web/app/page.tsx
    - apps/web/app/page.test.tsx
    - apps/web/components/json-analysis/json-analysis-panel.tsx
    - apps/web/components/json-analysis/json-analysis-panel.test.tsx
    - apps/web/components/json-analysis/summary-metric-cards.tsx
    - apps/web/app/globals.css
key-decisions:
  - "The top-level mode switch uses generic Live Audio Practice copy rather than Gemini Live branding."
  - "Pause ratio moved out of the primary dashboard metric strip for later Pause Analysis context."
patterns-established:
  - "Practice priority is derived from existing deterministic outputs only."
  - "Tests evolve with production UI changes rather than asserting future behavior early."
requirements-completed: [UI-01, UI-02]
duration: 0 min
completed: 2026-05-08
---

# Phase 6 Plan 02: Dashboard Shell Summary

**Learner-first dashboard shell with practice-path mode cards, deterministic priority guidance, and four primary metrics**

## Performance

- **Duration:** 0 min
- **Started:** 2026-05-08T09:28:20Z
- **Completed:** 2026-05-08T09:31:14Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments

- Updated the page mode switch to present JSON Analysis and Live Audio Practice as two accessible practice paths with helper copy.
- Added `derivePracticePriority()` and a `What should I practice next?` dashboard card that derives guidance from deterministic analysis outputs.
- Reduced the primary metric strip to exactly Pronunciation, Pronunciation Band, Fluency Band, and WPM, with tests proving Pause ratio is no longer primary.

## Task Commits

Each task was committed atomically:

1. **Task 1: Update top-level practice-path mode switch** - `44b5892` (feat)
2. **Task 2: Add dashboard priority header and four-card metric strip** - `dd944e4` (feat)

**Plan metadata:** pending in docs commit

## Files Created/Modified

- `apps/web/app/page.tsx` - Practice-path mode cards and helper copy.
- `apps/web/app/page.test.tsx` - Phase 6 mode label/helper/selected-state tests and Gemini Live safety guard.
- `apps/web/components/json-analysis/json-analysis-panel.tsx` - Dashboard priority derivation and card rendering.
- `apps/web/components/json-analysis/json-analysis-panel.test.tsx` - Dashboard priority and four-metric coverage.
- `apps/web/components/json-analysis/summary-metric-cards.tsx` - Four-card primary metric strip.
- `apps/web/app/globals.css` - Mode-card and priority-card styling.

## Decisions Made

- Kept the audio path labeled generically as Live Audio Practice because the current implementation still references Deepgram.
- Kept priority derivation UI-only and deterministic, avoiding scoring formula or backend contract changes.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

Ready for Plan 06-03 to replace the old tab/list presentation with Phase 6 Pause Analysis, word chip, and phoneme visualization contracts.

---
*Phase: 06-learner-dashboard-analysis-views*
*Completed: 2026-05-08*

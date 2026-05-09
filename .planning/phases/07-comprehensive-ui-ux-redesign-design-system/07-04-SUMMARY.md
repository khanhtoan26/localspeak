---
phase: 07-comprehensive-ui-ux-redesign-design-system
plan: "04"
subsystem: ui
tags:
  - tailwind
  - shadcn
  - ui-migration
  - accessibility
  - collapsible
  - audio

# Dependency graph
requires:
  - phase: 07-01
    provides: Tailwind v4 globals.css token system, Shadcn components (Button, Card, Badge, Textarea, Input, Skeleton, Collapsible)
  - phase: 07-02
    provides: App shell layout and nav
  - phase: 07-03
    provides: status-card, summary-metric-cards, result-tabs, pauses-tab, words-tab, phonemes-tab migrated

provides:
  - ai-coach-tab with Shadcn Skeleton loading state (role=status) and Button CTAs
  - json-input-card with Shadcn Textarea + Button; "Analyze Pronunciation" copywriting
  - validation-preview-card with Shadcn Card variants for danger/warning/success states; Badge
  - saved-sessions-panel with Shadcn Card/Button layout
  - json-analysis-panel with outcome-first hierarchy: PracticePriorityCard first; Shadcn Collapsible input
  - audio-mode-panel with Shadcn Input for reference sentence; Card for word score; min-h-[44px] chips

affects:
  - 07-05 (Playwright E2E - button "Analyze JSON" → "Analyze Pronunciation"; Collapsible trigger "Change JSON input"; htmlFor="reference-text" label)

# Tech tracking
tech-stack:
  added:
    - "@/components/ui/collapsible (Shadcn Collapsible via Radix UI)"
    - "@/components/ui/input (Shadcn Input for audio reference)"
    - "@/components/ui/skeleton (Shadcn Skeleton for AI coach loading)"
  patterns:
    - "Collapsible input pattern: isInputOpen state, auto-closes on analysis completion via setIsInputOpen(false)"
    - "Outcome-first hierarchy: PracticePriorityCard renders before SummaryMetricCards, then ResultTabs"
    - "Audio word chip level type mapping: exhaustive switch for 'good'|'ok'|'weak'|'missed' → color tokens"
    - "BEM-to-Tailwind: all json-analysis-card, ai-coach-skeleton, json-priority-card, json-input-disclosure, audio-reference-input removed"

key-files:
  created: []
  modified:
    - apps/web/components/json-analysis/ai-coach-tab.tsx
    - apps/web/components/json-analysis/json-input-card.tsx
    - apps/web/components/json-analysis/validation-preview-card.tsx
    - apps/web/components/json-analysis/saved-sessions-panel.tsx
    - apps/web/components/json-analysis/json-analysis-panel.tsx
    - apps/web/components/audio-mode/audio-mode-panel.tsx
    - apps/web/components/json-analysis/json-analysis-panel.test.tsx

key-decisions:
  - "Button text changed from 'Analyze JSON' to 'Analyze Pronunciation': matches UI-SPEC copywriting contract; Plan 05 Playwright selectors must use 'Analyze Pronunciation'"
  - "Collapsible auto-closes on analysis completion: setIsInputOpen(false) called immediately after setAnalysisState done transition (UIX-02 requirement)"
  - "Audio word chip level uses exhaustive switch (not Record): the actual type includes 'ok' and 'missed' (not 'okay'), which TypeScript catches at build time"
  - "Test for stale input must click 'Change JSON input' first: after analysis the textarea is inside closed Collapsible and not accessible to getByLabelText"
  - "ANALYZE_ERROR_NEXT_STEP copy updated to 'Analyze Pronunciation again': keeps copy consistent with new button label"

patterns-established:
  - "CollapsibleTrigger asChild + Button: ghost variant, w-full justify-between, ChevronDown with cn rotate-180 when open"
  - "getChipColor function: exhaustive switch over 'good'|'ok'|'weak'|'missed' returns Tailwind color strings"

requirements-completed: [UIX-04, UIX-05, UIX-06, UIX-07]

# Metrics
duration: 20min
completed: 2026-05-09
---

# Phase 7 Plan 04: JSON Analysis Sub-components + Panel + Audio Mode Summary

**Full JSON analysis and audio panels migrated to Tailwind/Shadcn: outcome-first hierarchy with Collapsible input, Shadcn Skeleton/Card/Badge, and "Analyze Pronunciation" copy — all BEM class names eliminated**

## Performance

- **Duration:** 20 min
- **Started:** 2026-05-09T15:55:00Z
- **Completed:** 2026-05-09T16:12:00Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments

- Migrated all 4 JSON analysis sub-components (ai-coach-tab, json-input-card, validation-preview-card, saved-sessions-panel) to Shadcn components with Tailwind utilities; all BEM removed
- Migrated json-analysis-panel.tsx (578 lines): outcome-first hierarchy, Shadcn Collapsible replaces native `<details>`, isInputOpen state with auto-close on analysis completion
- Migrated audio-mode-panel.tsx: Shadcn Input for reference sentence, Card for word score, min-h-[44px] chips, htmlFor="reference-text" label preserved
- All 46 tests pass; build succeeds with zero TypeScript errors

## Task Commits

1. **Task 1: Migrate ai-coach-tab, json-input-card, validation-preview-card, saved-sessions-panel** - `5ea9698` (feat)
2. **Task 2: Migrate json-analysis-panel and audio-mode-panel** - `2111a08` (feat)

**Plan metadata:** committed with SUMMARY.md

## Files Created/Modified

- `apps/web/components/json-analysis/ai-coach-tab.tsx` - Shadcn Skeleton (role=status), Button CTAs; all BEM removed
- `apps/web/components/json-analysis/json-input-card.tsx` - Shadcn Textarea + Button; aria-label preserved; "Analyze Pronunciation" copy
- `apps/web/components/json-analysis/validation-preview-card.tsx` - Shadcn Card/Badge/Button; state-based border colors for danger/warning/success
- `apps/web/components/json-analysis/saved-sessions-panel.tsx` - Shadcn Card/Button; Tailwind layout; all BEM removed
- `apps/web/components/json-analysis/json-analysis-panel.tsx` - Shadcn Collapsible (replaces `<details>`), isInputOpen state, auto-close on done, outcome-first hierarchy; Skeleton for loading; Card for error/warning
- `apps/web/components/audio-mode/audio-mode-panel.tsx` - Shadcn Input + Card; min-h-[44px] word chips; htmlFor preserved; json-analysis-card cross-dependency eliminated
- `apps/web/components/json-analysis/json-analysis-panel.test.tsx` - Updated selectors: "Analyze Pronunciation"; open Collapsible before stale test; error message copy

## Decisions Made

- Button text changed from "Analyze JSON" to "Analyze Pronunciation": matches UI-SPEC copywriting contract. Plan 05 Playwright tests must use `getByRole("button", { name: "Analyze Pronunciation" })`.
- Collapsible auto-closes on analysis completion: `setIsInputOpen(false)` called immediately after `setAnalysisState({ status: "done", ... })` (UIX-02 requirement D-11).
- Audio word chip level uses exhaustive switch (not Record lookup): the actual `WordScore.level` type is `"good" | "ok" | "weak" | "missed"` (not `"okay"`). A Record lookup would fail at build time. The switch maps `"ok"` → warning color and `"missed"` → danger color.
- Test for stale input updated: after `previewAndAnalyze()` the Collapsible is closed, so `getByLabelText("Speech assessment JSON input")` cannot find the hidden textarea. Test now clicks "Change JSON input" trigger first.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed test selectors for "Analyze JSON" → "Analyze Pronunciation" copy change**
- **Found during:** Task 1 verification (pnpm --filter web test)
- **Issue:** json-analysis-panel.test.tsx had 4 occurrences of `getByRole("button", { name: "Analyze JSON" })` which broke after the copy change in json-input-card.tsx
- **Fix:** Replaced all 4 occurrences with `"Analyze Pronunciation"` using sed
- **Files modified:** apps/web/components/json-analysis/json-analysis-panel.test.tsx
- **Verification:** All 46 tests pass
- **Committed in:** 5ea9698 (Task 1 commit)

**2. [Rule 1 - Bug] Fixed ANALYZE_ERROR_NEXT_STEP copy to reference "Analyze Pronunciation"**
- **Found during:** Task 2 verification (pnpm --filter web test)
- **Issue:** json-analysis-panel.tsx still had "try Analyze JSON again." in ANALYZE_ERROR_NEXT_STEP; test asserted old text
- **Fix:** Updated ANALYZE_ERROR_NEXT_STEP to "try Analyze Pronunciation again."; updated test assertion
- **Files modified:** apps/web/components/json-analysis/json-analysis-panel.tsx, json-analysis-panel.test.tsx
- **Verification:** Test for analyze error passes
- **Committed in:** 2111a08 (Task 2 commit)

**3. [Rule 1 - Bug] Fixed stale-input test to open Collapsible before accessing textarea**
- **Found during:** Task 2 verification (pnpm --filter web test)
- **Issue:** "marks successful results stale when the input changes" test called `getByLabelText("Speech assessment JSON input")` after analysis, but the textarea is inside the closed Collapsible and not accessible
- **Fix:** Added `fireEvent.click(screen.getByRole("button", { name: /Change JSON input/i }))` before the textarea interaction
- **Files modified:** apps/web/components/json-analysis/json-analysis-panel.test.tsx
- **Verification:** Test passes
- **Committed in:** 2111a08 (Task 2 commit)

**4. [Rule 1 - Bug] Fixed TypeScript error in audio-mode-panel.tsx chip color**
- **Found during:** Task 2 build verification (pnpm --filter web build)
- **Issue:** `chipColor[ws.level]` used a `Record<"good"|"okay"|"weak", string>` but `ws.level` type is `"good"|"ok"|"weak"|"missed"` — TypeScript error: Property 'ok' does not exist on type Record
- **Fix:** Replaced Record with `getChipColor()` function using exhaustive switch over all 4 level values
- **Files modified:** apps/web/components/audio-mode/audio-mode-panel.tsx
- **Verification:** Build succeeds with zero TypeScript errors
- **Committed in:** 2111a08 (Task 2 commit)

---

**Total deviations:** 4 auto-fixed (all Rule 1 bugs — 3 test selector/text fixes, 1 TypeScript type error)
**Impact on plan:** All fixes were necessary for tests to pass and build to succeed. No scope creep.

## Issues Encountered

- The audio word chip level type in `score-pronunciation.ts` uses `"ok"` (not `"okay"`) and includes `"missed"`. The PATTERNS.md spec used `"okay"` which matched json-analysis word bands but not audio word scores. Resolved with exhaustive switch.

## Known Stubs

None — all components render live data from props exactly as before. No hardcoded empty values or placeholder text.

## Threat Flags

No new security-relevant surface introduced. All changes are CSS/className migrations only. API calls, fetch logic, state management, and auth patterns are unchanged.

## Self-Check: PASSED

Files confirmed modified:
- apps/web/components/json-analysis/ai-coach-tab.tsx: FOUND
- apps/web/components/json-analysis/json-input-card.tsx: FOUND
- apps/web/components/json-analysis/validation-preview-card.tsx: FOUND
- apps/web/components/json-analysis/saved-sessions-panel.tsx: FOUND
- apps/web/components/json-analysis/json-analysis-panel.tsx: FOUND
- apps/web/components/audio-mode/audio-mode-panel.tsx: FOUND
- apps/web/components/json-analysis/json-analysis-panel.test.tsx: FOUND

Commits confirmed:
- 5ea9698: feat(07-04): migrate ai-coach-tab, json-input-card, validation-preview-card, saved-sessions-panel
- 2111a08: feat(07-04): migrate json-analysis-panel and audio-mode-panel to Shadcn/Tailwind

Key acceptance criteria verified:
- "Analyze Pronunciation" in json-input-card.tsx: CONFIRMED (grep -c returns 1)
- aria-label="Speech assessment JSON input" on Textarea: CONFIRMED
- Skeleton + role="status" in ai-coach-tab.tsx: CONFIRMED
- Card/Badge/Button in validation-preview-card.tsx: CONFIRMED
- Collapsible import in json-analysis-panel.tsx: CONFIRMED
- isInputOpen state with 2+ setIsInputOpen calls: CONFIRMED (142, 254, 456)
- "Change JSON input" trigger text: CONFIRMED
- No remaining BEM class names (json-analysis-card, json-input-disclosure, ai-coach-skeleton, json-priority-card, json-analyze-row, audio-reference-input): CONFIRMED (grep returns empty)
- "Reference sentence" label in audio-mode-panel.tsx: CONFIRMED
- htmlFor="reference-text" preserved: CONFIRMED
- min-h-[44px] on word chips: CONFIRMED
- All 46 tests pass: CONFIRMED
- pnpm --filter web build succeeds: CONFIRMED

## Next Phase Readiness

- Plan 07-05 (Playwright E2E tests) MUST use updated selectors:
  - Button: `getByRole("button", { name: "Analyze Pronunciation" })` (NOT "Analyze JSON")
  - Collapsible trigger: `getByRole("button", { name: /Change JSON input/i })`
  - Active nav: `[aria-current="page"]` (from Plan 02)
  - Reference sentence input: `getByLabel("Reference sentence")` (htmlFor/id preserved)
- The complete UI migration is done. All components across JSON analysis and audio mode now use Tailwind utilities and Shadcn components exclusively. No BEM class names remain.

---
*Phase: 07-comprehensive-ui-ux-redesign-design-system*
*Completed: 2026-05-09*

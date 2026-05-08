# Phase 6: Learner Dashboard & Analysis Views - Pattern Map

**Mapped:** 2026-05-08  
**Files analyzed:** 17 new/modified files  
**Analogs found:** 16 / 17

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `apps/web/app/page.tsx` | component/page | UI state | `apps/web/app/page.tsx` | exact |
| `apps/web/components/json-analysis/json-analysis-panel.tsx` | component/orchestrator | request-response + state machine | `apps/web/components/json-analysis/json-analysis-panel.tsx` | exact |
| `apps/web/components/json-analysis/summary-metric-cards.tsx` | component | transform/render | `apps/web/components/json-analysis/summary-metric-cards.tsx` | exact |
| `apps/web/components/json-analysis/result-tabs.tsx` | component | event-driven UI state | `apps/web/components/json-analysis/result-tabs.tsx` | exact |
| `apps/web/components/json-analysis/pauses-tab.tsx` | component | transform/render | `apps/web/components/json-analysis/pauses-tab.tsx` | exact |
| `apps/web/components/json-analysis/words-tab.tsx` | component | transform/render | `apps/web/components/json-analysis/words-tab.tsx` | exact |
| `apps/web/components/json-analysis/phonemes-tab.tsx` | component | transform/render | `apps/web/components/json-analysis/phonemes-tab.tsx` | exact |
| `apps/web/components/json-analysis/ai-coach-tab.tsx` | component | request-response state render | `apps/web/components/json-analysis/ai-coach-tab.tsx` | exact |
| `apps/web/components/json-analysis/saved-sessions-panel.tsx` | new component | CRUD request-response | `apps/web/components/json-analysis/json-analysis-panel.tsx`, `apps/api/src/saved-sessions/saved-sessions.controller.ts` | role-match |
| `apps/web/lib/saved-sessions/owner-key.ts` | new utility | browser storage | none | no analog |
| `apps/web/components/audio-mode/audio-mode-panel.tsx` | component | streaming + event-driven UI | `apps/web/components/audio-mode/audio-mode-panel.tsx` | exact |
| `apps/web/components/audio-mode/live-analysis-panel.tsx` | component | streaming render | `apps/web/components/audio-mode/live-analysis-panel.tsx` | exact |
| `apps/web/components/audio-mode/record-button.tsx` | component | event-driven recording control | `apps/web/components/audio-mode/record-button.tsx` | exact |
| `apps/web/app/globals.css` | config/style | render styling | `apps/web/app/globals.css` | exact |
| `apps/web/components/json-analysis/json-analysis-panel.test.tsx` | test | request-response + UI state | `apps/web/components/json-analysis/json-analysis-panel.test.tsx` | exact |
| `apps/web/app/page.test.tsx` | new test | event-driven UI state | `apps/web/components/status-panel.test.tsx`, `apps/web/components/json-analysis/json-analysis-panel.test.tsx` | role-match |
| `apps/web/components/json-analysis/saved-sessions-panel.test.tsx` | new test | CRUD request-response | `apps/web/components/json-analysis/json-analysis-panel.test.tsx`, `apps/api/test/saved-sessions.e2e-spec.ts` | role-match |

## Pattern Assignments

### `apps/web/app/page.tsx`

- Keep the existing `"use client"` page component and local `Mode = "json" | "audio"` state.
- Keep button-based mode switching with `aria-pressed`.
- Update labels/copy to the UI-SPEC practice paths: `JSON Analysis` and `Live Audio Practice` with helper descriptions.
- Switching modes must not clear completed JSON results unless the user explicitly clears them.

### `apps/web/components/json-analysis/json-analysis-panel.tsx`

- Preserve the existing local state-machine style:
  - JSON text/file/preview state
  - `AnalysisState = idle | loading | done | error`
  - `AiCoachState = idle | loading | done | error`
- Preserve Zod parsing before success state for all API responses.
- Add dashboard priority and saved-session state around the existing flow rather than replacing the preview/analyze/AI feedback flow.
- Keep deterministic results visible while AI feedback loads or fails.

### `apps/web/components/json-analysis/summary-metric-cards.tsx`

- Keep the helper-array mapping pattern.
- Make the primary dashboard strip exactly four cards:
  - `Pronunciation`
  - `Pronunciation Band`
  - `Fluency Band`
  - `WPM`
- Move pause ratio into Pause Analysis summary instead of rendering it as a fifth primary metric.

### `apps/web/components/json-analysis/result-tabs.tsx`

- Keep the `tabs as const` union pattern and local active-tab state.
- Rename/reorder tabs to:
  - `Pause Analysis`
  - `Words`
  - `Phonemes`
  - `IELTS Analysis`
- Default active tab should be `Pause Analysis`.
- Absorb the current `SummaryTab` content into the dashboard header/priority card rather than retaining a fifth tab.

### `apps/web/components/json-analysis/pauses-tab.tsx`

- Keep typed `Record<PauseSeverity, string>` severity label mapping.
- Preserve pause row copy with duration, before/after words, timing range, and explanation.
- Add required order:
  1. Pause summary card
  2. SVG timeline
  3. Severity legend
  4. Worst pause practice cue
  5. Duration-sorted list
- Timeline and list must not rely on color alone.

### `apps/web/components/json-analysis/words-tab.tsx`

- Keep typed `Record<WordBand, string>` label mapping.
- Replace list rows with sentence-order score chips.
- Always render chips when words exist, even if no weak words exist.
- Show weak-words shortlist only when at least one word has `band === "weak"`.
- Prefer existing `word.band` from the shared contract for chip color; do not duplicate inconsistent UI thresholds silently.

### `apps/web/components/json-analysis/phonemes-tab.tsx`

- Keep `WeakPhonemePattern[]` input.
- Add a UI-only impact ranking using average score, weak occurrence count, and supported Vietnamese/IELTS relevance.
- Render bars, ARPAbet, IPA examples, counts, score percent, example words, and one concise explanation.
- Show Vietnamese learner hints only when analysis data matches supported patterns.

### `apps/web/components/json-analysis/ai-coach-tab.tsx`

- Preserve idle/loading/error/success/retry branching.
- Rename user-facing tab/section to `IELTS Analysis`.
- Use polished loading/progress states compatible with strict JSON feedback; do not add a JSON streaming API in Phase 6.
- AI errors must not hide dashboard/tabs.

### `apps/web/components/json-analysis/saved-sessions-panel.tsx`

- New component recommended for secondary save/history/reopen UI.
- Follow `JsonAnalysisPanel` fetch + Zod parse + explicit error-state pattern.
- Use `SavedSessionCreateResponseSchema`, `SavedSessionListResponseSchema`, and `SavedSessionDetailResponseSchema`.
- Use existing backend saved-session API behavior:
  - `POST /api/saved-sessions`
  - `GET /api/saved-sessions?ownerKey=...`
  - `GET /api/saved-sessions/:id?ownerKey=...`
- Never include raw vendor payload fields rejected by `SavedSessionJsonSnapshotSchema`.

### `apps/web/lib/saved-sessions/owner-key.ts`

- New utility with no exact analog.
- Keep small and browser-only.
- Generate a random local-history `ownerKey` with `crypto.randomUUID()` or equivalent.
- Store it under an app-specific `localStorage` key.
- Treat it as local history partitioning, not authentication.

### Audio mode components

- Preserve existing reference input -> record control -> live analysis layout.
- Update copy to `Start Recording` / `Stop Recording` per UI-SPEC/checker recommendation.
- Do not label current implementation as Gemini Live until the Deepgram/Gemini mismatch is verified or reconciled.

### `apps/web/app/globals.css`

- Extend existing custom CSS classes/tokens.
- Do not introduce Tailwind, shadcn, Radix, charting libraries, or third-party UI registries.
- Use UI-SPEC spacing, typography, color, accessibility, and responsive rules.

### Tests

- Update `apps/web/components/json-analysis/json-analysis-panel.test.tsx` for new dashboard/tabs/visualization behavior.
- Add `apps/web/app/page.test.tsx` for top-level mode labels and non-clearing behavior.
- Add `apps/web/components/json-analysis/saved-sessions-panel.test.tsx` if saved-session UI is extracted.
- Follow existing Testing Library patterns from `json-analysis-panel.test.tsx`.

## Reuse Rules

- Reuse existing Zod parsing and request-response state patterns.
- Reuse existing semantic CSS class family and extend it surgically.
- Reuse computed contract fields rather than recalculating scoring formulas.
- Reuse `word.band`, `scorePercent`, `PauseMetric`, and `WeakPhonemePattern` fields from contracts.

## Gaps / Risks

- Audio mode currently references Deepgram implementation while planning docs say Gemini Live is canonical. Include a plan task to verify/reconcile labels before changing audio copy.
- Saved-session ownerKey utility does not exist in web code and needs a small tested implementation.
- UI-SPEC word chip threshold text can conflict with existing `word.band`; prefer contract values unless explicitly changing shared thresholds.
- Current tests assert pre-Phase-6 tabs/list behavior and will need updates.

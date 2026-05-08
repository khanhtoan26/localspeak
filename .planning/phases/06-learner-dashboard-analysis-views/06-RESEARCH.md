# Phase 06: Learner Dashboard & Analysis Views - Research

**Researched:** 2026-05-08  
**Domain:** Next.js frontend dashboard/UI over existing pronunciation, fluency, Gemini feedback, and saved-session contracts  
**Confidence:** HIGH for JSON dashboard and saved-session integration; MEDIUM for audio-mode details because current code still references Deepgram while roadmap/state decisions describe Gemini Live.

<user_constraints>
## User Constraints

### Locked Decisions

- **D-01 through D-04:** Use a learner-first dashboard header, compact reason sentence, top-level JSON/audio practice paths, and secondary saved-session controls.
- **D-05 through D-08:** Build Pause Analysis around a visual timeline first, use accessible severity labels/legend, show before/after words plus duration, and include one practice cue for the worst pause.
- **D-09 through D-13:** Show sentence-order word chips, keep weak-word shortlist secondary, rank phonemes by learner impact, include concise phoneme explanations, and show Vietnamese learner hints only when supported by detected data.
- **D-14 through D-17:** Keep deterministic metrics first, make AI feedback opt-in, do not require true streaming for JSON feedback, preserve audio live output, and support idle/loading/success/error/retry AI states.
- **D-18 through D-21:** Include lightweight save/history/reopen UI using Phase 5 APIs; keep saved sessions secondary; do not add rename, delete, account linking, authentication, or advanced progress analytics.

### Deferred Ideas

- Rename/delete/update saved sessions.
- Account linking, login, and authenticated saved history.
- Advanced progress analytics across saved attempts.
- Lexical Resource, Grammar scoring, and full IELTS Speaking simulation.

</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Requirement | Research Support |
|----|-------------|------------------|
| UI-01 | Dashboard header with pronunciation percentage, Pronunciation Band, Fluency Band, and WPM | `JsonAnalysisSummary` already provides these values; `SummaryMetricCards` renders them today but also includes pause ratio as a fifth primary card. |
| UI-02 | JSON/audio mode switching | `apps/web/app/page.tsx` already owns top-level `"json"` / `"audio"` mode state and renders `JsonAnalysisPanel` or `AudioModePanel`. |
| UI-03 | JSON tabs for Pause Analysis, Words, Phonemes, IELTS Analysis | Existing tabs are `Summary`, `Words`, `Phonemes`, `Pauses`, `AI Coach`; Phase 6 should rename/reorder and absorb Summary into dashboard header. |
| UI-04 | Pause summary, SVG timeline, sorted pause list | `PauseMetric` already includes severity, duration, start/end, before/after words, nearby words, and explanation. |
| UI-05 | Score-colored word chips | `WordMetric` includes order/index, word, score, scorePercent, band, start/end, and duration; current `WordsTab` renders list rows. |
| UI-06 | Ranked phoneme weakness bars grouped by ARPAbet | `WeakPhonemePattern` provides ARPAbet, IPA examples, average score, weak occurrence count, and example words; UI needs bars/explanations/impact ranking. |
| UI-07 | IELTS Analysis trigger and streamed-output UI | Existing JSON-mode AI feedback uses strict JSON `POST /api/gemini-feedback`; Phase 6 may use polished loading/progress states instead of backend streaming changes. |

</phase_requirements>

## Summary

Phase 6 should be planned as a frontend-heavy refinement over existing contracts and components, not as a backend scoring phase. The main work is to refactor `JsonAnalysisPanel`, `SummaryMetricCards`, `ResultTabs`, `PausesTab`, `WordsTab`, `PhonemesTab`, and `AiCoachTab` while preserving existing fetch endpoints and Zod response validation.

The JSON analysis response already contains the data needed for dashboard priority, metric cards, pause timeline/list, word chips, and phoneme ranking. The planner should avoid backend pronunciation/fluency formula changes because v1 scoring formulas are already complete and Phase 6 explicitly excludes formula redesign.

The biggest planning risk is audio-mode inconsistency: project state and roadmap say audio should use Gemini Live API with ephemeral tokens, but current code still uses `useDeepgramSession`, Deepgram tokening, and Deepgram WebSocket behavior. Phase 6 should not silently relabel Deepgram behavior as Gemini Live. It should either keep generic “AI coach/live audio” copy or include a small reconciliation/audit task before changing audio UI labels.

**Primary recommendation:** Plan this phase in four waves:

1. Dashboard shell, practice-path mode labels, priority header, metric strip, and baseline test updates.
2. Tab refactor plus pause timeline, word chips, and phoneme visualizations.
3. IELTS Analysis polish and lightweight saved-session UI.
4. Accessibility, responsive, contract coverage, and final verification hardening.

## Project Constraints

- Keep frontend-only Gemini API calls out of scope; API keys stay server-side.
- Keep v1 scoring focused on Pronunciation and Fluency.
- Continue the existing custom CSS approach from `apps/web/app/globals.css`; do not introduce Tailwind, shadcn, Radix, charting libraries, or new UI dependencies for Phase 6.
- Use shared contracts from `@localspeak/contracts` and parse API responses with Zod before rendering success UI.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|--------------|----------------|-----------|
| Dashboard priority and metric presentation | Browser/client | Existing JSON analysis output | Priority should derive from existing outputs and not change scoring formulas. |
| Top-level JSON/audio switching | Browser/client | — | `apps/web/app/page.tsx` already owns mode state. |
| Pause timeline/list | Browser/client | Existing `PauseMetric` | Timeline rendering is UI-only. |
| Word chips | Browser/client | Existing `WordMetric` | Word band, score, timing, and order are already available. |
| Phoneme weakness bars | Browser/client | Shared contracts | Existing weak patterns provide score/count/examples; UI adds ranking/explanations. |
| IELTS Analysis tab | Browser/client | Existing Gemini feedback API | Use current strict JSON feedback endpoint and polished states. |
| Save/history/reopen | Browser/client | Saved-session API + DB | Use Phase 5 create/list/fetch operations scoped by `ownerKey`. |
| Audio live panel labels | Browser/client | Current audio implementation | Verify Deepgram/Gemini mismatch before changing labels. |

## Standard Stack

| Library / Tool | Current Role | Planning Guidance |
|----------------|--------------|-------------------|
| Next.js + React | Web UI, client state, app page routing | Continue current client-component style. |
| `@localspeak/contracts` + Zod | Shared API request/response schemas | Parse saved-session responses just like JSON analysis and Gemini responses. |
| Custom CSS in `globals.css` | Cards, tabs, buttons, semantic colors, responsive styles | Extend existing classes/tokens; do not add UI libraries. |
| Vitest + Testing Library + jsdom | Component tests | Use existing test infrastructure for Phase 6 coverage. |

No new package installation is recommended for Phase 6.

## Architecture Patterns

### Pattern 1: Keep deterministic results visible while AI changes state

AI feedback should be opt-in and rendered in `IELTS Analysis` while dashboard, pause, word, and phoneme views remain available. An AI failure must only affect the AI section, not the deterministic results.

### Pattern 2: Contract-validate API responses before rendering

Use shared Zod schemas for saved-session create/list/fetch responses, matching the existing pattern used for JSON preview, JSON analyze, sample loading, and Gemini feedback.

### Pattern 3: Use UI-only derivations for dashboard priority

Compute priority text from existing `JsonAnalysisResponse` without changing shared scoring functions. Recommended priority order:

1. Repeated weak phoneme pattern with supported Vietnamese/IELTS relevance.
2. Critical or longest pause.
3. Weak word concentration.
4. WPM or pause ratio issue.

### Anti-Patterns to Avoid

- Adding new UI libraries or charting dependencies.
- Changing pronunciation/fluency scoring formulas.
- Replacing sentence-order word chips with only a sorted list.
- Showing Vietnamese-specific hints without matching analysis data.
- Labeling the current audio implementation as Gemini Live without verifying/reconciling the Deepgram mismatch.
- Persisting raw vendor speech-assessment JSON in saved sessions.

## Common Pitfalls

### Pitfall 1: Audio implementation mismatch

Current audio code uses Deepgram while roadmap/state decisions say Gemini Live. Plan a verification/reconciliation task before changing audio labels, or keep labels generic enough not to misrepresent the implementation.

### Pitfall 2: Summary tab remains as a fifth tab

Existing `ResultTabs` defaults to `Summary` and includes five tabs. Phase 6 requires four JSON tabs: `Pause Analysis`, `Words`, `Phonemes`, and `IELTS Analysis`. Move summary content into the dashboard header.

### Pitfall 3: Pause timeline loses list details

Phase 6 requires both visual timeline and inspectable pause details. Implement summary card, SVG timeline, legend, worst pause cue, and sorted list.

### Pitfall 4: Words tab hides all words when there are no weak words

Current `WordsTab` returns an empty state when no weak words exist. Phase 6 should always show sentence-order chips when words exist; only the weak-words shortlist is conditional.

### Pitfall 5: Saved-session payload stores raw vendor JSON

`SavedSessionJsonSnapshotSchema` rejects raw vendor keys such as `speechAssessment`, `rawSpeechAssessment`, and `vendorPayload`. Save sanitized metadata and derived metrics snapshots, not the original vendor payload.

### Pitfall 6: Word band threshold mismatch

Current shared logic uses `word.band`; UI-SPEC includes illustrative chip thresholds. Prefer the existing contract `word.band` for chip coloring unless the plan explicitly includes a shared threshold update and contract test changes.

## Open Questions for Planning (RESOLVED)

1. Audio mismatch — **RESOLVED:** Phase 6 will not claim Gemini Live while current code imports `useDeepgramSession`; it will use generic `Live Audio Practice` / `AI coach` copy unless implementation is reconciled before execution.
2. Word chip colors — **RESOLVED:** Use existing contract `word.band` for chip color and labels; do not duplicate UI-only thresholds.
3. ownerKey — **RESOLVED:** Store unauthenticated saved-history ownership in browser `localStorage` under `localspeak.ownerKey.v1`; treat it as local-history partitioning, not authentication.

## Environment Availability

| Dependency | Required By | Available | Fallback |
|------------|-------------|-----------|----------|
| Node.js | Next/Vitest/TypeScript | yes | — |
| pnpm | Monorepo scripts | yes | — |
| npm | Version verification | yes | — |
| Docker | Optional backend/DB local dependency | yes | Mock fetch for frontend saved-session UI tests if DB is not needed. |
| `psql` CLI | Manual DB inspection | no | Use backend tests or Docker DB tooling if needed; frontend tests can mock saved-session fetch. |

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest |
| React testing | `@testing-library/react` |
| Config file | `apps/web/vitest.config.mts` |
| Environment | `jsdom` with `apps/web/test/setup.ts` |
| Quick run command | `pnpm --filter web test` |
| Typecheck command | `pnpm --filter web check` |
| Current baseline | Researcher reported `pnpm --filter web test` passed 4 files / 35 tests and `pnpm --filter web check` passed. |

### Phase Requirements to Test Map

| Req ID | Behavior | Test Type | Suggested Command |
|--------|----------|-----------|-------------------|
| UI-01 | Dashboard header and four primary metrics render from `JsonAnalysisResponse.summary`. | component | `pnpm --filter web test -- components/json-analysis/json-analysis-panel.test.tsx -t "dashboard"` |
| UI-02 | JSON/audio mode switch labels and selected state work without clearing completed JSON results. | component | `pnpm --filter web test -- app/page.test.tsx` |
| UI-03 | Tabs are exactly `Pause Analysis`, `Words`, `Phonemes`, `IELTS Analysis` and default to Pause Analysis. | component | `pnpm --filter web test -- components/json-analysis/json-analysis-panel.test.tsx -t "tabs"` |
| UI-04 | Pause tab shows summary stats, accessible SVG timeline, legend, worst pause cue, and duration-sorted list. | component | `pnpm --filter web test -- components/json-analysis/json-analysis-panel.test.tsx -t "pause"` |
| UI-05 | Words tab renders all words as sentence-order chips with visible/accessibility score labels and optional weak shortlist. | component | `pnpm --filter web test -- components/json-analysis/json-analysis-panel.test.tsx -t "word"` |
| UI-06 | Phonemes tab ranks weak patterns with bars, ARPAbet, IPA examples, counts, average scores, explanations, and conditional Vietnamese hints. | component | `pnpm --filter web test -- components/json-analysis/json-analysis-panel.test.tsx -t "phoneme"` |
| UI-07 | IELTS Analysis tab triggers `/api/gemini-feedback`, shows idle/loading/success/error/retry, and preserves deterministic results. | component | `pnpm --filter web test -- components/json-analysis/json-analysis-panel.test.tsx -t "AI feedback"` |

### Wave 0 Test Gaps

- Add `apps/web/app/page.test.tsx` for top-level mode labels/descriptions and non-clearing behavior.
- Update `apps/web/components/json-analysis/json-analysis-panel.test.tsx` for the new dashboard, tabs, pause timeline, word chips, phoneme visuals, and AI feedback states.
- Add saved-session component tests if extracting `saved-sessions-panel.tsx`.
- Add accessibility assertions for SVG pause labels, word chip accessible names, and descriptive reopen buttons.

### Sampling Rate

- Per task: targeted component test plus `pnpm --filter web test` when feasible.
- Per wave: `pnpm --filter web check && pnpm --filter web test`.
- Phase gate: root `pnpm test` or at least `pnpm --filter web check && pnpm --filter web test`; run backend tests only if backend behavior changes.

## Security Domain

| Pattern | Risk | Standard Mitigation |
|---------|------|---------------------|
| Rendering vendor text containing script-like strings | XSS | Render as React text; do not use `dangerouslySetInnerHTML`; preserve existing XSS-oriented tests. |
| Raw vendor JSON accidentally persisted | Information disclosure / data minimization | Saved-session schema rejects raw vendor keys; save sanitized metadata and derived snapshots. |
| ownerKey exposure/collision | Spoofing / information disclosure | Generate sufficiently long browser-local ownerKey; do not present it as authentication; always scope list/fetch by ownerKey. |
| API contract drift | Reliability / tampering | Parse backend responses with Zod before rendering success UI. |

## Sources

- `.planning/phases/06-learner-dashboard-analysis-views/06-CONTEXT.md`
- `.planning/phases/06-learner-dashboard-analysis-views/06-UI-SPEC.md`
- `.planning/REQUIREMENTS.md`
- `.planning/STATE.md`
- `.planning/ROADMAP.md`
- `apps/web/app/page.tsx`
- `apps/web/components/json-analysis/*.tsx`
- `apps/web/components/audio-mode/*.tsx`
- `apps/web/app/globals.css`
- `packages/contracts/src/json-analysis.ts`
- `packages/contracts/src/gemini-feedback.ts`
- `packages/contracts/src/saved-session.ts`
- `apps/api/src/saved-sessions/*`
- `apps/api/src/database/schema.ts`
- `apps/api/src/gemini-feedback/*`

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH.
- JSON dashboard and saved-session architecture: HIGH.
- Audio service alignment: MEDIUM because source code and roadmap/state disagree.
- Validation strategy: HIGH.

**Valid until:** 2026-06-07 for frontend/UI planning; revisit sooner if Phase 4 audio implementation changes before Phase 6 execution.

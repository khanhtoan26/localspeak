# Phase 2: JSON Input & Pronunciation/Fluency Metrics - Context

**Gathered:** 2026-05-07
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 2 turns the Phase 1 foundation into a JSON-mode analysis flow. Learners can paste or upload speech assessment JSON, validate it, send it to the backend, and receive deterministic pronunciation and fluency metrics. This phase does not call Gemini, process raw audio, save history, or build the full learner dashboard; those remain later roadmap phases.

</domain>

<decisions>
## Implementation Decisions

### JSON submission flow
- **D-01:** Paste JSON is the primary input path; file upload is secondary.
- **D-02:** Include a one-click sample JSON action using `.artifacts/speech-response.json` so developers and learners can quickly see a working analysis.
- **D-03:** Analysis runs from a manual "Analyze JSON" action after the user has a validation preview. Do not auto-run full metrics immediately on paste.
- **D-04:** The NestJS backend owns JSON validation and deterministic metric computation. The frontend sends the JSON payload to the backend and renders the returned analysis.

### Validation error behavior
- **D-05:** Malformed JSON should show a friendly learner-facing summary first, with expandable technical details available.
- **D-06:** Show the most important 3-5 validation issues first, with full details available for debugging.
- **D-07:** Validation messages should include both a learner-friendly label and the exact JSON path.
- **D-08:** If JSON is valid enough to compute metrics but produces suspicious values, accept it, show warning callouts, and still compute metrics.

### Metric output priorities
- **D-09:** The primary summary should show pronunciation percentage, Pronunciation Band, Fluency Band, WPM, and pause ratio.
- **D-10:** Repeated weak-phoneme patterns should prioritize the top 5 weak ARPAbet phones by repeated low scores, with IPA examples.
- **D-11:** Word-level output should be a color-banded weak/okay/good word list with score and timing.
- **D-12:** Fluency output should include a notable pauses list with severity, duration, and nearby words.
- **D-17:** Word quality bands should use the approved UI-SPEC thresholds for Phase 2: weak `<0.65`, okay `>=0.65 && <0.85`, and good `>=0.85`.
- **D-18:** MET-06 should use the researched provisional Fluency band rubric: `criticalPauseCount >= 3 || pauseRatio >= 0.30` -> `5.5`; `criticalPauseCount >= 2 || pauseRatio >= 0.20` -> `6.0`; `criticalPauseCount >= 1 || pauseRatio >= 0.15` -> `6.5`; `pauseRatio <= 0.10 && wpm >= 140 && wpm <= 160` -> `7.5`; otherwise `7.0`; cap to `6.0` when `wpm < 100 || wpm > 190`, and cap to `6.5` when `wpm < 120 || wpm > 180`.
- **D-19:** Pause severity should use PROJECT thresholds only in Phase 2: natural/acceptable `0.3s <= gap < 0.5s`, noticeable/warning `0.5s <= gap < 1.0s`, and critical `gap >= 1.0s`. Do not add a separate `Long` severity yet.
- **D-20:** Analysis responses should return derived/extracted analysis fields, warnings, and metrics only; do not echo the full original speech assessment JSON unless a later phase explicitly needs it.

### Result presentation style
- **D-13:** Use a single analysis page: input panel on top, results below in warm cards.
- **D-14:** Use lightweight result tabs: Summary, Words, Phonemes, Pauses.
- **D-15:** Deterministic explanations should be coach-like but clearly non-Gemini, using language like "This suggests..." rather than pretending to be an IELTS examiner.
- **D-16:** If an accepted JSON result has no major weak phoneme or pause problems, show a positive empty state such as "No repeated weak pattern found."

### the agent's Discretion
- No Phase 2 decisions were delegated to agent discretion.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project scope and requirements
- `.planning/PROJECT.md` - Product vision, JSON-mode metric thresholds, Vietnamese IELTS learner focus, and v1 boundaries.
- `.planning/REQUIREMENTS.md` - Phase 2 requirements `JSON-01`, `JSON-02`, `JSON-03`, `MET-01`, `MET-02`, `MET-03`, `MET-04`, `MET-05`, and `MET-06`.
- `.planning/ROADMAP.md` - Phase 2 goal, dependency on Phase 1, and success criteria.
- `.planning/STATE.md` - Current milestone state and Phase 2 readiness.
- `.planning/phases/01-monorepo-foundation-contracts/01-CONTEXT.md` - Phase 1 decisions about pnpm layout, shared Zod contracts, fixture usage, API endpoints, and UI direction.
- `.planning/phases/01-monorepo-foundation-contracts/01-VERIFICATION.md` - Verified Phase 1 baseline and current integration points.

### Fixture and visual references
- `.artifacts/speech-response.json` - Canonical speech assessment fixture for sample JSON loading, validation, and deterministic metric regression tests.
- `.wireframe/data.js` - Mock learner result concepts, pause transcript model, score examples, and history examples.
- `.wireframe/screens-static.jsx` - Warm LocalSpeak screen structure and learner-facing result/card direction.
- `.wireframe/components.jsx` - Card, tag, typography, and visual atom direction for warm result presentation.

### Existing code to extend
- `packages/contracts/src/speech-assessment.ts` - Existing speech assessment Zod schema with timing, score, HTTP(S) audio URL, and unknown vendor field behavior.
- `packages/contracts/src/json-analysis.ts` - Current JSON analysis shell to expand into real request/response contracts.
- `packages/contracts/src/index.ts` - Public contracts barrel.
- `apps/api/src/contracts/contracts.controller.ts` - Existing NestJS fixture validation pattern using shared contracts.
- `apps/api/src/app.module.ts` - API module wiring location for any new JSON analysis module.
- `apps/web/components/status-panel.tsx` - Current frontend fetch/runtime-parse/status-card pattern to replace or extend.
- `apps/web/components/status-card.tsx` - Existing accessible card pattern.
- `apps/web/app/globals.css` - Current LocalSpeak warm visual tokens and card styling.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `SpeechAssessmentResponseSchema` already validates the real vendor-style speech assessment payload and should remain the input contract for JSON mode.
- `JsonAnalysisRequestSchema` and `JsonAnalysisResponseSchema` exist as shells and should become the shared API contract for Phase 2 outputs.
- `.artifacts/speech-response.json` contains a real 81-word, 255-phone sample with `total_score`, `text_refs`, word timings, phone scores, ARPAbet labels, and IPA labels.
- `StatusCard` and current global CSS provide reusable warm-card styling and accessible live-region behavior for result cards.

### Established Patterns
- Shared contracts use Zod schemas with inferred TypeScript types in `packages/contracts`.
- API controllers import shared runtime schemas from `@localspeak/contracts`.
- Web fetches same-origin `/api/*` routes through `apps/web/next.config.ts` rewrites and validates response JSON with Zod before rendering success states.
- Tests are already split across contracts Vitest, API Jest unit/e2e, and web Vitest/Testing Library.

### Integration Points
- Add the backend JSON analysis route under `apps/api/src` and wire it through `AppModule`.
- Expand `packages/contracts/src/json-analysis.ts` so frontend and backend agree on request, success response, validation warning, and metric output shapes.
- Replace or evolve `apps/web/app/page.tsx` / `StatusPanel` into the JSON analysis page while preserving the Phase 1 ability to verify API/contract health through tests.
- Keep Gemini feedback, audio mode, Supabase history, and full dashboard views out of this phase except where contracts need future-compatible fields.

</code_context>

<specifics>
## Specific Ideas

- Primary input UI: paste JSON first, upload secondary, plus a sample fixture load action.
- Analysis button: manual "Analyze JSON" after validation preview.
- Summary cards: pronunciation percentage, Pronunciation Band, Fluency Band, WPM, pause ratio.
- Detail tabs: Summary, Words, Phonemes, Pauses.
- Weak phoneme output: top 5 repeated weak ARPAbet phones with IPA examples.
- Word output: weak/okay/good bands using score and timing.
- Pause output: notable pauses with severity, duration, and nearby words.
- Word band thresholds: weak `<0.65`, okay `>=0.65 && <0.85`, good `>=0.85`.
- Fluency band rubric: 5.5 for 3+ critical pauses or pause ratio `>=0.30`; 6.0 for 2+ critical pauses or pause ratio `>=0.20`; 6.5 for 1+ critical pause or pause ratio `>=0.15`; 7.5 for pause ratio `<=0.10` with 140-160 WPM; otherwise 7.0, capped lower for very low/high WPM.
- Pause severity thresholds: natural/acceptable `0.3s-0.5s`, noticeable/warning `0.5s-1.0s`, critical `>=1.0s`; no separate `Long` severity in Phase 2.
- Analysis response should not include the full original speech assessment JSON; render from extracted fields and metric arrays.
- Tone: coach-like and deterministic, e.g. "This suggests...", not Gemini-style feedback yet.

</specifics>

<deferred>
## Deferred Ideas

- Gemini-generated IELTS feedback remains Phase 3.
- Audio upload, recording, streaming analysis, fillers, false starts, intonation, stress, and rhythm remain Phase 4.
- Supabase persistence and saved analysis history remain Phase 5.
- The full dashboard/header/tabs/timeline/chips design remains Phase 6; Phase 2 should implement only the minimal result presentation needed to verify metrics.

</deferred>

---

*Phase: 2-JSON Input & Pronunciation/Fluency Metrics*
*Context gathered: 2026-05-07*

# Phase 6: Learner Dashboard & Analysis Views - Context

**Gathered:** 2026-05-08T15:02:34.887+07:00
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 6 turns existing analysis outputs into a learner-friendly dashboard. The learner should understand the current result through headline metrics, top-level JSON/audio mode switching, JSON analysis tabs, pause timeline/list views, score-colored word chips, ranked phoneme weaknesses, and IELTS coaching UI.

This phase focuses on analysis presentation and lightweight saved-session UX. It does not change pronunciation/fluency scoring formulas, redesign Gemini prompts, add authentication, or expand into Lexical Resource/Grammar scoring.

</domain>

<decisions>
## Implementation Decisions

### Dashboard hierarchy
- **D-01:** Use a learner-first dashboard header: lead with the clearest practice priority, then show the existing key metrics underneath.
- **D-02:** The header should include a compact one-sentence reason for the priority, such as a weak sound pattern plus a fluency issue. Do not turn the header into a long coaching report.
- **D-03:** Preserve top-level JSON Mode and Audio Mode, but label/present them as two practice paths: JSON analysis for imported assessment data and live audio for microphone practice.
- **D-04:** Keep saved-session controls secondary. Saving/history should be accessible but must not distract from the current analysis result.

### Pause timeline
- **D-05:** Build the Pause Analysis tab around a visual timeline first, with a supporting sorted list below it.
- **D-06:** The timeline should use color plus accessible labels/legend for pause severity.
- **D-07:** Pause rows must show before/after words plus duration so the learner knows exactly where the problem occurred.
- **D-08:** Include one explicit practice cue for the worst pause, preferably the longest or most severe pause.

### Word and phoneme visuals
- **D-09:** Show word scores as inline chips in sentence order so weak spots are visible in the spoken text.
- **D-10:** Add a weak-words shortlist only if it helps focus attention; do not replace the sentence-order chip view.
- **D-11:** Rank phoneme weaknesses by practical learner impact: combine low average score, repeat count, and IELTS/Vietnamese relevance where the data supports it.
- **D-12:** Phoneme rows should include a brief learner explanation with the sound label, example words, and why the issue matters.
- **D-13:** Vietnamese learner hints may appear directly in the dashboard only when the analysis data matches known patterns such as /θ/ vs /t,d/, dropped final consonants, or consonant clusters like `thr-`, `str-`, and `tr-`.

### AI Coach and streamed analysis UI
- **D-14:** Keep deterministic metrics first. AI coaching remains opt-in through a button and a dedicated AI Coach tab/section.
- **D-15:** For JSON-mode AI feedback, do not require a backend API change to true streaming in Phase 6. Use polished loading/progress states that feel streamed where appropriate, while keeping compatibility with the existing strict JSON feedback endpoint.
- **D-16:** Audio mode can continue to use its live/streaming analysis panel for real-time text output.
- **D-17:** AI Coach states must cover idle, loading, success, error, and retry without hiding deterministic results.

### Saved-session UI boundary
- **D-18:** Include a light saved-session UX in Phase 6 because Phase 5 explicitly deferred learner-facing save/history/reopen UI here.
- **D-19:** Scope the saved-session UX to explicit save, history list, and reopen saved session using the Phase 5 APIs.
- **D-20:** Present saved sessions in a secondary panel, sidebar, or lightweight dialog. Do not make history a top-level mode unless planning finds the layout would otherwise be cramped.
- **D-21:** Do not add rename, delete, account linking, authentication, or advanced progress analytics in this phase.

### the agent's Discretion
- Most UI microcopy, exact card layout, spacing, chart styling, and component decomposition are left to the planner/implementer.
- The planner may choose the exact algorithm for deriving the headline practice priority from available metrics, as long as it is explainable from existing analysis outputs and does not invent unsupported diagnoses.
- The planner may choose whether the saved-session UI is a side panel, modal/dialog, or collapsible card, as long as it stays secondary to the current result.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project scope and requirements
- `.planning/PROJECT.md` - Product scope, Vietnamese IELTS learner focus, v1 boundaries, scoring scope, and UI direction.
- `.planning/REQUIREMENTS.md` - Phase 6 requirements `UI-01` through `UI-07`, plus saved-session requirements already completed in Phase 5.
- `.planning/ROADMAP.md` - Phase 6 goal, dependencies, and success criteria.
- `.planning/STATE.md` - Current project state and recent architecture decisions.

### Prior phase decisions
- `.planning/phases/03-json-mode-ielts-feedback/03-CONTEXT.md` - AI feedback is manually triggered after deterministic results and shown in AI Coach UI with loading/error/retry states.
- `.planning/phases/04-audio-streaming-via-gemini-live-api/04-CONTEXT.md` - Audio mode is a top-level mode with reference text, record controls, waveform, and live analysis panel.
- `.planning/phases/05-saved-analysis-persistence-service-drizzle-postgres/05-CONTEXT.md` - Saved sessions use explicit save, temporary `ownerKey`, create/list/fetch APIs, and defer learner-facing UI to Phase 6.

### Existing frontend integration points
- `apps/web/app/page.tsx` - Current top-level JSON/audio mode switch.
- `apps/web/components/json-analysis/json-analysis-panel.tsx` - Current JSON input, analysis state, summary cards, AI feedback trigger, and result tab wiring.
- `apps/web/components/json-analysis/summary-metric-cards.tsx` - Existing metric card component for pronunciation percentage, bands, WPM, and pause ratio.
- `apps/web/components/json-analysis/result-tabs.tsx` - Current result tab structure.
- `apps/web/components/json-analysis/pauses-tab.tsx` - Current pause list to expand into timeline plus list.
- `apps/web/components/json-analysis/words-tab.tsx` - Current word list to convert into score-colored chips.
- `apps/web/components/json-analysis/phonemes-tab.tsx` - Current repeated weak phoneme pattern list to enrich/rank.
- `apps/web/components/json-analysis/ai-coach-tab.tsx` - Current AI Coach idle/loading/success/error UI.
- `apps/web/components/audio-mode/audio-mode-panel.tsx` - Current audio-mode panel and live analysis surface.

### Shared contracts
- `packages/contracts/src/json-analysis.ts` - JSON analysis response shape that feeds dashboard metrics, pause timeline, word chips, and phoneme rankings.
- `packages/contracts/src/gemini-feedback.ts` - AI Coach request/response shape.
- `packages/contracts/src/saved-session.ts` - Saved-session create/list/fetch contracts for save/history/reopen UI.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `JsonAnalysisPanel` already manages pasted/uploaded JSON, preview validation, analyze state, stale-result state, and AI feedback state.
- `SummaryMetricCards` already renders the required headline metric values, but Phase 6 should reshape the hierarchy into a learner-first dashboard.
- `ResultTabs` already has Summary, Words, Phonemes, Pauses, and AI Coach tabs; the requested Phase 6 tabs should be reconciled with these names and order.
- `PausesTab`, `WordsTab`, and `PhonemesTab` already render basic lists that can be upgraded rather than replaced wholesale.
- `AiCoachTab` already handles idle/loading/error/retry/success states.
- `AudioModePanel` already provides a reference text input, record button, live analysis display, and post-recording score card.

### Established Patterns
- Frontend components use simple client-side React state and contract validation through `@localspeak/contracts` Zod schemas.
- UI styling currently uses shared CSS classes such as `json-analysis-card`, `json-tab-list`, `json-tab-button`, `json-result-list`, and `json-result-row`.
- API calls use same-origin `/api/*` routes from the web app.
- Deterministic metrics remain visible when AI feedback fails; this pattern should be preserved.

### Integration Points
- Add dashboard hierarchy in/around `JsonAnalysisPanel` and `SummaryMetricCards`.
- Expand `PausesTab` with an SVG timeline and accessible severity legend.
- Convert `WordsTab` from list rows to sentence-order score chips.
- Enrich `PhonemesTab` with ranked bars/explanations and conditional Vietnamese learner hints.
- Wire saved-session save/history/reopen controls using `packages/contracts/src/saved-session.ts` and the backend API created in Phase 5.
- Reconcile `AudioModePanel` with the Phase 4 canonical decision that audio mode is Gemini Live API based; current code naming references `useDeepgramSession`, so planning should verify current implementation state before changing UI labels.

</code_context>

<specifics>
## Specific Ideas

- Dashboard headline should answer: "What should I practice next?"
- Pause details should show before/after words plus duration.
- The worst pause should get one small practice cue.
- Saved-history UI should be useful but lightweight: save current result, list saved attempts, reopen a saved attempt.

</specifics>

<deferred>
## Deferred Ideas

- Rename/delete/update saved sessions are deferred.
- Account linking, login, and authenticated saved history are deferred to backlog item `999.1`.
- Advanced progress analytics across saved attempts are deferred to v2.
- Lexical Resource, Grammar scoring, and full IELTS Speaking simulation remain out of scope.

</deferred>

---

*Phase: 6-Learner Dashboard & Analysis Views*
*Context gathered: 2026-05-08T15:02:34.887+07:00*

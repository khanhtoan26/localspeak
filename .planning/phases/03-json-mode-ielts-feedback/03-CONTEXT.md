# Phase 3: JSON-Mode IELTS Feedback - Context

**Gathered:** 2026-05-08
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 3 adds AI-powered IELTS feedback to the Phase 2 deterministic metrics flow. The backend sends structured data from Phase 2's `computeJsonAnalysis` output to Gemini via its JSON-mode API and returns concise, learner-specific pronunciation and fluency coaching. This phase does NOT process raw audio (Phase 4), does NOT save history (Phase 5), and does NOT implement the Gemini Live API.

</domain>

<decisions>
## Implementation Decisions

### UX trigger
- **D-01:** Gemini feedback is triggered by a separate "Get AI Feedback" button that appears AFTER deterministic results are shown. It is NOT automatic.
- **D-02:** The button lives in the results area — learner must see their metrics first, then opt in to AI coaching.

### Prompt design
- **D-03:** The Gemini prompt receives FULL context from the analysis: weak words (with scores), weak phonemes (top patterns), pause stats (durations, positions, severity), WPM, pause ratio, computed bands, AND the original sentence text.
- **D-04:** Prompt structure: system instruction sets the IELTS coaching persona + locale, user message contains the structured metrics as JSON.
- **D-05:** System instruction emphasizes: concise, direct, learner-specific advice. No generic platitudes. Reference specific words/phonemes from the data.

### Response format
- **D-06:** Use Gemini's strict JSON schema mode (`response_mime_type: "application/json"` + `response_schema`). The schema matches the existing `GeminiFeedbackResponseSchema` contract (pronunciationBand, fluencyBand, topErrors[3], drills[3], summary).
- **D-07:** Validate the response with Zod on the backend before returning to frontend. If Gemini's response doesn't pass Zod validation, treat as error.

### Error handling
- **D-08:** On Gemini failure (timeout, invalid response, API error): return a friendly error message to the user ("AI feedback unavailable, please try again"). No retry, no fallback to deterministic summary.
- **D-09:** The deterministic results remain visible — only the AI feedback section shows the error state.

### Language / locale
- **D-10:** Feedback language matches the user's locale: Vietnamese by default, English as fallback.
- **D-11:** Locale is determined from the browser's `Accept-Language` header. The backend extracts it and includes it in the Gemini system prompt (e.g., "Respond in Vietnamese" or "Respond in English").
- **D-12:** No explicit language toggle in v1 — rely on browser locale.

### UI placement
- **D-13:** AI feedback renders as a new "AI Coach" tab alongside the existing Summary/Words/Phonemes/Pauses tabs.
- **D-14:** While loading, show a skeleton/spinner in the AI Coach tab with "Generating personalized feedback…" text.
- **D-15:** Error state shows in the AI Coach tab with retry button.

### Model selection
- **D-16:** Gemini model is configurable via `GEMINI_MODEL` env var. Default: `gemini-2.0-flash`.
- **D-17:** The env schema (`ApiEnvSchema`) adds `GEMINI_MODEL` as optional with default.

### Tone and content
- **D-18:** Coach-like tone (carried from Phase 2 D-15). Uses "You" language, references specific words/sounds from the data.
- **D-19:** topErrors: exactly 3 specific pronunciation errors with the word/phoneme that triggered them and a brief explanation of why it matters for IELTS.
- **D-20:** drills: exactly 3 actionable practice exercises the learner can do (e.g., "Record yourself saying 'think' and compare /θ/ vs /t/").
- **D-21:** summary: 2-3 sentences overall assessment with band context.

### Agent's Discretion
- Prompt template wording and exact system instruction text
- HTTP timeout duration for Gemini calls
- Whether to stream Gemini response or wait for full response (recommend: wait for full, since JSON-mode needs complete response)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project scope and requirements
- `.planning/PROJECT.md` - Product vision, tech stack (Gemini API, NestJS, Next.js), Vietnamese IELTS learner focus.
- `.planning/REQUIREMENTS.md` - Phase 3 requirements: `GEM-01` (structured prompt), `GEM-02` (JSON-mode response), `GEM-04` (concise learner-specific feedback).
- `.planning/ROADMAP.md` - Phase 3 goal, success criteria, dependency on Phase 2.
- `.planning/STATE.md` - Current milestone state.
- `.planning/phases/02-json-input-pronunciation-fluency-metrics/02-CONTEXT.md` - Phase 2 decisions about metric computation, result presentation, and validation.

### Existing contracts to extend
- `packages/contracts/src/gemini-feedback.ts` - Existing shell: `GeminiFeedbackRequestSchema`, `GeminiFeedbackResponseSchema`. Needs enrichment.
- `packages/contracts/src/json-analysis.ts` - Phase 2 analysis contracts. The `JsonAnalysisResponse` output feeds into the Gemini prompt.
- `packages/contracts/src/index.ts` - Public contracts barrel.

### Backend code to extend
- `apps/api/src/json-analysis/json-analysis.service.ts` - Phase 2 analysis service. Phase 3 adds a new feedback endpoint/service alongside this.
- `apps/api/src/config/env.ts` - Env schema. Add `GEMINI_MODEL` optional var.
- `apps/api/src/app.module.ts` - Module wiring for new Gemini feedback module.
- `apps/api/.env.example` - Add `GEMINI_MODEL` entry.

### Frontend code to extend
- `apps/web/components/json-analysis/json-analysis-panel.tsx` - Main panel. Add "Get AI Feedback" button after results, wire AI Coach tab.
- `apps/web/components/json-analysis/result-tabs.tsx` - Tab system. Add "AI Coach" tab.

### Reference
- `.artifacts/speech-response.json` - Fixture for testing prompt construction with realistic data.

</canonical_refs>

<code_context>
## Current Codebase State

### Env config (needs Supabase removal + GEMINI_MODEL addition)
- `apps/api/src/config/env.ts` still references `SUPABASE_URL` and `SUPABASE_SECRET_KEY` — must be cleaned as part of the "drop Supabase" architectural change. Add `GEMINI_MODEL` optional env var.

### Gemini feedback contract (shell — needs enrichment)
- `packages/contracts/src/gemini-feedback.ts` defines request/response schemas but request is too loose (`z.looseObject({})`). Needs proper typed fields for the full analysis context.

### Phase 2 output available for prompt construction
- `JsonAnalysisResponse` provides: `pronunciationPercent`, `pronunciationBand`, `fluencyBand`, `wpm`, `pauseRatio`, `words[]` (with scores/timing), `phonemes[]` (weak patterns), `pauses[]` (with severity/duration/context).

</code_context>

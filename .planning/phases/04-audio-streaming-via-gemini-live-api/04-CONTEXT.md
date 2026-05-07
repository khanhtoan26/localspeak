# Phase 4: Audio Streaming via Gemini Live API - Context

**Gathered:** 2026-05-08
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 4 enables real-time audio pronunciation coaching. The learner records from their browser microphone and streams audio to Gemini Live API via WebSocket. The backend provisions ephemeral tokens so the browser connects directly — no audio proxy. Gemini streams analysis output back in real-time while the user speaks.

This phase does NOT save history (Phase 5), does NOT use JSON-mode analysis (Phase 3), and does NOT implement auth (Phase 5).

</domain>

<decisions>
## Implementation Decisions

### Audio capture UX
- **D-01:** A single "Record" button starts microphone capture. While recording, it transforms into a "Stop" button with a pulsing red indicator.
- **D-02:** Visual feedback during recording: animated waveform/level meter showing real-time audio amplitude. Implemented with Web Audio API AnalyserNode.
- **D-03:** No separate "cancel" — pressing Stop ends the session and displays whatever analysis was received up to that point.
- **D-04:** Browser requests microphone permission on first Record press. If denied, show a clear error with instructions to enable it.

### Streaming output display
- **D-05:** Gemini's streamed text appears token-by-token in a dedicated "Live Analysis" panel below the audio controls.
- **D-06:** Text renders incrementally as chunks arrive over WebSocket — no buffering until complete.
- **D-07:** After the stream ends (user stops or Gemini finishes), the final text remains visible until a new session starts.
- **D-08:** While streaming, show a subtle typing indicator (blinking cursor) at the end of the text.

### Ephemeral token flow
- **D-09:** Backend exposes `POST /api/token` that creates a short-lived ephemeral token using the server-side `GEMINI_API_KEY`. Returns `{ token, expiresAt }`.
- **D-10:** Token lifetime: follow Gemini's default ephemeral token TTL (typically 1-2 minutes). Frontend requests a fresh token before each recording session.
- **D-11:** If token expires mid-session or WebSocket drops, show an error message ("Connection lost — please try again") and let the user restart. No automatic reconnection in v1.
- **D-12:** No token caching on the frontend — always request a fresh token per session.

### Reference text input
- **D-13:** User provides a reference sentence in a text input ABOVE the record button. This gives Gemini context for pronunciation scoring (e.g., "The weather is beautiful today").
- **D-14:** Reference text is required before recording can start. The Record button is disabled until text is entered.
- **D-15:** Reference text is sent in the Gemini Live API session config so it knows what the user is attempting to say.

### Gemini Live API configuration
- **D-16:** Use the Gemini Live API (multimodal live) WebSocket endpoint. Model: `gemini-2.0-flash` (or env `GEMINI_MODEL`).
- **D-17:** System instruction: IELTS pronunciation coach persona (similar to Phase 3) that analyzes live audio against the reference text. Identify phoneme errors, hesitations, fillers, pacing issues.
- **D-18:** Audio input format: PCM 16-bit mono at 16kHz (browser captures via AudioWorklet, resamples if needed).
- **D-19:** Response modality: TEXT only (no audio output from Gemini). The coach writes feedback, not speaks it.

### Error handling
- **D-20:** On WebSocket connection failure: "Unable to connect to AI coach. Check your internet connection and try again."
- **D-21:** On microphone access denied: "Microphone access is required. Please allow microphone access in your browser settings."
- **D-22:** Deterministic behavior: errors don't affect other parts of the app. Audio mode is a separate tab/view from JSON mode.

### UI layout
- **D-23:** Audio mode is a separate top-level tab/view (not nested inside JSON analysis). User switches between "JSON Mode" and "Audio Mode" at the app level.
- **D-24:** Audio mode layout (top to bottom): reference text input → record button with waveform → live analysis output panel.
- **D-25:** The live analysis panel has a dark/muted background to distinguish from the input area.

### Agent's Discretion
- WebSocket message framing details (follow Gemini Live API spec)
- AudioWorklet implementation details for capturing and resampling
- Exact system instruction wording for the pronunciation coach
- CSS styling of waveform visualization
- Whether to use a third-party audio library or raw Web Audio API

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Existing contracts
- `packages/contracts/src/audio-analysis.ts` — Existing audio analysis contract (needs replacement for Live API)
- `packages/contracts/src/gemini-feedback.ts` — Phase 3 Gemini feedback contract (reference for schema patterns)

### Backend patterns
- `apps/api/src/gemini-feedback/gemini-feedback.service.ts` — Existing Gemini SDK usage (`@google/genai` v1.52.0)
- `apps/api/src/config/env.ts` — Environment schema with GEMINI_API_KEY and GEMINI_MODEL

### Frontend patterns
- `apps/web/components/json-analysis/json-analysis-panel.tsx` — Main analysis panel pattern (state management, API calls)

### Requirements
- `.planning/REQUIREMENTS.md` §Audio Input — AUD-01 through AUD-04, GEM-03

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `@google/genai` SDK v1.52.0 — already installed, supports Live API via `ai.live.connect()`
- `env.ts` — already has `GEMINI_API_KEY` and `GEMINI_MODEL`
- `audio-analysis.ts` contract — placeholder exists, needs full rewrite for WebSocket/streaming

### Established Patterns
- NestJS module pattern: service + controller + module (from Phase 3 `gemini-feedback/`)
- Zod validation for API contracts
- State machine pattern in frontend (`json-analysis-panel.tsx` uses `status: idle | loading | done | error`)
- Error handling: return friendly error messages, keep other UI functional

### Integration Points
- New token endpoint: `POST /api/token` in NestJS
- Frontend: new top-level "Audio Mode" tab alongside existing "JSON Mode"
- Shared `GEMINI_API_KEY` env var (backend only — never exposed to frontend)

</code_context>

<specifics>
## Specific Ideas

- Gemini Live API provides real-time bidirectional audio/text streaming — perfect for continuous pronunciation coaching
- The ephemeral token pattern prevents GEMINI_API_KEY exposure to the browser
- PCM 16kHz mono is the standard input format for Gemini Live API
- Text-only response modality keeps the implementation simpler (no audio playback needed)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 4-Audio Streaming via Gemini Live API*
*Context gathered: 2026-05-08*

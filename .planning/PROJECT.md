# IELTS Pronunciation Scorer

## What This Is

IELTS Pronunciation Scorer is a web app for English pronunciation training, optimized first for Vietnamese IELTS learners. It analyzes either phoneme-level speech assessment JSON or raw uploaded/recorded audio, then returns IELTS-style Pronunciation and Fluency feedback with concrete error patterns and drills.

The app uses a Next.js frontend, a NestJS backend for LLM/API processing and token provisioning, Gemini for multimodal and structured analysis (including Gemini Live API with ephemeral tokens for real-time audio), and Drizzle ORM over Postgres via `DATABASE_URL` for saved-analysis persistence. Email/password authentication is deferred to the backlog after the persistence service is in place.

## Core Value

Vietnamese IELTS learners can identify their highest-priority pronunciation and fluency problems from real speaking attempts and get specific, actionable drills to improve them.

## Requirements

### Validated

- [x] UI presents a dashboard header with pronunciation percentage, Pronunciation Band, Fluency Band, and WPM. Validated in Phase 6.
- [x] UI supports JSON mode and audio mode, with JSON analysis tabs for Pause Analysis, Words, Phonemes, and IELTS Analysis. Validated in Phase 6.
- [x] UI visualizes pause timelines, word score chips, and phoneme weakness rankings clearly enough for learners to understand what to practice next. Validated in Phase 6.

### Active

- [ ] App can persist saved pronunciation analysis history through a backend service using Drizzle + Postgres via `DATABASE_URL`; email/password authentication is deferred to backlog.
- [ ] User can paste/import speech assessment JSON that contains total score, reference text, word timings, word scores, and phoneme-level ARPAbet/IPA scores.
- [ ] User can upload an audio file or record from the microphone in the browser.
- [ ] Backend provisions ephemeral tokens so the browser can stream audio directly to Gemini Live API via WebSocket without exposing the Gemini API key.
- [ ] App computes pronunciation metrics from JSON, including per-phoneme averages, systematic error patterns, word color bands, and IELTS-style Pronunciation band estimate.
- [ ] App computes fluency metrics from word timings, including pause severity, pause ratio, speech rate/WPM, and IELTS-style Fluency band estimate.
- [ ] App can ask Gemini for concise IELTS-oriented analysis that returns Pronunciation Band, Fluency Band, top 3 errors with examples, and 3 actionable drills.

### Out of Scope

- Lexical Resource and Grammar scoring — deferred so v1 stays focused on Pronunciation and Fluency.
- Full IELTS Speaking simulation — deferred until the scoring and feedback loop is useful.
- Teacher/tutor review workflows — the first user is the individual learner.
- Full email/password authentication in Phase 5 — deferred to backlog so Phase 5 can focus on saved-analysis persistence first.
- Frontend-only API calls to Gemini — the backend provisions ephemeral tokens for Gemini Live API but the API key stays server-side.
- Supabase — replaced by Drizzle ORM over Postgres via DATABASE_URL for all data needs.

## Context

The product is grounded in two input modes:

1. **Speech assessment JSON** from an external speech assessment API. Expected data includes `total_score`, `text_refs`, and a `result` array containing words, word scores, word start/end times, and phoneme-level scores with ARPAbet and IPA labels.
2. **Raw audio** from uploaded files or browser microphone recording. Audio is sent to the NestJS backend, then to Gemini for multimodal analysis.

Computed pronunciation metrics:

- Per-phoneme average score grouped by ARPAbet phone type.
- Systematic error detection: score below 0.85 appearing at least twice is treated as a pattern rather than an accident.
- Word coloring: 0.9 or higher is good, 0.7-0.9 is okay, below 0.7 is weak.
- Band estimate: at least 0.95 maps to 8.5, 0.90 to 7.5, 0.85 to 7.0, 0.80 to 6.5, 0.75 to 6.0, otherwise 5.5.

Computed fluency metrics:

- Gap between words is `words[i].start_time - words[i-1].end_time`.
- Pause severity: at least 1.0s is critical, 0.5-1.0s is warning, 0.3-0.5s is acceptable.
- Pause ratio is total pause time divided by total duration.
- Fluency band logic starts from critical pause count and pause ratio, with speech rate used as supporting evidence.
- Band 7+ speech-rate target is 140-160 WPM.

Gemini analysis should be concise and direct, not generic. In JSON mode, the backend sends structured metrics such as weak words, weak phonemes, pause stats, WPM, pause ratio, and notable pauses. In audio mode, Gemini should analyze pronunciation accuracy, phoneme errors with IPA symbols, pauses, hesitations, speech rate, fillers, Pronunciation band estimate, Fluency and Coherence band estimate, top priority errors, and drills.

Key learner-specific insights:

- A high overall pronunciation score can still hide systematic errors that matter for IELTS.
- Vietnamese IELTS learners commonly need help with /theta/ versus /t/ or /d/, dropped final consonants, and consonant clusters such as `thr-`, `str-`, and `tr-`.
- A high pause ratio can pull Fluency down even when pronunciation is otherwise decent.
- Free speech may reduce silent pauses but introduce fillers and false starts.
- Audio mode matters because it can capture intonation, stress, rhythm, fillers, and false starts that JSON misses.

## Constraints

- **Tech stack**: Next.js frontend, NestJS backend, Drizzle ORM + Postgres (via `DATABASE_URL`), Gemini API (including Gemini Live API with ephemeral tokens for real-time audio) — chosen by project direction.
- **Architecture**: Monorepo — frontend and backend should be developed together with shared contracts where useful.
- **Security**: Gemini API key must stay server-side — backend provisions ephemeral tokens for browser-to-Gemini Live WebSocket connections.
- **Database**: Use `DATABASE_URL` env var only — no Supabase JS client or anon/service keys.
- **Auth**: Deferred to backlog; the persistence model should include a future ownership field so account linking can be added later.
- **Audio streaming**: Browser connects directly to Gemini Live API via WebSocket using ephemeral tokens; backend does NOT proxy audio data.
- **Input support**: Audio mode should support upload and in-browser microphone recording — learners need both existing recordings and new attempts.
- **Scoring scope**: v1 focuses on Pronunciation and Fluency only — Lexical Resource and Grammar are deferred.
- **UI direction**: Use a rich web UI with mode toggle, dashboard header, tabs, timeline, charts, and streamed LLM response.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Optimize first for Vietnamese IELTS learners | Their common pronunciation patterns shape the feedback and drill priorities. | — Pending |
| Include both JSON and audio modes in v1 | JSON gives precise phoneme/timing metrics, while audio captures prosody, stress, rhythm, fillers, and false starts. | — Pending |
| Use NestJS backend for LLM processing | Keeps Gemini API keys server-side and centralizes prompt/streaming logic. | — Pending |
| Use Next.js frontend | Supports a modern app UI for upload/recording, dashboard views, tabs, and streamed analysis. | — Pending |
| Use Supabase Auth and saved analysis history | Learners should track progress across recordings and sessions. | — Pending |
| Limit v1 to Pronunciation and Fluency | Keeps the first release focused on the highest-value IELTS speaking feedback loop. | — Pending |
| Defer email/password authentication | Saved-analysis persistence should be implemented first, with account linking added later from backlog. | Approved 2026-05-08 |

## Evolution

## Current State

Phase 6 complete — JSON analysis now presents a learner dashboard with priority guidance, four primary metrics, Pause Analysis / Words / Phonemes / IELTS Analysis tabs, pause timeline and ratio summaries, word chips, ranked phoneme weakness bars, polished AI feedback states, and secondary saved-session save/history/reopen controls. JSON analysis state persists across practice-path switching, and the dashboard/history layout now reaches the Phase 6 responsive width contract.

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? -> Move to Out of Scope with reason
2. Requirements validated? -> Move to Validated with phase reference
3. New requirements emerged? -> Add to Active
4. Decisions to log? -> Add to Key Decisions
5. "What This Is" still accurate? -> Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-05-08 after Phase 6 completion*

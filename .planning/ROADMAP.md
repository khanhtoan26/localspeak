# Roadmap: IELTS Pronunciation Scorer

## Overview

Build a greenfield monorepo from a runnable Next.js/NestJS foundation into a complete IELTS pronunciation training app. The roadmap starts with shared contracts and configuration, then adds deterministic JSON analysis, Gemini feedback, audio upload/recording, Drizzle-backed saved analysis persistence, and finally the learner-facing dashboard views that make the analysis understandable and actionable.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Monorepo Foundation & Contracts** - Project can run locally with frontend, backend, shared contracts, and documented configuration.
- [x] **Phase 2: JSON Input & Pronunciation/Fluency Metrics** - Learner can submit speech assessment JSON and receive deterministic pronunciation/fluency metrics. (completed 2026-05-07)
- [ ] **Phase 3: JSON-Mode IELTS Feedback** - Learner can request concise Gemini feedback from computed JSON metrics without exposing API keys.
- [ ] **Phase 4: Audio Streaming via Gemini Live API** - Learner can record or stream audio from the browser and receive real-time pronunciation/fluency analysis via Gemini Live API.
- [ ] **Phase 5: Saved Analysis Persistence Service (Drizzle + Postgres)** - App can persist and retrieve analysis sessions through a backend service using Drizzle + Postgres.
- [ ] **Phase 6: Learner Dashboard & Analysis Views** - Learner can understand results through dashboard metrics, mode switching, tabs, timelines, word chips, phoneme rankings, and streamed IELTS analysis UI.

## Phase Details

### Phase 1: Monorepo Foundation & Contracts

**Goal**: Project can run locally with frontend, backend, shared contracts, and documented configuration.
**Depends on**: Nothing (first phase)
**Requirements**: ARCH-01, ARCH-02, ARCH-04
**Success Criteria** (what must be TRUE):
  1. Developer can start the Next.js frontend and NestJS backend locally using clear commands.
  2. Frontend and backend share documented request/response contracts for JSON analysis, audio analysis, saved sessions, and Gemini feedback.
  3. Required Gemini and Supabase environment variables are documented clearly enough for local setup.
  4. The project has a useful verifiable baseline before feature phases begin.
**Plans**: 4 (Wave 1: 01-01 workspace/contracts; Wave 2: 01-02 API and 01-03 web; Wave 3: 01-04 docs/final verification)
**UI hint**: yes

### Phase 2: JSON Input & Pronunciation/Fluency Metrics

**Goal**: Learner can submit speech assessment JSON and receive deterministic pronunciation/fluency metrics.
**Depends on**: Phase 1
**Requirements**: JSON-01, JSON-02, JSON-03, MET-01, MET-02, MET-03, MET-04, MET-05, MET-06
**Success Criteria** (what must be TRUE):
  1. User can paste or upload valid speech assessment JSON and see that it was accepted for analysis.
  2. User receives actionable validation errors when required JSON fields are missing or malformed.
  3. App extracts total score, reference text, word timings, word scores, ARPAbet phones, IPA labels, and phone scores from valid JSON.
  4. App computes pronunciation outputs including phoneme averages, repeated weak-phone patterns, word quality bands, and IELTS-style Pronunciation band.
  5. App computes fluency outputs including pause severity, pause ratio, duration, word count, WPM, and IELTS-style Fluency band.
**Plans**: 4 (Wave 1: 02-01 shared contracts/metrics; Wave 2: 02-02 backend endpoints; Wave 3: 02-03 JSON input UI; Wave 4: 02-04 results rendering/final verification)
**UI hint**: yes

### Phase 3: JSON-Mode IELTS Feedback

**Goal**: Learner can request concise Gemini feedback from computed JSON metrics without exposing API keys.
**Depends on**: Phase 2
**Requirements**: GEM-01, GEM-02, GEM-04
**Success Criteria** (what must be TRUE):
  1. Backend creates structured Gemini prompts from weak words, weak phonemes, pause stats, WPM, pause ratio, and notable pauses.
  2. User receives JSON-mode IELTS feedback containing Pronunciation Band, Fluency Band, top 3 errors with examples, and 3 actionable drills.
  3. Feedback is concise, direct, learner-specific, and avoids generic pronunciation advice.
  4. Gemini API calls are handled by the backend rather than the browser.
**Plans**: 3 (Wave 1: 03-01 contracts/env; Wave 2: 03-02 backend API and 03-03 frontend UI in parallel)

Plans:
- [ ] 03-01-PLAN.md — Enrich Gemini feedback contracts + env cleanup
- [ ] 03-02-PLAN.md — Backend Gemini service + controller
- [ ] 03-03-PLAN.md — Frontend AI Coach button + tab

**UI hint**: yes

### Phase 4: Audio Streaming via Gemini Live API

**Goal**: Learner can record or stream audio from the browser and receive real-time pronunciation/fluency analysis via Gemini Live API.
**Depends on**: Phase 3
**Requirements**: AUD-01, AUD-02, AUD-03, AUD-04, GEM-03
**Success Criteria** (what must be TRUE):
  1. Backend provisions ephemeral tokens via a `/api/token` endpoint using the server-side GEMINI_API_KEY.
  2. Browser establishes a direct WebSocket connection to Gemini Live API using the ephemeral token (no backend audio proxy).
  3. User can record audio from the browser microphone and stream it in real-time to Gemini Live API.
  4. User can see real-time streamed Gemini analysis output as audio is being processed.
  5. Audio-mode feedback identifies pronunciation accuracy issues, IPA phoneme errors, pauses, hesitations, speech rate, fillers, priority errors, and drills.
**Plans**: 3 (Wave 1: 04-01 contracts+token; Wave 2: 04-02 audio capture+session; Wave 3: 04-03 UI+integration)

Plans:
- [ ] 04-01-PLAN.md — Contracts + backend token endpoint
- [ ] 04-02-PLAN.md — Audio capture pipeline + Gemini Live session hook
- [ ] 04-03-PLAN.md — Audio Mode UI components + app tab switching

**UI hint**: yes

### Phase 5: Saved Analysis Persistence Service (Drizzle + Postgres)

**Goal**: App can persist and retrieve analysis sessions with derived metrics, feedback, input mode, input metadata, and timestamps through a backend service using Drizzle + Postgres via `DATABASE_URL`.
**Depends on**: Phase 4
**Requirements**: STORE-01, STORE-02, STORE-03, ARCH-03
**Success Criteria** (what must be TRUE):
  1. Drizzle schema and migration support saved analysis sessions in Postgres via `DATABASE_URL`.
  2. Backend service/API can create, list, and fetch saved sessions without requiring authentication in this phase.
  3. Stored sessions preserve JSON/audio input metadata, derived metrics, feedback, input mode, and timestamps.
  4. The data model includes a future ownership field so deferred authentication can link sessions later without reshaping saved-session records.
**Plans**: 4 (Wave 1: 05-01 contracts; Wave 1: 05-02 Drizzle schema/config; Wave 2: 05-03 database provider+service; Wave 3: 05-04 API+e2e+docs)

Plans:
- [ ] 05-01-PLAN.md — Saved-session contracts and contract tests
- [ ] 05-02-PLAN.md — Drizzle dependencies, schema, config, and migration
- [ ] 05-03-PLAN.md — Database provider and saved-sessions service
- [ ] 05-04-PLAN.md — Saved-sessions API, e2e coverage, and docs
**UI hint**: no

### Phase 6: Learner Dashboard & Analysis Views

**Goal**: Learner can understand results through dashboard metrics, mode switching, tabs, timelines, word chips, phoneme rankings, and streamed IELTS analysis UI.
**Depends on**: Phase 5
**Requirements**: UI-01, UI-02, UI-03, UI-04, UI-05, UI-06, UI-07
**Success Criteria** (what must be TRUE):
  1. User sees a dashboard header with pronunciation percentage, Pronunciation Band, Fluency Band, and WPM.
  2. User can switch between JSON mode and audio mode.
  3. JSON mode presents Pause Analysis, Words, Phonemes, and IELTS Analysis tabs.
  4. User can inspect pause summaries, SVG pause timeline, sorted pause list, score-colored word chips, and ranked phoneme weakness bars.
  5. User can trigger Gemini analysis from the IELTS Analysis tab and view streamed output.
**Plans**: TBD
**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5 -> 6

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Monorepo Foundation & Contracts | 4/4 | Complete | 2026-05-07 |
| 2. JSON Input & Pronunciation/Fluency Metrics | 4/4 | Complete | 2026-05-07 |
| 3. JSON-Mode IELTS Feedback | 0/TBD | Not started | - |
| 4. Audio Streaming via Gemini Live API | 0/TBD | Not started | - |
| 5. Saved Analysis Persistence Service (Drizzle + Postgres) | 0/TBD | Not started | - |
| 6. Learner Dashboard & Analysis Views | 0/TBD | Not started | - |

## Requirement Coverage

| Requirement | Phase | Status |
|-------------|-------|--------|
| ARCH-01 | Phase 1 | Complete |
| ARCH-02 | Phase 1 | Complete |
| ARCH-04 | Phase 1 | Complete |
| JSON-01 | Phase 2 | Complete |
| JSON-02 | Phase 2 | Complete |
| JSON-03 | Phase 2 | Complete |
| MET-01 | Phase 2 | Complete |
| MET-02 | Phase 2 | Complete |
| MET-03 | Phase 2 | Complete |
| MET-04 | Phase 2 | Complete |
| MET-05 | Phase 2 | Complete |
| MET-06 | Phase 2 | Complete |
| GEM-01 | Phase 3 | Pending |
| GEM-02 | Phase 3 | Pending |
| GEM-04 | Phase 3 | Pending |
| AUD-01 | Phase 4 | Pending |
| AUD-02 | Phase 4 | Pending |
| AUD-03 | Phase 4 | Pending |
| AUD-04 | Phase 4 | Pending |
| GEM-03 | Phase 4 | Pending |
| STORE-01 | Phase 5 | Pending |
| STORE-02 | Phase 5 | Pending |
| STORE-03 | Phase 5 | Pending |
| ARCH-03 | Phase 5 | Pending |
| UI-01 | Phase 6 | Pending |
| UI-02 | Phase 6 | Pending |
| UI-03 | Phase 6 | Pending |
| UI-04 | Phase 6 | Pending |
| UI-05 | Phase 6 | Pending |
| UI-06 | Phase 6 | Pending |
| UI-07 | Phase 6 | Pending |

**Coverage:**
- v1 requirements: 31 total
- Mapped to phases: 31
- Unmapped: 0

## Backlog

### Phase 999.1: Authentication & Account Sessions (BACKLOG)

**Goal**: Add email/password authentication and account-linked history after the saved-analysis persistence service is in place.
**Source**: Deferred from Phase 5 during 2026-05-08 scope update.
**Requirements**: AUTH-01, AUTH-02, AUTH-03
**Success Criteria** (what must be TRUE):
  1. User can sign up, log in, log out, and maintain a server-side session.
  2. Saved analysis sessions can be linked to authenticated user accounts.
  3. User can view and reopen account-linked saved sessions.

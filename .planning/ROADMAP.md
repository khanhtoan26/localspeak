# Roadmap: IELTS Pronunciation Scorer

## Overview

Build a greenfield monorepo from a runnable Next.js/NestJS foundation into a complete IELTS pronunciation training app. The roadmap starts with shared contracts and configuration, then adds deterministic JSON analysis, Gemini feedback, audio upload/recording, Supabase-backed history, and finally the learner-facing dashboard views that make the analysis understandable and actionable.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Monorepo Foundation & Contracts** - Project can run locally with frontend, backend, shared contracts, and documented configuration.
- [ ] **Phase 2: JSON Input & Pronunciation/Fluency Metrics** - Learner can submit speech assessment JSON and receive deterministic pronunciation/fluency metrics.
- [ ] **Phase 3: JSON-Mode IELTS Feedback** - Learner can request concise Gemini feedback from computed JSON metrics without exposing API keys.
- [ ] **Phase 4: Audio Upload, Recording & Streaming Analysis** - Learner can upload or record audio and receive streamed Gemini pronunciation/fluency analysis.
- [ ] **Phase 5: Supabase Auth & Saved Analysis History** - Learner can authenticate and revisit saved pronunciation analysis sessions.
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
**Plans**: TBD
**UI hint**: no

### Phase 4: Audio Upload, Recording & Streaming Analysis

**Goal**: Learner can upload or record audio and receive streamed Gemini pronunciation/fluency analysis.
**Depends on**: Phase 3
**Requirements**: AUD-01, AUD-02, AUD-03, AUD-04, GEM-03
**Success Criteria** (what must be TRUE):
  1. User can upload a supported audio file for IELTS-style pronunciation and fluency analysis.
  2. User can record audio from the browser microphone and submit it for analysis.
  3. Backend sends audio to Gemini without exposing Gemini API keys to the frontend.
  4. User can see streamed Gemini analysis output while audio analysis is running.
  5. Audio-mode feedback identifies pronunciation accuracy issues, IPA phoneme errors, pauses, hesitations, speech rate, fillers, priority errors, and drills.
**Plans**: TBD
**UI hint**: yes

### Phase 5: Supabase Auth & Saved Analysis History

**Goal**: Learner can authenticate and revisit saved pronunciation analysis sessions.
**Depends on**: Phase 4
**Requirements**: AUTH-01, AUTH-02, AUTH-03, ARCH-03
**Success Criteria** (what must be TRUE):
  1. User can sign up, log in, log out, and maintain a Supabase-backed session.
  2. User's analysis sessions are stored with derived metrics, feedback, input mode, input metadata, and timestamps.
  3. User can view saved pronunciation analysis sessions linked to their account.
  4. User can reopen a saved session and see its metrics, feedback, and original input metadata.
**Plans**: TBD
**UI hint**: yes

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
| 2. JSON Input & Pronunciation/Fluency Metrics | 1/4 | In Progress | - |
| 3. JSON-Mode IELTS Feedback | 0/TBD | Not started | - |
| 4. Audio Upload, Recording & Streaming Analysis | 0/TBD | Not started | - |
| 5. Supabase Auth & Saved Analysis History | 0/TBD | Not started | - |
| 6. Learner Dashboard & Analysis Views | 0/TBD | Not started | - |

## Requirement Coverage

| Requirement | Phase | Status |
|-------------|-------|--------|
| ARCH-01 | Phase 1 | Complete |
| ARCH-02 | Phase 1 | Complete |
| ARCH-04 | Phase 1 | Complete |
| JSON-01 | Phase 2 | Pending |
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
| AUTH-01 | Phase 5 | Pending |
| AUTH-02 | Phase 5 | Pending |
| AUTH-03 | Phase 5 | Pending |
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

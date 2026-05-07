# Requirements: IELTS Pronunciation Scorer

**Defined:** 2026-05-07
**Core Value:** Vietnamese IELTS learners can identify their highest-priority pronunciation and fluency problems from real speaking attempts and get specific, actionable drills to improve them.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Auth & History

- [ ] **AUTH-01**: User can sign up, log in, log out, and maintain a session through Supabase Auth.
- [ ] **AUTH-02**: User can view saved pronunciation analysis sessions linked to their account.
- [ ] **AUTH-03**: User can reopen a saved analysis session and see its metrics, feedback, and original input metadata.

### JSON Input

- [ ] **JSON-01**: User can paste or upload speech assessment JSON matching the expected word/phoneme schema.
- [x] **JSON-02**: App validates required JSON fields and surfaces actionable errors for malformed input.
- [x] **JSON-03**: App extracts total score, reference text, word timings, word scores, ARPAbet phones, IPA labels, and phone scores from valid JSON.

### Audio Input

- [ ] **AUD-01**: User can upload supported audio files for IELTS-style pronunciation and fluency analysis.
- [ ] **AUD-02**: User can record audio from the browser microphone and submit it for analysis.
- [ ] **AUD-03**: Backend sends audio to Gemini without exposing API keys to the frontend.
- [ ] **AUD-04**: User can see streamed Gemini analysis output while audio analysis is running.

### Metrics

- [x] **MET-01**: App computes per-phoneme average scores grouped by ARPAbet phone type.
- [x] **MET-02**: App detects systematic pronunciation patterns when weak phoneme scores repeat at least twice below the configured threshold.
- [x] **MET-03**: App computes word quality bands and color categories from word scores.
- [x] **MET-04**: App estimates IELTS Pronunciation band from the configured score thresholds.
- [x] **MET-05**: App computes pause gaps, pause severity, total pause time, pause ratio, duration, word count, and WPM from word timings.
- [x] **MET-06**: App estimates IELTS Fluency band from critical pauses, pause ratio, and speech-rate evidence.

### Gemini Feedback

- [ ] **GEM-01**: Backend builds structured Gemini prompts from JSON-derived weak words, weak phonemes, pause stats, WPM, pause ratio, and notable pauses.
- [ ] **GEM-02**: Gemini JSON-mode feedback returns Pronunciation Band, Fluency Band, top 3 errors with examples, and 3 actionable drills.
- [ ] **GEM-03**: Gemini audio-mode feedback identifies pronunciation accuracy issues, phoneme errors with IPA, pauses, hesitations, speech rate, fillers, priority errors, and drills.
- [ ] **GEM-04**: Feedback is concise, direct, learner-specific, and avoids generic advice.

### UI

- [ ] **UI-01**: User sees a dashboard header with pronunciation percentage, Pronunciation Band, Fluency Band, and WPM.
- [ ] **UI-02**: User can switch between JSON mode and audio mode.
- [ ] **UI-03**: JSON mode provides Pause Analysis, Words, Phonemes, and IELTS Analysis tabs.
- [ ] **UI-04**: Pause Analysis tab shows summary stats, SVG timeline with word blocks and shaded pauses, and pause list sorted by duration.
- [ ] **UI-05**: Words tab shows score-colored word chips.
- [ ] **UI-06**: Phonemes tab shows ranked phoneme weakness bars grouped by ARPAbet label.
- [ ] **UI-07**: IELTS Analysis tab can trigger Gemini analysis and display streamed output.

### Architecture

- [x] **ARCH-01**: Monorepo contains a Next.js frontend app and NestJS backend app with clear local development commands.
- [x] **ARCH-02**: Shared request/response contracts exist for JSON analysis, audio analysis, saved sessions, and Gemini feedback.
- [ ] **ARCH-03**: Supabase schema stores users' analysis sessions, derived metrics, feedback, input mode, and timestamps.
- [x] **ARCH-04**: Server-side configuration documents required Gemini and Supabase environment variables.

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Analysis Enhancements

- **ANAL-01**: App distinguishes inter-sentence pauses from mid-sentence pauses using sentence boundary detection.
- **ANAL-02**: App estimates Lexical Resource from transcript content.
- **ANAL-03**: App estimates Grammar accuracy from transcript content.
- **ANAL-04**: App supports full IELTS Speaking simulation across all scoring criteria.
- **ANAL-05**: App provides advanced progress analytics beyond saved analysis history.

### Collaboration

- **COLL-01**: Teacher or tutor can review learner recordings and analysis results.

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Frontend-only Gemini API calls | Gemini API keys must stay server-side. |
| Anonymous-only product model | v1 uses Supabase Auth so learners can track progress. |
| Full IELTS criteria scoring in v1 | v1 is focused on Pronunciation and Fluency. |
| Native mobile app | Web-first implementation is sufficient for upload, recording, and analysis. |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | Phase 5 | Pending |
| AUTH-02 | Phase 5 | Pending |
| AUTH-03 | Phase 5 | Pending |
| JSON-01 | Phase 2 | Pending |
| JSON-02 | Phase 2 | Complete |
| JSON-03 | Phase 2 | Complete |
| AUD-01 | Phase 4 | Pending |
| AUD-02 | Phase 4 | Pending |
| AUD-03 | Phase 4 | Pending |
| AUD-04 | Phase 4 | Pending |
| MET-01 | Phase 2 | Complete |
| MET-02 | Phase 2 | Complete |
| MET-03 | Phase 2 | Complete |
| MET-04 | Phase 2 | Complete |
| MET-05 | Phase 2 | Complete |
| MET-06 | Phase 2 | Complete |
| GEM-01 | Phase 3 | Pending |
| GEM-02 | Phase 3 | Pending |
| GEM-03 | Phase 4 | Pending |
| GEM-04 | Phase 3 | Pending |
| UI-01 | Phase 6 | Pending |
| UI-02 | Phase 6 | Pending |
| UI-03 | Phase 6 | Pending |
| UI-04 | Phase 6 | Pending |
| UI-05 | Phase 6 | Pending |
| UI-06 | Phase 6 | Pending |
| UI-07 | Phase 6 | Pending |
| ARCH-01 | Phase 1 | Complete |
| ARCH-02 | Phase 1 | Complete |
| ARCH-03 | Phase 5 | Pending |
| ARCH-04 | Phase 1 | Complete |

**Coverage:**
- v1 requirements: 31 total
- Mapped to phases: 31
- Unmapped: 0

---
*Requirements defined: 2026-05-07*
*Last updated: 2026-05-07 after roadmap creation*

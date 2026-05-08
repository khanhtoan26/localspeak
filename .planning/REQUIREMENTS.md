# Requirements: IELTS/TOEIC Speaking Practice MVP

**Defined:** 2026-05-08
**Milestone:** v1.1 Exam Practice & Rubric Feedback
**Source:** `.scope/scope.md`
**Core Value:** Vietnamese learners can practice realistic IELTS/TOEIC speaking tasks in a polished, confidence-building interface, receive strict rubric-based feedback, and know exactly what to improve next.

## Already Validated

These capabilities shipped before v1.1 and remain part of the foundation.

### JSON Analysis Foundation

- [x] **JSON-01**: User can paste or upload speech assessment JSON matching the expected word/phoneme schema.
- [x] **JSON-02**: App validates required JSON fields and surfaces actionable errors for malformed input.
- [x] **JSON-03**: App extracts total score, reference text, word timings, word scores, ARPAbet phones, IPA labels, and phone scores from valid JSON.

### Pronunciation and Fluency Metrics

- [x] **MET-01**: App computes per-phoneme average scores grouped by ARPAbet phone type.
- [x] **MET-02**: App detects systematic pronunciation patterns when weak phoneme scores repeat at least twice below the configured threshold.
- [x] **MET-03**: App computes word quality bands and color categories from word scores.
- [x] **MET-04**: App estimates IELTS Pronunciation band from configured score thresholds.
- [x] **MET-05**: App computes pause gaps, pause severity, total pause time, pause ratio, duration, word count, and WPM from word timings.
- [x] **MET-06**: App estimates IELTS Fluency band from critical pauses, pause ratio, and speech-rate evidence.

### Saved Sessions and Dashboard

- [x] **STORE-01**: Backend persists analysis sessions with input mode, input metadata, derived metrics, feedback, and timestamps using Drizzle + Postgres via `DATABASE_URL`.
- [x] **STORE-02**: Backend exposes service/API operations to create, list, and fetch saved analysis sessions without requiring authentication.
- [x] **STORE-03**: Saved-session records include future ownership support so authentication can link sessions later without reshaping records.
- [x] **UI-01**: User sees a dashboard header with pronunciation percentage, Pronunciation Band, Fluency Band, and WPM.
- [x] **UI-02**: User can switch between JSON Analysis and Live Audio Practice.
- [x] **UI-03**: JSON mode provides Pause Analysis, Words, Phonemes, and IELTS Analysis tabs.
- [x] **UI-04**: Pause Analysis tab shows summary stats, timeline, and pause list sorted by duration.
- [x] **UI-05**: Words tab shows score-colored word chips.
- [x] **UI-06**: Phonemes tab shows ranked phoneme weakness bars grouped by ARPAbet label.
- [x] **UI-07**: IELTS Analysis tab can trigger AI feedback and display output.
- [x] **ARCH-01**: Monorepo contains a Next.js frontend app and NestJS backend app with clear local development commands.
- [x] **ARCH-02**: Shared request/response contracts exist for JSON analysis, audio analysis, saved sessions, and AI feedback.
- [x] **ARCH-03**: Drizzle ORM schema over Postgres stores users' analysis sessions, derived metrics, feedback, input mode, and timestamps.
- [x] **ARCH-04**: Server-side configuration documents required environment variables.

## v1.1 Requirements

Requirements for the next milestone. These are derived from `.scope/scope.md` and scoped to a web-first MVP increment.

### Comprehensive UI/UX Redesign

- [ ] **UIX-01**: User experiences a cohesive app shell with clear navigation, hierarchy, and visual identity across JSON Analysis, Live Audio Practice, and upcoming exam-practice surfaces.
- [ ] **UIX-02**: User can understand the primary next action on every major screen without competing controls or crowded panels.
- [ ] **UIX-03**: UI uses a documented design system for spacing, typography, color, cards, buttons, forms, tabs, sidebars, timers, recording controls, feedback panels, and empty/loading/error states.
- [ ] **UIX-04**: JSON Analysis is redesigned around learner outcomes: priority action first, readable metrics, compact analysis sections, and secondary technical/input controls.
- [ ] **UIX-05**: Live Audio Practice is redesigned around a simple speaking flow: prompt/reference text, recording state, timer/waveform, transcript, and feedback/readiness states.
- [ ] **UIX-06**: The app is responsive at phone width without horizontal overflow, oversized cards, or hidden primary actions.
- [ ] **UIX-07**: The redesigned UI meets accessibility basics for keyboard navigation, focus states, semantic landmarks, touch targets, contrast, and screen-reader labels.
- [ ] **UIX-08**: Playwright or equivalent UI coverage verifies core responsive flows and guards against regressions in navigation, JSON analysis, live audio, and empty/error states.

### Question Bank

- [ ] **QBANK-01**: User can browse and select IELTS Speaking Part 1 questions grouped by topic.
- [ ] **QBANK-02**: User can browse and select IELTS Speaking Part 2 cue cards with bullet prompts and preparation/speaking timing metadata.
- [ ] **QBANK-03**: User can browse and select IELTS Speaking Part 3 discussion questions linked to Part 2 themes.
- [ ] **QBANK-04**: User can browse TOEIC Speaking task types 1-11 with prep time, response time, and scoring scale metadata.
- [ ] **QBANK-05**: Question-bank data is represented in shared contracts so frontend, backend, tests, and future persistence use one schema.

### Practice Session Flow

- [ ] **PRACTICE-01**: User can start an IELTS practice session from a chosen Part 1, Part 2, or Part 3 prompt.
- [ ] **PRACTICE-02**: User sees the active question, part instructions, prep timer where applicable, response timer, and recording state in a single practice screen.
- [ ] **PRACTICE-03**: User can complete a recorded response and submit transcript/audio metrics for evaluation without losing the original prompt context.
- [ ] **PRACTICE-04**: User can review a completed practice attempt with question, transcript, audio metrics, timing metadata, and saved-session status.
- [ ] **PRACTICE-05**: The session flow remains web-first and responsive for phone-width learners.

### IELTS Rubric Evaluation

- [ ] **RUBRIC-01**: Backend builds a strict IELTS-speaking examiner prompt using question, part, transcript, and audio metrics.
- [ ] **RUBRIC-02**: Backend validates strict JSON evaluation output for Fluency & Coherence, Lexical Resource, Grammatical Range & Accuracy, Pronunciation, and Overall Band.
- [ ] **RUBRIC-03**: Each criterion includes band, strengths, weaknesses, and quoted evidence from the transcript.
- [ ] **RUBRIC-04**: Part-specific rules are enforced: Part 2 penalizes responses under 90 seconds, and Part 3 expects extended abstract answers.
- [ ] **RUBRIC-05**: Evaluation output includes a band 7.5+ improved answer that preserves the learner's original ideas.
- [ ] **RUBRIC-06**: Evaluation output includes key corrections with original text, corrected text, and reason.
- [ ] **RUBRIC-07**: Evaluation output includes vocabulary upgrades with original word/phrase, upgraded alternative, and usage context.
- [ ] **RUBRIC-08**: Evaluation output includes concise Vietnamese feedback that is encouraging, specific, and actionable.

### TOEIC Speaking Scaffold

- [ ] **TOEIC-01**: User can view TOEIC Speaking's 11-question structure with task descriptions and expected response timing.
- [ ] **TOEIC-02**: User can start a TOEIC practice task from the question bank using the correct prompt, prep time, response time, and score scale metadata.
- [ ] **TOEIC-03**: TOEIC practice attempts are clearly marked as TOEIC so IELTS band language is not shown as TOEIC scoring.

### Session Reports and History

- [ ] **REPORT-01**: User can view a final session report containing criterion bands, overall band, strengths, weaknesses, evidence, improved answer, corrections, vocabulary upgrades, and Vietnamese feedback.
- [ ] **REPORT-02**: User can save and reopen practice-session reports using the existing saved-session infrastructure.
- [ ] **REPORT-03**: Session report records include exam type, speaking part/task type, prompt ID, transcript, timing metadata, audio metrics, and rubric evaluation.
- [ ] **REPORT-04**: Saved-history UI distinguishes JSON analysis results from IELTS/TOEIC practice-session reports.

### Architecture and Safety

- [ ] **ARCH-05**: Shared contracts cover question-bank prompts, practice attempts, rubric evaluation requests, rubric evaluation responses, and session report metadata.
- [ ] **ARCH-06**: LLM evaluation uses server-side API calls only; browser never receives provider API keys.
- [ ] **ARCH-07**: The rubric evaluator surfaces contract/validation errors distinctly from provider/network failures.
- [ ] **ARCH-08**: Tests cover contract parsing, prompt payload construction, evaluator error handling, and the core practice-to-report user flow.

## Future Requirements

Tracked from `.scope/scope.md`, but intentionally deferred beyond this milestone.

### Authentication and Payments

- **AUTH-01**: User can sign up, log in, log out, and maintain a server-side session.
- **AUTH-02**: User can link saved analysis and practice reports to an authenticated account.
- **BILL-01**: User can subscribe via Stripe, VNPay, or MoMo.
- **BILL-02**: Usage can be capped or metered by subscription tier.

### Audio, Speech, and Voice Agent Enhancements

- **AUD-01**: User can stream browser microphone audio to a real-time speech service.
- **AUD-02**: System can transcribe speech with word timestamps and confidence.
- **AUD-03**: System can run industry pronunciation assessment such as Azure Speech Pronunciation Assessment.
- **AUD-04**: System can store audio recordings in object storage.
- **VOICE-01**: User can practice with a real-time voice examiner agent.
- **TTS-01**: Examiner replies can be synthesized via streaming TTS with cached common prompts.

### Retention and Advanced Learning

- **RET-01**: User can maintain daily streaks and gamified practice progress.
- **RET-02**: User can create vocabulary flashcards from repeated errors.
- **RET-03**: User can shadow band 7+ sample answers.
- **RET-04**: User can complete a full IELTS Speaking mock test across all three parts.
- **ANAL-01**: App distinguishes inter-sentence pauses from mid-sentence pauses using sentence boundary detection.
- **ANAL-02**: App provides advanced progress analytics beyond saved report history.

### Collaboration and B2B

- **COLL-01**: Teacher or tutor can review learner recordings and reports.
- **B2B-01**: Language centers can view learner progress through a classroom dashboard.
- **PARENT-01**: Parents can receive periodic learner reports.

## Out of Scope for v1.1

| Feature | Reason |
|---------|--------|
| Native mobile app | Scope remains web-first; responsive phone layout is sufficient for this milestone. |
| Subscription/payments | Monetization depends on stable practice/report value first. |
| Full real-time voice examiner | The current milestone focuses on prompt-driven practice and final report evaluation. |
| Azure pronunciation integration | Existing pronunciation/fluency metrics remain the foundation; provider replacement requires its own evaluation phase. |
| Object storage for raw audio | Session reports can ship with transcript/metrics first; raw audio archival is a later storage concern. |
| Teacher, center, or parent dashboards | First user remains the individual learner. |
| Unbounded question-bank import/admin tooling | v1.1 can use curated seed data from `.scope/scope.md`; admin workflows are later. |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| UIX-01 | Phase 7 | Pending |
| UIX-02 | Phase 7 | Pending |
| UIX-03 | Phase 7 | Pending |
| UIX-04 | Phase 7 | Pending |
| UIX-05 | Phase 7 | Pending |
| UIX-06 | Phase 7 | Pending |
| UIX-07 | Phase 7 | Pending |
| UIX-08 | Phase 7 | Pending |
| QBANK-01 | Phase 8 | Pending |
| QBANK-02 | Phase 8 | Pending |
| QBANK-03 | Phase 8 | Pending |
| QBANK-04 | Phase 8 | Pending |
| QBANK-05 | Phase 8 | Pending |
| PRACTICE-01 | Phase 9 | Pending |
| PRACTICE-02 | Phase 9 | Pending |
| PRACTICE-03 | Phase 9 | Pending |
| PRACTICE-04 | Phase 9 | Pending |
| PRACTICE-05 | Phase 9 | Pending |
| RUBRIC-01 | Phase 10 | Pending |
| RUBRIC-02 | Phase 10 | Pending |
| RUBRIC-03 | Phase 10 | Pending |
| RUBRIC-04 | Phase 10 | Pending |
| RUBRIC-05 | Phase 11 | Pending |
| RUBRIC-06 | Phase 11 | Pending |
| RUBRIC-07 | Phase 11 | Pending |
| RUBRIC-08 | Phase 11 | Pending |
| TOEIC-01 | Phase 12 | Pending |
| TOEIC-02 | Phase 12 | Pending |
| TOEIC-03 | Phase 12 | Pending |
| REPORT-01 | Phase 11 | Pending |
| REPORT-02 | Phase 11 | Pending |
| REPORT-03 | Phase 11 | Pending |
| REPORT-04 | Phase 11 | Pending |
| ARCH-05 | Phase 8 | Pending |
| ARCH-06 | Phase 10 | Pending |
| ARCH-07 | Phase 10 | Pending |
| ARCH-08 | Phase 12 | Pending |

**Coverage:**
- v1.1 requirements: 37 total
- Mapped to phases: 37
- Unmapped: 0

---
*Last updated: 2026-05-08 for v1.1 milestone planning from `.scope/scope.md`*

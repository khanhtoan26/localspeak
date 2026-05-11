# Roadmap: IELTS/TOEIC Speaking Practice MVP

## Overview

v1.0 established the web/backend foundation, deterministic JSON pronunciation and fluency analysis, saved-session persistence, and a learner-facing dashboard. v1.1 now starts with a comprehensive UI/UX rebuild because the current interface is not strong enough to carry the next product layer. After that redesign foundation, the milestone expands LocalSpeak into a guided IELTS/TOEIC speaking-practice MVP based on `.scope/scope.md`: curated exam prompts, timed practice sessions, strict rubric evaluation, and saved final reports.

## Phases

**Phase Numbering:**
- Integer phases continue from the completed v1.0 sequence.
- Phase 7 begins milestone v1.1.
- Decimal phases remain reserved for urgent insertions.

- [x] **Phase 1: Monorepo Foundation & Contracts** - Project can run locally with frontend, backend, shared contracts, and documented configuration.
- [x] **Phase 2: JSON Input & Pronunciation/Fluency Metrics** - Learner can submit speech assessment JSON and receive deterministic pronunciation/fluency metrics.
- [x] **Phase 5: Saved Analysis Persistence Service (Drizzle + Postgres)** - App can persist and retrieve analysis sessions through a backend service using Drizzle + Postgres.
- [x] **Phase 6: Learner Dashboard & Analysis Views** - Learner can understand results through dashboard metrics, side navigation, tabs, timelines, word chips, phoneme rankings, saved history, and IELTS analysis UI.
- [ ] **Phase 7: Comprehensive UI/UX Redesign & Design System** - Rebuild the current app UI into a cohesive, responsive, accessible, learner-centered experience before adding new practice features.
- [ ] **Phase 07.1: Ground-Up Shadcn UI Rebuild (INSERTED)** - Supersede the rejected Phase 7 frame with a ground-up shadcn/ui app shell, design system, and redesigned JSON/audio surfaces.
- [ ] **Phase 8: Exam Question Bank & Contracts** - App has shared schemas and seeded IELTS/TOEIC speaking prompts from the scope document.
- [ ] **Phase 9: Timed IELTS Practice Session Flow** - Learner can select an IELTS prompt, record a timed response, and preserve prompt/transcript/metrics context.
- [ ] **Phase 10: IELTS Rubric Evaluation API** - Backend can produce and validate strict IELTS examiner JSON across the four official criteria.
- [ ] **Phase 11: Session Report & Saved Practice History** - Learner can review, save, and reopen full rubric reports with corrections and Vietnamese feedback.
- [ ] **Phase 12: TOEIC Speaking Scaffold & End-to-End Hardening** - Learner can practice TOEIC task types with correct timing/scoring labels and the milestone is covered by integration tests.

## Phase Details

### Phase 7: Comprehensive UI/UX Redesign & Design System

**Goal**: Rebuild the current app UI into a cohesive, responsive, accessible, learner-centered experience before adding new practice features.
**Depends on**: Phase 6
**Requirements**: UIX-01, UIX-02, UIX-03, UIX-04, UIX-05, UIX-06, UIX-07, UIX-08
**Success Criteria** (what must be TRUE):
  1. App has a redesigned shell/navigation system that feels like one product across JSON Analysis, Live Audio Practice, and future exam-practice flows.
  2. A documented design system exists in code for spacing, typography, color, buttons, cards, forms, tabs, sidebars, timers, recording controls, feedback panels, and status states.
  3. JSON Analysis is redesigned around learner outcomes: practice priority, key metrics, concise sections, and progressive disclosure for technical/input details.
  4. Live Audio Practice is redesigned around a simple speaking flow: prompt/reference text, recording state, timer/waveform, transcript, and feedback readiness.
  5. Phone-width layouts have no horizontal overflow, oversized cards, hidden primary actions, or mismatched JSON/audio layout density.
  6. Keyboard navigation, focus states, semantic landmarks, touch targets, contrast, and screen-reader labels are covered for the redesigned shell.
  7. Playwright or equivalent UI coverage protects navigation, JSON analysis, live audio, responsive layout, and empty/error states.
**Plans**: 5 plans
Plans:
**Wave 1**
- [ ] 07-01-PLAN.md — Tailwind v4 + Shadcn infrastructure setup (tsconfig @/* alias, postcss, globals.css, shadcn init, 11 components, Playwright Chromium)

**Wave 2** *(blocked on Wave 1 completion)*
- [x] 07-02-PLAN.md — App shell & navigation (layout.tsx font loading, page.tsx grouped sidebar + mobile bottom nav)

**Wave 3** *(blocked on Wave 2 completion)*
- [x] 07-03-PLAN.md — Shared primitives + JSON Analysis part 1 (status-card, status-panel, summary-metric-cards, result-tabs, pauses/words/phonemes tabs)

**Wave 4** *(blocked on Wave 3 completion)*
- [x] 07-04-PLAN.md — JSON Analysis part 2 + Audio panel (ai-coach-tab, json-input-card, validation-preview-card, json-analysis-panel Collapsible, audio-mode-panel)

**Wave 5** *(blocked on Wave 4 completion)*
- [x] 07-05-PLAN.md — Tests (update dashboard-ui.spec.ts, create responsive.spec.ts)
**UI hint**: yes

### Phase 07.1: Ground-Up Shadcn UI Rebuild (INSERTED)

**Goal:** Supersede the rejected Phase 7 frame with a ground-up shadcn/ui app shell, design system, and redesigned JSON/audio surfaces.
**Requirements**: UIX-01, UIX-02, UIX-03, UIX-04, UIX-05, UIX-06, UIX-07, UIX-08
**Depends on:** Phase 7
**Success Criteria** (what must be TRUE):
  1. App shell uses shadcn Sidebar/SidebarProvider/SidebarInset rather than the old custom desktop rail and mobile bottom nav frame.
  2. Navigation is config-driven and ready for JSON Analysis, Live Audio Practice, and future IELTS/TOEIC practice surfaces.
  3. JSON Analysis is rebuilt outcome-first with shadcn cards/tabs/collapsibles while preserving validation, analysis, warnings, saved sessions, AI feedback, and stale-state behavior.
  4. Live Audio Practice is rebuilt as a simple speaking flow with shadcn cards/buttons/badges/progress while preserving reference text, recording state, transcript, and scoring behavior.
  5. The design system uses documented tokens and product-level composed components rather than one-off hard-coded frame styles.
  6. Phone-width layout has no horizontal overflow and no hidden primary actions.
  7. Keyboard navigation, focus states, semantic landmarks, touch targets, labels, and contrast are covered.
  8. Unit and Playwright coverage is updated for the new shadcn shell and preserved JSON/audio behavior.
**Plans:** 2/5 plans executed

Plans:
- [ ] TBD (run /gsd-plan-phase 07.1 to break down)

### Phase 8: Exam Question Bank & Contracts

**Goal**: App has shared schemas and seeded IELTS/TOEIC speaking prompts from `.scope/scope.md`.
**Depends on**: Phase 07.1
**Requirements**: QBANK-01, QBANK-02, QBANK-03, QBANK-04, QBANK-05, ARCH-05
**Success Criteria** (what must be TRUE):
  1. Shared contracts model exam type, speaking part/task type, prompt text, cue-card bullets, topic/theme, prep time, response time, and scoring metadata.
  2. IELTS Part 1 prompt groups include at least Hometown, Studies/Work, Hobbies, and Technology from the scope document.
  3. IELTS Part 2 cue cards include the four scope examples with bullet prompts and preparation/speaking timing metadata.
  4. IELTS Part 3 prompts are linked to Part 2 themes so follow-up discussion can be presented coherently.
  5. TOEIC task types 1-11 are represented with task names, counts, prep/response timing, and scoring scale metadata.
  6. Frontend can browse/select prompts without backend/provider calls.
**Plans**: TBD
**UI hint**: yes

### Phase 9: Timed IELTS Practice Session Flow

**Goal**: Learner can select an IELTS prompt, record a timed response, and preserve prompt/transcript/metrics context.
**Depends on**: Phase 8
**Requirements**: PRACTICE-01, PRACTICE-02, PRACTICE-03, PRACTICE-04, PRACTICE-05
**Success Criteria** (what must be TRUE):
  1. User can start an IELTS Part 1, Part 2, or Part 3 practice session from the question bank.
  2. Practice screen shows the active question, speaking-part instructions, prep timer when applicable, response timer, and recording state.
  3. Completed attempt keeps the selected prompt, part, transcript, timing metadata, and available audio metrics together.
  4. User can submit a completed attempt for evaluation without losing the original question context.
  5. The practice screen remains usable at phone width and aligns with the redesigned app shell.
**Plans**: TBD
**UI hint**: yes

### Phase 10: IELTS Rubric Evaluation API

**Goal**: Backend can produce and validate strict IELTS examiner JSON across the four official criteria.
**Depends on**: Phase 9
**Requirements**: RUBRIC-01, RUBRIC-02, RUBRIC-03, RUBRIC-04, ARCH-06, ARCH-07
**Success Criteria** (what must be TRUE):
  1. Backend builds a server-side examiner prompt from question, IELTS part, transcript, and audio metrics.
  2. Prompt enforces strict JSON with Fluency & Coherence, Lexical Resource, Grammatical Range & Accuracy, Pronunciation, and Overall Band.
  3. Each criterion response includes band, strengths, weaknesses, and direct evidence quoted from the transcript.
  4. Part-specific rules are represented: Part 2 response duration under 90 seconds affects scoring, and Part 3 expects extended abstract answers.
  5. Provider/network failures and schema/contract failures produce distinct API errors and user-facing states.
  6. Browser never receives provider API keys or raw prompt secrets.
**Plans**: TBD
**UI hint**: no

### Phase 11: Session Report & Saved Practice History

**Goal**: Learner can review, save, and reopen full rubric reports with corrections and Vietnamese feedback.
**Depends on**: Phase 10
**Requirements**: RUBRIC-05, RUBRIC-06, RUBRIC-07, RUBRIC-08, REPORT-01, REPORT-02, REPORT-03, REPORT-04
**Success Criteria** (what must be TRUE):
  1. Session report shows criterion bands, overall band, strengths, weaknesses, and quoted evidence.
  2. Report shows a band 7.5+ improved answer that preserves the learner's ideas.
  3. Report shows key corrections with original text, corrected text, and reason.
  4. Report shows vocabulary upgrades with usage context and concise Vietnamese feedback.
  5. User can save and reopen practice-session reports through the existing saved-session infrastructure.
  6. Saved-history UI clearly distinguishes JSON analysis results from IELTS/TOEIC practice-session reports.
**Plans**: TBD
**UI hint**: yes

### Phase 12: TOEIC Speaking Scaffold & End-to-End Hardening

**Goal**: Learner can practice TOEIC task types with correct timing/scoring labels and the milestone is covered by integration tests.
**Depends on**: Phase 11
**Requirements**: TOEIC-01, TOEIC-02, TOEIC-03, ARCH-08
**Success Criteria** (what must be TRUE):
  1. User can view the TOEIC 11-question structure with task descriptions, prep time, response time, and scoring scale.
  2. User can start a TOEIC practice task from the question bank.
  3. TOEIC attempts use TOEIC labels and scoring-scale copy instead of IELTS band language.
  4. Contract, API, UI, and Playwright coverage exercise the core question-bank -> practice -> evaluation/report path.
  5. Milestone verification confirms all v1.1 requirements are mapped and no v1.0 dashboard behavior regressed.
**Plans**: TBD
**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 7 -> 8 -> 9 -> 10 -> 11 -> 12

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Monorepo Foundation & Contracts | 4/4 | Complete | 2026-05-07 |
| 2. JSON Input & Pronunciation/Fluency Metrics | 4/4 | Complete | 2026-05-07 |
| 5. Saved Analysis Persistence Service | 4/4 | Complete | 2026-05-08 |
| 6. Learner Dashboard & Analysis Views | 5/5 | Complete | 2026-05-08 |
| 7. Comprehensive UI/UX Redesign & Design System | 0/5 | Not started | - |
| 8. Exam Question Bank & Contracts | 0/TBD | Not started | - |
| 9. Timed IELTS Practice Session Flow | 0/TBD | Not started | - |
| 10. IELTS Rubric Evaluation API | 0/TBD | Not started | - |
| 11. Session Report & Saved Practice History | 0/TBD | Not started | - |
| 12. TOEIC Speaking Scaffold & End-to-End Hardening | 0/TBD | Not started | - |

## Requirement Coverage

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

## Backlog

### Phase 999.1: Authentication & Account Sessions (BACKLOG)

**Goal**: Add email/password authentication and account-linked history after practice reports are stable.
**Source**: Deferred from v1.0/v1.1 scope decisions.
**Requirements**: AUTH-01, AUTH-02
**Success Criteria** (what must be TRUE):
  1. User can sign up, log in, log out, and maintain a server-side session.
  2. Saved analysis sessions and practice reports can be linked to authenticated accounts.
  3. User can view and reopen account-linked saved sessions.

### Phase 999.2: Payments and Subscription Controls (BACKLOG)

**Goal**: Add paid-plan controls once core practice/report value is validated.
**Source**: `.scope/scope.md` MVP monetization notes.
**Requirements**: BILL-01, BILL-02
**Success Criteria** (what must be TRUE):
  1. User can subscribe through a supported payment provider.
  2. Usage limits can protect AI cost per plan.

### Phase 999.3: Real-Time Voice Examiner and TTS (BACKLOG)

**Goal**: Add a real-time spoken examiner loop with TTS after prompt-driven practice is stable.
**Source**: `.scope/scope.md` architecture and premium-tier notes.
**Requirements**: VOICE-01, TTS-01
**Success Criteria** (what must be TRUE):
  1. User can hear examiner prompts/replies.
  2. App can stream examiner audio while preserving cost controls.

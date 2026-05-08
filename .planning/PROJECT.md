# IELTS/TOEIC Speaking Practice MVP

## What This Is

LocalSpeak is a web-first speaking-practice app for Vietnamese learners preparing for IELTS and, next, TOEIC Speaking. It started as an IELTS pronunciation scorer with deterministic JSON analysis, pronunciation/fluency metrics, saved-session persistence, and a learner dashboard. The v1.1 direction expands it into guided exam practice: learners select realistic speaking prompts, record timed responses, receive strict rubric-based feedback, and save final reports for review.

The app uses a Next.js frontend, a NestJS backend for LLM/API processing, shared contracts, Drizzle ORM over Postgres via `DATABASE_URL`, and server-side AI provider calls so browser clients never receive provider API keys. Authentication, payments, raw audio storage, TTS, and real-time voice-agent features remain deferred until the practice/report loop is valuable.

## Core Value

Vietnamese learners can practice realistic IELTS/TOEIC speaking tasks, receive strict evidence-based feedback, and know exactly what to improve next.

## Current Milestone: v1.1 Exam Practice & Rubric Feedback

**Goal:** Turn the existing analysis dashboard into a prompt-driven IELTS/TOEIC speaking-practice MVP with question bank, timed practice flow, strict IELTS rubric evaluation, and saved session reports.

**Target features:**
- IELTS Part 1/2/3 question bank and TOEIC Speaking task scaffold sourced from `.scope/scope.md`.
- Timed IELTS practice flow with prompt context, recording state, transcript/audio metrics, and responsive phone layout.
- Server-side strict IELTS rubric evaluator for Fluency & Coherence, Lexical Resource, Grammatical Range & Accuracy, Pronunciation, and Overall Band.
- Session reports with evidence, improved answer, key corrections, vocabulary upgrades, Vietnamese feedback, and saved/reopen support.
- TOEIC practice scaffold that uses TOEIC-specific task labels and avoids IELTS band-language confusion.

## Requirements

### Validated

- [x] User can paste/upload speech assessment JSON and receive deterministic pronunciation and fluency metrics. Validated in Phase 2.
- [x] App computes phoneme averages, repeated weak patterns, word bands, pause severity, pause ratio, WPM, and IELTS-style Pronunciation/Fluency estimates. Validated in Phase 2.
- [x] App can persist and retrieve saved analysis sessions through Drizzle + Postgres via `DATABASE_URL`, with future ownership support. Validated in Phase 5.
- [x] UI presents a learner dashboard with pronunciation percentage, Pronunciation Band, Fluency Band, WPM, pause analysis, word chips, phoneme rankings, AI feedback entry point, and saved-session controls. Validated in Phase 6.
- [x] UI supports JSON Analysis and Live Audio Practice through a persistent sidebar/rail while keeping panel state mounted. Validated in Phase 6 polish.

### Active

- [ ] App provides a shared IELTS/TOEIC question-bank schema and seed data from `.scope/scope.md`.
- [ ] User can browse and select IELTS Speaking Part 1, Part 2, and Part 3 prompts.
- [ ] User can browse TOEIC Speaking task types 1-11 with timing and scoring-scale metadata.
- [ ] User can start a timed IELTS practice attempt from a selected prompt.
- [ ] User can submit transcript/audio metrics with prompt context for rubric evaluation.
- [ ] Backend can evaluate IELTS responses using strict JSON across Fluency & Coherence, Lexical Resource, Grammatical Range & Accuracy, Pronunciation, and Overall Band.
- [ ] Evaluation output includes evidence quotes, improved answer, key corrections, vocabulary upgrades, and concise Vietnamese feedback.
- [ ] User can view, save, and reopen practice-session reports distinct from JSON analysis results.
- [ ] TOEIC practice attempts are clearly labeled as TOEIC and do not reuse IELTS band-language incorrectly.

### Out of Scope

- Full real-time voice examiner loop — defer until prompt-driven practice/report flow is stable.
- Streaming TTS — defer because `.scope/scope.md` identifies TTS as a major cost driver.
- Azure Pronunciation Assessment integration — valuable, but provider migration should be its own focused milestone.
- Raw audio object storage — session reports can ship first with transcript, timing metadata, and derived metrics.
- Subscription/payments — defer until core practice/report value is validated.
- Teacher, center, and parent dashboards — first user remains the individual learner.
- Native mobile app — web-first responsive layout remains sufficient for this milestone.
- Unbounded question-bank admin/import tooling — v1.1 uses curated seed content from `.scope/scope.md`.

## Context

The product is now grounded in three complementary modes:

1. **Speech assessment JSON analysis** from an external speech assessment API. Expected data includes total score, reference text, words, timings, word scores, ARPAbet/IPA labels, and phoneme scores.
2. **Live/recorded audio practice** through the web UI. Current implementation has a live audio practice surface and token/service work in progress; full voice examiner and TTS remain future scope.
3. **Prompt-driven exam practice** from `.scope/scope.md`: IELTS Part 1/2/3 questions and TOEIC Speaking task types with prep/response timing.

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

v1.1 rubric evaluation should follow the `.scope/scope.md` IELTS examiner shape:

- Fluency & Coherence, Lexical Resource, Grammatical Range & Accuracy, and Pronunciation are each scored independently.
- Each criterion includes band, strengths, weaknesses, and evidence quoted from the transcript.
- Overall band is rounded to the nearest 0.5.
- Part 2 responses under 90 seconds are penalized.
- Part 3 expects extended, abstract answers.
- Output includes improved answer, key corrections, vocabulary upgrades, and Vietnamese feedback.

Key learner-specific insights:

- A high overall pronunciation score can still hide systematic errors that matter for IELTS.
- Vietnamese IELTS learners commonly need help with /theta/ versus /t/ or /d/, dropped final consonants, consonant clusters such as `thr-`, `str-`, and `tr-`, and rhythm/stress.
- A high pause ratio can pull Fluency down even when pronunciation is otherwise decent.
- Free speech can reduce silent pauses but introduce fillers and false starts.
- Full rubric feedback adds lexical and grammar coaching, but must remain evidence-based and avoid inflated bands.

## Constraints

- **Tech stack**: Next.js frontend, NestJS backend, shared contracts, Drizzle ORM + Postgres via `DATABASE_URL`, and server-side AI provider calls.
- **Architecture**: Monorepo — frontend and backend should be developed together with shared contracts for every cross-boundary shape.
- **Security**: Provider API keys must stay server-side.
- **Database**: Use `DATABASE_URL` and Drizzle; no Supabase client or service keys.
- **Auth**: Deferred to backlog; persistence should keep future ownership support.
- **Scope discipline**: v1.1 adds rubric reports and prompt-driven practice, but not payments, full voice agent, TTS, raw audio storage, or B2B dashboards.
- **Exam labeling**: IELTS and TOEIC practice must not share misleading scoring labels.
- **UI direction**: Preserve the polished Phase 6 dashboard/sidebar foundation and add practice/report views without regressing phone-width layout.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Optimize first for Vietnamese learners | Their common pronunciation patterns shape feedback and drills. | Approved |
| Include both JSON and audio/practice modes | JSON gives precise metrics; practice mode captures realistic exam context. | Approved |
| Use NestJS backend for LLM/rubric processing | Keeps API keys server-side and centralizes prompt/schema validation. | Approved |
| Use Drizzle ORM + Postgres via `DATABASE_URL` | Existing persistence foundation is already built and avoids Supabase lock-in. | Approved |
| Defer email/password authentication | Practice/report value should stabilize before account flows. | Approved 2026-05-08 |
| Expand v1.1 from Pronunciation/Fluency-only to full IELTS rubric reports | `.scope/scope.md` makes four-criterion rubric feedback central to the MVP. | Approved 2026-05-08 |
| Treat TOEIC as scaffold first | TOEIC scoring differs from IELTS; build task/timing structure before full TOEIC evaluator. | Approved 2026-05-08 |
| Defer TTS/voice agent and payments | Scope research identifies high cost/complexity; these depend on validated practice loop. | Approved 2026-05-08 |

## Evolution

## Current State

Phase 6 is complete. JSON analysis now presents a learner dashboard with priority guidance, four primary metrics, Pause Analysis / Words / Phonemes / IELTS Analysis tabs, pause timeline and ratio summaries, word chips, ranked phoneme weakness bars, polished AI feedback states, secondary saved-session controls, Playwright UI smoke coverage, compact phone layout, and persistent sidebar navigation between JSON Analysis and Live Audio Practice.

v1.1 planning is based on `.scope/scope.md` and begins at Phase 7.

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
*Last updated: 2026-05-08 for v1.1 milestone planning from `.scope/scope.md`*

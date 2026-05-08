# Research Summary: v1.1 Exam Practice & Rubric Feedback

**Source:** `.scope/scope.md`
**Milestone:** v1.1 Exam Practice & Rubric Feedback
**Purpose:** Translate the external scope document into a practical next milestone for the existing LocalSpeak web/Nest/Drizzle app.

## Source Findings

The scope document expands the product vision from pronunciation analysis into a broader IELTS/TOEIC speaking-practice app. It contributes four major inputs:

1. **IELTS rubric contract** — official-style four-criterion evaluation: Fluency & Coherence, Lexical Resource, Grammatical Range & Accuracy, and Pronunciation, each weighted 25%.
2. **Strict LLM output shape** — criterion bands, strengths, weaknesses, transcript evidence, overall band, improved answer, key corrections, vocabulary upgrades, and Vietnamese feedback.
3. **Question bank seed content** — IELTS Part 1 topic questions, IELTS Part 2 cue cards, IELTS Part 3 follow-ups, and TOEIC Speaking task types 1-11.
4. **MVP architecture direction** — practice UI, audio recorder, auth/session orchestration, STT, LLM, pronunciation engine, TTS, Postgres, object storage, and question bank.

## Existing App Fit

Already built capabilities that should be reused:

- Next.js web UI with JSON Analysis and Live Audio Practice paths.
- NestJS backend and shared contracts package.
- Deterministic pronunciation/fluency metrics from speech assessment JSON.
- AI feedback entry point from the IELTS Analysis tab.
- Drizzle/Postgres saved-session persistence with future ownership field.
- Responsive dashboard, saved-history UI, and Playwright smoke coverage.

## Recommended v1.1 Scope

The next milestone should focus on a **prompt-driven practice and final-report loop**, not the full voice-agent architecture yet:

1. Build shared question-bank contracts and seed data from the scope document.
2. Add timed IELTS practice sessions for Parts 1/2/3.
3. Add a strict server-side IELTS rubric evaluator across all four official criteria.
4. Add final session reports with improved answer, corrections, vocabulary upgrades, and Vietnamese feedback.
5. Save/reopen practice reports using the existing saved-session infrastructure.
6. Add TOEIC Speaking scaffold with correct task metadata and labels, without pretending TOEIC uses IELTS band scoring.

## Deferred From v1.1

These are valuable but too large or premature for this milestone:

- Authentication and account-linked history.
- Payments/subscriptions.
- Raw audio object storage.
- Azure Pronunciation Assessment provider migration.
- Streaming TTS and real-time examiner voice agent.
- Full retention/gamification/leaderboard features.
- Teacher/center/parent dashboards.

## Key Risks and Mitigations

| Risk | Why It Matters | Mitigation |
|------|----------------|------------|
| Rubric scope creep | Moving from Pronunciation/Fluency to four IELTS criteria is a major product expansion. | Keep v1.1 report-focused; defer full mock test and voice examiner. |
| LLM inconsistency | Scope warns rubric scoring can vary. | Use strict JSON schema, low-temperature provider settings, evidence quotes, and contract validation. |
| TOEIC/IELTS confusion | TOEIC scores are task-scale based, not IELTS bands. | Mark exam type clearly and avoid IELTS band labels in TOEIC flows. |
| Mobile complexity | Learners are likely to practice on phones. | Keep Playwright mobile-width coverage and reuse compact sidebar rail. |
| Cost control | Scope estimates AI costs can grow quickly. | Avoid TTS/voice-agent in v1.1; evaluate only completed attempts. |

## Roadmap Implication

Recommended phases:

1. **Phase 7:** Exam Question Bank & Contracts.
2. **Phase 8:** Timed IELTS Practice Session Flow.
3. **Phase 9:** IELTS Rubric Evaluation API.
4. **Phase 10:** Session Report & Saved Practice History.
5. **Phase 11:** TOEIC Speaking Scaffold & End-to-End Hardening.

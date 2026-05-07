# Phase 2: JSON Input & Pronunciation/Fluency Metrics - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md - this log preserves the alternatives considered.

**Date:** 2026-05-07
**Phase:** 02-JSON Input & Pronunciation/Fluency Metrics
**Areas discussed:** JSON submission flow, Validation error behavior, Metric output priorities, Result presentation style

---

## JSON submission flow

| Question | Options considered | Selected |
|----------|--------------------|----------|
| Primary input path | Paste first with upload secondary; upload first with paste secondary; both equally prominent; agent decides | Paste JSON first, with upload as secondary |
| Sample JSON action | Include sample JSON; only user-provided paste/upload; agent decides | Include sample JSON |
| Analysis trigger | Manual Analyze JSON after validation preview; auto-analyze when valid; auto-validate but require button for metrics; agent decides | Manual Analyze JSON button after validation preview |
| Analysis owner | Backend owns validation/metrics; frontend computes locally; shared package exposes functions to both; agent decides | Backend API owns validation and metrics |

**Notes:** The backend should be the source of truth for deterministic metrics so Phase 3 Gemini prompts and Phase 5 saved sessions can build from the same result shape.

---

## Validation error behavior

| Question | Options considered | Selected |
|----------|--------------------|----------|
| First error view | Friendly summary plus expandable technical details; friendly only; raw schema paths | Friendly summary plus expandable technical details |
| Issue count | Most important 3-5 first with full details available; every issue immediately; first issue only | Most important 3-5 first with full details available |
| Message vocabulary | Learner-friendly labels plus exact JSON path; learner-friendly only; exact paths only | Both learner label and JSON path |
| Suspicious metric values | Accept with warning callouts; block analysis; silently compute | Accept, warn, and still compute |

**Notes:** Validation must be useful to learners and still detailed enough for developers testing vendor payloads.

---

## Metric output priorities

| Question | Options considered | Selected |
|----------|--------------------|----------|
| Primary summary | Pronunciation %, Pronunciation Band, Fluency Band, WPM, pause ratio; two IELTS bands only; detailed tables first | Pronunciation %, Pronunciation Band, Fluency Band, WPM, pause ratio |
| Weak phoneme priority | Top 5 repeated weak ARPAbet phones with IPA examples; every weak group; only Vietnamese-specific sounds | Top 5 repeated weak ARPAbet phones by repeated low scores, with IPA examples |
| Word-level output | Color-banded weak/okay/good words with score and timing; weak words only; all words unbanded | Color-banded weak/okay/good word list with score and timing |
| Fluency insight | Notable pauses with severity, duration, nearby words; aggregate stats only; timeline only | Notable pauses list with severity, duration, and nearby words |

**Notes:** Project-level thresholds from `PROJECT.md` remain locked: repeated weak phoneme pattern below `0.85` at least twice, word score bands at `0.9` and `0.7`, pause severities at `0.3`, `0.5`, and `1.0` seconds, and WPM as fluency supporting evidence.

---

## Result presentation style

| Question | Options considered | Selected |
|----------|--------------------|----------|
| Page arrangement | Single page with input top/results below; desktop two-column; wizard flow | Single analysis page with input panel on top and warm-card results below |
| Detail structure | Lightweight tabs Summary/Words/Phonemes/Pauses; stacked page; Summary only | Lightweight tabs: Summary, Words, Phonemes, Pauses |
| Explanation tone | Coach-like deterministic language; technical numbers only; examiner-style assertions | Coach-like but clearly deterministic: "This suggests..." |
| Positive empty state | Show positive empty state; hide empty sections; show zeros/blank tables | Show positive empty state with "no repeated weak pattern found" |

**Notes:** Phase 2 should be useful on its own without pretending to provide Gemini feedback. Full dashboard visuals remain later.

---

## the agent's Discretion

None. The user selected concrete options for every discussed area.

## Deferred Ideas

- Gemini feedback remains Phase 3.
- Audio upload/recording/streaming analysis remains Phase 4.
- Supabase saved history remains Phase 5.
- Full learner dashboard and analysis views remain Phase 6.

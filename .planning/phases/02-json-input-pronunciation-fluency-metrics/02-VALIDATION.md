---
phase: 02
slug: json-input-pronunciation-fluency-metrics
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-07
---

# Phase 02 - Validation Strategy

> Per-phase validation contract for JSON-mode pronunciation and fluency metrics.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Contracts framework** | Vitest 4.1.5 |
| **Contracts config file** | `packages/contracts/vitest.config.mts` |
| **Contracts quick run command** | `pnpm --filter @localspeak/contracts test -- test/json-analysis.metrics.test.ts` |
| **API framework** | Jest 30.3.0 + Supertest 7.2.2 |
| **API config file** | `apps/api/jest.config.ts` |
| **API quick run command** | `pnpm --filter api test:e2e -- --runTestsByPath test/json-analysis.e2e-spec.ts` |
| **Web framework** | Vitest 4.1.5 + Testing Library React 16.3.2 |
| **Web config file** | `apps/web/vitest.config.mts` |
| **Web quick run command** | `pnpm --filter web test -- components/json-analysis/json-analysis-panel.test.tsx` |
| **Full suite command** | `pnpm check && pnpm test && pnpm build` |
| **Feedback latency** | Measure during execution; use package-specific quick commands after task commits and full root gates after waves. |

---

## Sampling Rate

- **After every contracts/metric task commit:** Run `pnpm --filter @localspeak/contracts test -- test/json-analysis.metrics.test.ts` plus `pnpm --filter @localspeak/contracts check` when schemas/types change.
- **After every API task commit:** Run `pnpm --filter api test:e2e -- --runTestsByPath test/json-analysis.e2e-spec.ts` plus `pnpm --filter api check` when controllers/services/contracts change.
- **After every web task commit:** Run `pnpm --filter web test -- components/json-analysis/json-analysis-panel.test.tsx` plus `pnpm --filter web check` when components or response parsing change.
- **After every plan wave:** Run `pnpm check && pnpm test`.
- **Before `/gsd-verify-work`:** Run `pnpm check && pnpm test && pnpm build`.
- **Max feedback latency:** No three consecutive implementation tasks may rely only on manual verification.

---

## Per-Task Verification Map

| Task ID | Expected Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|---------------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 02-W0-01 | 02-01 | 0 | JSON-03, MET-01, MET-02, MET-03, MET-04, MET-05, MET-06 | T-02-01 | Metric helpers never produce `NaN`/`Infinity` and do not call external services. | unit/fixture | `pnpm --filter @localspeak/contracts test -- test/json-analysis.metrics.test.ts` | No - create in Wave 0 | pending |
| 02-W0-02 | 02-02 | 0 | JSON-01, JSON-02 | T-02-01, T-02-02, T-02-03 | API rejects invalid input with learner-safe issue details and no stack traces/secrets. | e2e | `pnpm --filter api test:e2e -- --runTestsByPath test/json-analysis.e2e-spec.ts` | No - create in Wave 0 | pending |
| 02-W0-03 | 02-03 | 0 | JSON-01, JSON-02, MET-03 | T-02-03, T-02-04 | UI enforces local syntax parsing, 2 MB upload limit, shared response parsing, and no raw HTML rendering. | component | `pnpm --filter web test -- components/json-analysis/json-analysis-panel.test.tsx` | No - create in Wave 0 | pending |
| 02-01-01 | 02-01 | 1 | JSON-03 | T-02-01 | Extracted totals, reference text, word timings/scores, ARPAbet, IPA, and phone scores match `.artifacts/speech-response.json`. | unit/fixture | `pnpm --filter @localspeak/contracts test -- test/json-analysis.metrics.test.ts` | Pending Wave 0 | pending |
| 02-01-02 | 02-01 | 1 | MET-01, MET-02, MET-03, MET-04 | T-02-01 | Pronunciation formulas are deterministic constants/functions with covered fixture expectations. | unit/fixture | `pnpm --filter @localspeak/contracts test -- test/json-analysis.metrics.test.ts` | Pending Wave 0 | pending |
| 02-01-03 | 02-01 | 1 | MET-05, MET-06 | T-02-01 | Fluency formulas handle empty/short/overlapping timing edge cases without unsafe numeric outputs. | unit/fixture | `pnpm --filter @localspeak/contracts test -- test/json-analysis.metrics.test.ts` | Pending Wave 0 | pending |
| 02-02-01 | 02-02 | 2 | JSON-01, JSON-02, JSON-03 | T-02-01, T-02-02, T-02-03 | Backend validates on preview and analyze, returns exact JSON paths relative to pasted JSON root, and omits stack traces/secrets. | e2e | `pnpm --filter api test:e2e -- --runTestsByPath test/json-analysis.e2e-spec.ts` | Pending Wave 0 | pending |
| 02-02-02 | 02-02 | 2 | MET-01, MET-02, MET-03, MET-04, MET-05, MET-06 | T-02-01, T-02-03 | Backend analysis response is parsed by shared contracts and includes warnings for suspicious but computable values. | e2e | `pnpm --filter api test:e2e -- --runTestsByPath test/json-analysis.e2e-spec.ts` | Pending Wave 0 | pending |
| 02-03-01 | 02-03 | 3 | JSON-01, JSON-02 | T-02-02, T-02-03, T-02-04 | Browser parses JSON syntax locally, blocks unreadable input, validates backend responses with Zod, and shows collapsed technical details. | component | `pnpm --filter web test -- components/json-analysis/json-analysis-panel.test.tsx` | Pending Wave 0 | pending |
| 02-03-02 | 02-03 | 3 | MET-01, MET-02, MET-03, MET-04, MET-05, MET-06 | T-02-04 | UI renders Summary/Words/Phonemes/Pauses tabs from backend data without `dangerouslySetInnerHTML`. | component | `pnpm --filter web test -- components/json-analysis/json-analysis-panel.test.tsx` | Pending Wave 0 | pending |

---

## Threat References

| Ref | Threat | Required Mitigation | Covered By |
|-----|--------|---------------------|------------|
| T-02-01 | Invalid or adversarial JSON causes crashes, `NaN`, `Infinity`, or misleading metrics. | Shared schemas, backend revalidation on analyze, stricter non-empty analysis guards, metric edge-case tests. | Contracts/API tests |
| T-02-02 | Oversized file/body causes generic backend or browser failure. | UI 2 MB limit and backend body-size guard with friendly too-large error. | API/web tests |
| T-02-03 | Technical details leak stack traces, env values, or unrelated server internals. | Return only validation codes, paths, labels, hints, and safe technical parser/schema details. | API/web tests |
| T-02-04 | Vendor text or JSON paths render as executable HTML/script. | Render strings through React text nodes and prohibit `dangerouslySetInnerHTML`. | Web tests/static review |
| T-02-05 | Pasted JSON is sent to Gemini, analytics, or third-party systems. | Do not add external network calls in Phase 2; keep Gemini and persistence out of scope. | Code review/full phase verification |

---

## Wave 0 Requirements

- [ ] Create `packages/contracts/test/json-analysis.metrics.test.ts` with fixture regression tests covering JSON-03 and MET-01 through MET-06.
- [ ] Create `apps/api/test/json-analysis.e2e-spec.ts` with sample, preview, analyze, invalid schema, warning, too-large/body-limit, and no-secret-leak cases.
- [ ] Create `apps/web/components/json-analysis/json-analysis-panel.test.tsx` with paste, upload limit, sample load, disabled Analyze, warning/error details, result tabs, and malformed backend response parsing cases.
- [ ] Add fixture variants for missing required field, wrong type, empty result, empty phone list, overlapping timings, suspicious WPM, no weak phoneme patterns, and no notable pauses.
- [ ] Assert the locked implementation constants from `02-CONTEXT.md`: word bands `<0.65` / `0.65-0.85` / `>=0.85`, PROJECT pause severities, provisional Fluency band rubric, and no full input echo.

---

## Locked Validation Decisions for Planner

| Decision | Locked Value | Validation Impact |
|----------|--------------|-------------------|
| Word band thresholds | Use approved UI-SPEC thresholds: Weak `<0.65`, Okay `>=0.65 && <0.85`, Good `>=0.85`. | Contract/API/web tests must assert the same constants and fixture word counts. |
| Fluency band rubric | `criticalPauseCount >= 3 || pauseRatio >= 0.30` -> `5.5`; `criticalPauseCount >= 2 || pauseRatio >= 0.20` -> `6.0`; `criticalPauseCount >= 1 || pauseRatio >= 0.15` -> `6.5`; `pauseRatio <= 0.10 && wpm >= 140 && wpm <= 160` -> `7.5`; otherwise `7.0`; cap to `6.0` when `wpm < 100 || wpm > 190`, and cap to `6.5` when `wpm < 120 || wpm > 180`. | Tests must assert the exact branch thresholds and WPM caps. |
| Pause label set | Use PROJECT severity thresholds only: natural/acceptable `0.3s <= gap < 0.5s`, noticeable/warning `0.5s <= gap < 1.0s`, critical `gap >= 1.0s`; no separate `Long` severity in Phase 2. | Tests must prove `>=1.0s` remains critical and that sub-`0.3s` gaps are not notable pauses. |
| Analysis response echo | Do not echo the full original speech assessment JSON. Return derived/extracted analysis fields, warnings, and metrics only. | Response schema tests should reject or omit full `speechAssessment` echo in successful analysis responses. |

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Visual warmth, spacing, and tab/card presentation match approved UI-SPEC. | JSON-01, JSON-02, MET-01..MET-06 | Component tests can verify structure and labels but not subjective visual polish. | Run the web app, load the sample JSON, analyze it, and compare the page against `02-UI-SPEC.md` constraints: 960px shell, warm cards, Summary/Words/Phonemes/Pauses tabs, accessible status text, and no charts/timeline. |
| Coach-like deterministic tone avoids Gemini/examiner claims. | MET-01..MET-06 | Copy assertions can catch key strings but human review is needed for tone. | Inspect result empty states, warning callouts, and metric explanations for phrases like "This suggests..." and absence of "Gemini" or "IELTS examiner" claims. |

---

## Validation Sign-Off

- [ ] All tasks have automated verify commands or Wave 0 dependencies.
- [ ] Sampling continuity: no three consecutive tasks without automated verification.
- [ ] Wave 0 covers all missing test files and fixture variants.
- [ ] No watch-mode flags in verification commands.
- [ ] Full root gate `pnpm check && pnpm test && pnpm build` is green before phase verification.
- [ ] `nyquist_compliant: true` set in frontmatter after Wave 0 tests exist and pass.

**Approval:** pending

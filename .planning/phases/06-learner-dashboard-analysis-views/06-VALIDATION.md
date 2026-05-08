---
phase: 6
slug: learner-dashboard-analysis-views
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-08
---

# Phase 6 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest + Testing Library React + jsdom |
| **Config file** | `apps/web/vitest.config.mts` |
| **Quick run command** | `pnpm --filter web test` |
| **Full suite command** | `pnpm --filter web check && pnpm --filter web test` |
| **Estimated runtime** | < 120 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm --filter web test` or the targeted Vitest file when a task is small and isolated.
- **After every plan wave:** Run `pnpm --filter web check && pnpm --filter web test`.
- **Before `/gsd-verify-work`:** Full suite must be green.
- **Max feedback latency:** 120 seconds.

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 06-W0-01 | TBD | 0 | UI-02 | — | Mode switching does not clear completed JSON results unexpectedly. | component | `pnpm --filter web test -- app/page.test.tsx` | ❌ W0 | ⬜ pending |
| 06-W0-02 | TBD | 0 | UI-01, UI-03, UI-04, UI-05, UI-06, UI-07 | — | Dashboard and tabs preserve deterministic results when AI feedback fails. | component | `pnpm --filter web test -- components/json-analysis/json-analysis-panel.test.tsx` | ⚠️ update existing | ⬜ pending |
| 06-W0-03 | TBD | 0 | UI-04 | — | SVG timeline and pause rows expose labels, duration, and before/after words without relying on color alone. | component | `pnpm --filter web test -- components/json-analysis/json-analysis-panel.test.tsx -t "pause"` | ⚠️ update existing | ⬜ pending |
| 06-W0-04 | TBD | 0 | UI-05 | — | Word chips expose word, score, band, and timing as accessible text. | component | `pnpm --filter web test -- components/json-analysis/json-analysis-panel.test.tsx -t "word"` | ⚠️ update existing | ⬜ pending |
| 06-W0-05 | TBD | 0 | UI-06 | — | Phoneme rows do not show unsupported Vietnamese-specific hints. | component | `pnpm --filter web test -- components/json-analysis/json-analysis-panel.test.tsx -t "phoneme"` | ⚠️ update existing | ⬜ pending |
| 06-W0-06 | TBD | 0 | UI-07 | T-06-01 | AI feedback errors affect only IELTS Analysis; deterministic dashboard/tabs remain visible. | component | `pnpm --filter web test -- components/json-analysis/json-analysis-panel.test.tsx -t "AI feedback"` | ⚠️ update existing | ⬜ pending |
| 06-W0-07 | TBD | 0 | UI-01, UI-07 | T-06-02 | Saved-session UI stores sanitized derived snapshots and does not include raw vendor payload keys. | component | `pnpm --filter web test -- components/json-analysis/saved-sessions-panel.test.tsx` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `apps/web/app/page.test.tsx` — covers top-level JSON/audio mode labels/descriptions, selected state, and non-clearing behavior.
- [ ] `apps/web/components/json-analysis/json-analysis-panel.test.tsx` — update existing old-tab/list-row assertions to cover the Phase 6 dashboard, tabs, pause timeline, word chips, phoneme visuals, and AI feedback states.
- [ ] `apps/web/components/json-analysis/saved-sessions-panel.test.tsx` — create if saved-session UI is extracted into a dedicated component; cover save/list/reopen, ownerKey persistence, contract parsing, and raw vendor payload exclusion.
- [ ] Accessibility assertions for SVG pause labels, word chip accessible names, and descriptive reopen buttons.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Responsive visual layout at mobile/tablet/desktop widths | UI-01 through UI-07 | jsdom does not provide real layout measurements. | Run the app locally and inspect 375px, 768px, and 1200px widths; verify metric grid, tab scrolling, saved history placement, word chip wrapping, and timeline readability. |
| Audio service label correctness | UI-02, UI-07 | Requires confirming whether current audio implementation is Deepgram or Gemini Live before user-facing copy changes. | Inspect implemented audio service path and verify the UI does not claim Gemini Live unless the code actually uses Gemini Live. |

---

## Security Threat References

| Threat Ref | Threat | Mitigation |
|------------|--------|------------|
| T-06-01 | AI feedback failure could hide deterministic results and mislead the learner into thinking analysis failed. | Keep deterministic dashboard and tabs visible while only the IELTS Analysis section shows loading/error/retry. |
| T-06-02 | Saved-session UI could persist raw vendor JSON or expose unauthenticated history globally. | Use `ownerKey` scoped Phase 5 APIs; sanitize snapshots; never include raw vendor keys rejected by `SavedSessionJsonSnapshotSchema`. |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 120s
- [ ] `nyquist_compliant: true` set in frontmatter after Wave 0 tests are implemented

**Approval:** pending

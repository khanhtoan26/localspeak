---
phase: 1
slug: monorepo-foundation-contracts
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-07
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest for contracts/frontend; Jest + Supertest for NestJS API |
| **Config file** | none — Wave 0 installs scaffold configs |
| **Quick run command** | `pnpm check` |
| **Full suite command** | `pnpm test && pnpm build` |
| **Estimated runtime** | ~60 seconds after dependencies install |

---

## Sampling Rate

- **After every task commit:** Run `pnpm check`
- **After every plan wave:** Run `pnpm test && pnpm build`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 60 seconds after dependency install

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 1-01-01 | 01 | 1 | ARCH-01 | T-1-05 | Root scripts avoid broad CORS defaults by using Next rewrite for local API access | build/smoke | `pnpm build` | ❌ W0 | ⬜ pending |
| 1-01-02 | 01 | 1 | ARCH-02 | T-1-03 | Vendor payload is validated with Zod and unknown vendor fields pass through intentionally | unit | `pnpm --filter @localspeak/contracts test` | ❌ W0 | ⬜ pending |
| 1-02-01 | 02 | 2 | ARCH-04 | T-1-01 / T-1-02 / T-1-04 | Backend secrets stay server-side; `/health` returns generic status only | unit/e2e | `pnpm --filter api test && pnpm --filter api test:e2e` | ❌ W0 | ⬜ pending |
| 1-03-01 | 03 | 2 | ARCH-01 | T-1-05 | Frontend calls same-origin `/api/*` path through Next rewrite | unit | `pnpm --filter web test` | ❌ W0 | ⬜ pending |
| 1-04-01 | 04 | 3 | ARCH-01, ARCH-04 | T-1-01 / T-1-02 | Env docs avoid exposing Gemini/Supabase secret values or `NEXT_PUBLIC_GEMINI_*` | static/docs | `pnpm check` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `package.json`, `pnpm-workspace.yaml`, and workspace package manifests.
- [ ] `packages/contracts/test/speech-assessment.fixture.test.ts` — validates `.artifacts/speech-response.json` and unknown vendor field passthrough.
- [ ] `apps/api/test/health.e2e-spec.ts` — verifies `/health` returns `status: "ok"` without external calls.
- [ ] `apps/api/test/contracts.e2e-spec.ts` — verifies `/contracts/sample-json/validate` returns `valid: true`.
- [ ] `apps/api/src/config/env.spec.ts` — verifies missing backend env fails with clear variable names.
- [ ] `apps/web/components/status-panel.test.tsx` — verifies project name, API status, and fixture status render.
- [ ] `apps/web/vitest.config.mts` — frontend unit test config.
- [ ] Root `check`, `test`, and `build` scripts.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Root `pnpm dev` starts both apps and status page shows API health + fixture valid | ARCH-01, ARCH-02 | Requires a live local dev process and browser/manual HTTP check | Run `pnpm dev`, open the web URL, verify API status is `ok` and fixture status is valid. |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 60 seconds
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending

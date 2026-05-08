---
phase: 05
slug: saved-analysis-persistence-service-drizzle-postgres
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-08
---

# Phase 05 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Contracts framework** | Vitest in `packages/contracts` |
| **API framework** | Jest + `ts-jest` + `supertest` in `apps/api` |
| **Config files** | `packages/contracts/vitest.config.ts` if present; `apps/api/jest.config.ts` |
| **Quick run command** | `pnpm --filter @localspeak/contracts build && pnpm --filter api test:unit` |
| **Contract command** | `pnpm --filter @localspeak/contracts test` |
| **DB integration command** | `DATABASE_URL=postgresql://... pnpm --filter api test:e2e -- --testMatch '**/test/saved-sessions.e2e-spec.ts'` |
| **Full suite command** | `pnpm check && pnpm test` |
| **Estimated runtime** | ~60-180 seconds, excluding DB startup |

---

## Sampling Rate

- **After every task commit:** Run `pnpm --filter @localspeak/contracts build && pnpm --filter api test:unit`
- **After every contract/schema task:** Run `pnpm --filter @localspeak/contracts test` and `pnpm --filter api db:check`
- **After every DB/API wave:** Run `DATABASE_URL=postgresql://... pnpm --filter api test:e2e -- --testMatch '**/test/saved-sessions.e2e-spec.ts'`
- **Before `/gsd-verify-work`:** `pnpm check`, `pnpm test`, and a real Postgres migration smoke run must pass
- **Max feedback latency:** 180 seconds, excluding first-time dependency install and DB container startup

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 05-01-01 | 01 | 1 | STORE-01, STORE-02 | T-05-01 / — | Strict saved-session contracts reject missing/short `ownerKey` and unsafe raw vendor fields | contract | `pnpm --filter @localspeak/contracts test` | ❌ W0 | ⬜ pending |
| 05-01-02 | 01 | 1 | STORE-01, STORE-03, ARCH-03 | T-05-02 / — | Drizzle schema includes JSONB snapshots and nullable future ownership field | unit/migration | `pnpm --filter api db:generate && pnpm --filter api db:check` | ❌ W0 | ⬜ pending |
| 05-02-01 | 02 | 2 | STORE-01, STORE-02, STORE-03 | T-05-03 / — | Service validates input and persists scoped rows without auth | unit | `pnpm --filter api test:unit -- saved-sessions` | ❌ W0 | ⬜ pending |
| 05-02-02 | 02 | 2 | STORE-02 | T-05-04 / — | List/fetch queries always include `ownerKey`; wrong-owner fetch returns 404 | unit/e2e | `DATABASE_URL=postgresql://... pnpm --filter api test:e2e -- --testMatch '**/test/saved-sessions.e2e-spec.ts'` | ❌ W0 | ⬜ pending |
| 05-03-01 | 03 | 3 | ARCH-03 | T-05-05 / — | Runtime persistence path fails loudly without `DATABASE_URL`; no in-memory fallback | unit/e2e | `pnpm --filter api test:unit -- database saved-sessions` | ❌ W0 | ⬜ pending |
| 05-03-02 | 03 | 3 | STORE-01, STORE-02, ARCH-03 | T-05-06 / — | Full create/list/fetch works against real Postgres after migrations | e2e/migration | `pnpm --filter api db:migrate && DATABASE_URL=postgresql://... pnpm --filter api test:e2e -- --testMatch '**/test/saved-sessions.e2e-spec.ts'` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `packages/contracts/test/saved-session.contract.test.ts` — strict create/list/fetch contract tests
- [ ] `apps/api/src/saved-sessions/saved-sessions.service.spec.ts` — validation, summary extraction, and ownerKey-scoped service behavior with mocked DB/repository
- [ ] `apps/api/test/saved-sessions.e2e-spec.ts` — real HTTP create/list/fetch against Postgres
- [ ] `apps/api/src/database/schema.spec.ts` or migration smoke coverage — schema exports, JSONB fields, and nullable future owner field
- [ ] local Postgres setup documentation — how to provide `DATABASE_URL` for migrations and e2e tests

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Local Postgres availability | ARCH-03 | Developer machines vary; Docker or external Postgres may be used | Follow README local Postgres instructions, set `DATABASE_URL`, run `pnpm --filter api db:migrate` |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 180s after dependencies and DB are available
- [ ] `nyquist_compliant: true` set in frontmatter after Wave 0 coverage is implemented

**Approval:** pending

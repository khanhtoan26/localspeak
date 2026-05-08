---
phase: 05-saved-analysis-persistence-service-drizzle-postgres
depth: standard
files_reviewed: 22
findings:
  critical: 0
  warning: 1
  info: 0
  total: 1
status: issues_found
---

# Phase 05 Code Review Report

## Summary

Reviewed committed Phase 5 saved-analysis persistence changes from `56a19d8772ae49848fe0083f2c6f4283ea212739^..HEAD`, excluding unrelated uncommitted Deepgram/TLS/audio worktree changes.

The Drizzle schema, Nest module wiring, persistence service, contracts, and tests are generally coherent. Initial findings focused on privacy/data-minimization enforcement, owner-key transport, denormalized metric validation, and environment documentation. The blocking data-minimization issue and metric/env documentation warnings were remediated during review.

## Open Warnings

### WR-01: `ownerKey` is used as a bearer secret in URL query parameters

**File:** `apps/api/src/saved-sessions/saved-sessions.controller.ts`

Listing and fetching saved sessions require `ownerKey` in the query string. Even though `ownerKey` is not full authentication, it is the only access partition for saved history and can appear in browser history, proxy logs, APM traces, and similar tooling.

**Recommendation:** Consider moving owner key transport to a header such as `X-Owner-Key` when the API contract is revised.

**Disposition:** Deferred. Phase 5 planning and contracts explicitly specify `GET /saved-sessions?ownerKey=...` and `GET /saved-sessions/:id?ownerKey=...`; changing transport now would alter the approved API contract. `ownerKey` is documented as temporary partitioning, not authentication, and real auth is deferred to backlog item `999.1`.

## Resolved During Review

### CR-01: Raw vendor payload filtering only checked top-level snapshot keys

**Files:** `packages/contracts/src/saved-session.ts`, `packages/contracts/test/saved-session.contract.test.ts`, `apps/api/src/saved-sessions/saved-sessions.service.spec.ts`

`SavedSessionJsonSnapshotSchema` now recursively rejects `speechAssessment`, `rawSpeechAssessment`, and `vendorPayload`, and regression tests cover nested raw vendor payloads before persistence.

### WR-02: Denormalized summary metrics accept impossible values

**Files:** `apps/api/src/saved-sessions/saved-sessions.service.ts`, `apps/api/src/saved-sessions/saved-sessions.service.spec.ts`, `packages/contracts/src/saved-session.ts`, `packages/contracts/test/saved-session.contract.test.ts`

The service now stores `null` for out-of-range IELTS bands and invalid WPM values. Response contracts now require bands in `0..9` and nonnegative integer WPM, with regression tests.

### WR-03: Documented API environment setup omits required `DEEPGRAM_API_KEY`

**Files:** `README.md`, `apps/api/.env.example`

`DEEPGRAM_API_KEY=` was added to API env examples and documented as backend-only, matching `validateApiEnv`.

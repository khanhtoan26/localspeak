---
phase: 01-monorepo-foundation-contracts
plan: 02
subsystem: api
tags: [nestjs, zod, env-validation, jest, supertest]
requires:
  - phase: 01-01
    provides: pnpm workspace and @localspeak/contracts package
provides:
  - NestJS API package in apps/api
  - backend env validation for Gemini and Supabase configuration
  - safe /health endpoint
  - /contracts/sample-json/validate endpoint using shared contracts
  - API unit and e2e test coverage
affects: [web, contracts, phase-3-gemini-feedback, phase-4-audio-analysis]
tech-stack:
  added: [nestjs, jest, ts-jest, supertest, tsx]
  patterns:
    - backend-only secret validation with Zod
    - generic health endpoint with no external service calls
    - fixture validation endpoint using shared contracts
key-files:
  created:
    - apps/api/package.json
    - apps/api/src/config/env.ts
    - apps/api/src/health/health.controller.ts
    - apps/api/src/contracts/contracts.controller.ts
    - apps/api/test/health.e2e-spec.ts
    - apps/api/test/contracts.e2e-spec.ts
  modified:
    - packages/contracts/package.json
    - packages/contracts/tsconfig.json
    - pnpm-lock.yaml
key-decisions:
  - "Kept /health generic and dependency-free so it never leaks env values or calls Gemini/Supabase."
  - "Built API tests against dummy env values only; Phase 1 does not require real external credentials."
patterns-established:
  - "Nest controllers are isolated into feature modules and covered by Supertest e2e tests."
  - "Server-only config is validated at bootstrap through validateApiEnv before app.listen."
requirements-completed: [ARCH-01, ARCH-02, ARCH-04]
duration: 0 min
completed: 2026-05-07
---

# Phase 01 Plan 02: API Skeleton Summary

**NestJS API with backend env validation, safe health status, and shared-contract fixture validation**

## Performance

- **Duration:** 0 min
- **Started:** 2026-05-07T05:48:08Z
- **Completed:** 2026-05-07T05:52:49Z
- **Tasks:** 2
- **Files modified:** 19

## Accomplishments

- Added the `apps/api` NestJS package with local dev, check, test, e2e, and build scripts.
- Implemented fail-fast backend env validation for Gemini and Supabase secret configuration.
- Added safe `/health` and `/contracts/sample-json/validate` endpoints with automated e2e coverage.

## Task Commits

Each task was committed atomically:

1. **Task 1: Create backend env validation and tests** - `7833a9a` (feat)
2. **Task 2: Create health and fixture validation endpoints** - `fd1ea7f` (feat)

**Plan metadata:** pending

## Files Created/Modified

- `apps/api/package.json` - API scripts and Nest/Jest/Supertest dependencies.
- `apps/api/tsconfig.json` - TypeScript config for API source and tests.
- `apps/api/tsconfig.build.json` - Build config for API runtime output.
- `apps/api/jest.config.ts` - Jest/ts-jest configuration.
- `apps/api/.env.example` - Backend env documentation for port, Gemini, and Supabase secret config.
- `apps/api/src/config/env.ts` - Zod env validation.
- `apps/api/src/config/env.spec.ts` - Env validation tests.
- `apps/api/src/main.ts` - Nest bootstrap with env validation before listening.
- `apps/api/src/app.module.ts` - Root API module.
- `apps/api/src/health/health.controller.ts` - Generic safe health response.
- `apps/api/src/health/health.module.ts` - Health module wiring.
- `apps/api/src/contracts/contracts.controller.ts` - Fixture validation endpoint.
- `apps/api/src/contracts/contracts.module.ts` - Contracts module wiring.
- `apps/api/test/health.e2e-spec.ts` - `/health` e2e coverage.
- `apps/api/test/contracts.e2e-spec.ts` - `/contracts/sample-json/validate` e2e coverage.
- `packages/contracts/package.json` - Adjusted package output compatibility for API consumption.
- `packages/contracts/tsconfig.json` - Adjusted contracts build module settings for API consumption.
- `pnpm-lock.yaml` - Updated dependency lockfile.

## Decisions Made

- Used `tsx watch src/main.ts` for the API dev script to keep Phase 1 lightweight without adding Nest CLI scaffolding.
- Kept CORS disabled in the API skeleton because the web plan uses a Next.js same-origin rewrite.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Adjusted contracts package output for Nest/Jest interoperability**
- **Found during:** Task 1 (Create backend env validation and tests)
- **Issue:** The API package consumes `@localspeak/contracts` from a CommonJS-oriented Nest/Jest setup; the initial contracts package emitted ESM-only output.
- **Fix:** Built contracts as CommonJS while preserving the same public exports and type declarations.
- **Files modified:** `packages/contracts/package.json`, `packages/contracts/tsconfig.json`
- **Verification:** Contracts test/check/build and API test/check/build all passed.
- **Committed in:** `7833a9a`

---

**Total deviations:** 1 auto-fixed (1 blocking).
**Impact on plan:** Required for backend runtime/test interoperability; no API scope expansion.

## Issues Encountered

None.

## User Setup Required

None - real Gemini and Supabase values are documented later, and automated tests use dummy values only.

## Next Phase Readiness

The web status page can now fetch `/api/health` and `/api/contracts/sample-json/validate` through its Next rewrite.

## Self-Check: PASSED

- `pnpm --filter api test -- env` passed.
- `pnpm --filter api test:e2e -- health` passed.
- `pnpm --filter api test:e2e -- contracts` passed.
- `pnpm --filter api check` passed.
- `pnpm --filter api build` passed.
- `pnpm check` passed.

---
*Phase: 01-monorepo-foundation-contracts*
*Completed: 2026-05-07*

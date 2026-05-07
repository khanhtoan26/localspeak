---
phase: 01-monorepo-foundation-contracts
reviewed: 2026-05-07T06:01:51Z
depth: standard
files_reviewed: 24
files_reviewed_list:
  - package.json
  - pnpm-workspace.yaml
  - tsconfig.base.json
  - .gitignore
  - packages/contracts/package.json
  - packages/contracts/tsconfig.json
  - packages/contracts/src/index.ts
  - packages/contracts/src/speech-assessment.ts
  - packages/contracts/test/speech-assessment.fixture.test.ts
  - apps/api/package.json
  - apps/api/src/config/env.ts
  - apps/api/src/health/health.controller.ts
  - apps/api/src/contracts/contracts.controller.ts
  - apps/api/test/health.e2e-spec.ts
  - apps/api/test/contracts.e2e-spec.ts
  - apps/web/package.json
  - apps/web/next.config.ts
  - apps/web/app/layout.tsx
  - apps/web/app/page.tsx
  - apps/web/app/globals.css
  - apps/web/components/status-panel.tsx
  - apps/web/components/status-card.tsx
  - apps/web/components/status-panel.test.tsx
  - README.md
findings:
  critical: 0
  warning: 2
  info: 0
  total: 2
status: issues_found
---

# Phase 1: Code Review Report

**Reviewed:** 2026-05-07T06:01:51Z
**Depth:** standard
**Files Reviewed:** 24
**Status:** issues_found

## Summary

Reviewed the Phase 1 monorepo foundation files: pnpm workspace configuration, shared `@localspeak/contracts` Zod schemas, Nest API environment validation and endpoints, Next status page/rewrite, tests, and README/env documentation.

No critical security issues were found. In particular:

- Gemini and Supabase secret keys are documented as backend-only.
- No `NEXT_PUBLIC_` secret usage was found.
- `/health` returns generic status only and does not call external services.
- No broad CORS enablement was found in the reviewed API bootstrap path.
- The Next rewrite uses a server-side `API_INTERNAL_URL`, not a browser-exposed public env variable.

Two correctness issues were found around runtime validation. The shared speech-assessment contract validates basic shape but still accepts domain-invalid vendor data, and the frontend status panel trusts API JSON via TypeScript casts instead of runtime validation.

## Warnings

### WR-01: Speech assessment contract accepts domain-invalid vendor JSON

**File:** `packages/contracts/src/speech-assessment.ts:3-38`

**Issue:** The schema validates that vendor fields are numbers/strings/arrays, but it does not enforce important domain invariants. Examples currently accepted include negative timestamps, `end_time` before `start_time`, negative scores, scores above the expected vendor scale, and non-URL `audio_url` values. Because this schema is the shared contract for vendor speech-assessment JSON, invalid assessment data can be accepted silently and later used by the API/UI as if it were meaningful.

**Fix:** Add range and relationship validation while keeping `z.looseObject` if preserving unknown vendor fields is intentional. If the vendor uses a different score range for `score_raw`, define a separate `RawScoreSchema` that matches the real API contract.

### WR-02: Frontend status panel trusts API JSON and can show success for malformed responses

**File:** `apps/web/components/status-panel.tsx:57-62,80-96`

**Issue:** The component casts `response.json()` directly to `HealthResponse` and `ContractResponse`. For `/api/health`, an empty or malformed `200` response still renders as `"localspeak-api is responding"` with `status: ok` because fallback defaults are applied. For the contract endpoint, non-boolean truthy values such as `{ "valid": "false" }` are treated as valid. This can hide broken API responses instead of surfacing them as unavailable/invalid.

**Fix:** Validate API response bodies at runtime before rendering success. Parsing failures should fall into the existing `.catch()` path, preventing malformed JSON from being presented as a healthy/valid state.

---

_Reviewed: 2026-05-07T06:01:51Z_
_Reviewer: the agent (gsd-code-reviewer)_
_Depth: standard_

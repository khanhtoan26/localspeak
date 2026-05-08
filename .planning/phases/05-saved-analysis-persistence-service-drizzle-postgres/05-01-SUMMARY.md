# 05-01 Summary — Saved-session contracts and contract tests

## Status

Complete.

## What Changed

- Replaced the loose saved-session contract shell with strict ownerKey-scoped create/list/detail schemas.
- Added nullable `userId` to persisted/list/detail records for future auth migration while keeping create payloads auth-free.
- Added shallow raw-vendor snapshot rejection for `speechAssessment`, `rawSpeechAssessment`, and `vendorPayload`.
- Added Vitest coverage for JSON/audio create payloads, missing/short ownerKey, create-time `userId` rejection, raw vendor rejection, summary-only list responses, and detail snapshots.

## Verification

- `pnpm --filter @localspeak/contracts test -- saved-session.contract.test.ts`
- `pnpm --filter @localspeak/contracts build`

## Deviations from Plan

None - plan executed exactly as written.

## Self-Check: PASSED

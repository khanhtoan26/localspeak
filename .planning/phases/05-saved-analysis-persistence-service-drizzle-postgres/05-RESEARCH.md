# Phase 5: Saved Analysis Persistence Service (Drizzle + Postgres) - Research

**Researched:** 2026-05-08
**Domain:** NestJS persistence service with Drizzle ORM + PostgreSQL, Zod shared contracts, pnpm workspace
**Confidence:** Medium-high

<user_constraints>

## Locked Decisions

- Persist sessions through an explicit save API call only; existing analysis endpoints must not auto-save after JSON/audio analysis succeeds.
- Use a client-generated `ownerKey` as the temporary owner field until authentication is implemented.
- Treat `ownerKey` as local-history partitioning, not authentication; support later claiming/migration to a real `userId` without reshaping records.
- Store structured key columns plus JSONB snapshots. Recommended columns include `id`, `ownerKey`, future nullable ownership field, `inputMode`, reference/title metadata, timestamps, and list-view summary fields.
- Store detailed metrics, feedback, and input metadata as JSONB snapshots so JSON-mode and audio-mode shapes can evolve.
- Do not store the full raw vendor speech assessment JSON by default.
- Phase 5 includes create, list-by-ownerKey, and fetch-by-id-plus-ownerKey operations only.
- Learner-facing save/history/reopen UI is deferred to Phase 6.
- Use Drizzle Kit migrations with `DATABASE_URL`; do not add an in-memory fallback that hides missing database config.

</user_constraints>

<phase_requirements>

| ID | Description | Research Support |
|----|-------------|------------------|
| STORE-01 | Persist analysis sessions with input mode, input metadata, derived metrics, feedback, and timestamps using Drizzle + Postgres via `DATABASE_URL`. | Use `drizzle-orm` + `pg`, Drizzle `jsonb()` columns for snapshots, structured list columns, and Drizzle Kit generated SQL migrations. |
| STORE-02 | Expose create/list/fetch service/API operations without authentication in this phase. | Implement a NestJS module/controller/service following existing `JsonAnalysisModule` and `GeminiFeedbackModule` patterns; scope list/fetch by `ownerKey`. |
| STORE-03 | Include future ownership field for deferred auth linking. | Add nullable `userId` or `accountId` beside required `ownerKey`; index both `ownerKey` and the future owner field. |
| ARCH-03 | Drizzle ORM schema over Postgres via `DATABASE_URL` stores saved sessions, metrics, feedback, input mode, and timestamps. | Add API-local Drizzle schema/config/migrations and database provider; no Supabase client and no fake DB fallback. |

</phase_requirements>

## Summary

Phase 5 should implement a backend-only persistence slice: strict shared saved-session contracts, a NestJS saved-sessions module, Drizzle schema/migrations, and Postgres-backed create/list/fetch operations scoped by `ownerKey`. Existing analysis endpoints remain pure computation endpoints and must not auto-save sessions.

Recommended stack:

- `drizzle-orm` for typed schema/query builder.
- `drizzle-kit` for migration generation/application.
- `pg` and `@types/pg` for PostgreSQL connection pooling in the NestJS API.
- Existing `zod` contracts for runtime request/response validation.

Use `pg` rather than `postgres-js` unless the planner finds a strong reason otherwise; `pg` has an explicit `Pool` lifecycle that maps cleanly to NestJS provider cleanup.

## Recommended Dependencies and Scripts

Install in the API package:

```bash
pnpm --filter api add drizzle-orm pg
pnpm --filter api add -D drizzle-kit @types/pg
```

Recommended `apps/api/package.json` scripts:

```json
{
  "db:generate": "drizzle-kit generate",
  "db:migrate": "drizzle-kit migrate",
  "db:check": "drizzle-kit check"
}
```

Recommended Drizzle config path: `apps/api/drizzle.config.ts`, with:

- `dialect: "postgresql"`
- `schema: "./src/database/schema.ts"`
- `out: "./drizzle"`
- `dbCredentials.url` from `DATABASE_URL`
- fail-fast error when `DATABASE_URL` is absent

## Recommended File Changes

| File | Change | Why |
|------|--------|-----|
| `packages/contracts/src/saved-session.ts` | Replace loose shell with strict schemas for create/list/fetch responses and shared types. | Current contract requires `userId` and uses loose JSON objects, conflicting with deferred auth and `ownerKey`. |
| `packages/contracts/src/index.ts` | Keep exporting saved-session contracts. | Existing barrel already exposes the file. |
| `packages/contracts/test/saved-session.contract.test.ts` | Add contract tests for create/list/fetch payloads and unsafe raw-input rejection. | Contracts package uses Vitest. |
| `apps/api/drizzle.config.ts` | Add Drizzle Kit config. | Required for migration generation/application. |
| `apps/api/src/database/schema.ts` | Define `savedAnalysisSessions` table and input mode enum. | Drizzle schema is the source for generated migrations. |
| `apps/api/src/database/database.module.ts` / `database.provider.ts` | Provide Drizzle DB and `pg` Pool; close pool on module destroy. | NestJS needs injectable DB and lifecycle cleanup. |
| `apps/api/src/saved-sessions/*` | Add module/controller/service and tests. | Phase 5 API/service scope. |
| `apps/api/src/app.module.ts` | Import `SavedSessionsModule`. | Existing API modules are wired here. |
| `apps/api/src/config/env.ts` | Ensure persistence path fails loudly without `DATABASE_URL`. | `DATABASE_URL` is currently optional. |
| `apps/api/.env.example` | Add `DATABASE_URL=postgresql://...`. | Local setup requirement. |
| `README.md` | Document local Postgres and migration commands. | Phase D-13 requires migration/local Postgres docs. |

## API Shape Recommendation

Use backend-owned routes:

```text
POST /saved-sessions
GET  /saved-sessions?ownerKey={ownerKey}
GET  /saved-sessions/:id?ownerKey={ownerKey}
```

Recommended create request:

```ts
SavedSessionCreateRequestSchema = z.strictObject({
  ownerKey: z.string().min(16).max(256),
  inputMode: z.enum(["json", "audio"]),
  title: z.string().trim().min(1).max(160).optional(),
  referenceText: z.string().trim().max(5000).optional(),
  inputMetadata: z.record(z.string(), z.unknown()).default({}),
  metrics: z.record(z.string(), z.unknown()).default({}),
  feedback: z.record(z.string(), z.unknown()).optional(),
});
```

Recommended list response includes only summary/list-view fields:

```ts
SavedSessionListItemSchema = z.strictObject({
  id: z.string().uuid(),
  ownerKey: z.string(),
  userId: z.string().uuid().nullable(),
  inputMode: z.enum(["json", "audio"]),
  title: z.string().nullable(),
  referenceText: z.string().nullable(),
  pronunciationBand: z.number().nullable(),
  fluencyBand: z.number().nullable(),
  wpm: z.number().int().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
```

Fetch response should include the full snapshots needed by Phase 6 to reopen a session without recomputing.

## Schema Shape and Migration Approach

Recommended single table: `saved_analysis_sessions`.

Suggested columns:

- `id uuid primary key defaultRandom()`
- `owner_key varchar(256) not null`
- `user_id uuid null` or `account_id uuid null` for future auth linking
- `input_mode enum('json', 'audio') not null`
- `title varchar(160) null`
- `reference_text text null`
- `pronunciation_band` and `fluency_band` as `real`, `numeric`, or scaled integer fields; do not use plain integer because IELTS bands can be `5.5`
- `wpm integer null`
- `input_metadata jsonb not null`
- `metrics jsonb not null`
- `feedback jsonb null`
- `created_at timestamp with time zone default now() not null`
- `updated_at timestamp with time zone default now() not null`

Indexes:

- `(owner_key, created_at)` for local history lists
- `(user_id, created_at)` or `(account_id, created_at)` for later auth migration

Use Drizzle `jsonb().$type<T>()` for TypeScript inference, but keep Zod runtime validation before inserting because Drizzle’s JSON type annotation is compile-time only.

## Architecture Patterns

```text
Client / Tests
  -> POST /saved-sessions
  -> SavedSessionsController
  -> SavedSessionsService
  -> Drizzle Database Provider
  -> Postgres via DATABASE_URL

Client / Tests
  -> GET /saved-sessions?ownerKey=...
  -> SELECT summary columns WHERE owner_key = ownerKey ORDER BY created_at DESC

Client / Tests
  -> GET /saved-sessions/:id?ownerKey=...
  -> SELECT full row WHERE id = id AND owner_key = ownerKey
  -> 404 if no scoped row exists
```

Follow existing NestJS feature pattern:

- `saved-sessions.module.ts`
- `saved-sessions.controller.ts`
- `saved-sessions.service.ts`
- service validates `unknown` input with Zod contracts
- controller delegates to service and returns contract-shaped outputs

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Contracts framework | Vitest in `packages/contracts` |
| API framework | Jest + `ts-jest` + `supertest` in `apps/api` |
| Quick command | `pnpm --filter @localspeak/contracts build && pnpm --filter api test:unit` |
| Full command | `pnpm test` |
| DB integration command | `DATABASE_URL=postgresql://... pnpm --filter api test:e2e -- --testMatch '**/test/saved-sessions.e2e-spec.ts'` |

### Phase Requirements -> Test Map

| Req ID | Behavior | Test Type |
|--------|----------|-----------|
| STORE-01 | Create persists input mode, metadata, metrics, feedback, timestamps in Postgres. | DB integration/e2e |
| STORE-02 | API exposes create/list/fetch without auth and scopes reads by `ownerKey`. | Controller e2e |
| STORE-03 | Saved record includes nullable future ownership field. | Schema/unit/integration |
| ARCH-03 | Drizzle schema/migrations over Postgres via `DATABASE_URL`. | Migration smoke/integration |

### Wave 0 Test Gaps

- `packages/contracts/test/saved-session.contract.test.ts`
- `apps/api/src/saved-sessions/saved-sessions.service.spec.ts`
- `apps/api/test/saved-sessions.e2e-spec.ts`
- `apps/api/src/database/schema.spec.ts` or migration smoke coverage
- local test DB/bootstrap documentation

### Required Verification Samples

1. Create rejects missing/short `ownerKey`.
2. Create accepts JSON-mode saved output built from `JsonAnalysisResponseSchema`.
3. Create accepts audio-mode metadata/feedback without JSON-specific fields.
4. List returns only rows for provided `ownerKey`.
5. Fetch by `id` with wrong `ownerKey` returns 404.
6. List response excludes raw full vendor `speechAssessment`.
7. Migration creates JSONB fields and nullable future owner field.
8. Persistence code fails loudly when run without `DATABASE_URL`.

## Security Domain

Applicable controls:

- V4 access control, limited to backend-enforced `ownerKey` scoping.
- V5 input validation through strict Zod contracts.
- V8 data protection by avoiding raw full vendor payload storage.

Threat patterns and mitigations:

- Cross-owner read by ID -> always query with `id AND owner_key`; test wrong-owner fetch.
- SQL injection -> use Drizzle query builder; no manual SQL interpolation.
- Oversized JSONB payload -> consider request size/contract limits similar to existing JSON analysis 2 MB body limit.
- Raw vendor/private payload storage -> store derived outputs and metadata, not full vendor assessment.
- Fake auth interpretation of `ownerKey` -> document it is partitioning only, not real authentication.

## Risks / Landmines

1. Current worktree has unrelated Deepgram/TLS/audio changes. Phase 5 plans should avoid editing `apps/api/src/deepgram-token/*`, `apps/web/components/audio-mode/*`, `.prototype/*`, or TLS scripts unless compilation requires a package metadata reconciliation.
2. Current `DATABASE_URL` is optional in `apps/api/src/config/env.ts`; persistence path must fail fast without creating fake fallback behavior.
3. Existing saved-session contract requires `userId`, conflicting with deferred auth and `ownerKey`.
4. Over-normalizing words/phonemes/pauses/drills into many tables would make Phase 5 too large; use JSONB snapshots for evolving outputs.
5. Storing raw vendor speech assessment JSON by default creates privacy/size burden and conflicts with Phase 5 context.
6. IELTS bands can be half values; do not store them as plain integer columns.
7. Importing a fail-fast DB module into `AppModule` may break unrelated tests unless tests provide `DATABASE_URL` or override the provider.

## Planning Implications

Recommended wave breakdown:

1. **Wave 1 — Contracts + schema/config**
   - Replace saved-session contract shell.
   - Add contract tests.
   - Add Drizzle dependencies, config, schema, scripts, and migration generation.
2. **Wave 2 — Database provider + service**
   - Add database provider/module.
   - Add saved-session service with create/list/fetch and ownerKey scoping.
   - Add service unit tests with mocked DB/repository.
3. **Wave 3 — Controller + e2e + docs**
   - Add controller/module/AppModule wiring.
   - Add real Postgres e2e tests.
   - Update `.env.example` and README migration/local Postgres docs.
   - Run full checks plus migration smoke.

Keep Phase 5 backend-only; do not build learner-facing save/history UI.

## Open Questions (RESOLVED)

1. **RESOLVED — Future ownership column name:** Use nullable `userId` on persisted/list/detail records. Do not accept `userId` in create payloads. Auth backlog may add a foreign key or migration later.
2. **RESOLVED — JSONB snapshot strictness:** Use strict top-level saved-session contracts with flexible but bounded JSONB snapshot records. Reject shallow raw-vendor keys `speechAssessment`, `rawSpeechAssessment`, and `vendorPayload` in `inputMetadata`, `metrics`, and `feedback`.
3. **RESOLVED — DB provider fail timing:** Drizzle CLI config must fail immediately without `DATABASE_URL`, but Nest `AppModule` compilation for unrelated non-DB tests must not fail solely because `SavedSessionsModule` is imported. Use a lazy database provider/service that calls `getRequiredDatabaseUrl()` only when saved-session persistence methods need a real database. Saved-session routes still fail loudly without `DATABASE_URL`; no in-memory fallback is allowed.

## Sources

- `.planning/phases/05-saved-analysis-persistence-service-drizzle-postgres/05-CONTEXT.md`
- `.planning/REQUIREMENTS.md`
- `.planning/ROADMAP.md`
- `.planning/PROJECT.md`
- `packages/contracts/src/saved-session.ts`
- `packages/contracts/src/json-analysis.ts`
- `packages/contracts/src/gemini-feedback.ts`
- `apps/api/src/config/env.ts`
- `apps/api/src/app.module.ts`
- Existing `json-analysis` and `gemini-feedback` modules/controllers/services
- Drizzle docs: `https://orm.drizzle.team/docs/get-started-postgresql`
- Drizzle PostgreSQL column docs: `https://orm.drizzle.team/docs/column-types/pg`
- Drizzle Kit migration docs: `https://orm.drizzle.team/docs/drizzle-kit-migrate`
- Node Postgres pool docs: `https://node-postgres.com/apis/pool`

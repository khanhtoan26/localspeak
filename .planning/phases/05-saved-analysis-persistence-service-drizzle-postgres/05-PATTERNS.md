# Phase 05 Pattern Map

**Phase:** 05 — Saved Analysis Persistence Service (Drizzle + Postgres)  
**Mapped:** 2026-05-08  
**Scope:** Backend/contracts/persistence only

---

## Planned Files

| Planned File / Area | Role | Data Flow | Closest Existing Analog | Match Quality |
|---|---|---|---|---|
| `packages/contracts/src/saved-session.ts` | contract / validation | request-response + transform | `packages/contracts/src/json-analysis.ts` | exact contract-style analog |
| `packages/contracts/src/index.ts` | barrel export | module export | `packages/contracts/src/index.ts` | exact existing file |
| `packages/contracts/test/saved-session.contract.test.ts` | contract test | validation | `packages/contracts/test/speech-assessment.fixture.test.ts`, `packages/contracts/test/json-analysis.metrics.test.ts` | exact test analog |
| `apps/api/drizzle.config.ts` | config | migration / batch | `apps/api/src/config/env.ts` fail-fast style + Drizzle research | partial |
| `apps/api/src/database/schema.ts` | model / schema | CRUD persistence | no Drizzle schema exists | no direct analog |
| `apps/api/src/database/database.provider.ts` | provider / service | request-response + DB lifecycle | injectable service/config patterns in API services | partial |
| `apps/api/src/database/database.module.ts` | module | dependency injection | `apps/api/src/json-analysis/json-analysis.module.ts` | exact |
| `apps/api/src/database/schema.spec.ts` | unit test | schema validation | `apps/api/src/config/env.spec.ts` | role-match |
| `apps/api/src/saved-sessions/saved-sessions.module.ts` | module | request-response | `apps/api/src/json-analysis/json-analysis.module.ts` | exact |
| `apps/api/src/saved-sessions/saved-sessions.controller.ts` | controller | request-response CRUD | `apps/api/src/json-analysis/json-analysis.controller.ts`, `apps/api/src/gemini-feedback/gemini-feedback.controller.ts` | exact |
| `apps/api/src/saved-sessions/saved-sessions.service.ts` | service | CRUD + validation | `apps/api/src/json-analysis/json-analysis.service.ts` | exact |
| `apps/api/src/saved-sessions/saved-sessions.service.spec.ts` | unit test | CRUD + validation | `apps/api/src/config/env.spec.ts`, API service specs | role-match |
| `apps/api/test/saved-sessions.e2e-spec.ts` | e2e API test | request-response CRUD | `apps/api/test/json-analysis.e2e-spec.ts` | exact |
| `apps/api/src/app.module.ts` | module wiring | dependency graph | `apps/api/src/app.module.ts` | exact existing file |
| `apps/api/src/config/env.ts` + `env.spec.ts` | config / validation | startup validation | same files | exact |
| `apps/api/package.json` + lockfile | package metadata | scripts/deps | `apps/api/package.json`, root `package.json` | exact |
| `apps/api/.env.example` | docs/config | env example | `apps/api/.env.example`, README env section | exact |
| `README.md` | docs | setup flow | existing `README.md` env + command sections | exact |
| `apps/api/drizzle/` generated migrations | migration | batch schema migration | none in repo | no direct analog |

Notes:

- Auth is deferred. `ownerKey` is a temporary local-history partition, not authentication.
- Do not add learner-facing saved-history UI in Phase 5.
- Do not add an in-memory fallback for persistence. Drizzle/Postgres must use `DATABASE_URL`.
- Avoid unrelated Deepgram/TLS/audio changes unless package metadata or `AppModule` wiring requires reconciliation.

---

## Existing Analogs

### Shared Zod contract conventions

Use `packages/contracts/src/json-analysis.ts` as the main contract analog:

```ts
import { z } from "zod";

export const JsonAnalysisResponseSchema = z.strictObject({
  contract: z.literal("json-analysis-response.v1"),
  inputMode: z.literal("json"),
  summary: JsonAnalysisSummarySchema,
  extracted: ExtractedSpeechAssessmentSchema,
  pronunciation: PronunciationMetricsSchema,
  fluency: FluencyMetricsSchema,
  words: z.array(WordMetricSchema),
  phonemes: z.array(PhonemeMetricSchema),
  weakPhonemePatterns: z.array(WeakPhonemePatternSchema),
  pauses: z.array(PauseMetricSchema),
  warnings: z.array(ValidationWarningSchema),
});

export type JsonAnalysisResponse = z.infer<typeof JsonAnalysisResponseSchema>;
```

Apply to `packages/contracts/src/saved-session.ts`:

- Replace the current loose shell and required `userId`.
- Use required `ownerKey: z.string().min(16).max(256)`.
- Include nullable future ownership field, likely `userId: z.string().uuid().nullable()`.
- Use `inputMode: z.enum(["json", "audio"])`.
- Use strict top-level schemas for create/list/fetch request and response shapes.
- Use controlled JSON snapshot fields such as `z.record(z.string(), z.unknown())`.
- Add list-item and detail/fetch response schemas.

### Current saved-session shell to replace

`packages/contracts/src/saved-session.ts` currently uses:

```ts
export const SavedAnalysisSessionSchema = z.looseObject({
  id: z.string(),
  userId: z.string(),
  inputMode: z.enum(["json", "audio"]),
  createdAt: z.string(),
  updatedAt: z.string(),
  inputMetadata: z.looseObject({}).optional(),
  metrics: z.looseObject({}).optional(),
  feedback: z.looseObject({}).optional(),
});
```

Keep the file path and exported concept names where possible to avoid import churn, but replace auth-era `userId` create requirements with `ownerKey` and a nullable future owner field.

### Contract barrel export

`packages/contracts/src/index.ts` already exports saved-session contracts:

```ts
export * from "./audio-streaming";
export * from "./gemini-feedback";
export * from "./json-analysis";
export * from "./saved-session";
export * from "./speech-assessment";
```

No change is required unless saved-session contracts are split into multiple files.

### NestJS module pattern

Copy the feature module style from `apps/api/src/json-analysis/json-analysis.module.ts`:

```ts
import { Module } from "@nestjs/common";
import { JsonAnalysisController } from "./json-analysis.controller";
import { JsonAnalysisService } from "./json-analysis.service";

@Module({
  controllers: [JsonAnalysisController],
  providers: [JsonAnalysisService],
})
export class JsonAnalysisModule {}
```

Apply to:

- `apps/api/src/saved-sessions/saved-sessions.module.ts`
- `apps/api/src/database/database.module.ts`

`SavedSessionsModule` should import `DatabaseModule` if the service injects the DB provider.

### Controller request-response pattern

Copy controller structure from `apps/api/src/json-analysis/json-analysis.controller.ts` and `apps/api/src/gemini-feedback/gemini-feedback.controller.ts`:

```ts
@Controller("json-analysis")
export class JsonAnalysisController {
  constructor(
    @Inject(JsonAnalysisService)
    private readonly jsonAnalysisService: JsonAnalysisService,
  ) {}

  @Post("analyze")
  @HttpCode(200)
  analyze(@Body() body: unknown) {
    return this.jsonAnalysisService.analyze(body);
  }
}
```

Phase 5 route recommendation:

```text
POST /saved-sessions
GET  /saved-sessions?ownerKey={ownerKey}
GET  /saved-sessions/:id?ownerKey={ownerKey}
```

Conventions:

- Import decorators from `@nestjs/common`.
- Inject service with `@Inject(ServiceClass)`.
- Accept raw `unknown` body and validate in the service.
- Use `@Query("ownerKey")` and `@Param("id")` for list/fetch.
- Do not add auth guards.

### API service validation and error handling

Copy the validation pattern from `apps/api/src/json-analysis/json-analysis.service.ts`:

```ts
const request = JsonAnalysisRequestSchema.safeParse(body);
if (!request.success) {
  throw new BadRequestException(
    this.invalidAnalyzeResponse(body, toValidationIssues(request.error.issues)),
  );
}

return JsonAnalysisResponseSchema.parse(computeJsonAnalysis(request.data.speechAssessment));
```

Apply to `SavedSessionsService`:

- Parse create payload with `SavedSessionCreateRequestSchema.safeParse`.
- Validate ownerKey and UUID query/path input before querying.
- Throw `BadRequestException` for invalid request input.
- Throw `NotFoundException` for missing or wrong-owner fetches.
- Validate outgoing rows with response schemas before returning.
- Consider a payload size guard for JSONB snapshots, reusing the existing 2 MB limit concept.
- Do not catch DB errors and return success-shaped fallbacks.

### Env validation pattern

`apps/api/src/config/env.ts` currently has:

```ts
export const ApiEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3001),
  DATABASE_URL: z.string().url().optional(),
  GEMINI_API_KEY: z.preprocess(
    (value) => (typeof value === "string" ? value.trim() : ""),
    z.string().min(1, "GEMINI_API_KEY is required"),
  ),
});
```

Phase 5 adaptation:

- Keep global API env validation compatible with non-DB tests if necessary.
- Add a dedicated DB env helper/provider that requires `DATABASE_URL` when persistence is loaded.
- Drizzle config must require `DATABASE_URL` immediately.
- Do not introduce fake/in-memory DB fallback.

### AppModule wiring pattern

`apps/api/src/app.module.ts` wires feature modules in the imports array:

```ts
@Module({
  imports: [HealthModule, ContractsModule, JsonAnalysisModule, GeminiFeedbackModule, DeepgramTokenModule],
})
export class AppModule {}
```

Phase 5 should import `SavedSessionsModule`. If that module imports `DatabaseModule`, `AppModule` only needs `SavedSessionsModule`. Watch test impact: importing a fail-fast DB module can break unrelated tests when `DATABASE_URL` is absent.

### API bootstrap and body limit

`apps/api/src/main.ts` disables default body parsing and applies a 2 MB JSON body limit:

```ts
const app = await NestFactory.create<NestExpressApplication>(AppModule, {
  bodyParser: false,
});

app.useBodyParser("json", { limit: "2mb" });
```

Saved-session JSONB snapshot inputs should respect this boundary. Do not increase the body size without explicit need and tests.

### API e2e pattern

Copy app factory style from `apps/api/test/json-analysis.e2e-spec.ts`:

```ts
const moduleRef = await Test.createTestingModule({
  imports: [AppModule],
}).compile();

const app = moduleRef.createNestApplication<NestExpressApplication>({
  bodyParser: false,
  logger: false,
});
app.useBodyParser("json", { limit: "2mb" });
await app.init();
```

Saved-session e2e tests should:

- Validate response bodies with `@localspeak/contracts` schemas.
- Assert no unsafe raw vendor payload or secrets in response bodies.
- Use real Postgres via `DATABASE_URL`; do not use in-memory fallback.

### API e2e unsafe-detail assertions

Copy helper style from JSON analysis e2e:

```ts
const serialize = (value: unknown) => JSON.stringify(value);

const expectNoUnsafeDetails = (value: unknown) => {
  const serialized = serialize(value);

  expect(serialized).not.toContain("GEMINI_API_KEY");
  expect(serialized).not.toContain("SUPABASE_SECRET_KEY");
  expect(serialized).not.toContain("Error:");
  expect(serialized).not.toContain("at ");
};
```

Adapt for Phase 5 by asserting responses do not include raw `speechAssessment`, DB connection strings, or stack traces.

### Contracts package Vitest pattern

Use Vitest imports and fixture style from `packages/contracts/test/speech-assessment.fixture.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { SpeechAssessmentResponseSchema } from "../src";

describe("speech assessment fixture contract", () => {
  it("validates the real sample fixture", () => {
    const result = SpeechAssessmentResponseSchema.safeParse(fixture);

    expect(result.success).toBe(true);
  });
});
```

For `saved-session.contract.test.ts`, include:

- create accepts valid JSON-mode snapshot
- create accepts valid audio-mode snapshot
- create rejects missing/short `ownerKey`
- create rejects auth-only `userId` if create payload should not accept it
- list response validates summary-only fields
- fetch response validates full snapshots
- timestamp strings validate
- raw `speechAssessment` rejection/absence if implemented

### Package script pattern

Root scripts use pnpm filters:

```json
{
  "dev": "pnpm --filter @localspeak/contracts build && concurrently \"pnpm --filter web dev\" \"pnpm --filter api start:dev\"",
  "check": "pnpm --filter @localspeak/contracts build && pnpm -r check",
  "test": "pnpm --filter @localspeak/contracts build && pnpm -r test",
  "build": "pnpm -r build"
}
```

API scripts should add:

```json
{
  "db:generate": "drizzle-kit generate",
  "db:migrate": "drizzle-kit migrate",
  "db:check": "drizzle-kit check"
}
```

Install dependencies:

```bash
pnpm --filter api add drizzle-orm pg
pnpm --filter api add -D drizzle-kit @types/pg
```

### Docs and env example pattern

`apps/api/.env.example` uses simple dotenv entries:

```dotenv
PORT=3001
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.0-flash
DEEPGRAM_API_KEY=
```

Phase 5 should add:

```dotenv
DATABASE_URL=postgresql://localspeak:localspeak@localhost:5432/localspeak
```

README should document:

- local Postgres requirement
- `DATABASE_URL`
- `pnpm --filter api db:generate`
- `pnpm --filter api db:migrate`
- `pnpm --filter api db:check`
- backend-only secret guidance

---

## Conventions to Reuse

### Zod contracts

- Use `z.strictObject` for stable API request/response shapes.
- Use `z.looseObject` only where vendor payloads intentionally preserve unknown fields.
- Use `safeParse` at API boundaries.
- Use `Schema.parse(...)` before returning responses from services/tests.
- Export types with `z.infer<typeof Schema>` directly below schema exports.

### NestJS structure

Use one folder per feature:

```text
apps/api/src/saved-sessions/
  saved-sessions.module.ts
  saved-sessions.controller.ts
  saved-sessions.service.ts
  saved-sessions.service.spec.ts
```

### Database / Drizzle conventions

No direct Drizzle analog exists in the repo. Use research-guided conventions:

- `apps/api/drizzle.config.ts`
- `apps/api/src/database/schema.ts`
- `apps/api/src/database/database.module.ts`
- `apps/api/src/database/database.provider.ts`
- generated migrations under `apps/api/drizzle/`
- `drizzle-orm` + `pg`
- `drizzle-kit` scripts in `apps/api/package.json`
- `DATABASE_URL` required for DB provider and Drizzle config
- no in-memory fallback

Suggested table:

- `saved_analysis_sessions`
- `id uuid primary key defaultRandom()`
- `owner_key varchar(256) not null`
- `user_id uuid null`
- `input_mode enum('json', 'audio') not null`
- `title varchar(160) null`
- `reference_text text null`
- summary metrics such as `pronunciation_band`, `fluency_band`, `wpm`
- `input_metadata jsonb not null`
- `metrics jsonb not null`
- `feedback jsonb null`
- `created_at timestamp with time zone default now() not null`
- `updated_at timestamp with time zone default now() not null`
- indexes on `(owner_key, created_at)` and future owner field

---

## Data Flow

### Create saved session

```text
Client/tests
  -> POST /saved-sessions
  -> SavedSessionsController.create(@Body() body: unknown)
  -> SavedSessionsService.create(body)
  -> SavedSessionCreateRequestSchema.safeParse(body)
  -> derive summary/list fields from snapshots
  -> Drizzle insert into saved_analysis_sessions
  -> validate DB row with created/detail schema
  -> return contract-shaped response
```

Rules:

- Explicit save only.
- Existing analysis endpoints must not auto-save.
- `ownerKey` is required.
- `ownerKey` is partitioning, not auth.
- Store JSONB snapshots for metrics/feedback/input metadata.
- Do not store raw vendor `speechAssessment` by default.

### List saved sessions by ownerKey

```text
Client/tests
  -> GET /saved-sessions?ownerKey=...
  -> SavedSessionsController.list(@Query("ownerKey") ownerKey)
  -> SavedSessionsService.listByOwnerKey(ownerKey)
  -> validate ownerKey
  -> SELECT summary columns WHERE owner_key = ownerKey ORDER BY created_at DESC
  -> SavedSessionListResponseSchema.parse(...)
  -> return summaries only
```

Rules:

- Always scope by `ownerKey`.
- Summary response should include list-view fields only.
- Include enough for Phase 6: `id`, input mode, title/reference metadata, timestamps, summary bands/WPM.

### Fetch saved session by id + ownerKey

```text
Client/tests
  -> GET /saved-sessions/:id?ownerKey=...
  -> SavedSessionsController.get(@Param("id") id, @Query("ownerKey") ownerKey)
  -> validate UUID + ownerKey
  -> SELECT full row WHERE id = id AND owner_key = ownerKey
  -> 404 if not found
  -> SavedSessionDetailResponseSchema.parse(...)
  -> return full snapshots
```

Rules:

- Query by both `id` and `ownerKey`.
- Wrong owner returns 404.
- No global fetch by ID.

### Migration/config flow

```text
Developer
  -> set DATABASE_URL
  -> pnpm --filter api db:generate
  -> pnpm --filter api db:migrate
  -> pnpm --filter api db:check
```

Rules:

- No fake DB fallback.
- Generated migrations should be committed.
- Docs must explain local Postgres setup.

---

## Test Patterns

### Contract tests

Command:

```bash
pnpm --filter @localspeak/contracts test
```

Include:

- create accepts valid JSON-mode snapshot
- create accepts valid audio-mode snapshot
- create rejects missing/short `ownerKey`
- create rejects unsafe raw vendor fields if implemented
- list response validates summary fields
- fetch response validates full snapshots
- timestamp strings validate

### API unit tests

Command:

```bash
pnpm --filter api test:unit -- saved-sessions
```

Include:

- mock DB provider or repository layer
- create validates input before insert
- create maps DB row to contract response
- list scopes by `ownerKey`
- fetch uses `id AND ownerKey`
- wrong-owner/not-found throws `NotFoundException`
- missing `DATABASE_URL` fails in DB provider/config path

### API e2e tests

Command:

```bash
DATABASE_URL=postgresql://... pnpm --filter api test:e2e -- --testMatch '**/test/saved-sessions.e2e-spec.ts'
```

Include:

1. Create persists input mode, metadata, metrics, feedback, timestamps.
2. List returns only records matching `ownerKey`.
3. Fetch by ID returns record only with matching `ownerKey`.
4. Wrong-owner fetch returns 404.
5. Missing/short `ownerKey` returns 400.
6. Response excludes raw full vendor `speechAssessment`.
7. Runtime path requires real `DATABASE_URL`.

### Migration/schema tests

No direct repo analog. Recommended:

- `apps/api/src/database/schema.spec.ts`
- assert exported table/enum names exist
- assert JSONB fields are represented in Drizzle schema
- assert nullable future owner field exists
- migration smoke:
  - `pnpm --filter api db:generate`
  - `pnpm --filter api db:check`
  - `pnpm --filter api db:migrate` against real Postgres

---

## Risks/Notes

1. `ownerKey` is not auth. No guards, sessions, signup, login, or account linking in Phase 5.
2. Learner-facing save/history/reopen UI belongs to Phase 6.
3. Drizzle + Postgres via `DATABASE_URL` is required; missing DB config must fail loudly in persistence paths and Drizzle config.
4. `DATABASE_URL` is currently optional in `apps/api/src/config/env.ts`; Phase 5 must make persistence requirements explicit without accidentally breaking unrelated tests.
5. No existing Drizzle/migration analog exists, so use research recommendations and Drizzle docs.
6. AppModule DB import can break tests if the database provider fails before unrelated routes are tested.
7. Avoid unrelated dirty worktree areas around Deepgram/TLS/audio.
8. Do not store full raw vendor speech assessment JSON by default.
9. IELTS bands can be half values; do not use integer-only columns for pronunciation/fluency bands.
10. Phase 5 docs should update Supabase-era wording to Drizzle/Postgres via `DATABASE_URL`.


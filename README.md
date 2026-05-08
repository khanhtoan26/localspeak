# LocalSpeak

LocalSpeak is a Next.js + NestJS monorepo for IELTS pronunciation practice, optimized first for Vietnamese learners. Phase 1 provides the runnable foundation: a frontend status page, backend health/contract endpoints, shared Zod contracts, and documented local configuration.

## Workspace layout

```text
apps/web              Next.js frontend
apps/api              NestJS backend API
packages/contracts    Shared Zod schemas and inferred TypeScript types
```

## Setup

Install dependencies from the repository root:

```bash
pnpm install
```

## Development commands

Run both apps together:

```bash
pnpm dev
```

Run either app separately:

```bash
pnpm dev:web
pnpm dev:api
```

The web app uses a same-origin rewrite from `/api/:path*` to the local API server at `http://localhost:3001`.

Each `pnpm dev*` command builds `@localspeak/contracts` first so the API and web app can resolve the shared package from a fresh install.

If port `3000` is already in use, set `WEB_PORT` for the frontend and update `API_INTERNAL_URL` if the API is not running on `3001`.

## Verification commands

```bash
pnpm check
pnpm test
pnpm build
```

These commands run across the pnpm workspace packages.

## Environment configuration

LocalSpeak uses PostgreSQL through Drizzle for saved analysis persistence. Authentication is not part of the current saved-session flow; temporary local ownership is partitioned by a client-generated `ownerKey`.

### Backend API

Copy `apps/api/.env.example` to `apps/api/.env` for local development:

```dotenv
PORT=3001
DATABASE_URL=postgresql://localspeak:localspeak@localhost:5432/localspeak
GEMINI_API_KEY=
```

`GEMINI_API_KEY` and `DATABASE_URL` are backend-only values. Do not put them in frontend files and do not prefix them with `NEXT_PUBLIC_`.

The API dev script loads `apps/api/.env` automatically at startup.

### Local Postgres and migrations

Start a local Postgres database:

```bash
docker run --name localspeak-postgres \
  -e POSTGRES_USER=localspeak \
  -e POSTGRES_PASSWORD=localspeak \
  -e POSTGRES_DB=localspeak \
  -p 5432:5432 \
  -d postgres:16
```

Apply Drizzle migrations from the repository root:

```bash
DATABASE_URL=postgresql://localspeak:localspeak@localhost:5432/localspeak pnpm --filter api db:migrate
```

Run the saved-session e2e tests against the migrated database:

```bash
DATABASE_URL=postgresql://localspeak:localspeak@localhost:5432/localspeak pnpm --filter api exec jest --config jest.config.ts --testMatch '**/test/saved-sessions.e2e-spec.ts'
```

Saved analysis history is explicit-save only: call `POST /saved-sessions` with an `ownerKey` to persist a completed analysis, then list with `GET /saved-sessions?ownerKey=...` or fetch detail with `GET /saved-sessions/:id?ownerKey=...`. `ownerKey` is only a temporary local partition and is not authentication; real auth and user accounts are deferred to backlog item `999.1`.

### Frontend web app

Copy `apps/web/.env.example` to `apps/web/.env` if you need to override the default API target:

```dotenv
API_INTERNAL_URL=http://localhost:3001
```

The frontend env file should not contain Gemini API keys or Supabase secret keys.

## Phase 1 endpoints

- `GET /health` returns generic local API status without calling Gemini or Supabase.
- `GET /contracts/sample-json/validate` validates `.artifacts/speech-response.json` with `@localspeak/contracts`.

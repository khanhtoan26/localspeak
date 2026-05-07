# Phase 1: Monorepo Foundation & Contracts - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-07
**Phase:** 1-Monorepo Foundation & Contracts
**Areas discussed:** Repo layout & dev commands, Shared contract style, Environment setup strategy, Walking skeleton behavior

---

## Repo layout & dev commands

| Question | Option | Selected |
|----------|--------|----------|
| Which workspace/package manager should Phase 1 lock in? | pnpm workspace | yes |
| Which workspace/package manager should Phase 1 lock in? | npm workspaces | |
| Which workspace/package manager should Phase 1 lock in? | Yarn workspaces | |
| Which workspace/package manager should Phase 1 lock in? | You decide | |
| What top-level monorepo layout should the planner use? | apps/web + apps/api + packages/contracts | yes |
| What top-level monorepo layout should the planner use? | frontend + backend + packages/contracts | |
| What top-level monorepo layout should the planner use? | apps/frontend + apps/backend + libs/shared | |
| What top-level monorepo layout should the planner use? | You decide | |
| How should local dev commands behave from the repo root? | One root dev command starts web+api, with separate dev:web/dev:api too | yes |
| How should local dev commands behave from the repo root? | Only separate dev:web and dev:api commands | |
| How should local dev commands behave from the repo root? | Use Docker Compose as the primary dev entrypoint | |
| How should local dev commands behave from the repo root? | You decide | |
| What should Phase 1's runnable baseline prove? | Next page calls Nest health endpoint and displays status | yes |
| What should Phase 1's runnable baseline prove? | Frontend and backend start independently; no cross-call yet | |
| What should Phase 1's runnable baseline prove? | Backend exposes contract metadata; frontend only has static landing page | |
| What should Phase 1's runnable baseline prove? | You decide | |

**User's choice:** pnpm workspace, `apps/web` + `apps/api` + `packages/contracts`, root and per-app dev commands, frontend calls backend health endpoint.
**Notes:** These choices make Phase 1 a real walking skeleton rather than only generated folders.

---

## Shared contract style

| Question | Option | Selected |
|----------|--------|----------|
| What should be the source of truth for shared API contracts? | Shared Zod schemas + inferred TypeScript types | yes |
| What should be the source of truth for shared API contracts? | Plain TypeScript interfaces only | |
| What should be the source of truth for shared API contracts? | Nest DTO classes + generated OpenAPI client | |
| What should be the source of truth for shared API contracts? | You decide | |
| Which contracts should Phase 1 define upfront? | All top-level v1 shells: JSON analysis, audio analysis, saved session, Gemini feedback | yes |
| Which contracts should Phase 1 define upfront? | Only Phase 2 JSON analysis contracts | |
| Which contracts should Phase 1 define upfront? | Only health/status contracts; defer feature contracts | |
| Which contracts should Phase 1 define upfront? | You decide | |
| How strict should the initial speech assessment JSON schema be? | Strict for known required fields, passthrough unknown vendor fields | yes |
| How strict should the initial speech assessment JSON schema be? | Strict only for top-level fields; loose nested word/phone fields | |
| How strict should the initial speech assessment JSON schema be? | Fully strict; reject any unknown fields | |
| How strict should the initial speech assessment JSON schema be? | You decide | |
| Should the sample payload in `.artifacts/speech-response.json` become part of the Phase 1 contract/test fixtures? | Yes, use it as a fixture for contract validation | yes |
| Should the sample payload in `.artifacts/speech-response.json` become part of the Phase 1 contract/test fixtures? | Reference it in docs only; don't wire into tests yet | |
| Should the sample payload in `.artifacts/speech-response.json` become part of the Phase 1 contract/test fixtures? | No, keep contracts independent of the sample file | |
| Should the sample payload in `.artifacts/speech-response.json` become part of the Phase 1 contract/test fixtures? | You decide | |

**User's choice:** Shared Zod schemas, v1 contract shells, required-field strictness with passthrough vendor fields, sample payload as a fixture.
**Notes:** The fixture is a canonical reference for downstream planning.

---

## Environment setup strategy

| Question | Option | Selected |
|----------|--------|----------|
| How should Supabase be handled in Phase 1 local setup docs? | Document hosted Supabase env vars now; local Supabase CLI can come later | yes |
| How should Supabase be handled in Phase 1 local setup docs? | Set up local Supabase CLI immediately | |
| How should Supabase be handled in Phase 1 local setup docs? | Support both hosted and local Supabase from day one | |
| How should Supabase be handled in Phase 1 local setup docs? | You decide | |
| How should Gemini be handled in the Phase 1 baseline before real analysis is built? | Backend config validates env var but health endpoint does not call Gemini | yes |
| How should Gemini be handled in the Phase 1 baseline before real analysis is built? | Health endpoint calls Gemini to verify the key works | |
| How should Gemini be handled in the Phase 1 baseline before real analysis is built? | Use a mock Gemini provider by default | |
| How should Gemini be handled in the Phase 1 baseline before real analysis is built? | You decide | |
| What environment files should the skeleton include? | Root docs plus app-specific `.env.example` files for web/api | yes |
| What environment files should the skeleton include? | Only one root `.env.example` | |
| What environment files should the skeleton include? | No env files; document variables in README only | |
| What environment files should the skeleton include? | You decide | |
| How should missing required backend env vars behave during development? | Fail fast at API startup with clear variable names | yes |
| How should missing required backend env vars behave during development? | Warn but keep server running | |
| How should missing required backend env vars behave during development? | Only fail when a route uses the missing variable | |
| How should missing required backend env vars behave during development? | You decide | |

**User's choice:** Hosted Supabase env docs now, backend validates Gemini env without health-calling Gemini, root and per-app env examples, fail-fast backend env validation.
**Notes:** Local Supabase CLI setup is explicitly deferred.

---

## Walking skeleton behavior

| Question | Option | Selected |
|----------|--------|----------|
| What should the Phase 1 web page look like? | Minimal status page showing project name, API health, and contract fixture check | yes |
| What should the Phase 1 web page look like? | Landing page styled like the future product dashboard | |
| What should the Phase 1 web page look like? | Plain default Next.js page with only a backend status badge | |
| What should the Phase 1 web page look like? | You decide | |
| What backend endpoints should exist in the Phase 1 skeleton? | `/health` plus `/contracts/sample-json/validate` using the fixture | yes |
| What backend endpoints should exist in the Phase 1 skeleton? | Only `/health` | |
| What backend endpoints should exist in the Phase 1 skeleton? | `/health`, `/version`, and placeholder analysis routes | |
| What backend endpoints should exist in the Phase 1 skeleton? | You decide | |
| How much styling should Phase 1 include? | Clean minimal UI using the chosen Next styling baseline; no full design system yet | |
| How much styling should Phase 1 include? | Barebones unstyled HTML | |
| How much styling should Phase 1 include? | Set up a polished design system immediately | |
| How much styling should Phase 1 include? | User freeform: reference `.wireframe/` folder | yes |
| What should Phase 1 prove automatically when tests/checks run? | Contract fixture validation + API health behavior + frontend renders health status | yes |
| What should Phase 1 prove automatically when tests/checks run? | Only contract fixture validation | |
| What should Phase 1 prove automatically when tests/checks run? | Only app startup/build success | |
| What should Phase 1 prove automatically when tests/checks run? | You decide | |

**User's choice:** Minimal status page, `/health`, `/contracts/sample-json/validate`, `.wireframe/` visual reference, and automated checks for contract fixture validation, health, and frontend health rendering.
**Notes:** `.wireframe/` was user-referenced during discussion and added to canonical refs.

---

## Agent Discretion

None.

## Deferred Ideas

- Local Supabase CLI setup can come after Phase 1.
- Full design system implementation is deferred beyond the foundation skeleton.

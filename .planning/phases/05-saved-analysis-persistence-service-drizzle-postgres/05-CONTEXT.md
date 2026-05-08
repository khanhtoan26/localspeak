# Phase 5: Saved Analysis Persistence Service (Drizzle + Postgres) - Context

**Gathered:** 2026-05-08
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 5 builds the backend persistence foundation for saved analysis sessions. The app should be able to persist and retrieve JSON/audio analysis sessions with derived metrics, feedback, input mode, input metadata, ownership metadata for future auth linking, and timestamps through Drizzle ORM over Postgres via `DATABASE_URL`.

This phase does not implement email/password signup, login, logout, account sessions, or learner-facing saved-history UI. Authentication has been deferred to backlog item 999.1. Phase 6 can build the frontend history/reopen experience on top of the service/API from this phase.

</domain>

<decisions>
## Implementation Decisions

### Persistence trigger
- **D-01:** Persist sessions through an explicit save API call only. Existing analysis endpoints should not auto-save after every successful JSON/audio analysis.
- **D-02:** The explicit save action can be called by frontend code or tests after analysis succeeds. This keeps persistence side effects separate from analysis computation.

### Temporary ownership model
- **D-03:** Use a client-generated `ownerKey` as the temporary owner field until authentication is implemented.
- **D-04:** The browser will generate and locally store a random `ownerKey`; create/list/fetch APIs use it to scope saved sessions.
- **D-05:** Treat `ownerKey` as a lightweight local-history partition, not real authentication. It should support later claiming/migration to an authenticated `userId` without reshaping saved-session records.

### Stored session shape
- **D-06:** Store structured key columns plus JSONB snapshots. Recommended columns include `id`, `ownerKey`, future nullable user/account ownership field, `inputMode`, reference/title metadata, timestamps, and summary fields useful for list views.
- **D-07:** Store detailed metrics, feedback, and input metadata as JSONB snapshots so JSON-mode and audio-mode results can evolve without over-normalizing v1 schema.
- **D-08:** Do not store the full raw vendor speech assessment JSON by default unless a later phase explicitly needs replay/debug storage. Prefer extracted metadata and derived outputs.

### API/service scope
- **D-09:** Phase 5 includes create, list-by-ownerKey, and fetch-by-id-plus-ownerKey operations.
- **D-10:** Update/delete/rename are out of scope for Phase 5 unless required internally for tests.
- **D-11:** Backend service/API plus shared contracts are in scope. Learner-facing save/history UI is deferred to Phase 6.

### Database setup
- **D-12:** Use Drizzle Kit migrations with `DATABASE_URL`.
- **D-13:** Document local Postgres requirements and migration commands. Do not add an in-memory fallback that hides missing `DATABASE_URL` mistakes.

### the agent's Discretion
- The exact JSONB field names and summary/list-view column set are left to the planner/implementer, as long as they satisfy the decisions above and support Phase 6 history UI.
- The exact route names are flexible, but they should follow existing NestJS module/controller/service patterns and shared contract conventions.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project scope and requirements
- `.planning/PROJECT.md` - Current product scope, deferred auth decision, `DATABASE_URL`/Drizzle constraint, and v1 boundaries.
- `.planning/REQUIREMENTS.md` - Phase 5 requirements `STORE-01`, `STORE-02`, `STORE-03`, and `ARCH-03`; auth requirements are deferred to backlog.
- `.planning/ROADMAP.md` - Phase 5 goal, success criteria, and backlog item `999.1`.
- `.planning/STATE.md` - Current milestone state and roadmap evolution.

### Existing contracts and analysis outputs
- `packages/contracts/src/saved-session.ts` - Existing saved-session contract shell to replace/enrich for Phase 5.
- `packages/contracts/src/json-analysis.ts` - JSON-mode analysis response shape that saved sessions must be able to snapshot.
- `packages/contracts/src/gemini-feedback.ts` - Gemini feedback response shape that saved sessions must be able to snapshot.
- `packages/contracts/src/audio-streaming.ts` - Existing audio-mode contract surface to consider for audio saved-session metadata.
- `packages/contracts/src/index.ts` - Shared contracts barrel.

### Backend integration points
- `apps/api/src/app.module.ts` - Module wiring location for saved-session/database modules.
- `apps/api/src/config/env.ts` - Env schema already includes optional `DATABASE_URL`; Phase 5 should make persistence requirements explicit.
- `apps/api/src/json-analysis/json-analysis.service.ts` - Produces deterministic JSON analysis outputs that may be persisted.
- `apps/api/src/gemini-feedback/gemini-feedback.service.ts` - Produces feedback outputs that may be persisted.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `SavedAnalysisSessionSchema` and `SavedSessionCreateRequestSchema` exist as loose shells in `packages/contracts/src/saved-session.ts`; Phase 5 should replace them with strict, useful contracts.
- `JsonAnalysisResponseSchema` provides the structured JSON analysis output that can be stored in saved-session JSONB snapshots.
- `GeminiFeedbackResponseSchema` provides the AI feedback output that can be stored in saved-session JSONB snapshots.

### Established Patterns
- Backend features use NestJS module/controller/service structure and are registered in `AppModule`.
- Shared API contracts live in `packages/contracts` and are consumed by both backend and frontend.
- Runtime validation uses Zod contracts at API boundaries.
- Local API routes are reached by the web app through same-origin `/api/*` rewrites.

### Integration Points
- Add Drizzle schema/migration/config under the API package or a clear workspace location chosen by the planner.
- Add a saved-session NestJS module with create/list/fetch operations.
- Extend `apps/api/.env.example`, README setup docs, and package scripts for Drizzle migration workflows as needed.
- Keep frontend UI wiring minimal or absent in Phase 5; Phase 6 owns learner-facing history/reopen presentation.

</code_context>

<specifics>
## Specific Ideas

- `ownerKey` should be generated by the browser with a random value such as `crypto.randomUUID()` and stored locally under an app-specific key.
- List responses should include enough summary data for a future history list: id, input mode, reference/title metadata, created/updated timestamps, and compact summary metrics.
- Fetch responses should restore the full saved analysis snapshot needed by Phase 6 to reopen a session without recomputing analysis.
- Create/list/fetch should require `ownerKey` to avoid global history exposure before real auth exists.

</specifics>

<deferred>
## Deferred Ideas

- Email/password signup, login, logout, account sessions, and account-linked history are deferred to roadmap backlog item `999.1`.
- Learner-facing save buttons, saved-history list UI, and reopen UI are deferred to Phase 6.
- Delete/rename/update saved sessions are deferred unless a later phase explicitly pulls them into scope.

</deferred>

---

*Phase: 5-Saved Analysis Persistence Service (Drizzle + Postgres)*
*Context gathered: 2026-05-08*

# Phase 5: Saved Analysis Persistence Service (Drizzle + Postgres) - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-08
**Phase:** 5-Saved Analysis Persistence Service (Drizzle + Postgres)
**Areas discussed:** Phase scope, persistence trigger, temporary ownership, stored session content, API/service scope, frontend boundary, database setup

---

## Phase Scope

| Option | Description | Selected |
|--------|-------------|----------|
| Defer authentication and focus Phase 5 on saved-analysis service persistence | Move email/password auth to backlog and make Phase 5 a Drizzle/Postgres persistence-service phase. | ✓ |
| Keep Phase 5 as auth + saved history | Preserve original roadmap scope. | |
| Split service persistence now and auth as the next phase | Do persistence first, then create a near-term auth phase. | |

**User's choice:** Defer authentication and focus Phase 5 on saved-analysis service persistence.
**Notes:** Planning docs were updated so Phase 5 is now “Saved Analysis Persistence Service (Drizzle + Postgres)” and auth is backlog item 999.1.

---

## Persistence Trigger

| Option | Description | Selected |
|--------|-------------|----------|
| Explicit API call only | Frontend or tests call “save session” after analysis succeeds; no auto-save side effects. | ✓ |
| Auto-save after every successful JSON/audio analysis | Convenient later, but changes existing analysis endpoint behavior. | |
| Let the agent decide | Delegate trigger choice to planner/implementer. | |

**User's choice:** Explicit API call only.
**Notes:** Existing analysis flows should remain side-effect free.

---

## Temporary Ownership

| Option | Description | Selected |
|--------|-------------|----------|
| Client-generated `ownerKey` | Browser stores a random local key; backend lists only sessions for that key; auth can claim them later. | ✓ |
| Global dev history | Every saved session is listable; simplest service, poor privacy and harder auth migration. | |
| Nullable `userId` only | Write records with no owner until auth exists; list/fetch are mostly admin/test-only. | |
| Let the agent decide | Delegate temporary ownership model. | |

**User's choice:** Client-generated `ownerKey`.
**Notes:** User asked what `ownerKey` means. It was clarified as a random local browser identifier, not real authentication. User confirmed this decision after clarification.

---

## Stored Session Content

| Option | Description | Selected |
|--------|-------------|----------|
| Structured metadata + JSONB analysis snapshots | Columns for ownerKey/inputMode/reference/summary/timestamps, JSONB for metrics/feedback/inputMetadata. | |
| Fully normalized metrics tables | Best querying later, more schema work now. | |
| Raw full input plus outputs | Easiest replay, but stores larger/sensitive vendor payloads. | |
| Let the agent decide | Delegate exact storage shape to planner/implementer. | ✓ |

**User's choice:** Let the agent decide.
**Notes:** Context records recommended agent discretion: structured key columns plus JSONB snapshots, avoid raw full vendor input by default.

---

## API/Service Scope

| Option | Description | Selected |
|--------|-------------|----------|
| Create, list by ownerKey, fetch by id+ownerKey | Enough for save/history/reopen without update/delete complexity. | ✓ |
| Create only | Persistence foundation first, no history retrieval until UI phase. | |
| Full CRUD including delete/rename | More complete, but adds product behavior not required yet. | |
| Let the agent decide | Delegate API operation scope. | |

**User's choice:** Create, list by ownerKey, fetch by id+ownerKey.
**Notes:** Update/delete/rename are deferred.

---

## Frontend Boundary

| Option | Description | Selected |
|--------|-------------|----------|
| Backend service/API + contracts only | Phase 6 can build the learner-facing history UI. | ✓ |
| Add minimal frontend save/history UI now | Useful to try manually, but expands Phase 5 into UI work. | |
| Let the agent decide | Delegate frontend boundary. | |

**User's choice:** Backend service/API + contracts only.
**Notes:** Keep Phase 5 out of learner-facing UI scope.

---

## Database Setup

| Option | Description | Selected |
|--------|-------------|----------|
| Use Drizzle Kit migrations with `DATABASE_URL` | Add schema, migration scripts, and document local Postgres requirement. | ✓ |
| Runtime `db push` only | Faster local iteration, weaker migration history. | |
| In-memory fallback when `DATABASE_URL` is missing | Convenient tests, but risks hiding config mistakes. | |
| Let the agent decide | Delegate database setup approach. | |

**User's choice:** Use Drizzle Kit migrations with `DATABASE_URL`.
**Notes:** No in-memory fallback that masks config errors.

---

## the agent's Discretion

- Exact JSONB field names and summary/list-view columns.
- Exact route names, as long as they follow existing NestJS/shared-contract patterns.

## Deferred Ideas

- Email/password signup, login, logout, account sessions, and account-linked history.
- Learner-facing saved-history UI and reopen UI.
- Delete/rename/update saved sessions.

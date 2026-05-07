# Phase 1: Monorepo Foundation & Contracts - Context

**Gathered:** 2026-05-07
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase delivers the runnable project foundation for the IELTS Pronunciation Scorer: a Next.js frontend, NestJS backend, shared TypeScript contracts, local development commands, and environment/config documentation. It should prove the monorepo works end-to-end without implementing the full analysis product.

</domain>

<decisions>
## Implementation Decisions

### Repo layout & dev commands
- **D-01:** Use a pnpm workspace.
- **D-02:** Use top-level layout `apps/web`, `apps/api`, and `packages/contracts`.
- **D-03:** Provide a root `dev` command that starts both frontend and backend, plus separate `dev:web` and `dev:api` commands.
- **D-04:** The Phase 1 runnable baseline should prove that the Next.js page can call the NestJS health endpoint and display the returned status.

### Shared contract style
- **D-05:** Shared API contracts should use Zod schemas with inferred TypeScript types.
- **D-06:** Phase 1 should define top-level v1 contract shells for JSON analysis, audio analysis, saved sessions, and Gemini feedback.
- **D-07:** Speech assessment JSON validation should be strict for known required fields while passing through unknown vendor fields.
- **D-08:** `.artifacts/speech-response.json` should be used as a fixture for contract validation.

### Environment setup strategy
- **D-09:** Phase 1 should document hosted Supabase environment variables; local Supabase CLI setup can come later.
- **D-10:** Backend config should validate that required Gemini configuration exists, but `/health` should not call Gemini.
- **D-11:** Include root setup docs plus app-specific `.env.example` files for `apps/web` and `apps/api`.
- **D-12:** Missing required backend environment variables should fail fast at API startup with clear variable names.

### Walking skeleton behavior
- **D-13:** The Phase 1 web page should be a minimal status page showing the project name, API health, and contract fixture check.
- **D-14:** The backend should expose `/health` and `/contracts/sample-json/validate` using the sample fixture.
- **D-15:** The minimal UI should reference `.wireframe/` for visual direction, especially the warm, card-based LocalSpeak style and shared UI atoms, without building the full design system yet.
- **D-16:** Automated checks should cover contract fixture validation, API health behavior, and frontend rendering of health status.

### Agent Discretion
- No decisions were delegated to agent discretion.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project scope and phase requirements
- `.planning/PROJECT.md` — Product vision, core value, stack decisions, constraints, and v1 boundaries.
- `.planning/REQUIREMENTS.md` — Phase 1 requirements `ARCH-01`, `ARCH-02`, and `ARCH-04`, plus deferred scope.
- `.planning/ROADMAP.md` — Phase 1 goal, dependency position, success criteria, and UI hint.
- `.planning/config.json` — GSD workflow settings and planning preferences.

### Contract fixtures
- `.artifacts/speech-response.json` — Real speech assessment sample payload to use for initial contract validation fixture.

### Visual direction
- `.wireframe/` — User-referenced wireframe folder; use as product visual reference.
- `.wireframe/app.jsx` — Wireframe navigation structure and app-level screen model.
- `.wireframe/components.jsx` — Warm card-based visual atoms, typography, color tokens, score ring, tags, and buttons.
- `.wireframe/screens-static.jsx` — Example LocalSpeak screens, home structure, history preview, and IELTS practice flow.
- `.wireframe/data.js` — Mock IELTS learner data, pause transcript model, score examples, and history examples.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `.artifacts/speech-response.json`: usable as the Phase 1 contract validation fixture.
- `.wireframe/components.jsx`: not production code yet, but a useful reference for visual tokens and component direction.
- `.wireframe/data.js`: not production data, but a useful reference for learner-facing concepts and example fields.

### Established Patterns
- No production application code exists yet.
- Wireframe direction favors a warm, card-based, mobile-first LocalSpeak style with serif display text, soft beige background, dark ink foreground, rounded cards, tags, and concise learner feedback.
- The product should keep Gemini calls backend-owned; frontend-only Gemini calls remain out of scope.

### Integration Points
- New frontend app starts at `apps/web`.
- New backend app starts at `apps/api`.
- Shared contracts live in `packages/contracts` and should be consumed by both apps.
- Phase 1 should create the first frontend-backend integration through `/health` and `/contracts/sample-json/validate`.

</code_context>

<specifics>
## Specific Ideas

- Root `pnpm dev` should be the fastest verification path for the whole skeleton.
- The status page should show project name, backend health, and whether the sample JSON fixture validates.
- The initial UI should use `.wireframe/` as reference, but only enough styling to keep the skeleton aligned with the intended product direction.
- The validation fixture should tolerate additional vendor fields so future speech assessment payload variants are not rejected unnecessarily.

</specifics>

<deferred>
## Deferred Ideas

- Local Supabase CLI setup can come after Phase 1; hosted Supabase env documentation is enough for the initial foundation.
- Full design system implementation is deferred; Phase 1 only references the wireframe style.

</deferred>

---

*Phase: 1-Monorepo Foundation & Contracts*
*Context gathered: 2026-05-07*

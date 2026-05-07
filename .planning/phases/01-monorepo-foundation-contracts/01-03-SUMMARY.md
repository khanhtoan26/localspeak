---
phase: 01-monorepo-foundation-contracts
plan: 03
subsystem: ui
tags: [nextjs, react, vitest, testing-library, status-page]
requires:
  - phase: 01-01
    provides: pnpm workspace and @localspeak/contracts package
  - phase: 01-02
    provides: /health and /contracts/sample-json/validate API endpoints
provides:
  - Next.js app package in apps/web
  - same-origin /api/:path* rewrite to Nest dev server
  - LocalSpeak status page with API health and contract fixture cards
  - frontend status rendering and refresh tests
affects: [api, ui, phase-6-dashboard]
tech-stack:
  added: [nextjs, react, react-dom, testing-library, jsdom, vite-react-plugin]
  patterns:
    - client-side status fetching through same-origin Next rewrites
    - local UI atoms styled with approved UI-SPEC tokens
    - React Testing Library coverage for async status states
key-files:
  created:
    - apps/web/package.json
    - apps/web/next.config.ts
    - apps/web/app/layout.tsx
    - apps/web/app/page.tsx
    - apps/web/app/globals.css
    - apps/web/components/status-panel.tsx
    - apps/web/components/status-card.tsx
    - apps/web/components/status-panel.test.tsx
  modified:
    - .gitignore
    - pnpm-lock.yaml
key-decisions:
  - "Used a same-origin Next rewrite instead of enabling broad API CORS."
  - "Kept Phase 1 UI to a minimal status page and did not copy the full wireframe app shell."
patterns-established:
  - "Frontend status checks fetch /api/* routes from client components and render accessible card states."
  - "Warm LocalSpeak visual tokens are declared in app/globals.css for local Phase 1 components."
requirements-completed: [ARCH-01]
duration: 0 min
completed: 2026-05-07
---

# Phase 01 Plan 03: Web Status Page Summary

**Next.js LocalSpeak status page with same-origin API rewrite and tested async health/fixture states**

## Performance

- **Duration:** 0 min
- **Started:** 2026-05-07T05:52:49Z
- **Completed:** 2026-05-07T05:57:13Z
- **Tasks:** 2
- **Files modified:** 18

## Accomplishments

- Added the `apps/web` Next.js App Router package with dev, check, test, and build scripts.
- Configured `/api/:path*` rewrites to the Nest dev server through `API_INTERNAL_URL`.
- Implemented the LocalSpeak status page with API Health, Contract Fixture, Refresh Status, UI-SPEC styling, accessible status announcements, and failure copy.

## Task Commits

Each task was committed atomically:

1. **Task 1: Create Next.js app package, rewrite, test setup, and safe env example** - `77de35b` (feat)
2. **Task 2: Implement LocalSpeak status page with frontend tests** - `efb410f` (feat)

**Plan metadata:** pending

## Files Created/Modified

- `apps/web/package.json` - Web scripts and Next/React/test dependencies.
- `apps/web/tsconfig.json` - TypeScript config for Next and React.
- `apps/web/next.config.ts` - Same-origin API rewrite and shared package transpilation.
- `apps/web/vitest.config.mts` - Vitest jsdom and React plugin setup.
- `apps/web/test/setup.ts` - Testing Library matcher setup.
- `apps/web/.env.example` - Safe frontend API rewrite env variable.
- `apps/web/next-env.d.ts` - Standard Next.js TypeScript declarations.
- `apps/web/app/layout.tsx` - App shell and metadata.
- `apps/web/app/page.tsx` - Status page route.
- `apps/web/app/globals.css` - UI-SPEC LocalSpeak styling tokens and component classes.
- `apps/web/components/status-card.tsx` - Accessible status card atom.
- `apps/web/components/status-panel.tsx` - Client status fetch, refresh, and error handling.
- `apps/web/components/status-panel.test.tsx` - Async status, error, and refresh behavior tests.
- `.gitignore` - Ignores generated TypeScript build-info files.
- `pnpm-lock.yaml` - Updated web dependencies.

## Decisions Made

- Kept status fetching in a client component because Phase 1 must show loading, refresh, and independent async error states in the browser.
- Used CSS classes and local atoms instead of a component library to satisfy the UI-SPEC registry-safety and scope constraints.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added React Vite plugin for TSX test parsing**
- **Found during:** Task 2 (Implement LocalSpeak status page with frontend tests)
- **Issue:** Vitest could not parse JSX in `.tsx` tests without React plugin configuration.
- **Fix:** Added `@vitejs/plugin-react` and configured it in `apps/web/vitest.config.mts`.
- **Files modified:** `apps/web/package.json`, `apps/web/vitest.config.mts`, `pnpm-lock.yaml`
- **Verification:** `pnpm --filter web test -- status-panel` passed.
- **Committed in:** `efb410f`

**2. [Rule 3 - Blocking] Ignored generated TypeScript build-info files**
- **Found during:** Task 2 verification
- **Issue:** `tsc --noEmit` created `apps/web/tsconfig.tsbuildinfo` because the Next TypeScript config uses incremental mode.
- **Fix:** Added `*.tsbuildinfo` to `.gitignore` and removed the generated file from the worktree.
- **Files modified:** `.gitignore`
- **Verification:** `git status --short` showed no generated build-info artifact.
- **Committed in:** `efb410f`

---

**Total deviations:** 2 auto-fixed (2 blocking).
**Impact on plan:** Both fixes supported planned test/build verification without expanding product scope.

## Issues Encountered

None.

## User Setup Required

None - the frontend uses a local rewrite to the API and exposes no secrets.

## Next Phase Readiness

The final docs/verification plan can document `pnpm dev`, `pnpm dev:web`, and `pnpm dev:api` against the working web/API skeleton.

## Self-Check: PASSED

- `pnpm --filter web test -- status-panel` passed.
- `pnpm --filter web check` passed.
- `pnpm --filter web build` passed.
- `pnpm check` passed.

---
*Phase: 01-monorepo-foundation-contracts*
*Completed: 2026-05-07*

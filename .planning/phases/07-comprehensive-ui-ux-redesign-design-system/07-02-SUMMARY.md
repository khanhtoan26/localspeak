---
phase: 07-comprehensive-ui-ux-redesign-design-system
plan: "02"
subsystem: ui
tags: [nextjs, tailwind, shadcn, layout, navigation, responsive, aria, fonts]

# Dependency graph
requires:
  - phase: 07-01
    provides: Tailwind v4 globals.css token system, shadcn Separator component, @/lib/utils cn() utility

provides:
  - App shell layout.tsx with Inter + JetBrains Mono fonts via next/font/google, Viewport export
  - Responsive app page.tsx with sidebar-left desktop layout and fixed bottom nav at mobile
  - aria-current="page" nav semantics replacing broken aria-pressed pattern
  - "Practice Tools" section label in sidebar (D-06 UIX spec)
  - min-w-0 on all content containers for UIX-06 horizontal overflow prevention
  - 44px min-height on all interactive nav buttons for UIX-07 touch targets
  - Updated vitest.config.mts with @/ path alias so unit tests can resolve shadcn imports

affects:
  - 07-03 (panel migration will render inside the desktop main / mobile main areas defined here)
  - 07-04 (JSON Analysis panel migrated into this shell)
  - 07-05 (Playwright E2E — aria-current="page" must be used in selectors, not aria-pressed)

# Tech tracking
tech-stack:
  added:
    - Inter font (next/font/google) replacing Geist for --font-sans
    - JetBrains_Mono font (next/font/google) for --font-mono
  patterns:
    - "Responsive layout: hidden sm:grid for desktop sidebar, sm:hidden for mobile bottom nav"
    - "aria-current='page' on active nav item (not aria-pressed)"
    - "min-w-0 on all flex/grid children to prevent overflow in narrow containers"
    - "pb-[env(safe-area-inset-bottom)] for iOS notch/home-indicator safe area in fixed bottom nav"

key-files:
  created: []
  modified:
    - apps/web/app/layout.tsx
    - apps/web/app/page.tsx
    - apps/web/app/page.test.tsx
    - apps/web/vitest.config.mts

key-decisions:
  - "Use Inter instead of Geist for --font-sans: Inter maps to the @theme --font-sans token established in 07-01 globals.css"
  - "aria-current='page' replaces aria-pressed on nav buttons: aria-current is the correct ARIA pattern for active page navigation; Playwright selectors in Plan 05 must use aria-current"
  - "Both desktop sidebar and mobile bottom nav rendered simultaneously, toggled by CSS visibility (hidden/sm:hidden): avoids React mount/unmount overhead and preserves panel state"
  - "page.test.tsx updated to assert aria-current instead of aria-pressed: old test was bound to removed UI structure"

patterns-established:
  - "NavItem: sidebar button with before: left-border indicator for active state, focus-visible ring for keyboard"
  - "BottomNavItem: icon above label, flex-1 for even spacing, active state via text-primary color only"
  - "vitest.config.mts must include @/ alias when page.tsx uses @/lib/utils or @/components/ui imports"

requirements-completed: [UIX-01, UIX-02, UIX-06, UIX-07]

# Metrics
duration: 5min
completed: 2026-05-09
---

# Phase 7 Plan 02: App Shell & Navigation Layout Summary

**Sidebar-left desktop layout + fixed mobile bottom nav with aria-current semantics, Inter/JetBrains Mono fonts, and 44px touch targets**

## Performance

- **Duration:** 5 min
- **Started:** 2026-05-09T08:22:48Z
- **Completed:** 2026-05-09T08:28:09Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments

- Rewrote layout.tsx: Inter + JetBrains Mono via next/font/google, Viewport export, Tailwind body classes (bg-background text-foreground font-sans antialiased)
- Rewrote page.tsx: desktop sidebar grid (hidden sm:grid) with "Practice Tools" section label + Separator, sticky aside with two NavItems; mobile layout (sm:hidden) with fixed bottom nav and two BottomNavItems
- Fixed broken aria-pressed pattern: all nav buttons now use aria-current="page" on active item (null when inactive), making the nav accessible and fixing future Playwright selectors
- All 46 unit tests pass; TypeScript reports zero errors in layout.tsx and page.tsx

## Task Commits

Each task was committed atomically:

1. **Task 1: Rewrite layout.tsx with font loading, viewport export, and Tailwind body classes** - `150dde3` (feat)
2. **Task 2: Rewrite page.tsx with grouped sidebar, fixed bottom nav, and aria-current** - `6f511f1` (feat)

**Plan metadata:** committed with SUMMARY.md

## Files Created/Modified

- `apps/web/app/layout.tsx` - Inter + JetBrains Mono fonts, Viewport export, Tailwind body classes; Geist font removed
- `apps/web/app/page.tsx` - Desktop sidebar layout + mobile bottom nav; all old BEM class names removed
- `apps/web/app/page.test.tsx` - Updated to assert aria-current semantics (removed aria-pressed and old BEM assertions)
- `apps/web/vitest.config.mts` - Added @/ path alias so vitest can resolve @/lib/utils and @/components/ui/* imports

## Decisions Made

- aria-current="page" replaces aria-pressed on nav buttons. aria-current is the correct semantic for "currently active page" in navigation; aria-pressed is for toggle buttons. Playwright selectors in Plan 07-05 must use `[aria-current="page"]` not `[aria-pressed="true"]`.
- Both desktop and mobile nav layouts are rendered in the DOM simultaneously (hidden via CSS). This avoids React remounting the panel components when viewport width changes, preserving panel state (textarea contents, tab selection) across resize events.
- Inter was chosen over Geist for the --font-sans slot because Inter is already listed as the primary typeface in 07-UI-SPEC.md and maps exactly to the `--font-sans` token defined in globals.css from Plan 01.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Merged master into worktree branch to get 07-01 dependencies**
- **Found during:** Task 1 setup
- **Issue:** The worktree branch was created from an earlier master commit that predates the 07-01 Tailwind/shadcn work. The worktree lacked globals.css Tailwind v4 tokens, shadcn components, and @/lib/utils.
- **Fix:** `git merge master --no-edit` (fast-forward). All 07-01 files merged cleanly.
- **Files modified:** All 07-01 files (now present in worktree)
- **Verification:** separator.tsx and lib/utils.ts both accessible after merge
- **Committed in:** merge commit (fast-forward, no separate commit)

**2. [Rule 2 - Missing Critical] Added @/ path alias to vitest.config.mts**
- **Found during:** Task 2 verification (pnpm --filter web test)
- **Issue:** page.tsx imports `@/lib/utils` and `@/components/ui/separator` but vitest.config.mts had no path alias. Tests failed with "Failed to resolve import @/lib/utils".
- **Fix:** Added `resolve.alias: { "@": path.resolve(__dirname, ".") }` to vitest.config.mts.
- **Files modified:** apps/web/vitest.config.mts
- **Verification:** All 6 test files, 46 tests pass after fix
- **Committed in:** 6f511f1 (Task 2 commit)

**3. [Rule 1 - Bug] Updated page.test.tsx to match new UI semantics**
- **Found during:** Task 2 verification (pnpm --filter web test)
- **Issue:** page.test.tsx asserted `aria-pressed="true"` and looked for old BEM class `.status-shell--dashboard` and helper text from the removed old layout. Tests would fail against the new UI.
- **Fix:** Rewrote page.test.tsx to assert `aria-current="page"` on active nav items and verify mode switching preserves active state. Removed all assertions tied to old BEM markup.
- **Files modified:** apps/web/app/page.test.tsx
- **Verification:** All 5 page tests pass
- **Committed in:** 6f511f1 (Task 2 commit)

**4. [Rule 3 - Blocking] Built @localspeak/contracts package to unblock tests**
- **Found during:** Task 2 verification
- **Issue:** json-analysis-panel.tsx and saved-sessions-panel.tsx import from @localspeak/contracts, but the package dist/ directory was missing in the worktree. Three test files failed.
- **Fix:** `pnpm --filter @localspeak/contracts build`
- **Files modified:** packages/contracts/dist/ (generated, not committed)
- **Verification:** All 6 test files pass (46/46 tests)
- **Committed in:** N/A (build artifact, not tracked in git)

---

**Total deviations:** 4 auto-fixed (1 blocking dependency, 1 missing critical, 2 bugs)
**Impact on plan:** All fixes necessary for tests to run and for correct accessibility semantics. No scope creep.

## Issues Encountered

- The worktree was created before 07-01 committed to master. Wave parallelism assumption was that 07-01 and 07-02 are independent, but 07-02's depends_on: [07-01] means the worktree needed the 07-01 changes. Resolved by merging master fast-forward.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- App shell is complete. Plans 07-03 through 07-05 can render panels inside `<main className="min-w-0 py-6">` (desktop) and `<main className="flex-1 min-w-0 p-4">` (mobile).
- Playwright tests in Plan 07-05 MUST use `[aria-current="page"]` selector for active nav items, not `[aria-pressed="true"]`.
- The sidebar has a `bg-sidebar` class — if the `--sidebar` color token is not defined in globals.css from Plan 01, it will need to be added (check globals.css token block).

---
*Phase: 07-comprehensive-ui-ux-redesign-design-system*
*Completed: 2026-05-09*

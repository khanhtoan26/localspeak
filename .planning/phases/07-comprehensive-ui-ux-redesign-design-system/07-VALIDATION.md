---
phase: 07
slug: comprehensive-ui-ux-redesign-design-system
status: approved
nyquist_compliant: true
wave_0_complete: true
created: 2026-05-09
updated: 2026-05-11T03:27:57Z
---

# Phase 07 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Playwright 1.59.1 (E2E) + Vitest 4.1.5 (unit) |
| **Playwright config** | `apps/web/playwright.config.ts` |
| **Vitest config** | `apps/web/vitest.config.mts` |
| **Quick run command (unit)** | `pnpm --filter web test` |
| **Quick run command (E2E)** | `pnpm --filter web test:e2e -- dashboard-ui.spec.ts responsive.spec.ts` |
| **TypeScript command** | `pnpm --filter web exec tsc --noEmit -p tsconfig.json` |
| **Full suite command** | `pnpm --filter web test && pnpm --filter web test:e2e -- dashboard-ui.spec.ts responsive.spec.ts` |
| **Last verified** | 2026-05-11 — TypeScript exit 0, Vitest 47/47, Playwright 18/18 |

---

## Sampling Rate

- **After every task commit:** Run `pnpm --filter web test`
- **After every plan wave:** Run `pnpm --filter web test && pnpm --filter web test:e2e -- dashboard-ui.spec.ts responsive.spec.ts`
- **Before `/gsd-verify-work`:** Full targeted suite must be green
- **Max feedback latency:** 90 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 07-01 | 01 | 1 | UIX-03 | T-07-01-01, T-07-01-02, T-07-01-03 | Tailwind v4, Shadcn aliases, and `cn()` resolve without style/build breakage | typecheck/E2E | `pnpm --filter web exec tsc --noEmit -p tsconfig.json`; `pnpm --filter web test:e2e -- dashboard-ui.spec.ts responsive.spec.ts` | yes | green |
| 07-02 | 02 | 2 | UIX-01, UIX-02, UIX-06, UIX-07 | T-07-02-02, T-07-02-03, T-07-02-04 | Sidebar/bottom nav render at correct breakpoints, preserve active state, use `aria-current`, avoid overflow | unit/E2E | `pnpm --filter web test`; `pnpm --filter web test:e2e -- dashboard-ui.spec.ts responsive.spec.ts` | yes | green |
| 07-03 | 03 | 3 | UIX-03, UIX-04, UIX-07 | T-07-03-01, T-07-03-02, T-07-03-04 | Migrated cards/tabs/chips keep test hooks, ARIA tab semantics, and 44px touch targets | unit/E2E | `pnpm --filter web test`; `pnpm --filter web test:e2e -- dashboard-ui.spec.ts responsive.spec.ts` | yes | green |
| 07-04 | 04 | 4 | UIX-04, UIX-05, UIX-06, UIX-07 | T-07-04-01, T-07-04-02, T-07-04-04, T-07-04-05 | JSON panel is outcome-first with Collapsible input; audio reference label and record state are accessible | unit/E2E | `pnpm --filter web test`; `pnpm --filter web test:e2e -- dashboard-ui.spec.ts responsive.spec.ts` | yes | green |
| 07-05 | 05 | 5 | UIX-01, UIX-05, UIX-06, UIX-07, UIX-08 | T-07-05-01, T-07-05-02, T-07-05-03, T-07-05-04, T-07-05-05 | Playwright covers nav, JSON analysis, audio states, responsive overflow, ARIA roles, keyboard tabs, and contrast | E2E | `pnpm --filter web test:e2e -- dashboard-ui.spec.ts responsive.spec.ts` | yes | green |

*Status: pending · green · red · flaky*

---

## Wave 0 Requirements

- [x] `pnpm --filter web exec playwright install chromium` — Chromium available; E2E ran successfully.
- [x] TypeScript path alias `@/*` configured in `apps/web/tsconfig.json` and Vitest alias configured in `apps/web/vitest.config.mts`.
- [x] `apps/web/e2e/responsive.spec.ts` created and expanded for UIX-01, UIX-03, UIX-05, UIX-06, UIX-07, and UIX-08 coverage.

Existing infrastructure covers all phase requirements.

---

## Automated Coverage

| Requirement | Automated coverage |
|-------------|--------------------|
| UIX-01 | `responsive.spec.ts` verifies desktop sidebar, mobile bottom nav, nav labels, and active `aria-current`. |
| UIX-02 | `dashboard-ui.spec.ts` verifies post-analysis outcome-first state and collapsed JSON input via "Change JSON input". |
| UIX-03 | `responsive.spec.ts` verifies warm design token rendering (`background`, `foreground`, `sidebar`, `primary`) and readable contrast for body, sidebar label, desktop active nav, and mobile active nav. |
| UIX-04 | `dashboard-ui.spec.ts` verifies practice priority, metric labels, pause ratio, advice copy, and IELTS Analysis tab entry point. |
| UIX-05 | `responsive.spec.ts` verifies audio reference input and Record button disabled/enabled states. |
| UIX-06 | `responsive.spec.ts` verifies no horizontal overflow at 390px for JSON pre-analysis, JSON post-analysis, and Audio mode. |
| UIX-07 | `responsive.spec.ts` verifies touch target height, JSON label access, tablist/tab/tabpanel roles, keyboard tab navigation, and contrast. |
| UIX-08 | `dashboard-ui.spec.ts` and `responsive.spec.ts` pass as the targeted UI coverage suite. |

---

## Manual-Only Verifications

All phase behaviors have automated verification.

---

## Validation Audit 2026-05-11

| Metric | Count |
|--------|-------|
| Gaps found | 1 |
| Resolved | 1 |
| Escalated | 0 |

Resolved gap:
- UIX-03/UIX-07 design-token and contrast coverage added to `apps/web/e2e/responsive.spec.ts`.
- Small active/subtle nav contrast issue fixed in `apps/web/app/page.tsx`: active mobile nav text now uses `text-foreground` with a primary marker, and the sidebar section label uses `text-muted-foreground`.

Commands run:
- `pnpm --filter web exec tsc --noEmit -p tsconfig.json` — exit 0
- `pnpm --filter web test:e2e -- dashboard-ui.spec.ts responsive.spec.ts` — 18 passed
- `pnpm --filter web test` — 47 passed

---

## Validation Sign-Off

- [x] All tasks have automated verification or completed Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all missing references
- [x] No watch-mode flags
- [x] Feedback latency < 90s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-05-11

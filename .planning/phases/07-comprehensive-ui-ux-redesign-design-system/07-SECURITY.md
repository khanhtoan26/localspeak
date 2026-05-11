---
phase: 07
slug: comprehensive-ui-ux-redesign-design-system
status: verified
threats_open: 0
asvs_level: 1
created: 2026-05-11
---

# Phase 07 — Security

> Per-phase security contract: threat register, accepted risks, and audit trail.

---

## Trust Boundaries

| Boundary | Description | Data Crossing |
|----------|-------------|---------------|
| CLI/package registry -> repository files | Tailwind, Shadcn, Radix, Lucide, and Playwright dependencies/components are installed into `apps/web`. | Package code and generated component files |
| Browser client -> app shell state | `page.tsx` is a client component; navigation mode is local React state only. | Non-sensitive UI mode state |
| Browser -> same-origin JSON analysis routes | Existing JSON analysis input, preview, analyze, saved-session list/save/reopen flows remain same-origin. | Speech assessment JSON, derived analysis metrics, browser owner key |
| Browser -> live audio UI | Phase 7 restyles the existing audio panel without changing recording/session transport. | Reference text, transcript/session state already handled by prior phase |
| User-provided analysis data -> React rendering | Words, phonemes, pauses, and feedback render through React components. | Learner speech text and analysis metrics |
| Playwright test runner -> Next dev server | E2E tests exercise localhost UI and intercept API routes with trusted fixtures. | Test-only fixture data |

---

## Threat Register

| Threat ID | Category | Component | Disposition | Mitigation | Status |
|-----------|----------|-----------|-------------|------------|--------|
| T-07-01-01 | Tampering | `globals.css` after Shadcn init | mitigate | `apps/web/app/globals.css` starts with `@import "tailwindcss"` and retains the Phase 7 `@theme inline` token block. | closed |
| T-07-01-02 | Tampering | Shadcn component generation path | mitigate | `apps/web/components.json` maps `ui` to `@/components/ui`, `utils` to `@/lib/utils`, and generated UI components exist under `apps/web/components/ui`. | closed |
| T-07-01-03 | Denial of Service | Tailwind/PostCSS pipeline | mitigate | `apps/web/postcss.config.mjs` configures `@tailwindcss/postcss`; `pnpm --filter web exec tsc --noEmit -p tsconfig.json` and E2E server startup passed after dependency links were refreshed. | closed |
| T-07-01-04 | Information Disclosure | Official Shadcn registry components | accept | Accepted at plan time: components are from the official Shadcn registry, no third-party registry blocks are declared in `components.json`. | closed |
| T-07-02-01 | Information Disclosure | `next/font` font handling | accept | Accepted at plan time: `apps/web/app/layout.tsx` uses `next/font/google`, which self-hosts generated font assets; no learner data is sent to Google Fonts during browsing. | closed |
| T-07-02-02 | Elevation of Privilege | Navigation focus management | mitigate | `NavItem` and `BottomNavItem` include `focus-visible` ring classes; Playwright accessibility checks passed. | closed |
| T-07-02-03 | Denial of Service | Fixed mobile bottom nav obscuring content | mitigate | Shared `<main>` uses mobile bottom padding (`pb-20`) and E2E verified no 390px overflow in JSON and Audio modes. | closed |
| T-07-02-04 | Spoofing | Current-state nav semantics | accept | Accepted at plan time: desktop and mobile navs represent the same local mode state; active buttons use `aria-current="page"` and hidden breakpoint navs are CSS-hidden. | closed |
| T-07-03-01 | Tampering | Data-testid preservation during migration | mitigate | `summary-metric-cards.tsx`, `words-tab.tsx`, and `phonemes-tab.tsx` retain `data-testid` hooks used by tests. | closed |
| T-07-03-02 | Elevation of Privilege | Mixed ARIA signals in tabs | mitigate | `result-tabs.tsx` uses Shadcn/Radix Tabs and contains no `aria-pressed`; E2E verified tablist/tab/tabpanel roles and keyboard arrow navigation. | closed |
| T-07-03-03 | Information Disclosure | Pronunciation data in word chips | accept | Accepted at plan time: Phase 7 changes presentation only; learner words still render through React text nodes with no new unsafe HTML path. | closed |
| T-07-03-04 | Denial of Service | Word chip touch target size | mitigate | `words-tab.tsx` chip base includes `min-h-[44px]`; responsive/accessibility E2E passed. | closed |
| T-07-04-01 | Tampering | JSON input disclosure state migration | mitigate | `json-analysis-panel.tsx` uses controlled Shadcn `Collapsible`, preserves `isInputOpen`, and auto-closes with `setIsInputOpen(false)` after analysis. | closed |
| T-07-04-02 | Tampering | Analyze button copy breaking E2E coverage | mitigate | E2E selectors use `"Analyze Pronunciation"`; targeted Playwright suite passed 17/17. | closed |
| T-07-04-03 | Elevation of Privilege | Collapsible focus management | accept | Accepted at plan time: Shadcn/Radix Collapsible manages disclosure semantics and does not trap focus because it is not a dialog. | closed |
| T-07-04-04 | Denial of Service | Audio reference label association | mitigate | `audio-mode-panel.tsx` pairs `htmlFor="reference-text"` with `id="reference-text"`; E2E verifies `getByLabel("Reference sentence")`. | closed |
| T-07-04-05 | Spoofing | Legacy `json-analysis-card` class bleed into audio panel | mitigate | `audio-mode-panel.tsx` no longer relies on `json-analysis-card`; Tailwind classes are local to the audio panel. | closed |
| T-07-05-01 | Tampering | E2E selectors masking UI breakage | mitigate | Specs use semantic Playwright selectors (`getByRole`, `getByLabel`, `getByTestId`) and caught the duplicate responsive panel bug during verification. | closed |
| T-07-05-02 | Denial of Service | Missing Playwright Chromium binary | mitigate | Playwright E2E executed successfully with Chromium: `pnpm --filter web test:e2e -- dashboard-ui.spec.ts responsive.spec.ts` passed 17/17. | closed |
| T-07-05-03 | Tampering | Overflow checks against wrong viewport | mitigate | `responsive.spec.ts` sets desktop/mobile viewport sizes before navigation and checks `documentElement.scrollWidth` against `clientWidth`. | closed |
| T-07-05-04 | Spoofing | Flaky post-analysis timing | mitigate | Fixed sleeps were replaced with explicit DOM assertions; `07-REVIEW-FIX.md` records WR-01 closed and E2E passed. | closed |
| T-07-05-05 | Tampering | Audio panel selector drift | mitigate | Audio tests target observable `Reference sentence` and `Record` button states; E2E passed after Phase 7 implementation. | closed |

*Status: open · closed*
*Disposition: mitigate (implementation required) · accept (documented risk) · transfer (third-party)*

---

## Accepted Risks Log

| Risk ID | Threat Ref | Rationale | Accepted By | Date |
|---------|------------|-----------|-------------|------|
| AR-07-01 | T-07-01-04 | Official Shadcn registry components are accepted for this design-system phase; no third-party registry entries are configured. | Plan-time phase approval | 2026-05-09 |
| AR-07-02 | T-07-02-01 | `next/font/google` self-hosts generated font assets, so no learner data is disclosed to Google Fonts at runtime. | Plan-time phase approval | 2026-05-09 |
| AR-07-03 | T-07-02-04 | Desktop and mobile nav buttons mirror the same local mode state; CSS-hidden breakpoint navs do not create a spoofing path. | Plan-time phase approval | 2026-05-09 |
| AR-07-04 | T-07-03-03 | Rendering pronunciation words is existing behavior and remains React-escaped presentation, not a new data exposure path. | Plan-time phase approval | 2026-05-09 |
| AR-07-05 | T-07-04-03 | Collapsible disclosure uses Radix semantics and requires no focus trap because it is not modal. | Plan-time phase approval | 2026-05-09 |

*Accepted risks do not resurface in future audit runs.*

---

## Security Audit Trail

| Audit Date | Threats Total | Closed | Open | Run By |
|------------|---------------|--------|------|--------|
| 2026-05-11 | 22 | 22 | 0 | Copilot |

---

## Sign-Off

- [x] All threats have a disposition (mitigate / accept / transfer)
- [x] Accepted risks documented in Accepted Risks Log
- [x] `threats_open: 0` confirmed
- [x] `status: verified` set in frontmatter

**Approval:** verified 2026-05-11

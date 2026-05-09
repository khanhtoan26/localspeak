---
phase: 07
slug: comprehensive-ui-ux-redesign-design-system
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-09
---

# Phase 07 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Playwright 1.59.1 (E2E) + Vitest 4.0.15 (unit) |
| **Playwright config** | `apps/web/playwright.config.ts` |
| **Vitest config** | `apps/web/vitest.config.mts` |
| **Quick run command (unit)** | `pnpm --filter web test` |
| **Quick run command (E2E)** | `pnpm --filter web test:e2e` |
| **Full suite command** | `pnpm --filter web test && pnpm --filter web test:e2e` |
| **Estimated runtime** | ~90 seconds (unit fast, E2E ~60s) |

---

## Sampling Rate

- **After every task commit:** Run `pnpm --filter web test`
- **After every plan wave:** Run `pnpm --filter web test && pnpm --filter web test:e2e`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 90 seconds

---

## Per-Task Verification Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? | Status |
|--------|----------|-----------|-------------------|-------------|--------|
| UIX-01 | App shell renders with nav, main content, and visual identity | E2E | `pnpm --filter web test:e2e -- --grep "app shell"` | ✗ Wave 5 | ⬜ pending |
| UIX-02 | Primary action visible; JSON input collapsed post-analysis | E2E | `pnpm --filter web test:e2e -- --grep "outcome first"` | ✗ Wave 5 | ⬜ pending |
| UIX-03 | Design system: Shadcn components render without style errors | E2E (smoke) | `pnpm --filter web test:e2e -- --grep "design system"` | ✗ Wave 5 | ⬜ pending |
| UIX-04 | JSON Analysis: PracticePriorityCard first, metrics second, tabs third, input collapsible | E2E | Update `dashboard-ui.spec.ts` | ✓ (needs update) | ⬜ pending |
| UIX-05 | Audio panel: reference input → record → status badge → transcript → score | E2E | Update existing audio spec | ✓ (needs update) | ⬜ pending |
| UIX-06 | No horizontal overflow at 390px mobile width | E2E | `pnpm --filter web test:e2e -- --grep "no overflow"` | ✓ (needs update) | ⬜ pending |
| UIX-07 | Accessibility: semantic landmarks, focus states, touch targets ≥44px, aria labels | E2E | `pnpm --filter web test:e2e -- --grep "accessibility"` | ✗ Wave 5 | ⬜ pending |
| UIX-08 | Full E2E coverage: nav, JSON analysis, live audio, responsive layout | E2E | `pnpm --filter web test:e2e` | ✓ (needs update) | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `pnpm exec playwright install chromium` — Chromium binary not installed; required before any E2E run
- [ ] Verify TypeScript path alias `@/*` added to `tsconfig.json` before `shadcn init`
- [ ] `apps/web/e2e/responsive.spec.ts` — new spec for UIX-06 bottom nav and UIX-07 accessibility

*Existing infrastructure (Playwright config, Vitest config) is in place but Chromium binary must be installed.*

---

## E2E Test Cases Required (Wave 5)

**Navigation (UIX-01, UIX-02):**
```typescript
test("sidebar nav switches between JSON and Audio modes at desktop")
test("bottom nav switches modes at mobile width 390px")
test("active nav item has aria-current='page'")
test("nav has aria-label='Main navigation'")
```

**JSON Analysis Panel (UIX-04):**
```typescript
test("JSON Analysis: practice priority card appears before metric cards")
test("JSON Analysis: JSON input is collapsed after analysis completes")
test("JSON Analysis: stale banner appears when input changes post-analysis")
test("JSON Analysis: tabs are navigable via keyboard arrow keys (Shadcn Tabs)")
// UPDATE: "Analyze JSON" → "Analyze Pronunciation" copy change
```

**Audio Panel (UIX-05):**
```typescript
test("Audio: record button disabled when reference text is empty")
test("Audio: status badge updates on session state change")
```

**Responsive (UIX-06):**
```typescript
test("no horizontal overflow at 390px mobile width — JSON mode")
test("no horizontal overflow at 390px mobile width — Audio mode")
test("sidebar hidden at mobile, bottom nav visible at mobile")
test("bottom nav hidden at desktop, sidebar visible at desktop")
```

**Accessibility (UIX-07):**
```typescript
test("all interactive elements reachable via Tab key")
test("focus ring visible on focused interactive elements")
test("metric cards have min 44px touch target")
test("JSON Textarea has aria-label")
test("result tabs have role=tablist, role=tab, role=tabpanel")
```

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Visual warmth / Notion-like aesthetic | UIX-03 (D-03) | Subjective visual quality cannot be automated | Review app at desktop and mobile; verify calm, generous whitespace, good contrast for reading feedback |
| WCAG AA contrast ratios | UIX-07 | Requires color contrast analysis tool | Use browser DevTools Accessibility panel or axe extension on each redesigned surface |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 90s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending

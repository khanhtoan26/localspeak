# Phase 7: Comprehensive UI/UX Redesign & Design System - Context

**Gathered:** 2026-05-09T00:00:00.000+07:00
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 7 rebuilds the current app UI into a cohesive, responsive, accessible, learner-centered shell. It replaces the existing custom-CSS system with Tailwind + Shadcn/UI, establishes a documented design system baseline, redesigns existing JSON Analysis and Live Audio panels through a CSS/hierarchy overhaul, evolves the sidebar navigation to scale for future exam-practice sections, and adds responsive phone-width support.

This phase does NOT add new exam-practice features, question bank, timed IELTS sessions, rubric evaluation, or session reports. Those are Phases 8–12. Phase 7 only rebuilds what exists (JSON Analysis, Live Audio, sidebar navigation, app shell) and lays the design-system foundation.

</domain>

<decisions>
## Implementation Decisions

### Design System

- **D-01:** Migrate from the existing custom CSS (1,332-line globals.css) to **Tailwind CSS + Shadcn/UI**. This is a full migration — all existing BEM-ish custom class names are replaced with Tailwind utilities and Shadcn component patterns.
- **D-02:** Use a **fresh Shadcn theme** starting from Shadcn defaults rather than mapping the existing CSS variable tokens. Start clean; do not attempt to preserve current class names.
- **D-03:** Theme target is **warm, readable, learner-tool aesthetic** — similar to Notion or Linear: focused, calm, generous whitespace, accessible for long study sessions. Not flashy; good contrast for reading feedback text.
- **D-04:** Install the **core Shadcn component set** needed to rebuild current surfaces: Button, Card, Tabs, Badge, Input, Textarea, Separator, Tooltip, Dialog, Skeleton. Additional components are added in later phases on demand.
- **D-05:** The design system is considered "documented" when the Shadcn component set is installed, the Tailwind config has a coherent color/typography token structure, and the theme is applied consistently across all redesigned surfaces.

### Navigation

- **D-06:** Use **grouped sidebar sections** to scale to future phases. Current groups: "Practice Tools" (JSON Analysis, Live Audio Practice). Future group "Exam Practice" added when Phase 8 ships. This grouping follows the VS Code/Linear sidebar pattern with labeled section dividers.
- **D-07:** Sidebar shows **only existing/shipped sections** — no coming-soon or disabled placeholder items. New sections are added to the sidebar as each phase ships.

### Mobile / Responsive Layout

- **D-08:** At phone width (≤640px), the **sidebar becomes a fixed bottom navigation bar** with icon + label pairs for each top-level section. This is the primary mobile navigation pattern — no hamburger menu.
- **D-09:** JSON Analysis and Live Audio panels use **natural Tailwind responsive reflow** at phone width. No phone-specific layout redesign — single-column stacking via responsive utilities is sufficient.
- **D-10:** No horizontal overflow at any viewport width. This is a hard requirement (UIX-06).

### Redesign Depth (Existing Panels)

- **D-11:** JSON Analysis and Live Audio panels are redesigned via **CSS/hierarchy overhaul only** — rewrite class names to Tailwind + Shadcn components, reorder visual hierarchy (outcome/metrics first, input/technical controls secondary). The component tree (JsonAnalysisPanel, SummaryMetricCards, ResultTabs, etc.) and all data/logic hooks remain unchanged.
- **D-12:** No data flow changes, no component tree restructuring, no Zod schema changes, no backend API changes in Phase 7.
- **D-13:** Existing globals.css is **fully replaced** by Tailwind — not extended. After Phase 7, globals.css contains only Tailwind directives and any truly global CSS resets, not component-level styles.

### Accessibility

- **D-14:** Phase 7 establishes the UIX-07 baseline: keyboard navigation, visible focus states, semantic HTML landmarks, touch targets ≥44px, WCAG AA contrast ratios, screen-reader labels on interactive elements.

### Test Coverage

- **D-15:** Playwright E2E test coverage (UIX-08) verifies: navigation between sections, JSON Analysis core flow, Live Audio Practice surface, and responsive layout at phone and desktop breakpoints. Playwright is already configured in `apps/web/playwright.config.ts` — Phase 7 extends it.

### Claude's Discretion

- JSON input placement (textarea visibility/collapsibility after analysis completes) — planner picks the right balance between input visibility and result-first hierarchy. A collapsible disclosure pattern is reasonable given the existing `<details>` element already in use.
- Exact Shadcn theme color values, typography scale, and component variant choices are left to the planner/implementer, provided the "warm, readable, learner-tool" direction is followed.
- Whether to use Shadcn's built-in dark mode support is left to discretion — not required by UIX requirements but acceptable to include if it doesn't add scope.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project scope and requirements
- `.planning/PROJECT.md` — Product scope, Vietnamese IELTS learner focus, v1.1 goals, and tech stack constraints.
- `.planning/REQUIREMENTS.md` — UIX-01 through UIX-08 (Phase 7 requirements). Read every UIX requirement carefully — they define the acceptance criteria for this phase.
- `.planning/ROADMAP.md` — Phase 7 goal, success criteria, and dependency chain for Phases 8–12.
- `.planning/STATE.md` — Current project state and recent decisions.

### Prior phase context
- `.planning/phases/06-learner-dashboard-analysis-views/06-CONTEXT.md` — Defines learner-first hierarchy, mode-switching pattern, deterministic metrics primary/AI coaching secondary, and current component structure. Phase 7 preserves this hierarchy while upgrading the visual system.

### Existing frontend files to redesign
- `apps/web/app/globals.css` — Current 1,332-line custom CSS system to be replaced by Tailwind.
- `apps/web/app/layout.tsx` — App shell entry point. Phase 7 updates this for Tailwind, Shadcn provider, and responsive meta.
- `apps/web/app/page.tsx` — Top-level page with sidebar layout and mode switching. Phase 7 redesigns this with grouped Shadcn sidebar navigation and mobile bottom nav.
- `apps/web/components/json-analysis/json-analysis-panel.tsx` — Main JSON analysis view. Phase 7 overwrites class names to Tailwind/Shadcn, reorders hierarchy.
- `apps/web/components/json-analysis/summary-metric-cards.tsx` — Metric cards (pronunciation %, bands, WPM). Phase 7 migrates to Shadcn Card.
- `apps/web/components/json-analysis/result-tabs.tsx` — Analysis tab structure. Phase 7 migrates to Shadcn Tabs.
- `apps/web/components/json-analysis/pauses-tab.tsx` — Pause timeline/list view.
- `apps/web/components/json-analysis/words-tab.tsx` — Score-colored word chips.
- `apps/web/components/json-analysis/phonemes-tab.tsx` — Ranked phoneme weakness bars.
- `apps/web/components/json-analysis/ai-coach-tab.tsx` — AI Coach states.
- `apps/web/components/audio-mode/audio-mode-panel.tsx` — Live Audio Practice surface.
- `apps/web/components/status-card.tsx` — Status card component.
- `apps/web/components/status-panel.tsx` — Status panel component.

### Playwright test configuration
- `apps/web/playwright.config.ts` — Existing Playwright config. Phase 7 adds test files in `apps/web/e2e/`.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `JsonAnalysisPanel` manages JSON paste/upload, validation, analysis state, stale-result state, and AI feedback state — all logic stays unchanged. Phase 7 only rewrites its markup and class names.
- `SummaryMetricCards` renders headline metrics — maps naturally to Shadcn Card components.
- `ResultTabs` — maps naturally to Shadcn Tabs component.
- `PausesTab`, `WordsTab`, `PhonemesTab`, `AiCoachTab` — existing tab content components, CSS rewrite only.
- `AudioModePanel` — existing audio surface, CSS rewrite only.
- Existing `<details>` element used for JSON input disclosure — this pattern can stay or be replaced with Shadcn Collapsible.

### Established Patterns
- All API calls use same-origin `/api/*` routes — unchanged.
- Zod schemas in `@localspeak/contracts` define all data shapes — unchanged.
- Component state is React local state — unchanged.
- Current CSS variable system (`--bg`, `--ink`, `--accent`, etc.) is replaced by Tailwind + Shadcn theme variables. No other code references these variables directly.

### Integration Points
- `apps/web/app/layout.tsx` — Add Tailwind + Shadcn ThemeProvider here.
- `apps/web/app/page.tsx` — Sidebar navigation redesign is the central change: grouped sections, mobile bottom nav toggle.
- `apps/web/tailwind.config.ts` — Must be created as part of Tailwind setup.
- `apps/web/package.json` — Tailwind, Shadcn, and Radix dependencies added here.

### Migration Scope
- ~15 component files need className rewrites (no logic changes).
- 1 globals.css file replaced (Tailwind directives only after migration).
- 1 new tailwind.config.ts created.
- Shadcn components installed via CLI into `apps/web/components/ui/`.
- Playwright E2E tests added for navigation + core flows.

</code_context>

<specifics>
## Specific Ideas

- Visual aesthetic: warm, readable learner tool — think Notion or Linear. Calm, focused, generous whitespace. Good contrast for long study sessions.
- Shadcn component set for Phase 7 baseline: Button, Card, Tabs, Badge, Input, Textarea, Separator, Tooltip, Dialog, Skeleton.
- Mobile bottom nav should show icon + label for each top-level section. Two items initially: JSON Analysis, Live Audio.
- Sidebar grouped sections pattern: section label (e.g., "Practice Tools") followed by indented nav items. Matches VS Code sidebar and Linear left-nav conventions.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 7-Comprehensive UI/UX Redesign & Design System*
*Context gathered: 2026-05-09*

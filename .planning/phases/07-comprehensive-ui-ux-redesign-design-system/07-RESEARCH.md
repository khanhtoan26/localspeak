# Phase 7: Comprehensive UI/UX Redesign & Design System — Research

**Researched:** 2026-05-09
**Domain:** Tailwind CSS v4 + Shadcn/UI migration in Next.js 16 monorepo (pnpm)
**Confidence:** HIGH (codebase fully inspected; library docs verified via Context7 and official sources)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Migrate from the existing custom CSS (1,332-line globals.css) to Tailwind CSS + Shadcn/UI. Full migration — all existing BEM-ish custom class names replaced with Tailwind utilities and Shadcn component patterns.
- **D-02:** Use a fresh Shadcn theme starting from Shadcn defaults rather than mapping the existing CSS variable tokens. Start clean; do not attempt to preserve current class names.
- **D-03:** Theme target is warm, readable, learner-tool aesthetic — similar to Notion or Linear: focused, calm, generous whitespace, accessible for long study sessions.
- **D-04:** Install the core Shadcn component set: Button, Card, Tabs, Badge, Input, Textarea, Separator, Tooltip, Dialog, Skeleton, Collapsible.
- **D-05:** Design system is "documented" when the Shadcn component set is installed, the Tailwind config has a coherent color/typography token structure, and the theme is applied consistently across all redesigned surfaces.
- **D-06:** Use grouped sidebar sections to scale to future phases. Current groups: "Practice Tools" (JSON Analysis, Live Audio Practice). This grouping follows the VS Code/Linear sidebar pattern with labeled section dividers.
- **D-07:** Sidebar shows only existing/shipped sections — no coming-soon or disabled placeholder items.
- **D-08:** At phone width (≤640px), the sidebar becomes a fixed bottom navigation bar with icon + label pairs for each top-level section. No hamburger menu.
- **D-09:** JSON Analysis and Live Audio panels use natural Tailwind responsive reflow at phone width. No phone-specific layout redesign.
- **D-10:** No horizontal overflow at any viewport width. Hard requirement (UIX-06).
- **D-11:** JSON Analysis and Live Audio panels redesigned via CSS/hierarchy overhaul only — rewrite class names to Tailwind + Shadcn components, reorder visual hierarchy. Component tree and data/logic hooks remain unchanged.
- **D-12:** No data flow changes, no component tree restructuring, no Zod schema changes, no backend API changes in Phase 7.
- **D-13:** Existing globals.css is fully replaced by Tailwind — not extended. After Phase 7, globals.css contains only Tailwind directives and any truly global CSS resets.
- **D-14:** Phase 7 establishes the UIX-07 baseline: keyboard navigation, visible focus states, semantic HTML landmarks, touch targets ≥44px, WCAG AA contrast ratios, screen-reader labels on interactive elements.
- **D-15:** Playwright E2E test coverage verifies: navigation between sections, JSON Analysis core flow, Live Audio Practice surface, and responsive layout at phone and desktop breakpoints. Playwright is already configured in `apps/web/playwright.config.ts`.

### Claude's Discretion

- JSON input placement (textarea visibility/collapsibility after analysis completes) — a collapsible disclosure pattern is reasonable given the existing `<details>` element already in use.
- Exact Shadcn theme color values, typography scale, and component variant choices, provided the "warm, readable, learner-tool" direction is followed.
- Whether to use Shadcn's built-in dark mode support — not required but acceptable if it doesn't add scope.

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| UIX-01 | Cohesive app shell with clear navigation, hierarchy, and visual identity across JSON Analysis, Live Audio Practice, and upcoming exam-practice surfaces. | App shell redesign using `page.tsx` sidebar rewrite + Shadcn Separator for grouped nav sections; Tailwind layout shell replaces `.practice-layout` grid. |
| UIX-02 | User can understand the primary next action on every major screen without competing controls or crowded panels. | Outcome-first hierarchy: PracticePriorityCard at top, metrics, tabs. JSON input via Shadcn Collapsible (collapsed post-analysis). Confirmed feasible without logic changes (D-11). |
| UIX-03 | UI uses a documented design system for spacing, typography, color, cards, buttons, forms, tabs, sidebars, timers, recording controls, feedback panels, and empty/loading/error states. | Tailwind config with documented tokens + Shadcn component set (D-04, D-05). All 11 specified components verified available in shadcn registry. |
| UIX-04 | JSON Analysis redesigned around learner outcomes: priority action first, readable metrics, compact analysis sections, secondary technical/input controls. | Component hierarchy reorder in `json-analysis-panel.tsx` — PracticePriorityCard → SummaryMetricCards → ResultTabs → Collapsible input (D-11 guarantees no logic changes needed). |
| UIX-05 | Live Audio Practice redesigned around a simple speaking flow: prompt/reference text, recording state, timer/waveform, transcript, feedback/readiness states. | `audio-mode-panel.tsx` CSS/hierarchy overhaul: Input → RecordButton → status Badge → LiveAnalysisPanel → WordScoreCard. Logic hooks unchanged (D-11/D-12). |
| UIX-06 | App is responsive at phone width without horizontal overflow, oversized cards, or hidden primary actions. | Existing mobile media queries replaced by Tailwind responsive utilities. Bottom nav at ≤640px replaces sidebar (D-08). Hard overflow prevention via `min-w-0` on flex/grid children. |
| UIX-07 | Redesigned UI meets accessibility basics: keyboard navigation, focus states, semantic landmarks, touch targets, contrast, screen-reader labels. | Shadcn Tabs provides correct ARIA (role=tablist/tab/tabpanel, aria-selected). Focus states via `focus-visible:ring-2 focus-visible:ring-primary`. Semantic `<nav>`, `<main>`, `<header>` landmarks. Touch targets min 44px via Tailwind padding utilities. |
| UIX-08 | Playwright or equivalent UI coverage verifies core responsive flows and guards against regressions in navigation, JSON analysis, live audio, and empty/error states. | Playwright 1.59.1 already installed. `apps/web/e2e/dashboard-ui.spec.ts` exists (must be updated for new copy/selectors). New spec file for responsive bottom-nav and accessibility tests needed. |
</phase_requirements>

---

## Summary

Phase 7 migrates the `apps/web` Next.js 16 application from a 1,332-line hand-crafted BEM-ish CSS system to Tailwind CSS v4 + Shadcn/UI. This is a CSS/hierarchy-only overhaul — all React component trees, hooks, API routes, and Zod schemas stay unchanged (D-11, D-12).

The codebase is in a clean pre-migration state: no Tailwind configuration exists, no Shadcn components are installed, no `components.json`, no `tailwind.config.ts`, no PostCSS config, and no `@/*` TypeScript path alias. All of these must be created as part of Wave 0 (setup). The existing CSS variable system in `globals.css` uses the same color values the UI-SPEC specifies — the values are preserved but the delivery mechanism changes (CSS variables → Tailwind @theme tokens).

The migration affects approximately 15 component files (className rewrites only), 1 globals.css replacement, and 1 layout.tsx update to add Shadcn ThemeProvider. Playwright E2E tests already exist in `e2e/dashboard-ui.spec.ts` but use some selectors and copy that will change with the redesign (e.g., "Analyze JSON" → "Analyze Pronunciation", sidebar nav changes); those tests need updating alongside implementation.

**Primary recommendation:** Run `pnpm dlx shadcn@latest init` inside `apps/web/` after adding the `@/*` path alias to `tsconfig.json`. Then add Shadcn components one by one. Migrate components in dependency order: layout shell first, then the sidebar/nav, then panel components.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| App shell layout (sidebar + content area) | Frontend (Next.js page) | — | `app/page.tsx` owns the grid layout; purely client-side presentation |
| Sidebar navigation (grouped sections) | Frontend (page.tsx) | — | State is just `mode` — already managed in page.tsx client state |
| Mobile bottom navigation bar | Frontend (page.tsx) | — | CSS show/hide at breakpoint; same state as sidebar nav |
| JSON Analysis panel redesign | Frontend (component) | — | `JsonAnalysisPanel` + child components; CSS rewrite only |
| Live Audio panel redesign | Frontend (component) | — | `AudioModePanel` + child components; CSS rewrite only |
| Design system tokens | Frontend (globals.css + tailwind config) | — | Tailwind `@theme` block in globals.css; no backend involvement |
| Shadcn component library | Frontend (components/ui/) | — | Installed via Shadcn CLI into `apps/web/components/ui/` |
| Accessibility attributes | Frontend (component markup) | — | ARIA roles/labels on interactive elements; no server-side involvement |
| Playwright E2E tests | Frontend test layer | — | `apps/web/e2e/` — tests the browser-rendered UI |

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| tailwindcss | 4.3.0 [VERIFIED: npm registry] | Utility-first CSS; replaces globals.css | Required by D-01; Tailwind v4 is current stable |
| @tailwindcss/postcss | 4.3.0 [VERIFIED: npm registry] | PostCSS plugin for Tailwind v4 integration with Next.js | Required by Tailwind v4 — replaces tailwind.config.ts with CSS-first config |
| shadcn (CLI) | 2.9.0 [VERIFIED: npm registry] | Component installer CLI | Installs Shadcn components into `components/ui/` from official registry |
| class-variance-authority | 0.7.1 [VERIFIED: npm registry] | Type-safe component variant management | Installed automatically by Shadcn CLI; used in all Shadcn components |
| clsx | 2.1.1 [VERIFIED: npm registry] | Conditional className merging | Installed automatically; part of `cn()` utility pattern |
| tailwind-merge | latest [ASSUMED] | Merge Tailwind classes without conflicts | Installed automatically by Shadcn CLI for `cn()` utility |
| tw-animate-css | 1.4.0 [VERIFIED: npm registry] | Animation utilities (Tailwind v4 replacement for tailwindcss-animate) | Tailwind v4 deprecates tailwindcss-animate; tw-animate-css is the current equivalent |
| lucide-react | 0.487 [ASSUMED — check npm] | Icon library | Default icon library for Shadcn; tree-shakeable; already called out in UI-SPEC |

### Shadcn Component Set (Phase 7 Baseline — D-04)

All from official shadcn registry (`https://ui.shadcn.com`). [VERIFIED: Context7 /llmstxt/ui_shadcn_llms_txt]

| Component | Install Command | Usage |
|-----------|----------------|-------|
| Button | `shadcn add button` | All interactive CTAs, nav items |
| Card | `shadcn add card` | Metric cards, panel wrappers |
| Tabs | `shadcn add tabs` | ResultTabs (Pause/Words/Phonemes/IELTS) |
| Badge | `shadcn add badge` | Score bands, status chips |
| Input | `shadcn add input` | Reference text in AudioModePanel |
| Textarea | `shadcn add textarea` | JSON paste input |
| Separator | `shadcn add separator` | Sidebar section dividers |
| Tooltip | `shadcn add tooltip` | Metric helper text, icon labels |
| Dialog | `shadcn add dialog` | Saved-session history modal |
| Skeleton | `shadcn add skeleton` | Loading states (AI Coach, metric cards) |
| Collapsible | `shadcn add collapsible` | JSON input disclosure (replaces `<details>`) |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Shadcn full Sidebar component | Custom nav with Tailwind only | Shadcn Sidebar is heavy (requires SidebarProvider, Sheet for mobile) — Phase 7 sidebar is simple enough (2 items) that custom Tailwind nav is less complex and avoids an overbuilt dependency |
| Bottom nav via Shadcn Sidebar (mobile Sheet) | Fixed `<nav>` with Tailwind | Decision D-08 specifies fixed bottom nav bar, not a drawer/sheet — custom implementation is correct |
| tailwindcss-animate | tw-animate-css | Tailwind v4 deprecated tailwindcss-animate; tw-animate-css is the maintained replacement |

**Installation (Wave 0):**
```bash
# From apps/web/ directory
# Step 1: Add @/* path alias to tsconfig.json (REQUIRED before shadcn init)
# Step 2: Install Tailwind v4 + PostCSS
pnpm add -D tailwindcss @tailwindcss/postcss tw-animate-css

# Step 3: Create postcss.config.mjs
# Step 4: Init shadcn (creates components.json, rewrites globals.css, installs cn util)
pnpm dlx shadcn@latest init

# Step 5: Install component set
pnpm dlx shadcn@latest add button card tabs badge input textarea separator tooltip dialog skeleton collapsible

# Step 6: Install icon library
pnpm add lucide-react
```

**Version verification (confirmed against npm registry on 2026-05-09):**
- tailwindcss: 4.3.0
- @tailwindcss/postcss: 4.3.0
- tw-animate-css: 1.4.0
- class-variance-authority: 0.7.1
- clsx: 2.1.1
- shadcn CLI: 2.9.0

---

## Architecture Patterns

### System Architecture Diagram

```
Browser request
      │
      ▼
Next.js 16 (apps/web) — app/layout.tsx
      │  adds: lang="en", viewport meta, Tailwind root classes
      │
      ▼
app/page.tsx  ← "use client" — owns mode state ("json" | "audio")
      │
      ├── Desktop (>640px): CSS Grid sidebar-left layout
      │     ├── <nav> sidebar (sticky, grouped sections)
      │     │     └── Shadcn Separator + nav items (active indicator bar)
      │     └── <main> content area
      │
      └── Mobile (≤640px): Single column + fixed bottom nav
            ├── <main> content (padding-bottom: 72px)
            └── <nav> fixed bottom bar (icon + label × 2)
                  Active item: accent color + indicator

mode === "json"                    mode === "audio"
      │                                  │
      ▼                                  ▼
JsonAnalysisPanel                  AudioModePanel
  1. PracticePriorityCard            1. Shadcn Input (reference text)
  2. SummaryMetricCards              2. RecordButton (existing)
     └── 4 × Shadcn Card            3. Status Badge (aria-live)
  3. ResultTabs                      4. LiveAnalysisPanel (existing)
     └── Shadcn Tabs                 5. WordScoreCard
           ├── PausesTab                └── Shadcn Card
           ├── WordsTab
           ├── PhonemesTab
           └── AiCoachTab
              └── Shadcn Skeleton (loading)
  4. Shadcn Collapsible (input)
     └── JsonInputCard
         └── Shadcn Textarea

All API calls unchanged: /api/json-analysis/*, /api/gemini-feedback, /api/saved-sessions
All hooks unchanged: useDeepgramSession, local React useState
```

### Recommended Project Structure (after Phase 7)

```
apps/web/
├── app/
│   ├── globals.css          # Tailwind directives + @theme block ONLY (D-13)
│   ├── layout.tsx           # Updated: adds lang="vi" support, viewport, ThemeProvider if used
│   └── page.tsx             # Redesigned: grouped sidebar + bottom nav
├── components/
│   ├── ui/                  # Shadcn components (auto-generated by CLI)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── tabs.tsx
│   │   ├── badge.tsx
│   │   ├── input.tsx
│   │   ├── textarea.tsx
│   │   ├── separator.tsx
│   │   ├── tooltip.tsx
│   │   ├── dialog.tsx
│   │   ├── skeleton.tsx
│   │   └── collapsible.tsx
│   ├── json-analysis/       # CSS rewrites only — same files, new classNames
│   └── audio-mode/          # CSS rewrites only — same files, new classNames
├── lib/
│   └── utils.ts             # cn() utility (created by shadcn init)
├── e2e/
│   ├── dashboard-ui.spec.ts # Updated for new copy/selectors
│   └── responsive.spec.ts   # New: bottom nav + overflow tests
├── components.json          # Shadcn configuration (created by shadcn init)
├── postcss.config.mjs       # @tailwindcss/postcss plugin (created in Wave 0)
└── tsconfig.json            # Updated: add @/* path alias
```

### Pattern 1: Tailwind v4 CSS-First Configuration

Tailwind v4 eliminates `tailwind.config.ts`. All theme tokens go in `globals.css` via `@theme inline`.
[VERIFIED: Context7 /llmstxt/ui_shadcn_llms_txt, official docs ui.shadcn.com/docs/tailwind-v4]

```css
/* apps/web/app/globals.css — after Phase 7 */
@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  /* === Color palette (from UI-SPEC) === */
  --color-background: #fafaf7;
  --color-card: #ffffff;
  --color-primary: #d97757;
  --color-primary-foreground: #ffffff;
  --color-destructive: #9f2d20;

  /* Semantic */
  --color-success: #3f6b4f;
  --color-warning: #b88a3e;
  --color-danger: #9f2d20;

  /* Surfaces */
  --color-border: #ebe7df;
  --color-sidebar: #f1ede4;
  --color-input: #fffdf9;

  /* Text */
  --color-foreground: #161513;
  --color-muted-foreground: #5a564f;
  --color-subtle: #9b968d;

  /* === Typography === */
  --font-sans: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace;
  --font-display: "Instrument Serif", "Iowan Old Style", Georgia, serif;

  /* === Spacing/Radius === */
  --radius: 1.125rem; /* 18px — matches existing .status-card border-radius */
}

/* Global resets only — no component classes */
* { box-sizing: border-box; }
html, body { min-height: 100%; }
body { margin: 0; }
button, input, textarea, select { font: inherit; }
```

### Pattern 2: Shadcn Init in Existing Next.js Monorepo

Run from inside `apps/web/` — NOT from monorepo root.
[VERIFIED: Context7 /llmstxt/ui_shadcn_llms_txt — "Add component to monorepo app"]

```bash
cd apps/web
pnpm dlx shadcn@latest init
```

The `shadcn init` command for an existing project:
1. Reads/creates `components.json`
2. Creates `lib/utils.ts` with the `cn()` function
3. Installs npm dependencies: `clsx`, `tailwind-merge`, `class-variance-authority`
4. Configures CSS variables in `globals.css`

**Critical pre-condition:** `tsconfig.json` in `apps/web/` must have `@/*` path alias before running `shadcn init`. The CLI reads this alias to determine where to install components and utilities.

```json
// apps/web/tsconfig.json — add to compilerOptions:
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

Note: The existing project uses `"./components/..."` relative imports, not `@/`. After init, new Shadcn components in `components/ui/` import from `@/lib/utils`. The existing component files can continue using relative imports — only the shadcn-generated files use the `@/` alias.

### Pattern 3: Grouped Sidebar Navigation (Custom, not Shadcn Sidebar)

Decision D-06 + Phase 7 simplicity (2 nav items) means a custom implementation is appropriate. The Shadcn `Sidebar` component was evaluated [VERIFIED: Context7] — it is designed for complex, collapsible sidebars with mobile Sheet drawer behavior. For Phase 7's fixed-width sticky sidebar that transforms to bottom nav, a custom Tailwind implementation is cleaner.

```tsx
// Desktop sidebar (>640px)
<aside className="hidden sm:flex flex-col sticky top-6 self-start
                  w-[180px] min-w-[180px] max-w-[220px]
                  bg-sidebar rounded-[18px] p-3 gap-2">
  <p className="font-display text-4xl text-foreground px-1 pb-2">LocalSpeak</p>
  <Separator />
  {/* Section label — Label role */}
  <p className="font-mono text-xs font-semibold uppercase tracking-[0.06em]
                text-subtle px-1 pt-2">Practice Tools</p>
  {/* Nav items */}
  <NavItem icon={FileJson} label="JSON Analysis" active={mode === "json"} onClick={() => setMode("json")} />
  <NavItem icon={Mic} label="Live Audio Practice" active={mode === "audio"} onClick={() => setMode("audio")} />
</aside>

// Mobile bottom nav (≤640px) — fixed, full-width
<nav aria-label="Main navigation"
     className="sm:hidden fixed bottom-0 left-0 right-0 z-50
                flex h-16 border-t border-border bg-card
                safe-area-pb">
  <BottomNavItem icon={FileJson} label="JSON Analysis" active={mode === "json"} onClick={() => setMode("json")} />
  <BottomNavItem icon={Mic} label="Live Audio Practice" active={mode === "audio"} onClick={() => setMode("audio")} />
</nav>
```

Active nav item indicator (D-06 "left accent bar"):
```tsx
// NavItem active state
<button
  aria-current={active ? "page" : undefined}
  className={cn(
    "relative flex items-center gap-2 w-full min-h-[44px] rounded-[14px] px-3 text-left",
    "transition-colors duration-[120ms]",
    active
      ? "bg-sidebar text-foreground before:absolute before:left-2 before:top-3 before:bottom-3 before:w-[3px] before:rounded-full before:bg-primary"
      : "text-muted-foreground hover:text-foreground"
  )}
>
```

### Pattern 4: Shadcn Tabs Replacing Custom Tab Buttons

The existing `ResultTabs` uses `aria-pressed` on `<button>` elements in a custom div. Replace with Shadcn Tabs which provides correct `role=tablist/tab/tabpanel` ARIA.
[VERIFIED: Context7 — "Tab component" provides role=tablist, role=tab, role=tabpanel, aria-selected, aria-controls]

```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Replace: div.json-tab-list + button.json-tab-button
// With:
<Tabs defaultValue="pause-analysis">
  <TabsList>
    <TabsTrigger value="pause-analysis">Pause Analysis</TabsTrigger>
    <TabsTrigger value="words">Words</TabsTrigger>
    <TabsTrigger value="phonemes">Phonemes</TabsTrigger>
    <TabsTrigger value="ielts-analysis">IELTS Analysis</TabsTrigger>
  </TabsList>
  <TabsContent value="pause-analysis"><PausesTab ... /></TabsContent>
  <TabsContent value="words"><WordsTab ... /></TabsContent>
  <TabsContent value="phonemes"><PhonemesTab ... /></TabsContent>
  <TabsContent value="ielts-analysis"><AiCoachTab ... /></TabsContent>
</Tabs>
```

### Pattern 5: Shadcn Collapsible Replacing `<details>`

The existing `JsonAnalysisPanel` uses a native `<details><summary>` for JSON input disclosure. Replace with Shadcn Collapsible for better animation and focus management.

```tsx
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const [isOpen, setIsOpen] = useState(false);

<Collapsible open={isOpen} onOpenChange={setIsOpen}>
  <CollapsibleTrigger asChild>
    <Button variant="ghost" className="w-full justify-between min-h-[44px]">
      {isOpen ? "Hide JSON input" : "Edit Input"}
      <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
    </Button>
  </CollapsibleTrigger>
  <CollapsibleContent>
    <JsonInputCard ... />
    <ValidationPreviewCard ... />
  </CollapsibleContent>
</Collapsible>
```

### Anti-Patterns to Avoid

- **Mixing Tailwind v3 and v4 syntax:** Tailwind v4 uses `@import "tailwindcss"` (not `@tailwind base/components/utilities` directives). Never mix v3 directives into a v4 project.
- **Installing tailwindcss-animate:** Tailwind v4 is incompatible with `tailwindcss-animate`. Use `tw-animate-css` instead. [VERIFIED: Context7 — "Tailwind v4 deprecates tailwindcss-animate"]
- **Running shadcn init from monorepo root:** Must run from `apps/web/` or components will be installed in the wrong location. [VERIFIED: Context7 — "Add component to monorepo app"]
- **Using Shadcn Sidebar component for this phase:** Shadcn Sidebar is a complex collapsible sidebar with SidebarProvider, Sheet for mobile drawer, and CSS custom properties. Phase 7's simple 2-item nav with a fixed bottom bar at mobile is better served by custom Tailwind — avoids 400+ lines of component overhead.
- **Leaving `@/*` alias out of tsconfig:** shadcn init requires this alias or it will fail to generate correct import paths in `components/ui/*.tsx`. [VERIFIED: Context7 — "Configure path alias in tsconfig.json"]
- **Preserving old CSS class names:** D-02 prohibits CSS variable mapping from the old system. Do not create migration shims or keep old class names alive for backward compatibility.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Accessible tab list with keyboard nav | Custom button-based tabs | Shadcn Tabs (Radix UI Tabs) | Arrow key navigation, aria-selected, aria-controls, tabpanel roles — Radix handles all of this correctly |
| Focus ring styling | Per-element outline CSS | Tailwind `focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2` | Consistent, `focus-visible` only (no mouse-click rings), single source of truth |
| Collapsible disclosure | Native `<details>` or custom state | Shadcn Collapsible | Animation, focus management, aria-expanded, keyboard support all handled |
| Class merging | String concatenation or custom `cx()` | `cn()` from `lib/utils.ts` (clsx + tailwind-merge) | Prevents conflicting Tailwind class collisions (e.g., `p-4 p-2` — tailwind-merge keeps the last one) |
| Loading skeleton | Custom `<div>` with animation | Shadcn Skeleton | `role="status" aria-label="Loading…"` built in; consistent animation |
| Icon library | Custom SVG components | lucide-react | Tree-shakeable, consistent stroke width, matches Shadcn's default; no custom SVG management |

**Key insight:** Tailwind v4 + Shadcn/Radix handles the entire accessibility surface for interactive components. Custom implementations consistently miss keyboard edge cases (arrow keys in tab lists, focus trapping, aria-live regions). Trust the library.

---

## Common Pitfalls

### Pitfall 1: Tailwind v4 @theme vs @layer Confusion

**What goes wrong:** Developer uses `@layer components { ... }` or `@tailwind utilities` (Tailwind v3 syntax) in a v4 project. CSS fails to compile or classes are missing.

**Why it happens:** Tailwind v4 is a full rewrite with CSS-first configuration. The `tailwind.config.ts` file is gone; theme tokens go in `@theme inline {}` in globals.css. The `@tailwind base/components/utilities` directives are replaced by `@import "tailwindcss"`.

**How to avoid:** globals.css must start with `@import "tailwindcss";` and `@import "tw-animate-css";`. Theme tokens go in `@theme inline {}`. No `tailwind.config.ts` needed.

**Warning signs:** TypeScript can't find Tailwind classes, browser shows unstyled content, shadcn init creates a `tailwind.config.ts` in v3 style.

### Pitfall 2: Missing @/* Path Alias Before shadcn init

**What goes wrong:** Running `pnpm dlx shadcn@latest init` without first adding `@/*` to `tsconfig.json`. The CLI either prompts for an alias path or generates imports that TypeScript cannot resolve, causing compile errors throughout `components/ui/`.

**Why it happens:** The current `apps/web/tsconfig.json` has no `paths` or `baseUrl` field — it extends `tsconfig.base.json` which also has no paths. The existing codebase uses relative imports (`../components/`) not the `@/` alias. [VERIFIED: confirmed by reading tsconfig.json]

**How to avoid:** Before running `shadcn init`, add to `apps/web/tsconfig.json`:
```json
"compilerOptions": {
  "baseUrl": ".",
  "paths": { "@/*": ["./*"] }
}
```

**Warning signs:** Import errors like `Cannot find module '@/lib/utils'` after running shadcn init.

### Pitfall 3: Playwright Tests Break Due to Copy Changes

**What goes wrong:** Existing `e2e/dashboard-ui.spec.ts` uses selectors tied to the current UI copy. The test `getByRole("button", { name: "Analyze JSON" })` will fail after renaming the button to "Analyze Pronunciation" (per UI-SPEC copywriting contract).

**Why it happens:** The existing tests are semantics-based (getByRole, getByLabel) which is correct — but the accessible names change with the redesign. [VERIFIED: confirmed by reading `dashboard-ui.spec.ts`]

**Specific changes required:**
- `"Analyze JSON"` → `"Analyze Pronunciation"`
- `getByRole("button", { name: "JSON Analysis" })` → nav item selector changes when sidebar becomes nav with `role="navigation"` or `aria-current`
- `getByText("Record from your microphone...")` → text changes per copywriting contract
- `getByLabel("Reference sentence")` → label text changes to match new copy
- `getByLabel("Speech assessment JSON input")` → aria-label on Textarea must be preserved or updated

**How to avoid:** Update tests in the same plan wave that updates the copy. Mark each copy change in implementation tasks so the test update companion is obvious.

### Pitfall 4: Horizontal Overflow from flex/grid Children

**What goes wrong:** At mobile width, a grid or flex child with content (long words, pre-formatted text, SVG) expands beyond its container, causing horizontal scrolling. UIX-06 is violated.

**Why it happens:** By default, flex items have `min-width: auto` — they size to their content. Grid columns with `auto` tracks do the same.

**How to avoid:**
- All flex children: add `min-w-0` class
- All grid content columns: use `minmax(0, 1fr)` not `1fr` (same thing via Tailwind's `min-w-0`)
- Textarea: `w-full max-w-full`
- Word chip list: `flex-wrap: wrap`
- Content area in sidebar grid: `min-w-0` on the content div

**Warning signs:** `scrollWidth > clientWidth` in the responsive Playwright test.

### Pitfall 5: PostCSS Config Missing — Tailwind Classes Not Applied

**What goes wrong:** Tailwind v4 requires a PostCSS config file with `@tailwindcss/postcss`. Without it, Next.js does not process the `@import "tailwindcss"` directive and all utility classes are missing.

**Why it happens:** The existing `apps/web/` has no `postcss.config.mjs` or `postcss.config.js`. [VERIFIED: confirmed by checking `apps/web/` file listing]

**How to avoid:** Create `apps/web/postcss.config.mjs` as part of Wave 0:
```js
export default {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
```

**Warning signs:** All Tailwind classes render as unstyled; `@import "tailwindcss"` line in globals.css produces a browser CSS warning.

### Pitfall 6: Result-Tabs aria-pressed vs Shadcn Tabs Role Conflict

**What goes wrong:** The existing `ResultTabs` uses `aria-pressed` on buttons (toggle pattern). If these are kept and Shadcn Tabs is placed around them, screen readers get conflicting ARIA semantics.

**Why it happens:** `aria-pressed` is the toggle button pattern; Shadcn Tabs uses `role="tab"` + `aria-selected`. These are incompatible patterns for the same element.

**How to avoid:** Fully replace the existing custom tab implementation with Shadcn `<Tabs>/<TabsList>/<TabsTrigger>/<TabsContent>`. Remove the old `aria-pressed` buttons entirely. [CITED: ui.shadcn.com/docs/components/tabs]

---

## Code Examples

### Metric Cards Grid (SummaryMetricCards Migration)

```tsx
// Source: UI-SPEC Metric Cards section, Shadcn Card pattern
import { Card } from "@/components/ui/card";

// Replace: div.json-metric-grid > div.json-metric-card
// With:
<div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
  <Card className="p-4 min-w-0">
    <p data-testid="summary-metric-label"
       className="font-mono text-xs font-semibold uppercase tracking-[0.06em] text-subtle m-0">
      Pronunciation
    </p>
    <p className="font-display text-4xl text-foreground mt-2 mb-2">
      {summary.pronunciationPercentage}%
    </p>
    <p className="text-base text-muted-foreground m-0">Overall score</p>
  </Card>
  {/* repeat for Pronunciation Band, Fluency Band, WPM */}
</div>
```

Note: `data-testid="summary-metric-label"` must be preserved — the existing Playwright test asserts on this. [VERIFIED: reading dashboard-ui.spec.ts line 149]

### Focus Visible Ring (global pattern)

```tsx
// Apply to all interactive elements: buttons, inputs, tabs, nav items
// Tailwind v4 focus-visible utilities:
className="focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none"

// For Shadcn components: the default ring color is --ring (set in @theme to #d97757 / primary)
// Override in components.json or per-component via className prop
```

### Mobile Bottom Nav Safe Area

```tsx
// iOS safe-area-inset support for bottom nav
<nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50
                flex h-16 border-t border-border bg-card
                pb-[env(safe-area-inset-bottom)]">
```

### Skeleton Loading State (AI Coach)

```tsx
import { Skeleton } from "@/components/ui/skeleton";

// Replace: "Computing deterministic metrics..." text
// With:
<div role="status" aria-label="Loading…" className="space-y-3">
  <Skeleton className="h-4 w-3/4 bg-sidebar" />
  <Skeleton className="h-4 w-1/2 bg-sidebar" />
  <Skeleton className="h-4 w-2/3 bg-sidebar" />
</div>
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `tailwind.config.ts` + `tailwind.config.js` | `@theme inline {}` in globals.css | Tailwind v4 (2025) | No JS config file needed; all tokens in CSS |
| `@tailwind base/components/utilities` | `@import "tailwindcss"` | Tailwind v4 | Single import replaces three directives |
| `tailwindcss-animate` | `tw-animate-css` | Tailwind v4 | Plugin incompatible with v4; tw-animate-css is the replacement |
| HSL color values in Shadcn (`hsl(0 0% 100%)`) | OKLCH or plain hex | Shadcn v2+ / Tailwind v4 | Colors can be plain hex in `@theme inline`; no `hsl()` wrapper needed |
| `forwardRef` in Shadcn components | Plain function components + `data-slot` | Shadcn 2024+ | React 19 compatible; simpler component code |
| `tailwind.config.ts` for path | `components.json` `aliases` field | Shadcn current | CLI reads components.json for install location |

**Deprecated/outdated:**
- `tailwindcss-animate`: Do not install — incompatible with Tailwind v4. Use `tw-animate-css`.
- `tailwind.config.ts`/`tailwind.config.js`: Not used in Tailwind v4. If the shadcn CLI creates one, it is a v3-mode fallback — ensure v4 mode is confirmed during init.
- `@tailwind base` / `@tailwind components` / `@tailwind utilities`: Tailwind v3 syntax. Do not use.

---

## Codebase State (Current — Pre-Migration)

This section documents what was found in the actual codebase during research. [VERIFIED: direct file inspection]

### What Exists
- `apps/web/app/globals.css`: 1,332 lines, BEM-ish custom class names, CSS variables in `:root`. Full replacement required (D-13).
- `apps/web/app/layout.tsx`: 19 lines. Simple shell with `<html lang="en"><body>{children}</body></html>`. Imports globals.css.
- `apps/web/app/page.tsx`: 72 lines. Client component, `useState` for `"json" | "audio"` mode. Sidebar with two `<button aria-pressed>` nav items. Grid layout via `.practice-layout`.
- `apps/web/components/json-analysis/json-analysis-panel.tsx`: 578 lines. All logic/hooks are here. Uses native `<details>` for JSON input disclosure. Has `PracticePriorityCard` inline function.
- `apps/web/components/json-analysis/result-tabs.tsx`: 65 lines. Uses `aria-pressed` on custom `<button>` elements — not proper tab ARIA.
- `apps/web/components/audio-mode/audio-mode-panel.tsx`: 122 lines. Uses `json-analysis-card` class (cross-component style reuse — a code smell that disappears after Tailwind migration).
- `apps/web/e2e/dashboard-ui.spec.ts`: 193 lines. Two tests. Uses mock API routes. Tests will need selector/copy updates.
- `apps/web/playwright.config.ts`: Configured for `./e2e/` dir, Chromium only, `baseURL: http://localhost:3000`.

### What Does NOT Exist
- `tailwind.config.ts` — does not exist [VERIFIED]
- `postcss.config.mjs` / `postcss.config.js` — does not exist [VERIFIED]
- `components.json` — does not exist [VERIFIED]
- `apps/web/components/ui/` — does not exist [VERIFIED]
- `@/*` path alias in tsconfig — does not exist [VERIFIED]
- Font loading via `next/font` — does not exist; fonts are referenced by name in CSS `var(--font-*)` but not loaded (assumed preloaded by system or missing — Wave 0 should add next/font or Google Fonts link) [ASSUMED — check if fonts display correctly without explicit loading]

### Component Dependency Graph (Migration Order)

```
Wave 0: Setup
  ├── tsconfig.json (@/* alias)
  ├── postcss.config.mjs
  ├── globals.css (Tailwind directives + @theme)
  └── shadcn init + component installs

Wave 1: App Shell (no component dependencies)
  ├── app/layout.tsx (viewport meta, font loading)
  └── app/page.tsx (sidebar nav + bottom nav + grid shell)

Wave 2: Shared primitives (used by both panels)
  ├── status-card.tsx (if needed — check usage)
  └── status-panel.tsx (if needed — check usage)

Wave 3: JSON Analysis Panel (depends on Wave 1 shell)
  ├── summary-metric-cards.tsx (Shadcn Card)
  ├── result-tabs.tsx (Shadcn Tabs)
  ├── pauses-tab.tsx
  ├── words-tab.tsx
  ├── phonemes-tab.tsx
  ├── ai-coach-tab.tsx (Shadcn Skeleton)
  ├── json-input-card.tsx (Shadcn Textarea, Button)
  ├── validation-preview-card.tsx (Shadcn Badge)
  ├── saved-sessions-panel.tsx (Shadcn Card)
  └── json-analysis-panel.tsx (orchestrates all of the above + Collapsible)

Wave 4: Audio Panel (depends on Wave 1 shell)
  └── audio-mode-panel.tsx (Shadcn Input, Badge, Card)

Wave 5: Test updates
  ├── e2e/dashboard-ui.spec.ts (update selectors/copy)
  └── e2e/responsive.spec.ts (new: bottom nav, overflow tests)
```

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Fonts (Inter, Instrument Serif, JetBrains Mono) are not explicitly loaded via next/font or a `<link>` tag — they are referenced in CSS but may rely on system fonts or be missing. | Standard Stack | If fonts fail to load, display aesthetics break. Wave 0 should add `next/font/google` for Inter; Instrument Serif and JetBrains Mono may need explicit loading. |
| A2 | `shadcn init` in Tailwind v4 mode will NOT create a `tailwind.config.ts` file (it uses CSS-first config) | Architecture Patterns | If shadcn init creates a v3-style `tailwind.config.ts`, the executor must delete it and confirm v4 mode is active. |
| A3 | `lucide-react` current version is ~0.487 (approximate) | Standard Stack | Install the version that ships with current shadcn — the CLI will pull the compatible version automatically. |
| A4 | The existing `data-testid="summary-metric-label"` in `summary-metric-cards.tsx` must be preserved in the redesigned component | Common Pitfalls | Playwright test will fail if this attribute is removed or changed. Confirmed the test uses it (line 149 of spec). |

---

## Open Questions (RESOLVED)

1. **Font Loading Strategy**
   - What we know: Fonts are declared in `:root` CSS vars (`--font-display`, `--font-body`, `--font-mono`) but there is no `<link>` or `next/font` loading. The public directory only contains `audio-worklet-processor.js`.
   - What's unclear: Whether fonts display correctly in the current app (system fallbacks may cover Inter; Instrument Serif and JetBrains Mono likely fall back to serif/monospace).
   - Recommendation: Add `next/font/google` in `layout.tsx` for Inter and JetBrains Mono (both available on Google Fonts). Instrument Serif may need a CSS `@import` from Google Fonts or `next/font/local` if a font file is added.
   - RESOLVED: Plan 02 (07-02-PLAN.md) adds Inter and JetBrains_Mono via next/font/google in layout.tsx with CSS variable mapping (`--font-sans`, `--font-mono`). Instrument Serif uses the Georgia system fallback for Phase 7 — acceptable per discretion note in CONTEXT.md.

2. **shadcn init Interactive Prompts**
   - What we know: `pnpm dlx shadcn@latest init` is interactive — it asks about style (Default/New York), base color, CSS variables, etc.
   - What's unclear: Whether the CLI can be run non-interactively in CI or if specific flags can pre-answer the prompts.
   - Recommendation: Run interactively during Wave 0. Choose "New York" style, base color "neutral" (then override with custom hex values in `@theme`), CSS variables: yes.
   - RESOLVED: Plan 01 Task 2 documents the exact interactive answers (New York style, neutral base color, CSS variables: yes). The executor runs the command interactively from inside apps/web/ and restores the @theme inline block if shadcn init overwrites globals.css with HSL tokens.

3. **Playwright Browser Installation**
   - What we know: Playwright 1.59.1 is installed as a devDependency. The Playwright browser binaries are NOT installed (`~/.cache/ms-playwright` does not exist).
   - What's unclear: Whether the test environment has internet access to download browsers.
   - Recommendation: Wave 0 must include `pnpm dlx playwright install chromium` or `pnpm exec playwright install chromium` from `apps/web/`. If CI is involved, this needs to be a setup step.
   - RESOLVED: Plan 01 Task 2 includes `pnpm exec playwright install chromium` as an explicit step with an acceptance criterion requiring exit 0. The test environment has internet access (local development machine). CI environments should add this as a setup step before running test:e2e.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | All frontend tooling | ✓ | v22.22.2 | — |
| pnpm | Package management | ✓ | 10.33.0 | — |
| Playwright @1.59.1 | E2E tests (UIX-08) | ✓ (installed) | 1.59.1 | — |
| Chromium browser binary | Playwright E2E tests | ✗ (not installed) | — | Run `pnpm exec playwright install chromium` in Wave 0 |
| tailwindcss v4 | CSS system | ✗ (not installed) | — | Install in Wave 0: `pnpm add -D tailwindcss @tailwindcss/postcss` |
| shadcn CLI | Component installation | ✗ (not installed) | — | Run via `pnpm dlx shadcn@latest` — no install needed |
| lucide-react | Icons in nav/components | ✗ (not installed) | — | Install in Wave 0: `pnpm add lucide-react` |
| postcss.config.mjs | Tailwind v4 compilation | ✗ (file missing) | — | Create in Wave 0 |

**Missing dependencies with no fallback:**
- Tailwind CSS v4 + @tailwindcss/postcss: required for the entire CSS system
- postcss.config.mjs: required for Next.js to process Tailwind classes
- @/* path alias in tsconfig: required for shadcn init to work

**Missing dependencies with fallback:**
- Chromium browser binary: `playwright install chromium` must run before E2E tests; fallback is to skip E2E in environments without internet, but UIX-08 requires test coverage before phase completion.

---

## Validation Architecture

Nyquist validation is enabled (`workflow.nyquist_validation: true` in config.json).

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Playwright 1.59.1 (E2E) + Vitest 4.0.15 (unit) |
| Playwright config | `apps/web/playwright.config.ts` |
| Vitest config | `apps/web/vitest.config.mts` |
| Quick run command (E2E) | `pnpm --filter web test:e2e` |
| Quick run command (unit) | `pnpm --filter web test` |
| Full suite command | `pnpm --filter web test:e2e && pnpm --filter web test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| UIX-01 | App shell renders with nav, main content, and visual identity | E2E | `pnpm --filter web test:e2e -- --grep "app shell"` | ✗ Wave 5 |
| UIX-02 | Primary action visible without crowded controls; JSON input collapsed post-analysis | E2E | `pnpm --filter web test:e2e -- --grep "outcome first"` | ✗ Wave 5 (update existing spec) |
| UIX-03 | Design system: Shadcn components render without style errors | E2E (visual smoke) | `pnpm --filter web test:e2e -- --grep "design system"` | ✗ Wave 5 |
| UIX-04 | JSON Analysis: PracticePriorityCard first, metrics second, tabs third, input collapsible | E2E | Update `dashboard-ui.spec.ts` — existing test covers post-analysis hierarchy | ✓ (needs update) |
| UIX-05 | Audio panel: reference input → record button → status badge → transcript → score card | E2E | `pnpm --filter web test:e2e -- --grep "audio panel"` | ✓ (needs update) |
| UIX-06 | No horizontal overflow at 390px mobile width | E2E | `pnpm --filter web test:e2e -- --grep "no overflow"` | ✓ (existing mobile test covers this — needs update for bottom nav) |
| UIX-07 | Accessibility: semantic landmarks, focus states, touch targets, aria labels | E2E (axe-core or manual assertions) | `pnpm --filter web test:e2e -- --grep "accessibility"` | ✗ Wave 5 |
| UIX-08 | Full E2E coverage: nav, JSON analysis, live audio, responsive layout | E2E | `pnpm --filter web test:e2e` | ✓ (needs update) |

### Specific E2E Test Cases Required

**Navigation (UIX-01, UIX-02):**
```typescript
test("sidebar nav switches between JSON and Audio modes at desktop", ...)
test("bottom nav switches modes at mobile width 390px", ...)
test("active nav item has aria-current='page'", ...)
test("nav has aria-label='Main navigation'", ...)
```

**JSON Analysis Panel (UIX-04):**
```typescript
test("JSON Analysis: practice priority card appears before metric cards", ...)
test("JSON Analysis: JSON input is collapsed after analysis completes", ...)
test("JSON Analysis: stale banner appears when input changes post-analysis", ...)
test("JSON Analysis: tabs are navigable via keyboard arrow keys (Shadcn Tabs)", ...)
// UPDATE existing:
// "Analyze JSON" → "Analyze Pronunciation" (copy change from UI-SPEC)
```

**Audio Panel (UIX-05):**
```typescript
test("Audio: record button disabled when reference text is empty", ...)
test("Audio: status badge updates on session state change", ...)
```

**Responsive (UIX-06):**
```typescript
test("no horizontal overflow at 390px mobile width — JSON mode", ...) // EXISTS, needs update
test("no horizontal overflow at 390px mobile width — Audio mode", ...) // EXISTS
test("sidebar hidden at mobile, bottom nav visible at mobile", ...)
test("bottom nav hidden at desktop, sidebar visible at desktop", ...)
```

**Accessibility (UIX-07):**
```typescript
test("all interactive elements reachable via Tab key", ...)
test("focus ring visible on focused interactive elements", ...)
test("metric cards use Shadcn Card with min 44px touch target", ...)
test("JSON Textarea has aria-label", ...)
test("result tabs have role=tablist, role=tab, role=tabpanel", ...)
```

### Sampling Rate

- **Per component wave commit:** `pnpm --filter web test` (Vitest unit — fast)
- **Per wave merge (after E2E tests created in Wave 5):** `pnpm --filter web test:e2e`
- **Phase gate:** Full suite green before `/gsd-verify-work` — both Vitest and Playwright pass

### Wave 0 Gaps

- [ ] Playwright Chromium binary: `pnpm exec playwright install chromium` — required before any E2E run
- [ ] `apps/web/e2e/responsive.spec.ts` — covers UIX-06 (bottom nav at mobile) and UIX-07 accessibility assertions
- [ ] Update `apps/web/e2e/dashboard-ui.spec.ts` — update button name from "Analyze JSON" to "Analyze Pronunciation", update nav selectors for redesigned sidebar

---

## Security Domain

Phase 7 is a pure CSS/HTML migration — no new authentication, session management, data storage, or API surface. The ASVS security domain is not applicable to this phase's scope.

| ASVS Category | Applies | Reason |
|---------------|---------|--------|
| V2 Authentication | No | No auth changes |
| V3 Session Management | No | No session changes |
| V4 Access Control | No | No access control changes |
| V5 Input Validation | Existing — unchanged | JSON textarea validation logic stays identical (D-12) |
| V6 Cryptography | No | No cryptographic operations |

The one security-relevant pattern to maintain: all API calls remain same-origin (`/api/*`) with no changes to headers, CORS, or token handling. The Shadcn component migration does not introduce new network requests.

---

## Sources

### Primary (HIGH confidence)
- Context7 `/llmstxt/ui_shadcn_llms_txt` — Shadcn initialization, Next.js monorepo installation, Tailwind v4 migration, component ARIA patterns, components.json configuration
- Context7 `/shadcn-ui/ui` — Sidebar component API, component props
- `apps/web/app/globals.css` — direct inspection, confirmed 1,332 lines, CSS variables, all component styles
- `apps/web/package.json` — confirmed: no Tailwind, no Shadcn; React 19, Next 16.2.5, Playwright 1.59.1
- `apps/web/tsconfig.json` — confirmed: no `@/*` path alias
- `apps/web/e2e/dashboard-ui.spec.ts` — confirmed: 2 tests, selector inventory, copy strings
- `apps/web/playwright.config.ts` — confirmed: Chromium only, baseURL localhost:3000

### Secondary (MEDIUM confidence)
- `npm view tailwindcss version` → 4.3.0 (verified against registry)
- `npm view @tailwindcss/postcss version` → 4.3.0
- `npm view tw-animate-css version` → 1.4.0
- `npm view shadcn version` → 2.9.0
- `npm view class-variance-authority version` → 0.7.1
- `npm view clsx version` → 2.1.1
- WebFetch `ui.shadcn.com/docs/tailwind-v4` — Tailwind v4 migration steps, OKLCH colors, tw-animate-css
- WebFetch `ui.shadcn.com/docs/installation/next` — existing project installation steps, path alias requirement

### Tertiary (LOW confidence — see Assumptions Log)
- Font loading strategy (A1): inferred from absence of explicit font loading
- shadcn init interactive prompts behavior (A2, A3): assumed from documentation patterns

---

## Metadata

**Confidence breakdown:**
- Standard Stack: HIGH — all versions verified against npm registry; shadcn CLI behavior verified via Context7
- Architecture: HIGH — codebase fully inspected; migration plan based on actual file contents
- Pitfalls: HIGH — all pitfalls derived from actual codebase gaps (no tailwind, no tsconfig paths, no postcss) and verified library behavior
- Playwright test gaps: HIGH — spec file read directly; missing tests identified precisely

**Research date:** 2026-05-09
**Valid until:** 2026-06-09 (Tailwind v4 and shadcn are active development areas — recheck if planning is delayed beyond 30 days)

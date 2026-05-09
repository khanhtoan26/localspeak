# Phase 7: Comprehensive UI/UX Redesign & Design System - Pattern Map

**Mapped:** 2026-05-09
**Files analyzed:** 15 source files + 2 new config files + 2 new/updated E2E files
**Analogs found:** 15 / 15 (all from within this project — it is a green-field migration, so the analogs are the files being replaced)

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `apps/web/app/globals.css` | config | transform | itself (full replacement) | self |
| `apps/web/app/layout.tsx` | config | request-response | itself | self |
| `apps/web/app/page.tsx` | component | event-driven | itself | self |
| `apps/web/components/json-analysis/json-analysis-panel.tsx` | component | CRUD + event-driven | itself | self |
| `apps/web/components/json-analysis/summary-metric-cards.tsx` | component | transform | itself | self |
| `apps/web/components/json-analysis/result-tabs.tsx` | component | event-driven | itself | self |
| `apps/web/components/json-analysis/pauses-tab.tsx` | component | transform | itself | self |
| `apps/web/components/json-analysis/words-tab.tsx` | component | transform | itself | self |
| `apps/web/components/json-analysis/phonemes-tab.tsx` | component | transform | itself | self |
| `apps/web/components/json-analysis/ai-coach-tab.tsx` | component | event-driven | itself | self |
| `apps/web/components/json-analysis/json-input-card.tsx` | component | event-driven | itself | self |
| `apps/web/components/json-analysis/validation-preview-card.tsx` | component | event-driven | itself | self |
| `apps/web/components/audio-mode/audio-mode-panel.tsx` | component | streaming + event-driven | itself | self |
| `apps/web/components/status-card.tsx` | component | transform | itself | self |
| `apps/web/components/status-panel.tsx` | component | CRUD + event-driven | itself | self |
| `apps/web/postcss.config.mjs` | config | — | none (new file) | none |
| `apps/web/components.json` | config | — | none (new file, created by shadcn init) | none |
| `apps/web/lib/utils.ts` | utility | transform | none (new file, created by shadcn init) | none |
| `apps/web/e2e/dashboard-ui.spec.ts` | test | request-response | itself | self |
| `apps/web/e2e/responsive.spec.ts` | test | request-response | `apps/web/e2e/dashboard-ui.spec.ts` | role-match |

**Note on analog strategy:** Phase 7 is a CSS/hierarchy-only migration (D-11, D-12). Every component file is its own analog — the logic, props, and structure are preserved; only `className` strings and a few structural elements change. The patterns below capture the exact current class names and map them to their Tailwind/Shadcn replacements.

---

## Wave 0: Setup Files (New — No Existing Analog)

### `apps/web/postcss.config.mjs` (new file)

No analog exists. Create exactly:

```js
export default {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
```

**Critical constraint:** This file must exist before Next.js processes any `@import "tailwindcss"` directive. Without it, all Tailwind classes silently fail to compile.

### `apps/web/tsconfig.json` (modify — add `@/*` alias)

Current state (lines 1–6): extends `../../tsconfig.base.json`, no `paths` or `baseUrl`. Add before running `shadcn init`:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    },
    "plugins": [{ "name": "next" }]
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

**Critical constraint:** This alias must exist before `pnpm dlx shadcn@latest init` or the CLI will generate broken import paths in `components/ui/*.tsx` (all Shadcn components import from `@/lib/utils`).

### `apps/web/lib/utils.ts` (new file — created by shadcn init)

Created automatically by `shadcn init`. Content will be:

```typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

This `cn()` function is used in every Shadcn component and must be used in any custom component that needs conditional className merging.

---

## Pattern Assignments

### `apps/web/app/globals.css` (config, transform)

**Analog:** Itself — full replacement.

**Current structure (lines 1–16):** CSS custom properties in `:root` — `--bg`, `--card`, `--ink`, `--ink-soft`, `--ink-muted`, `--line`, `--beige-soft`, `--accent`, `--success`, `--warning`, `--danger`, `--font-display`, `--font-body`, `--font-mono`.

**Replacement structure (Tailwind v4 CSS-first config):**

```css
/* apps/web/app/globals.css — FULL REPLACEMENT after Phase 7 */
@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  /* Color palette — maps 1:1 from existing :root tokens */
  --color-background: #fafaf7;       /* was --bg */
  --color-card: #ffffff;             /* was --card */
  --color-foreground: #161513;       /* was --ink */
  --color-muted-foreground: #5a564f; /* was --ink-soft */
  --color-subtle: #9b968d;           /* was --ink-muted */
  --color-border: #ebe7df;           /* was --line */
  --color-sidebar: #f1ede4;          /* was --beige-soft */
  --color-input: #fffdf9;            /* was background on .json-input-textarea */
  --color-primary: #d97757;          /* was --accent */
  --color-primary-foreground: #ffffff;
  --color-success: #3f6b4f;          /* was --success */
  --color-warning: #b88a3e;          /* was --warning */
  --color-danger: #9f2d20;           /* was --danger */
  --color-destructive: #9f2d20;

  /* Semantic surface tokens */
  --color-success-border: #d9e8dd;   /* was .json-analysis-card--success border */
  --color-warning-border: #eadcb8;   /* was .json-analysis-card--warning border */
  --color-danger-border: #edd0ca;    /* was .json-analysis-card--danger border */

  /* Typography */
  --font-sans: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace;
  --font-display: "Instrument Serif", "Iowan Old Style", Georgia, serif;

  /* Radius */
  --radius: 1.125rem; /* 18px — matches existing .status-card, .json-analysis-card */
}

/* Global resets only — no component classes */
* { box-sizing: border-box; }
html, body { min-height: 100%; }
body { margin: 0; }
button, input, textarea, select { font: inherit; }
```

**Anti-pattern to avoid:** Do NOT use `@tailwind base`, `@tailwind components`, or `@tailwind utilities` — those are Tailwind v3 directives. Tailwind v4 uses `@import "tailwindcss"` only.

---

### `apps/web/app/layout.tsx` (config, request-response)

**Analog:** Itself (19 lines, minimal shell).

**Current class names used:** None (no className in current layout.tsx).

**Current structure (lines 1–19):**
- Imports `Metadata` from next
- Imports `./globals.css`
- Exports `RootLayout` wrapping `<html lang="en"><body>{children}</body></html>`

**Replacement structure:**

```tsx
import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "LocalSpeak",
  description: "Practice pronunciation with AI-powered feedback.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-background text-foreground font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
```

**Key changes from current:**
- Adds `next/font/google` for Inter and JetBrains Mono (addresses Research Assumption A1 — fonts currently not explicitly loaded)
- Adds `Viewport` export for responsive meta (required for UIX-06)
- Adds body Tailwind classes: `bg-background text-foreground font-sans antialiased`

---

### `apps/web/app/page.tsx` (component, event-driven)

**Analog:** Itself (72 lines). All logic (useState for `"json" | "audio"` mode) stays unchanged.

**Current class names to replace:**

| Current className | Role | Tailwind/Shadcn replacement |
|---|---|---|
| `status-page` (on `<main>`) | page wrapper | `min-h-screen p-6` |
| `status-shell status-shell--practice` | centered container | `w-full max-w-[1040px] mx-auto flex flex-col gap-4` |
| `status-shell--dashboard` (conditional add) | wider container in JSON mode | remove — grid layout handles width |
| `status-header` | header block | `pt-8 pb-2` |
| `status-tag` | eyebrow tag | `inline-flex items-center gap-1 rounded-full bg-sidebar text-primary text-[11px] font-semibold uppercase tracking-[0.08em] px-2 py-1` |
| `status-title` | h1 | `font-display text-3xl text-foreground mt-4 mb-2` |
| `status-intro` | subtitle paragraph | `text-base text-muted-foreground m-0` |
| `practice-layout` | grid wrapper | `grid grid-cols-[minmax(180px,220px)_minmax(0,1fr)] items-start gap-4` |
| `practice-sidebar` | `<aside>` | `hidden sm:flex flex-col sticky top-6 self-start bg-sidebar rounded-[18px] p-3 gap-2` |
| `practice-sidebar__eyebrow` | section label | `font-mono text-[11px] font-semibold uppercase tracking-[0.06em] text-subtle px-1 pt-2` |
| `mode-switch-list` | nav list wrapper | `flex flex-col gap-1` |
| `mode-switch-button` | nav item button | see NavItem pattern below |
| `mode-switch-button[aria-pressed="true"]` | active nav state | `aria-current="page"` + Tailwind active variant |
| `mode-switch-button__label` | nav item label | `text-base font-semibold pl-2` |
| `mode-switch-button__helper` | nav item helper text | `text-base font-normal text-muted-foreground pl-2` |
| `practice-content` | content area | `min-w-0` |
| `mode-panel` | panel show/hide | keep `hidden` attribute pattern |

**New structure required (D-06, D-08):**

```tsx
"use client";

import { useState } from "react";
import { FileJson, Mic } from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { JsonAnalysisPanel } from "../components/json-analysis/json-analysis-panel";
import { AudioModePanel } from "../components/audio-mode/audio-mode-panel";

type Mode = "json" | "audio";

// NavItem sub-component (desktop sidebar)
function NavItem({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-current={active ? "page" : undefined}
      onClick={onClick}
      className={cn(
        "relative flex items-center gap-2 w-full min-h-[44px] rounded-[14px] px-3 text-left",
        "text-sm font-medium transition-colors duration-[120ms]",
        "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none",
        active
          ? "bg-card text-foreground before:absolute before:left-2 before:top-3 before:bottom-3 before:w-[3px] before:rounded-full before:bg-primary"
          : "text-muted-foreground hover:text-foreground hover:bg-card/60"
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {label}
    </button>
  );
}

// BottomNavItem sub-component (mobile)
function BottomNavItem({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-current={active ? "page" : undefined}
      onClick={onClick}
      className={cn(
        "flex flex-1 flex-col items-center justify-center gap-1 min-h-[44px]",
        "text-[11px] font-semibold transition-colors duration-[120ms]",
        "focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none",
        active ? "text-primary" : "text-muted-foreground"
      )}
    >
      <Icon className="h-5 w-5" />
      {label}
    </button>
  );
}

export default function Home() {
  const [mode, setMode] = useState<Mode>("json");

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop layout: sidebar + content grid */}
      <div className="hidden sm:grid grid-cols-[minmax(180px,220px)_minmax(0,1fr)]
                      items-start gap-4 max-w-[1200px] mx-auto p-6">
        {/* Desktop sidebar */}
        <aside className="flex flex-col sticky top-6 self-start
                          bg-sidebar rounded-[18px] p-3 gap-2">
          <p className="font-display text-3xl text-foreground px-1 pb-1">LocalSpeak</p>
          <Separator />
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.06em]
                        text-subtle px-1 pt-2">
            Practice Tools
          </p>
          <nav aria-label="Main navigation">
            <NavItem icon={FileJson} label="JSON Analysis" active={mode === "json"} onClick={() => setMode("json")} />
            <NavItem icon={Mic} label="Live Audio Practice" active={mode === "audio"} onClick={() => setMode("audio")} />
          </nav>
        </aside>
        {/* Content area */}
        <main className="min-w-0 py-6">
          <div hidden={mode !== "json"}><JsonAnalysisPanel /></div>
          <div hidden={mode !== "audio"}><AudioModePanel /></div>
        </main>
      </div>

      {/* Mobile layout: single column + fixed bottom nav */}
      <div className="sm:hidden flex flex-col min-h-screen pb-16">
        <main className="flex-1 min-w-0 p-4">
          <div hidden={mode !== "json"}><JsonAnalysisPanel /></div>
          <div hidden={mode !== "audio"}><AudioModePanel /></div>
        </main>
        <nav aria-label="Main navigation"
             className="fixed bottom-0 left-0 right-0 z-50
                        flex h-16 border-t border-border bg-card
                        pb-[env(safe-area-inset-bottom)]">
          <BottomNavItem icon={FileJson} label="JSON Analysis" active={mode === "json"} onClick={() => setMode("json")} />
          <BottomNavItem icon={Mic} label="Live Audio" active={mode === "audio"} onClick={() => setMode("audio")} />
        </nav>
      </div>
    </div>
  );
}
```

**Playwright-critical changes:**
- Remove `aria-pressed` on nav buttons — replaced with `aria-current="page"`. The existing test at line 139–142 of `dashboard-ui.spec.ts` asserts `getByRole("button", { name: "JSON Analysis" })` with `aria-pressed="true"`. This selector still finds the button by name but the `aria-pressed` assertion must change to `aria-current="page"`.
- Remove `.mode-switch-button__helper` text ("Record from your microphone and watch live transcript feedback.") — the existing test at lines 144–146 asserts on this text. The desktop nav no longer shows helper text; the test assertion must be removed or replaced.

---

### `apps/web/components/json-analysis/json-analysis-panel.tsx` (component, CRUD + event-driven)

**Analog:** Itself (578 lines). All logic, hooks, and state remain unchanged per D-11/D-12.

**Current class names in JSX render (lines 381–529):**

| Current className | Tailwind/Shadcn replacement |
|---|---|
| `json-analysis-page` (section, line 382) | `space-y-4` or remove wrapper — handled by shell |
| `json-analysis-shell` (section, line 383) | `flex flex-col gap-4` |
| `json-analysis-shell--with-history` (conditional modifier) | no modifier needed — gap handles spacing |
| `json-analysis-header` (header, line 389) | `pt-2 pb-1` |
| `json-analysis-tag` (span, line 390) | `inline-flex items-center rounded-full bg-sidebar text-primary text-[11px] font-semibold uppercase tracking-[0.06em] px-2 py-1` |
| `json-analysis-title` (h1, line 391) | `font-display text-3xl text-foreground mt-4 mb-2` |
| `json-analysis-intro` (p, line 394) | `text-base text-muted-foreground m-0` |
| `json-results-region` (section, line 402) | `flex flex-col gap-4` |
| `json-analysis-pill saved-session-marker` (p, line 404) | `inline-flex items-center rounded-full bg-sidebar text-muted-foreground text-[11px] font-semibold uppercase tracking-[0.06em] px-2 py-1` |
| `json-analysis-card json-analysis-card--warning` (div, line 410) | `<Card className="border-[#eadcb8] p-4 min-w-0">` |
| `json-analysis-card__title` (h2, line 411) | `text-xl font-semibold text-foreground m-0` |
| `json-analysis-card__detail` (p, line 413) | `text-base text-muted-foreground mt-4` |
| `json-issue-list` (ul, line 418) | `flex flex-col gap-2 mt-3 list-none p-0` |
| `json-issue-row` (li, line 419) | `flex flex-col gap-1 text-sm` |
| `json-results-main` (div, line 433) | `flex flex-col gap-4` |
| `json-input-disclosure` (details, line 450) | Replace with `<Collapsible>` — see Pattern 5 in RESEARCH.md |
| `json-analysis-stale` (p, line 455) | `text-sm text-warning font-medium` |
| `json-analysis-loading` (p, line 509) | Replace with Skeleton — see ai-coach-tab pattern |
| `json-analysis-card json-analysis-card--danger` (section, line 516) | `<Card className="border-[#edd0ca] p-4 min-w-0">` |

**PracticePriorityCard (lines 532–549):**

| Current className | Tailwind/Shadcn replacement |
|---|---|
| `json-priority-card` (section) | `<Card className="p-5 min-w-0 bg-sidebar border-border">` |
| `json-analysis-pill` (p) | `inline-flex items-center rounded-full bg-background text-primary text-[11px] font-semibold uppercase tracking-[0.06em] px-2 py-1 mb-2` |
| `json-analysis-card__title` (h2) | `text-xl font-semibold text-foreground m-0` |
| `json-priority-card__priority` (p) | `font-display text-2xl text-foreground mt-3 mb-1` |
| `json-priority-card__reason` (p) | `text-base text-muted-foreground m-0` |

**Playwright-critical:** `getByRole("heading", { name: "What should I practice next?" })` (line 130 of spec) — the h2 text must remain identical.

**Import changes required:**
```tsx
// ADD to top of file:
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

// ADD state for collapsible:
const [isInputOpen, setIsInputOpen] = useState(false);
// When analysisState transitions to "done", auto-close: setIsInputOpen(false)
```

**`<details>` → `<Collapsible>` replacement (lines 449–480):**
```tsx
// REPLACE: <details className="json-input-disclosure">...</details>
// WITH:
<Collapsible open={isInputOpen} onOpenChange={setIsInputOpen}>
  <CollapsibleTrigger asChild>
    <Button variant="ghost" className="w-full justify-between min-h-[44px] font-medium">
      {isInputOpen ? "Hide JSON input" : "Change JSON input"}
      <ChevronDown className={cn("h-4 w-4 transition-transform", isInputOpen && "rotate-180")} />
    </Button>
  </CollapsibleTrigger>
  <CollapsibleContent className="flex flex-col gap-3 pt-2">
    {resultsStale ? (
      <p className="text-sm text-warning font-medium">
        Input changed. Analyze again to update results.
      </p>
    ) : null}
    <JsonInputCard ... />
    <ValidationPreviewCard ... />
  </CollapsibleContent>
</Collapsible>
```

**Playwright-critical:** The test at line 157 asserts `getByText("Change JSON input")` is visible (the `<summary>` text). The CollapsibleTrigger Button must contain exactly "Change JSON input". Line 158 asserts the textarea is hidden when the disclosure is closed — the Collapsible closed state must hide `CollapsibleContent` (Radix does this automatically).

---

### `apps/web/components/json-analysis/summary-metric-cards.tsx` (component, transform)

**Analog:** Itself (46 lines). Props and logic unchanged.

**Current class names:**

| Current className | Tailwind/Shadcn replacement |
|---|---|
| `json-metric-grid` (section, line 34) | `grid grid-cols-2 sm:grid-cols-4 gap-2` |
| `json-metric-card` (article, line 36) | `<Card className="p-4 min-w-0">` |
| `json-metric-card__label` (h3, line 37) | `font-mono text-[11px] font-semibold uppercase tracking-[0.06em] text-subtle m-0` |
| `json-metric-card__value` (p, line 40) | `font-display text-4xl text-foreground mt-2 mb-2` |
| `json-metric-card__helper` (p, line 41) | `text-sm text-muted-foreground m-0` |

**Playwright-critical:** `data-testid="summary-metric-label"` on the `<h3>` element (line 37) MUST be preserved. The spec asserts on this at lines 149–154 of `dashboard-ui.spec.ts`.

**Import changes required:**
```tsx
import { Card } from "@/components/ui/card";
```

**Full replacement JSX:**
```tsx
export function SummaryMetricCards({ summary }: SummaryMetricCardsProps) {
  return (
    <section className="grid grid-cols-2 sm:grid-cols-4 gap-2" aria-label="Summary metrics">
      {metricHelpers.map((metric) => (
        <Card key={metric.label} className="p-4 min-w-0">
          <h3
            className="font-mono text-[11px] font-semibold uppercase tracking-[0.06em] text-subtle m-0"
            data-testid="summary-metric-label"
          >
            {metric.label}
          </h3>
          <p className="font-display text-4xl text-foreground mt-2 mb-2">
            {metric.value(summary)}
          </p>
          <p className="text-sm text-muted-foreground m-0">{metric.helper}</p>
        </Card>
      ))}
    </section>
  );
}
```

---

### `apps/web/components/json-analysis/result-tabs.tsx` (component, event-driven)

**Analog:** Itself (65 lines). State and props unchanged. Core change: replace custom `aria-pressed` tab buttons with Shadcn `<Tabs>`.

**Current class names:**

| Current className | Tailwind/Shadcn replacement |
|---|---|
| `json-results-tabs` (section, line 29) | Remove — Tabs provides its own wrapper |
| `json-tab-list` (div, line 30) | `<TabsList>` |
| `json-tab-button` (button, line 33) | `<TabsTrigger value="...">` |
| `aria-pressed` on buttons | Remove — `aria-selected` handled by Radix |
| `json-tab-panel` (div, line 44) | `<TabsContent value="...">` per tab |

**Import changes required:**
```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
// Remove: import { useState } from "react"; (activeTab state replaced by Tabs defaultValue)
```

**Full replacement JSX (all logic props unchanged):**
```tsx
export function ResultTabs({ analysis, aiCoachState, onRequestFeedback, onRetryFeedback }: ResultTabsProps) {
  return (
    <Tabs defaultValue="pause-analysis" className="w-full">
      <TabsList className="w-full justify-start flex-wrap h-auto gap-1">
        <TabsTrigger value="pause-analysis">Pause Analysis</TabsTrigger>
        <TabsTrigger value="words">Words</TabsTrigger>
        <TabsTrigger value="phonemes">Phonemes</TabsTrigger>
        <TabsTrigger value="ielts-analysis">IELTS Analysis</TabsTrigger>
      </TabsList>
      <TabsContent value="pause-analysis">
        <PausesTab pauses={analysis.pauses} pauseRatio={analysis.summary.pauseRatio} />
      </TabsContent>
      <TabsContent value="words">
        <WordsTab words={analysis.words} />
      </TabsContent>
      <TabsContent value="phonemes">
        <PhonemesTab patterns={analysis.weakPhonemePatterns} />
      </TabsContent>
      <TabsContent value="ielts-analysis">
        <AiCoachTab state={aiCoachState} onRequestFeedback={onRequestFeedback} onRetry={onRetryFeedback} />
      </TabsContent>
    </Tabs>
  );
}
```

**Playwright-critical:** The existing test clicks `getByRole("button", { name: "IELTS Analysis" })` (line 160 of spec). Shadcn `TabsTrigger` renders as `role="tab"` not `role="button"`. The test selector must change to `getByRole("tab", { name: "IELTS Analysis" })`. State management: `activeTab` useState is eliminated — Radix Tabs manages active state internally via `defaultValue`/`value`.

---

### `apps/web/components/json-analysis/pauses-tab.tsx` (component, transform)

**Analog:** Itself (129 lines). All logic, SVG rendering, and data unchanged.

**Current class names:**

| Current className | Tailwind/Shadcn replacement |
|---|---|
| `json-empty-state` (section, empty state) | `flex flex-col gap-2 py-8 items-start` |
| `json-analysis-card__title` (h2, empty) | `text-xl font-semibold text-foreground m-0` |
| `json-analysis-card__detail` (p, empty) | `text-base text-muted-foreground` |
| `json-analysis-card` (section, main) | `flex flex-col gap-4` (no Card wrapper — already inside ResultTabs content) |
| `json-analysis-card__title` (h2, main) | `text-xl font-semibold text-foreground m-0` |
| `pause-summary-grid` (div, line 35) | `grid grid-cols-2 sm:grid-cols-4 gap-2` |
| `pause-summary-card` (div, line 36) | `flex flex-col gap-1 rounded-xl bg-sidebar p-3 text-sm` |
| `pause-timeline-scroll` (div, line 54) | `overflow-x-auto rounded-xl bg-sidebar p-2` |
| `pause-timeline` (svg, line 55) | `w-full h-6 min-w-[200px]` |
| `pause-timeline__axis` (line) | keep as SVG attribute |
| `pause-timeline__segment--natural` | keep as SVG rect — but use `fill` attribute or inline style for color |
| `pause-timeline__segment--noticeable` | same |
| `pause-timeline__segment--critical` | same |
| `pause-legend` (ul, line 92) | `flex flex-wrap gap-4 text-sm list-none p-0 m-0` |
| `pause-legend__dot` (span) | `inline-block w-2 h-2 rounded-full mr-1` |
| `pause-legend__dot--natural` | `bg-[#3f6b4f]` (success color) |
| `pause-legend__dot--noticeable` | `bg-[#b88a3e]` (warning color) |
| `pause-legend__dot--critical` | `bg-[#9f2d20]` (danger color) |
| `pause-practice-cue` (section, line 101) | `rounded-xl bg-sidebar p-4` |
| `json-analysis-subtitle` (h3, line 102) | `text-base font-semibold text-foreground m-0 mb-2` |
| `json-result-list` (ul, line 109) | `flex flex-col gap-2 list-none p-0 m-0` |
| `json-result-row json-result-row--pause-{severity}` (li) | `flex flex-col gap-1 rounded-xl p-3 text-sm border` + severity color |
| `json-result-row--pause-natural` | `border-[#d9e8dd] bg-[#f0f7f2]` |
| `json-result-row--pause-noticeable` | `border-[#eadcb8] bg-[#fdf7ec]` |
| `json-result-row--pause-critical` | `border-[#edd0ca] bg-[#fdf1ee]` |

**SVG segment colors:** The SVG uses CSS class names for fill colors. Replace with inline `fill` props:
```tsx
// natural → fill="#3f6b4f"
// noticeable → fill="#b88a3e"
// critical → fill="#9f2d20"
const segmentFill: Record<PauseSeverity, string> = {
  natural: "#3f6b4f",
  noticeable: "#b88a3e",
  critical: "#9f2d20",
};
// Then: <rect fill={segmentFill[pause.severity]} ... />
```

---

### `apps/web/components/json-analysis/words-tab.tsx` (component, transform)

**Analog:** Itself (79 lines). All logic unchanged.

**Current class names:**

| Current className | Tailwind/Shadcn replacement |
|---|---|
| `json-empty-state` (section) | `flex flex-col gap-2 py-8 items-start` |
| `json-analysis-card__title` (h2) | `text-xl font-semibold text-foreground m-0` |
| `json-analysis-card__detail` (p) | `text-base text-muted-foreground` |
| `json-analysis-card` (section, main) | `flex flex-col gap-4` |
| `json-analysis-card__title` (h2, main) | `text-xl font-semibold text-foreground m-0` |
| `word-chip-legend` (ul, line 33) | `flex flex-wrap gap-4 text-sm list-none p-0 m-0` |
| `word-chip-legend__dot` (span) | `inline-block w-2 h-2 rounded-full mr-1` |
| `word-chip-legend__dot--weak` | `bg-danger` |
| `word-chip-legend__dot--okay` | `bg-warning` |
| `word-chip-legend__dot--good` | `bg-success` |
| `word-chip-list` (ol, line 41) | `flex flex-wrap gap-1.5 list-none p-0 m-0` |
| `word-chip word-chip--{band}` (li, line 44) | `inline-flex flex-col items-center rounded-xl px-3 py-1.5 text-sm font-medium min-h-[44px] justify-center` + band color |
| `word-chip--weak` | `bg-[#fdf1ee] text-danger border border-[#edd0ca]` |
| `word-chip--okay` | `bg-[#fdf7ec] text-warning border border-[#eadcb8]` |
| `word-chip--good` | `bg-[#f0f7f2] text-success border border-[#d9e8dd]` |
| `weak-word-shortlist` (section, line 57) | `rounded-xl bg-sidebar p-4` |
| `json-analysis-subtitle` (h3, line 58) | `text-base font-semibold text-foreground m-0 mb-2` |
| `json-result-list` (ol, line 59) | `flex flex-col gap-2 list-none p-0 m-0` |
| `json-result-row json-result-row--weak` (li, line 61) | `flex flex-col gap-1 rounded-xl p-3 text-sm border border-[#edd0ca] bg-[#fdf1ee]` |

**Playwright-critical:** `data-testid="word-row"` (line 49) must be preserved on each `<li>`.

---

### `apps/web/components/json-analysis/phonemes-tab.tsx` (component, transform)

**Analog:** Itself (64 lines of JSX, 41 lines of utility functions). All logic unchanged.

**Current class names:**

| Current className | Tailwind/Shadcn replacement |
|---|---|
| `json-empty-state` (section) | `flex flex-col gap-2 py-8 items-start` |
| `json-analysis-card__title` (h2) | `text-xl font-semibold text-foreground m-0` |
| `json-analysis-card__detail` (p) | `text-base text-muted-foreground` |
| `json-analysis-card` (section, main) | `flex flex-col gap-4` |
| `json-analysis-card__title` (h2, main) | `text-xl font-semibold text-foreground m-0` |
| `json-result-list` (ul, line 35) | `flex flex-col gap-3 list-none p-0 m-0` |
| `json-result-row` (li, line 37) | `flex flex-col gap-1 rounded-xl border border-border p-4 text-sm` |
| `phoneme-bar` (div, line 46) | `w-full h-2 rounded-full bg-border overflow-hidden mt-1` |
| `phoneme-bar__fill` (span, line 50) | `block h-full rounded-full bg-danger transition-all` |
| `phoneme-hint` (p, line 58) | `text-sm text-muted-foreground italic border-l-2 border-primary pl-3 mt-1` |

**Playwright-critical:** `data-testid="phoneme-row"` (line 37) must be preserved on each `<li>`.

---

### `apps/web/components/json-analysis/ai-coach-tab.tsx` (component, event-driven)

**Analog:** Itself (121 lines). All state flow unchanged.

**Current class names:**

| Current className | Tailwind/Shadcn replacement |
|---|---|
| `json-analysis-card` (section, idle) | `flex flex-col gap-4 py-6` |
| `json-analysis-card__detail` (p, idle) | `text-base text-muted-foreground` |
| `json-primary-button json-action-button json-action-button--ai` (button, idle) | `<Button className="min-h-[44px]">Get AI Feedback</Button>` |
| `json-analysis-card ai-coach-loading` (section, loading) | `flex flex-col gap-4 py-6` |
| `ai-coach-skeleton` (div, loading) | Replace with Shadcn Skeleton — see below |
| `json-analysis-card__detail` (p, loading) | `text-base text-muted-foreground` |
| `json-analysis-card json-analysis-card--danger` (section, error) | `<Card className="border-[#edd0ca] p-4 flex flex-col gap-3">` |
| `json-analysis-card__title` (h2, error) | `text-xl font-semibold text-foreground m-0` |
| `json-analysis-card__detail` (p, error) | `text-base text-muted-foreground` |
| `json-primary-button json-action-button--ai` (button, error) | `<Button className="min-h-[44px]">Retry AI Feedback</Button>` |
| `json-analysis-card ai-coach-result` (section, done) | `flex flex-col gap-4` |
| `json-analysis-card__title` (h2, done) | `text-xl font-semibold text-foreground m-0` |
| `ai-coach-bands` (div) | `grid grid-cols-2 gap-2` |
| `ai-coach-band` (div) | `<Card className="p-3 flex flex-col gap-1">` |
| `ai-coach-band__label` (span) | `font-mono text-[11px] font-semibold uppercase tracking-[0.06em] text-subtle` |
| `ai-coach-band__value` (span) | `font-display text-3xl text-foreground` |
| `ai-coach-section` (div) | `flex flex-col gap-2` |
| `json-analysis-subtitle` (h3) | `text-base font-semibold text-foreground m-0` |
| `ai-coach-errors` (ol) | `flex flex-col gap-3 list-none p-0 m-0` |
| `ai-coach-error` (li) | `flex flex-col gap-1 text-sm rounded-xl border border-border p-3` |
| `ai-coach-drills` (ol) | `flex flex-col gap-2 list-decimal list-inside text-sm` |
| `ai-coach-drill` (li) | `text-sm` |
| `json-analysis-card__detail` (p, summary) | `text-base text-muted-foreground` |

**Loading state replacement (Shadcn Skeleton):**
```tsx
// REPLACE:
// <div className="ai-coach-skeleton" />
// <p className="json-analysis-card__detail">Generating...</p>

// WITH:
import { Skeleton } from "@/components/ui/skeleton";

<section className="flex flex-col gap-4 py-6" aria-busy="true">
  <div role="status" aria-label="Loading AI feedback" className="space-y-3">
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-4 w-1/2" />
    <Skeleton className="h-4 w-2/3" />
  </div>
  <p className="text-base text-muted-foreground">Generating personalized IELTS feedback…</p>
</section>
```

**Import changes required:**
```tsx
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
```

---

### `apps/web/components/json-analysis/json-input-card.tsx` (component, event-driven)

**Analog:** Itself (121 lines). All props and file-handling logic unchanged.

**Current class names:**

| Current className | Tailwind/Shadcn replacement |
|---|---|
| `json-analysis-card` (section, line 62) | `flex flex-col gap-4` (no Card — already inside Collapsible content) |
| `json-analysis-card__header` (div, line 63) | `flex items-start justify-between gap-4` |
| `json-analysis-card__title` (h2, line 64) | `text-xl font-semibold text-foreground m-0` |
| `json-analysis-pill` (span, line 65) | `inline-flex items-center rounded-full bg-sidebar text-muted-foreground text-[11px] font-semibold uppercase tracking-[0.06em] px-2 py-1 shrink-0` |
| `json-input-label` (label, line 68) | `block font-mono text-[11px] font-semibold uppercase tracking-[0.06em] text-subtle mt-4` |
| `json-input-textarea` (textarea, line 71) | `<Textarea>` with `className="font-mono min-h-[280px] resize-y bg-input w-full max-w-full"` |
| `json-input-actions` (div, line 81) | `flex flex-wrap gap-2 mt-2` |
| `json-secondary-button` (label, line 82) | `<Button variant="outline" size="sm" asChild>` for file upload label |
| `json-input-file` (input, line 83) | `sr-only` (visually hidden inside button label) |
| `json-secondary-button` (button, line 92) | `<Button variant="outline" size="sm">` |
| `json-secondary-button` (button, line 95) | `<Button variant="outline" size="sm">` |
| `json-analysis-error` (p, line 100) | `text-sm text-danger font-medium` |
| `json-input-meta` (div, line 102) | `flex flex-wrap items-center gap-2 mt-2 font-mono text-[11px] text-subtle` |
| `json-analyze-row` (div, line 108) | `flex flex-wrap items-center gap-3 mt-4` |
| `json-primary-button` (button, line 109) | `<Button disabled={!canAnalyze} className="min-h-[44px]">` |
| `json-input-helper` (p, line 117) | `text-sm text-muted-foreground` |

**Playwright-critical:** The `aria-label="Speech assessment JSON input"` on the textarea (line 73) must be preserved — the spec asserts `getByLabel("Speech assessment JSON input")` at line 127. The button text "Analyze JSON" at line 115 changes to "Analyze Pronunciation" per the UI-SPEC copywriting contract. The spec currently asserts `getByRole("button", { name: "Analyze JSON" })` at line 128 — this test assertion must be updated to `"Analyze Pronunciation"`.

**Import changes required:**
```tsx
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
```

---

### `apps/web/components/json-analysis/validation-preview-card.tsx` (component, event-driven)

**Analog:** Itself (239 lines). All logic, state, and prop types unchanged.

**Current class names (all states):**

| Current className | Tailwind/Shadcn replacement |
|---|---|
| `json-analysis-card` (section, all states) | `<Card className="p-4 min-w-0">` |
| `json-analysis-card--danger` (modifier) | `<Card className="p-4 min-w-0 border-[#edd0ca]">` |
| `json-analysis-card--warning` (modifier) | `<Card className="p-4 min-w-0 border-[#eadcb8]">` |
| `json-analysis-card--success` (modifier) | `<Card className="p-4 min-w-0 border-[#d9e8dd]">` |
| `json-analysis-card__title` (h2) | `text-xl font-semibold text-foreground m-0` |
| `json-analysis-card__detail` (p) | `text-base text-muted-foreground mt-3` |
| `json-analysis-card__header` (div) | `flex items-start justify-between gap-4` |
| `json-analysis-pill json-analysis-pill--danger` (span) | `<Badge variant="destructive">` |
| `json-analysis-pill json-analysis-pill--warning` (span) | `<Badge className="bg-warning text-white">` |
| `json-issue-list` (ul) | `flex flex-col gap-2 mt-3 list-none p-0` |
| `json-issue-row` (li) | `flex flex-col gap-1 text-sm` |
| `json-analysis-card__meta` (p) | `font-mono text-[11px] text-subtle mt-2` |
| `json-link-button` (button) | `<Button variant="link" size="sm" className="p-0 h-auto">` |
| `json-all-issues` (div) | `mt-3` |
| `json-analysis-subtitle` (h3) | `text-base font-semibold text-foreground m-0 mb-2` |
| `json-technical-details` (div) | `mt-3` |
| `json-technical-line` (code) | `block font-mono text-[11px] text-subtle bg-sidebar rounded p-2 mt-1 break-all` |

**Import changes required:**
```tsx
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
```

---

### `apps/web/components/audio-mode/audio-mode-panel.tsx` (component, streaming + event-driven)

**Analog:** Itself (121 lines). All hooks (`useDeepgramSession`), logic, and child components (`RecordButton`, `LiveAnalysisPanel`) unchanged.

**Current class names:**

| Current className | Tailwind/Shadcn replacement |
|---|---|
| `json-analysis-card` (outer div, line 78) | `flex flex-col gap-4 rounded-[18px] border border-border bg-card p-4` |
| `json-input-label` (label, line 80) | `block font-mono text-[11px] font-semibold uppercase tracking-[0.06em] text-subtle` |
| `json-input-textarea audio-reference-input` (input, line 83) | `<Input>` with `className="bg-input"` |
| `audio-section` (div, line 94) | `flex flex-col gap-2` |
| `json-analysis-error` (p, line 106) | `text-sm text-danger font-medium` |
| `audio-section` (div, line 110) | `flex flex-col gap-2` |
| WordScoreCard `json-analysis-card audio-score-card` | `<Card className="p-4 min-w-0">` |
| `audio-score-card__header` (div) | `flex items-center justify-between gap-4 mb-3` |
| `json-input-label audio-score-card__label` (span) | `font-mono text-[11px] font-semibold uppercase tracking-[0.06em] text-subtle` |
| `audio-score-card__value audio-score-card__value--{level}` (span) | `font-display text-3xl` + level color class |
| `audio-score-card__value--good` | `text-success` |
| `audio-score-card__value--okay` | `text-warning` |
| `audio-score-card__value--weak` | `text-danger` |
| `audio-word-chip-list` (div) | `flex flex-wrap gap-1.5` |
| `audio-word-chip audio-word-chip--{level}` (span) | `inline-flex items-center rounded-xl px-3 py-1.5 text-sm font-medium min-h-[44px]` + level colors |
| `audio-word-chip--good` | `bg-[#f0f7f2] text-success border border-[#d9e8dd]` |
| `audio-word-chip--okay` | `bg-[#fdf7ec] text-warning border border-[#eadcb8]` |
| `audio-word-chip--weak` | `bg-[#fdf1ee] text-danger border border-[#edd0ca]` |
| `audio-fluency-meta` (div) | `flex flex-wrap gap-3 font-mono text-[11px] text-subtle mt-2` |
| `audio-score-card__summary` (p) | `text-sm text-muted-foreground mt-2` |

**Playwright-critical:** `getByLabel("Reference sentence")` (line 164 of spec, line 187). The `<label>` with `htmlFor="reference-text"` and content "Reference sentence" must remain. With Shadcn `<Input>`, the label is a separate element — this pattern is already correct.

**Import changes required:**
```tsx
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
```

---

### `apps/web/components/status-card.tsx` (component, transform)

**Analog:** Itself (36 lines). All props and badge types unchanged.

**Current class names:**

| Current className | Tailwind/Shadcn replacement |
|---|---|
| `status-card` (article) | `<Card className="p-4">` |
| `status-card__header` (div) | `flex items-start justify-between gap-4` |
| `status-card__title` (h2) | `text-xl font-semibold text-foreground m-0` |
| `status-badge` (span base) | `<Badge>` |
| `status-badge--checking` | `<Badge variant="secondary">` |
| `status-badge--ok` | `<Badge className="bg-success text-white">` |
| `status-badge--valid` | `<Badge className="bg-success text-white">` |
| `status-badge--unavailable` | `<Badge variant="destructive">` |
| `status-badge--invalid` | `<Badge variant="destructive">` |
| `status-card__body` (div) | `mt-4` |
| `status-card__detail` (p) | `text-base text-muted-foreground m-0` |
| `status-card__meta` (p) | `font-mono text-[11px] text-subtle mt-2 m-0` |

**Import changes required:**
```tsx
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
```

---

### `apps/web/components/status-panel.tsx` (component, CRUD + event-driven)

**Analog:** Itself (144 lines). All fetch logic and state unchanged.

**Current class names:**

| Current className | Tailwind/Shadcn replacement |
|---|---|
| `status-page` (main, line 114) | `min-h-screen p-6 bg-background` |
| `status-shell` (section, line 115) | `w-full max-w-[720px] mx-auto flex flex-col gap-4` |
| `status-header` (header, line 116) | `pt-8 pb-2` |
| `status-tag` (span, line 117) | `inline-flex items-center rounded-full bg-sidebar text-primary text-[11px] font-semibold uppercase tracking-[0.06em] px-2 py-1` |
| `status-title` (h1, line 118) | `font-display text-3xl text-foreground mt-4 mb-2` |
| `status-intro` (p, line 119) | `text-base text-muted-foreground m-0` |
| `status-refresh` (button, line 128) | `<Button disabled={isRefreshing}>Refresh Status</Button>` |
| `status-helper` (p, line 137) | `text-sm text-muted-foreground` |

**Import changes required:**
```tsx
import { Button } from "@/components/ui/button";
```

---

### `apps/web/e2e/dashboard-ui.spec.ts` (test, request-response)

**Analog:** Itself. Update only — do not restructure the mock pattern or test file layout.

**Selectors that MUST change (with current → new mapping):**

| Current assertion (line) | New assertion | Reason |
|---|---|---|
| `getByRole("button", { name: "JSON Analysis" })` with `.toHaveAttribute("aria-pressed", "true")` (lines 139–142) | `getByRole("button", { name: "JSON Analysis" }).toHaveAttribute("aria-current", "page")` | Nav switches from `aria-pressed` to `aria-current` |
| `getByText("Record from your microphone and watch live transcript feedback.")` (line 144) | Remove this assertion | Helper text removed from desktop nav items |
| `getByRole("button", { name: "Analyze JSON" })` (lines 128–129) | `getByRole("button", { name: "Analyze Pronunciation" })` | Button copy change per UI-SPEC |
| `getByRole("button", { name: "IELTS Analysis" })` (line 160) | `getByRole("tab", { name: "IELTS Analysis" })` | Shadcn TabsTrigger renders as `role="tab"` not `role="button"` |
| `getByRole("button", { name: "Live Audio Practice" })` (lines 163, 186) | `getByRole("button", { name: "Live Audio Practice" })` — keep but verify it targets the nav button correctly | Bottom nav on mobile; sidebar button on desktop |

**Assertions to PRESERVE unchanged:**
- `getByText("Change JSON input")` (line 157) — Collapsible trigger text must match
- `getByLabel("Speech assessment JSON input")` (lines 127, 158) — textarea aria-label preserved
- `getByTestId("summary-metric-label")` (lines 149, 178) — data-testid preserved
- `getByText("Start with the TH / theta sound pattern.")` (line 148) — PracticePriorityCard text
- `getByText("Try saying \"trees stood\" as one short phrase")` (line 156) — PausesTab text
- `getByLabel("Reference sentence")` (lines 164, 187) — audio input label preserved

---

### `apps/web/e2e/responsive.spec.ts` (new test file)

**Analog:** `apps/web/e2e/dashboard-ui.spec.ts` — copy the mock pattern, file imports, and helper functions.

**Mock pattern to copy (lines 108–122 of dashboard-ui.spec.ts):**
```typescript
async function mockDashboardApi(page: Page) {
  await page.route("**/api/json-analysis/preview", async (route) => {
    await route.fulfill({ json: validPreview });
  });
  await page.route("**/api/json-analysis/analyze", async (route) => {
    await route.fulfill({ json: analysisResponse });
  });
  await page.route("**/api/saved-sessions", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({ json: { sessions: [] } });
      return;
    }
    await route.fulfill({ json: { session: null }, status: 201 });
  });
}
```

**New tests required (UIX-06, UIX-07, UIX-08):**
```typescript
test("sidebar hidden at mobile; bottom nav visible at mobile", ...)
test("bottom nav hidden at desktop; sidebar visible at desktop", ...)
test("active bottom nav item has aria-current='page'", ...)
test("no horizontal overflow at 390px — JSON mode after analysis", ...)
test("no horizontal overflow at 390px — Audio mode", ...)
test("bottom nav items have touch target min 44px height", ...)
test("result tabs navigable by keyboard arrow keys", ...)
test("JSON textarea has aria-label", ...)
test("nav has aria-label='Main navigation'", ...)
```

---

## Shared Patterns

### Pattern A: Shadcn Card (applies to all components)

**Source:** Shadcn registry — `apps/web/components/ui/card.tsx` (created by `shadcn add card`)

**Apply to:** `summary-metric-cards.tsx`, `ai-coach-tab.tsx`, `validation-preview-card.tsx`, `audio-mode-panel.tsx`, `status-card.tsx`

The Shadcn Card has a default `rounded-xl border bg-card text-card-foreground shadow`. For this project the border radius from `--radius` (18px) will override the default. The border color comes from `--color-border`. Use `className` prop to override border color for status variants:

```tsx
import { Card } from "@/components/ui/card";

// Default card (white background, border-border)
<Card className="p-4 min-w-0">...</Card>

// Success variant
<Card className="p-4 min-w-0 border-[#d9e8dd]">...</Card>

// Warning variant
<Card className="p-4 min-w-0 border-[#eadcb8]">...</Card>

// Danger/error variant
<Card className="p-4 min-w-0 border-[#edd0ca]">...</Card>

// Sidebar/muted background
<Card className="p-4 min-w-0 bg-sidebar border-border">...</Card>
```

### Pattern B: Shadcn Button (applies to all components with CTAs)

**Source:** Shadcn registry — `apps/web/components/ui/button.tsx`

**Apply to:** `json-input-card.tsx`, `ai-coach-tab.tsx`, `validation-preview-card.tsx`, `status-panel.tsx`, `json-analysis-panel.tsx` (Collapsible trigger)

All interactive buttons must have `min-h-[44px]` for UIX-07 touch target requirement:

```tsx
import { Button } from "@/components/ui/button";

// Primary CTA (Analyze Pronunciation, Get AI Feedback)
<Button className="min-h-[44px]">Analyze Pronunciation</Button>

// Secondary action (Load sample, Clear, Upload)
<Button variant="outline" size="sm">Load sample JSON</Button>

// Ghost / text action (Collapsible trigger, Show/hide toggles)
<Button variant="ghost" className="w-full justify-between min-h-[44px]">
  Change JSON input
  <ChevronDown className="h-4 w-4" />
</Button>

// Link style (Show all issues, Show technical details)
<Button variant="link" size="sm" className="p-0 h-auto">Show all issues</Button>
```

### Pattern C: Focus Ring (applies to all interactive elements)

**Source:** RESEARCH.md Pattern section + Shadcn default ring behavior

**Apply to:** All buttons, inputs, textarea, tabs, nav items that are not Shadcn components (Shadcn components have focus-visible ring built in via `focus-visible:ring-2 focus-visible:ring-ring`)

For custom elements (NavItem, BottomNavItem, file upload label):
```tsx
className="focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none"
```

The `--ring` CSS variable in Shadcn maps to `--color-primary` (#d97757) in our `@theme inline` block. This ensures all focus rings use the accent color.

### Pattern D: Monospace Label (applies to all metric/input labels)

**Source:** `apps/web/app/globals.css` lines 467–485 (`.json-input-label`, `.json-analysis-card__meta` pattern)

**Apply to:** Any label that renders as a mono small-caps eyebrow: metric card labels, input labels, badge-style metadata

```tsx
// Eyebrow label (e.g., metric card labels, input labels)
<p className="font-mono text-[11px] font-semibold uppercase tracking-[0.06em] text-subtle">
  {label}
</p>

// Inline metadata (character count, file name, validation status)
<span className="font-mono text-[11px] text-subtle">
  {jsonText.length} characters
</span>
```

### Pattern E: Overflow Prevention (applies to all flex/grid children)

**Source:** RESEARCH.md Pitfall 4 + `apps/web/app/globals.css` line 95–96 (`.practice-content { min-width: 0; }`)

**Apply to:** Every flex child and grid column that contains content

```tsx
// Flex children that contain text or media
<div className="min-w-0">...</div>

// Grid content area
<main className="min-w-0">...</main>

// Word chip lists (wrapping required)
<div className="flex flex-wrap gap-1.5">...</div>

// Textarea (never wider than container)
<Textarea className="w-full max-w-full" />
```

### Pattern F: Tailwind Responsive Pattern (applies to layout components)

**Source:** `apps/web/app/globals.css` lines 313–352 (existing `@media (max-width: 640px)` block)

**Apply to:** `page.tsx` grid, sidebar, content area

The breakpoint `sm:` (640px) maps to the existing media query threshold:

```tsx
// Desktop-only: hidden on mobile
<aside className="hidden sm:flex ...">

// Mobile-only: hidden on desktop
<nav className="sm:hidden fixed bottom-0 ...">

// Responsive grid: stack on mobile, grid on desktop
<div className="grid grid-cols-1 sm:grid-cols-[minmax(180px,220px)_minmax(0,1fr)]">
```

---

## No Analog Found

Files with no close match in the codebase (use RESEARCH.md patterns instead):

| File | Role | Data Flow | Reason |
|---|---|---|---|
| `apps/web/postcss.config.mjs` | config | — | No PostCSS config exists; use RESEARCH.md Pitfall 5 pattern |
| `apps/web/components.json` | config | — | Generated by `shadcn init` — no analog; follow RESEARCH.md Pattern 2 |
| `apps/web/lib/utils.ts` | utility | transform | Generated by `shadcn init` — standard `cn()` pattern |
| `apps/web/components/ui/*.tsx` | component | — | Generated by `shadcn add` — do not hand-roll; use CLI |
| `apps/web/e2e/responsive.spec.ts` | test | — | New file; copy mock pattern from `dashboard-ui.spec.ts` |

---

## Critical Migration Order Constraints

The executor MUST follow this order (from RESEARCH.md Wave dependency graph):

1. **Wave 0 first:** `tsconfig.json` alias → `postcss.config.mjs` → `globals.css` Tailwind directives → `shadcn init` → `shadcn add [components]` → `lucide-react install`. Nothing else builds until these succeed.

2. **Wave 1 before all panels:** `layout.tsx` and `page.tsx` must be migrated before any panel component, because the shell provides `bg-background` on `<body>` and the grid layout context that panels live inside.

3. **Wave 2 shared primitives:** `status-card.tsx` and `status-panel.tsx` before JSON/audio panels (they share Badge and Card patterns that can be verified in isolation).

4. **Wave 3 dependency order within JSON Analysis:** `summary-metric-cards.tsx` and `result-tabs.tsx` before `json-analysis-panel.tsx` (panel imports them); tab content components (`pauses-tab.tsx`, etc.) can be migrated in parallel.

5. **Wave 5 tests last:** Update `dashboard-ui.spec.ts` and create `responsive.spec.ts` only after all component migrations are complete, so selectors match the final rendered output.

---

## Metadata

**Analog search scope:** `apps/web/` directory — all component, page, and CSS files
**Files scanned:** 20 source files read directly
**Pattern extraction date:** 2026-05-09

# Phase 7: Comprehensive UI/UX Redesign & Design System - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-09
**Phase:** 07-Comprehensive UI/UX Redesign & Design System
**Areas discussed:** Design system strategy, Navigation model, Mobile/responsive layout, Redesign depth for existing panels

---

## Design System Strategy

### Q1: Migrate to Tailwind CSS or formalize existing custom CSS?

| Option | Description | Selected |
|--------|-------------|----------|
| Migrate to Tailwind CSS | Replace globals.css class names with Tailwind utilities. Built-in token system. Requires rewriting classNames across ~15 component files. | |
| Keep custom CSS, document it | Extract formal design-tokens file from globals.css. No class name churn. Fragile as more surfaces are added. | |
| Shadcn/UI | User suggested — brings Tailwind + Radix UI + accessible component library together. | ✓ |

**User's choice:** Shadcn/UI (free-text response)
**Notes:** User responded with "how about shadcn" — indicating preference for adopting Shadcn/UI as the component foundation, which implies Tailwind + Radix as well.

---

### Q2: What happens to existing warm-neutral color tokens?

| Option | Description | Selected |
|--------|-------------|----------|
| Map existing tokens into Shadcn CSS variable convention | Preserve current warm-neutral feel (--bg, --accent, etc.) mapped into Shadcn slots. | |
| Use Shadcn defaults, retheme from scratch | Start fresh from Shadcn's default theme. | ✓ |

**User's choice:** Use Shadcn defaults, retheme from scratch
**Notes:** Clean break from current custom CSS tokens.

---

### Q3: Which Shadcn components to install in Phase 7?

| Option | Description | Selected |
|--------|-------------|----------|
| Core set only | Button, Card, Tabs, Badge, Input, Textarea, Separator, Tooltip, Dialog, Skeleton. | ✓ (via "you decide") |
| Comprehensive upfront install | All components likely needed through Phases 8–12. Large Phase 7 scope. | |

**User's choice:** "Do what best for project" (deferred to Claude)
**Notes:** Planner will install the core set covering current surface needs.

---

### Q4: Design reference for fresh Shadcn theme?

| Option | Description | Selected |
|--------|-------------|----------|
| Warm, readable learner tool | Warm neutrals, good contrast, generous whitespace. Notion/Linear aesthetic. | ✓ |
| You decide | Planner picks theme. | |

**User's choice:** Warm, readable learner tool

---

## Navigation Model

### Q1: How does the sidebar scale for upcoming phases?

| Option | Description | Selected |
|--------|-------------|----------|
| Grouped sections | Labelled groups: "Practice Tools", "Exam Practice". Section dividers. | ✓ |
| Flat list | Add items as phases ship. Simple now, crowded at 7+ items. | |
| Top nav for primary sections | Top bar carries major sections; sidebar only for sub-navigation. | |

**User's choice:** Grouped sections (Recommended)

---

### Q2: Show coming-soon placeholder items?

| Option | Description | Selected |
|--------|-------------|----------|
| Show only existing sections | Navigation only contains what's built. | ✓ |
| Show coming-soon placeholders | Greyed-out items for upcoming phases. | |

**User's choice:** Show only existing sections (Recommended)

---

## Mobile / Responsive Layout

### Q1: How does sidebar behave at phone width?

| Option | Description | Selected |
|--------|-------------|----------|
| Bottom navigation bar | Fixed bottom nav with icons + labels below 640px. | ✓ |
| Hamburger menu / slide-in drawer | Menu icon opens drawer. | |
| Stack vertically | Nav stacks above content. | |

**User's choice:** Bottom navigation bar on mobile (Recommended)

---

### Q2: JSON Analysis layout at phone width?

| Option | Description | Selected |
|--------|-------------|----------|
| Natural reflow only | Tailwind responsive utilities handle single-column stacking. | ✓ |
| Phone-optimized layout | Distinct phone experience with compact metrics, collapsible sections. | |

**User's choice:** Natural reflow only (Recommended)

---

## Redesign Depth for Existing Panels

### Q1: How deep should JSON Analysis panel redesign go?

| Option | Description | Selected |
|--------|-------------|----------|
| CSS/hierarchy overhaul within existing component structure | Rewrite classNames to Tailwind + Shadcn, reorder hierarchy. Keep component tree and logic unchanged. | ✓ |
| Partial rebuild — restructure layout, keep logic | New sections/card groupings; logic stays. | |
| Full rebuild from design-first | Throw away existing markup, build fresh. | |

**User's choice:** CSS/hierarchy overhaul within existing component structure (Recommended)

---

### Q2: JSON input placement after analysis completes?

| Option | Description | Selected |
|--------|-------------|----------|
| Collapse to secondary / disclosure | Input moves to collapsible section once results are shown. | |
| Keep as is — input always visible | No change to input placement. | |
| You decide | Planner picks the right balance. | ✓ |

**User's choice:** You decide (deferred to Claude)

---

## Claude's Discretion

- JSON input placement/collapsibility — planner picks appropriate hierarchy balance.
- Exact Shadcn theme color values and component variant choices.
- Shadcn component selection (recommended core set is the starting point).
- Whether to include dark mode support (not required, acceptable if adds no scope).

## Deferred Ideas

None — discussion stayed within phase scope.

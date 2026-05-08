---
status: issues_found
phase: 06
reviewed: 2026-05-08T00:00:00Z
depth: standard
files_reviewed: 15
files_reviewed_list:
  - apps/web/app/globals.css
  - apps/web/app/page.test.tsx
  - apps/web/app/page.tsx
  - apps/web/components/json-analysis/ai-coach-tab.tsx
  - apps/web/components/json-analysis/json-analysis-panel.test.tsx
  - apps/web/components/json-analysis/json-analysis-panel.tsx
  - apps/web/components/json-analysis/pauses-tab.tsx
  - apps/web/components/json-analysis/phonemes-tab.tsx
  - apps/web/components/json-analysis/result-tabs.tsx
  - apps/web/components/json-analysis/saved-sessions-panel.test.tsx
  - apps/web/components/json-analysis/saved-sessions-panel.tsx
  - apps/web/components/json-analysis/summary-metric-cards.tsx
  - apps/web/components/json-analysis/test-fixtures.ts
  - apps/web/components/json-analysis/words-tab.tsx
  - apps/web/lib/saved-sessions/owner-key.ts
findings:
  critical: 2
  warning: 2
  info: 1
  total: 5
---

# Phase 6: Code Review Report

**Reviewed:** 2026-05-08T00:00:00Z  
**Depth:** standard  
**Files Reviewed:** 15  
**Status:** issues_found

## Summary

Reviewed Phase 6 learner dashboard analysis views, including JSON analysis dashboard UI, result tabs, saved sessions panel, tests, global CSS, and saved-session owner-key generation.

Validation performed:
- `pnpm --filter @localspeak/contracts build && pnpm --filter web check` — passed
- `pnpm --filter web test` — passed, 41 tests

The implementation is generally type-safe and covered by tests, but there are security and accessibility issues that should be addressed before relying on saved sessions for learner history.

## Critical Issues

### CR-01: Saved-session bearer owner key is sent in URLs

**File:** `apps/web/components/json-analysis/saved-sessions-panel.tsx:44-46`, `apps/web/components/json-analysis/saved-sessions-panel.tsx:84-86`

**Issue:** The saved-session `ownerKey` functions as a bearer credential: anyone with it can list or reopen saved learner sessions. The component sends it in query strings:

```ts
`/api/saved-sessions?ownerKey=${encodeURIComponent(ownerKey)}`
`/api/saved-sessions/${sessionId}?ownerKey=${encodeURIComponent(ownerKey)}`
```

Secrets in URLs are commonly captured in server/proxy logs, monitoring tools, browser/network history, and error telemetry. This can expose saved speaking attempts and learner feedback.

**Fix:** Move the owner key out of the URL and into a request header or request body, with corresponding backend support.

### CR-02: Owner-key fallback uses predictable randomness and can crash when `crypto` is absent

**File:** `apps/web/lib/saved-sessions/owner-key.ts:7-10`

**Issue:** The owner key is used as an access secret for saved sessions, but the fallback uses `Math.random()` plus `Date.now()`. `Math.random()` is not cryptographically secure. Additionally, `typeof crypto.randomUUID` can throw a `ReferenceError` if `crypto` itself is not defined.

**Fix:** Use `globalThis.crypto` safely and require cryptographically secure randomness. If secure crypto is unavailable, disable saved sessions or surface a safe error instead of generating a weak secret.

## Warnings

### WR-01: Nested `<main>` landmarks create invalid page structure

**File:** `apps/web/app/page.tsx:13`, `apps/web/components/json-analysis/json-analysis-panel.tsx:380`

**Issue:** `Home` renders a top-level `<main>`, and `JsonAnalysisPanel` renders another `<main>` inside it when JSON mode is selected. Nested `main` landmarks are invalid and can confuse screen-reader landmark navigation.

**Fix:** Keep only one page-level `<main>`. Change the inner component wrapper to a `section` or `div`.

### WR-02: Visually hidden file input has no visible keyboard focus indication

**File:** `apps/web/app/globals.css:419-426`

**Issue:** `.json-input-file` is clipped to a 1px invisible control. The upload control is keyboard-focusable, but the visible label styled as a button does not receive a focus-visible outline when the hidden input is focused.

**Fix:** Add a focus style to the visible label when the nested input is focused.

## Info

### IN-01: Preview error technical message always reports contract mismatch

**File:** `apps/web/components/json-analysis/json-analysis-panel.tsx:189-198`

**Issue:** The preview error handler sets the same technical message for both Zod contract failures and all other errors, hiding useful distinction between backend/network failures and actual contract mismatches.

**Fix:** Preserve a safe, non-sensitive distinction.

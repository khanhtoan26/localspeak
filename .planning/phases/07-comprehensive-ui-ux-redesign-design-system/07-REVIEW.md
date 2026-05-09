---
phase: 07-comprehensive-ui-ux-redesign-design-system
reviewed: 2026-05-09T00:00:00Z
depth: standard
files_reviewed: 20
files_reviewed_list:
  - apps/web/app/layout.tsx
  - apps/web/app/page.test.tsx
  - apps/web/app/page.tsx
  - apps/web/components/audio-mode/audio-mode-panel.tsx
  - apps/web/components/json-analysis/ai-coach-tab.tsx
  - apps/web/components/json-analysis/json-analysis-panel.test.tsx
  - apps/web/components/json-analysis/json-analysis-panel.tsx
  - apps/web/components/json-analysis/json-input-card.tsx
  - apps/web/components/json-analysis/pauses-tab.tsx
  - apps/web/components/json-analysis/phonemes-tab.tsx
  - apps/web/components/json-analysis/result-tabs.tsx
  - apps/web/components/json-analysis/saved-sessions-panel.tsx
  - apps/web/components/json-analysis/summary-metric-cards.tsx
  - apps/web/components/json-analysis/validation-preview-card.tsx
  - apps/web/components/json-analysis/words-tab.tsx
  - apps/web/components/status-card.tsx
  - apps/web/components/status-panel.tsx
  - apps/web/e2e/dashboard-ui.spec.ts
  - apps/web/e2e/responsive.spec.ts
  - apps/web/vitest.config.mts
findings:
  critical: 2
  warning: 3
  info: 2
  total: 7
status: issues_found
---

# Phase 07: Code Review Report

**Reviewed:** 2026-05-09T00:00:00Z
**Depth:** standard
**Files Reviewed:** 20
**Status:** issues_found

## Summary

This phase implements a full UI/UX redesign with a sidebar-left desktop layout, mobile bottom navigation, and a comprehensive JSON analysis dashboard. The component logic in the production source files is generally sound — state management, accessibility semantics, schema validation, and error handling are well-structured. The two critical bugs are both confined to the E2E test mocks: the API route stubs return response shapes that do not match the shared Zod contract schemas, causing the `SavedSessionsPanel` to always enter its error state during E2E runs. Warnings cover flaky timing patterns in E2E tests, duplicated fixture data, and a missing authentication header on the save request. Two info-level issues cover a redundant `aria-label` and commented fixture metadata.

---

## Critical Issues

### CR-01: E2E mock for `POST /api/saved-sessions` returns a response that fails contract schema validation

**File:** `apps/web/e2e/dashboard-ui.spec.ts:120-122` (same pattern at `apps/web/e2e/responsive.spec.ts:124`)

**Issue:** Both E2E files mock the save endpoint by returning `{ json: { session: null }, status: 201 }`. In `saved-sessions-panel.tsx` line 83, the panel calls `SavedSessionCreateResponseSchema.parse(await response.json())`. That schema is a `z.strictObject` requiring `{ contract: "saved-session-create.v1", session: SavedAnalysisSessionSchema }` — a non-nullable session with multiple required fields. Parsing `{ session: null }` throws a `ZodError`, which is caught and sets `saveStatus` to `"We couldn't save this result. Check your connection and try again."` So every E2E Save Result interaction silently reports failure. This means the save success path is never exercised in E2E and the visible UI state is incorrect.

**Fix:**
```typescript
// dashboard-ui.spec.ts and responsive.spec.ts — replace the POST stub body
await page.route("**/api/saved-sessions", async (route) => {
  if (route.request().method() === "GET") {
    await route.fulfill({
      json: { contract: "saved-session-list.v1", sessions: [] },
    });
    return;
  }
  // POST – return a shape that passes SavedSessionCreateResponseSchema
  await route.fulfill({
    json: {
      contract: "saved-session-create.v1",
      session: {
        id: "mock-session-id",
        ownerKey: "mock-owner-key-1234567890",
        createdAt: new Date().toISOString(),
        inputMode: "json",
        title: "Mock session",
        referenceText: null,
        pronunciationBand: 7,
        fluencyBand: 6.5,
        wpm: 118,
        phoneCount: null,
        wordCount: null,
        durationSeconds: null,
        hasFeedback: false,
      },
    },
    status: 201,
  });
});
```

---

### CR-02: E2E mock for `GET /api/saved-sessions` also returns an invalid response shape

**File:** `apps/web/e2e/dashboard-ui.spec.ts:116-119` (same at `apps/web/e2e/responsive.spec.ts:119-122`)

**Issue:** The GET stub returns `{ json: { sessions: [] } }`, which is missing the required `contract: "saved-session-list.v1"` field. `SavedSessionListResponseSchema` uses `z.strictObject` (strict mode rejects extra keys but also requires all declared keys). The parse at `saved-sessions-panel.tsx:57` throws a `ZodError`, which propagates to the catch block and sets `loadState` to `{ status: "error", message: "We couldn't load saved attempts. Refresh and try again." }`. The `SavedSessionsPanel` always shows its error state in every E2E test that reaches post-analysis UI.

**Fix:**
```typescript
// Replace the GET stub response in both spec files
await route.fulfill({
  json: { contract: "saved-session-list.v1", sessions: [] },
});
```

---

## Warnings

### WR-01: `page.waitForTimeout()` makes E2E tests flaky and slow

**File:** `apps/web/e2e/responsive.spec.ts:201`, `responsive.spec.ts:249`, `responsive.spec.ts:261`

**Issue:** Three tests use `await page.waitForTimeout(500)` after clicking "Analyze Pronunciation" to wait for the mocked API response to render. Fixed sleeps are a common cause of intermittent CI failures: under load the 500 ms may not be enough, and on fast machines the tests spend unnecessary time waiting. The correct Playwright idiom is to await a visible DOM assertion that becomes true when the response renders.

**Fix:**
```typescript
// Replace every waitForTimeout(500) with an explicit visibility assertion
await page.getByRole("heading", { name: "What should I practice next?" }).waitFor();
// or use:
await expect(page.getByTestId("summary-metric-label").first()).toBeVisible();
```

---

### WR-02: Entire fixture block duplicated verbatim between two E2E files

**File:** `apps/web/e2e/responsive.spec.ts:3-126` — duplicated from `apps/web/e2e/dashboard-ui.spec.ts`

**Issue:** The comment at line 3 of `responsive.spec.ts` explicitly notes "copied from dashboard-ui.spec.ts". `validPreview`, `analysisResponse`, and `mockDashboardApi` are identical in both files. If the contract fixture evolves (e.g., a field is added to `weakPhonemePatterns`), only one file gets updated and the other silently uses stale data, potentially masking test failures.

**Fix:** Extract the shared fixture data and `mockDashboardApi` helper into a shared module, for example `apps/web/e2e/fixtures/analysis.ts`, and import it in both spec files.

---

### WR-03: `handleSave` sends `ownerKey` in the request body but not in the `X-Localspeak-Owner-Key` header

**File:** `apps/web/components/json-analysis/saved-sessions-panel.tsx:77-81`

**Issue:** The list (`loadSessions`) and reopen (`handleReopen`) requests both send `ownerKey` as the `X-Localspeak-Owner-Key` request header. The save (`handleSave`) request sends `ownerKey` only inside the JSON body via `buildSaveRequest` (line 74), with no such header. This inconsistency means any server-side middleware that validates the owner key from the header (e.g., for rate-limiting or ownership enforcement) will not receive it on save requests. Whether this is a bug depends on the NestJS API implementation, but the client contract is inconsistent with its own GET/reopen pattern.

**Fix:**
```typescript
const response = await fetch("/api/saved-sessions", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-Localspeak-Owner-Key": ownerKey,   // add this line
  },
  body: JSON.stringify(body),
});
```

---

## Info

### IN-01: `Textarea` in `JsonInputCard` has a redundant `aria-label` that overrides its `<label>` association

**File:** `apps/web/components/json-analysis/json-input-card.tsx:70-81`

**Issue:** The `<label htmlFor="speech-json-input">` element correctly associates with `<Textarea id="speech-json-input" .../>`. The same element also carries `aria-label="Speech assessment JSON input"` with identical text. When both are present, assistive technologies use `aria-label` and ignore the associated `<label>` element's text. While not broken (both strings match), the redundancy is misleading to other developers and means the `<label>` click target works but contributes nothing to the accessible name computation.

**Fix:** Remove the `aria-label` from the `Textarea` and rely solely on the `htmlFor`/`id` association, which is the correct and sufficient pattern.

```tsx
<Textarea
  id="speech-json-input"
  className="font-mono min-h-[280px] resize-y bg-input w-full max-w-full"
  // Remove: aria-label="Speech assessment JSON input"
  placeholder="Paste the full speech assessment JSON here."
  value={jsonText}
  onChange={(event) => onJsonTextChange(event.target.value)}
  spellCheck={false}
/>
```

---

### IN-02: E2E fixture uses `ipaExamples: ["theta"]` (word) instead of the Unicode character `θ`

**File:** `apps/web/e2e/dashboard-ui.spec.ts:39`, `apps/web/e2e/dashboard-ui.spec.ts:86`, `apps/web/e2e/responsive.spec.ts:41`, `apps/web/e2e/responsive.spec.ts:88`

**Issue:** The IPA example is specified as the English word `"theta"` rather than the Unicode character `"θ"`. The E2E assertion at `dashboard-ui.spec.ts:145` correctly expects `"Start with the TH / theta sound pattern."` (matching the fixture), and `getVietnameseHint` in `phonemes-tab.tsx` correctly triggers on `pattern.arpabet.toLowerCase() === "th"` regardless of `ipaExamples`. However, real backend responses would return `"θ"`, so the fixture diverges from production data. Tests verifying IPA rendering would not catch regressions in Unicode handling.

**Fix:** Use the actual Unicode character `"θ"` in both E2E fixtures and update the corresponding assertion to `"Start with the TH / θ sound pattern."`:

```typescript
ipaExamples: ["θ"],  // was: ["theta"]
```

---

_Reviewed: 2026-05-09T00:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_

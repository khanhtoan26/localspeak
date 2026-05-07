# Phase 2: JSON Input & Pronunciation/Fluency Metrics - Research

**Researched:** 2026-05-07  
**Domain:** Next.js + NestJS + shared Zod contracts for deterministic speech-assessment JSON validation and metric computation  
**Confidence:** MEDIUM-HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

## Phase Boundary

Phase 2 turns the Phase 1 foundation into a JSON-mode analysis flow. Learners can paste or upload speech assessment JSON, validate it, send it to the backend, and receive deterministic pronunciation and fluency metrics. This phase does not call Gemini, process raw audio, save history, or build the full learner dashboard; those remain later roadmap phases.

## Implementation Decisions

### JSON submission flow
- **D-01:** Paste JSON is the primary input path; file upload is secondary.
- **D-02:** Include a one-click sample JSON action using `.artifacts/speech-response.json` so developers and learners can quickly see a working analysis.
- **D-03:** Analysis runs from a manual "Analyze JSON" action after the user has a validation preview. Do not auto-run full metrics immediately on paste.
- **D-04:** The NestJS backend owns JSON validation and deterministic metric computation. The frontend sends the JSON payload to the backend and renders the returned analysis.

### Validation error behavior
- **D-05:** Malformed JSON should show a friendly learner-facing summary first, with expandable technical details available.
- **D-06:** Show the most important 3-5 validation issues first, with full details available for debugging.
- **D-07:** Validation messages should include both a learner-friendly label and the exact JSON path.
- **D-08:** If JSON is valid enough to compute metrics but produces suspicious values, accept it, show warning callouts, and still compute metrics.

### Metric output priorities
- **D-09:** The primary summary should show pronunciation percentage, Pronunciation Band, Fluency Band, WPM, and pause ratio.
- **D-10:** Repeated weak-phoneme patterns should prioritize the top 5 weak ARPAbet phones by repeated low scores, with IPA examples.
- **D-11:** Word-level output should be a color-banded weak/okay/good word list with score and timing.
- **D-12:** Fluency output should include a notable pauses list with severity, duration, and nearby words.

### Result presentation style
- **D-13:** Use a single analysis page: input panel on top, results below in warm cards.
- **D-14:** Use lightweight result tabs: Summary, Words, Phonemes, Pauses.
- **D-15:** Deterministic explanations should be coach-like but clearly non-Gemini, using language like "This suggests..." rather than pretending to be an IELTS examiner.
- **D-16:** If an accepted JSON result has no major weak phoneme or pause problems, show a positive empty state such as "No repeated weak pattern found."

### the agent's Discretion
- No Phase 2 decisions were delegated to agent discretion.

### Deferred Ideas (OUT OF SCOPE)

- Gemini-generated IELTS feedback remains Phase 3.
- Audio upload, recording, streaming analysis, fillers, false starts, intonation, stress, and rhythm remain Phase 4.
- Supabase persistence and saved analysis history remain Phase 5.
- The full dashboard/header/tabs/timeline/chips design remains Phase 6; Phase 2 should implement only the minimal result presentation needed to verify metrics.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| JSON-01 | User can paste or upload speech assessment JSON matching the expected word/phoneme schema. | Use frontend textarea/upload/sample flow from UI spec and backend `SpeechAssessmentResponseSchema` as source of truth. [VERIFIED: `.planning/REQUIREMENTS.md`, `.planning/phases/02-json-input-pronunciation-fluency-metrics/02-UI-SPEC.md`, `packages/contracts/src/speech-assessment.ts`] |
| JSON-02 | App validates required JSON fields and surfaces actionable errors for malformed input. | Use local JSON syntax parsing only, then backend preview endpoint returning friendly labels, exact JSON paths, hints, and collapsed technical details. [VERIFIED: `02-CONTEXT.md`, `02-UI-SPEC.md`, `packages/contracts/src/speech-assessment.ts`] |
| JSON-03 | App extracts total score, reference text, word timings, word scores, ARPAbet phones, IPA labels, and phone scores from valid JSON. | Existing schema already requires `total_score`, `text_refs`, `result[*].start_time`, `result[*].end_time`, `result[*].score`, `result[*].phones[*].phone`, `phone_ipa`, and `score`; Phase 2 should add stricter `.min(1)` requirements where metric computation needs non-empty arrays. [VERIFIED: `packages/contracts/src/speech-assessment.ts`] |
| MET-01 | App computes per-phoneme average scores grouped by ARPAbet phone type. | Add pure metric function grouping `word.phones` by `phone` and averaging `score`. [VERIFIED: `.planning/PROJECT.md`; ASSUMED implementation shape] |
| MET-02 | App detects systematic pronunciation patterns when weak phoneme scores repeat at least twice below the configured threshold. | Use score `< 0.85` and count `>= 2` as the weak pattern rule. [VERIFIED: `.planning/PROJECT.md`] |
| MET-03 | App computes word quality bands and color categories from word scores. | UI spec requires Phase 2 word bands: Weak `< 0.65`, Okay `>= 0.65 && < 0.85`, Good `>= 0.85`; note this conflicts with older PROJECT thresholds and should be treated as the approved Phase 2 UI contract unless the user overrides. [VERIFIED: `02-UI-SPEC.md`; VERIFIED conflict: `.planning/PROJECT.md`] |
| MET-04 | App estimates IELTS Pronunciation band from configured score thresholds. | Use total score thresholds: `>=0.95 -> 8.5`, `>=0.90 -> 7.5`, `>=0.85 -> 7.0`, `>=0.80 -> 6.5`, `>=0.75 -> 6.0`, else `5.5`. [VERIFIED: `.planning/PROJECT.md`] |
| MET-05 | App computes pause gaps, pause severity, total pause time, pause ratio, duration, word count, and WPM from word timings. | Gap formula is `words[i].start_time - words[i-1].end_time`; pause ratio is total pause time divided by total duration; WPM is `wordCount / (durationSeconds / 60)`. [VERIFIED: `.planning/PROJECT.md`; WPM formula ASSUMED from standard definition] |
| MET-06 | App estimates IELTS Fluency band from critical pauses, pause ratio, and speech-rate evidence. | Project context gives ingredients but not a complete band rubric; use the provisional deterministic rubric in this research and mark as requiring user confirmation before locking. [VERIFIED partial: `.planning/PROJECT.md`; ASSUMED rubric] |
</phase_requirements>

## Project Constraints (from copilot-instructions.md)

- Use GSD workflow entry points before edits; do not make direct repo edits outside GSD unless explicitly asked. [VERIFIED: `copilot-instructions.md`]
- Follow existing patterns found in the codebase because project conventions are not yet fully documented. [VERIFIED: `copilot-instructions.md`]
- Tech stack is Next.js frontend, NestJS backend, Supabase, and Gemini by project direction, but Phase 2 must not call Gemini or Supabase. [VERIFIED: `copilot-instructions.md`, `02-CONTEXT.md`]
- Gemini API keys must stay server-side; frontend-only LLM calls are out of scope. [VERIFIED: `copilot-instructions.md`, `.planning/PROJECT.md`]
- The app is a monorepo and frontend/backend should be developed together with shared contracts where useful. [VERIFIED: `copilot-instructions.md`, `.planning/PROJECT.md`]
- Project skills directory exists under `.github/skills`, but no Phase 2-specific local skill was required for this research. [VERIFIED: `.github/skills` directory listing]

## Summary

Phase 2 should be planned as a three-layer feature: shared contract expansion in `packages/contracts`, deterministic backend validation/analysis in `apps/api`, and a single-page JSON analysis UI in `apps/web`. [VERIFIED: `02-CONTEXT.md`, `02-UI-SPEC.md`, `packages/contracts/src/json-analysis.ts`, `apps/api/src/app.module.ts`, `apps/web/app/page.tsx`] The backend must be the authoritative owner of schema validation and metrics, while the frontend may only parse JSON syntax locally to avoid sending unreadable text. [VERIFIED: `02-CONTEXT.md`, `02-UI-SPEC.md`]

The safest API shape is to add a dedicated JSON analysis module with `POST /json-analysis/preview`, `POST /json-analysis/analyze`, and `GET /json-analysis/sample`. [ASSUMED] The request body should wrap the pasted vendor payload as `{ speechAssessment: unknown }` for preview and `{ speechAssessment: SpeechAssessmentResponse }` for analysis. [VERIFIED existing shell: `packages/contracts/src/json-analysis.ts`; ASSUMED endpoint split] Returned issue paths should be relative to the pasted JSON root, e.g. `result[12].start_time`, not `speechAssessment.result[12].start_time`, because the learner edits the vendor JSON directly. [VERIFIED requirement: `02-CONTEXT.md`; ASSUMED implementation detail]

**Primary recommendation:** Plan Wave 1 for shared contracts + pure metric functions, Wave 2 for NestJS preview/analyze/sample endpoints, and Wave 3 for the Next.js single-page JSON input/results UI with end-to-end validation and regression tests. [ASSUMED planning structure]

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|--------------|----------------|-----------|
| JSON paste/upload/sample capture | Browser / Client | Frontend Server / API for sample route | The UI owns text input, file reading, disabled states, and rendering; a backend sample route avoids bundling filesystem artifacts into the client. [VERIFIED: `02-UI-SPEC.md`; ASSUMED sample route] |
| JSON syntax parse | Browser / Client | — | UI spec allows frontend syntax parsing only to avoid sending unreadable text. [VERIFIED: `02-UI-SPEC.md`] |
| Schema validation preview | API / Backend | Shared contracts | Backend is the source of truth and uses shared Zod schemas. [VERIFIED: `02-CONTEXT.md`, `02-UI-SPEC.md`, `packages/contracts/src/speech-assessment.ts`] |
| Deterministic pronunciation metrics | API / Backend | Shared contract types | Backend owns deterministic metric computation. [VERIFIED: `02-CONTEXT.md`] |
| Deterministic fluency metrics | API / Backend | Shared contract types | Backend computes timings, pause ratio, WPM, and fluency band. [VERIFIED: `.planning/PROJECT.md`, `02-CONTEXT.md`] |
| Result rendering | Browser / Client | Shared response schemas | Frontend renders backend outputs and validates response JSON with shared Zod before showing success, matching Phase 1 status-panel pattern. [VERIFIED: `apps/web/components/status-panel.tsx`, `02-UI-SPEC.md`] |
| Gemini/API-key security | API / Backend | — | Phase 2 must not call Gemini; future Gemini keys must remain server-side. [VERIFIED: `02-CONTEXT.md`, `.planning/PROJECT.md`] |
| Persistence/history | Database / Storage | API / Backend | Out of scope for Phase 2; Supabase history is Phase 5. [VERIFIED: `02-CONTEXT.md`, `.planning/ROADMAP.md`] |

## Standard Stack

### Core

| Library | Installed Version | Current npm Version Checked | Purpose | Why Standard |
|---------|-------------------|-----------------------------|---------|--------------|
| `zod` | `4.4.3` | `4.4.3`, modified `2026-05-04T18:06:03.234Z` | Runtime validation and inferred TypeScript contracts | Already used in shared contracts and frontend response parsing; `.safeParse()` returns success/error result with `ZodError.issues`. [VERIFIED: npm registry; VERIFIED: `packages/contracts/src/*.ts`; VERIFIED: local Zod README] |
| `@nestjs/common`, `@nestjs/core`, `@nestjs/platform-express` | `11.1.19` | `@nestjs/common@11.1.19`, modified `2026-04-13T07:52:25.034Z` | Backend module/controller routing | Existing API uses Nest modules/controllers and e2e testing with `AppModule`. [VERIFIED: npm registry; VERIFIED: `apps/api/src/app.module.ts`, `apps/api/src/contracts/contracts.controller.ts`] |
| `next` | `16.2.5` | `16.2.5`, modified `2026-05-06T23:59:28.778Z` | Frontend app and same-origin API rewrite | Existing web app rewrites `/api/:path*` to the Nest API and transpiles `@localspeak/contracts`. [VERIFIED: npm registry; VERIFIED: `apps/web/next.config.ts`] |
| `react` / `react-dom` | `19.2.6` | `19.2.6`, modified `2026-05-06T17:50:46.676Z` | Client UI | Existing Next app depends on React 19. [VERIFIED: npm registry; VERIFIED: `apps/web/package.json`] |
| `typescript` | `5.9.3` | Not rechecked against npm | Strict typing across monorepo | Root `tsconfig.base.json` sets strict TypeScript and all packages have `check` scripts. [VERIFIED: `tsconfig.base.json`, package scripts] |

### Supporting

| Library | Installed Version | Current npm Version Checked | Purpose | When to Use |
|---------|-------------------|-----------------------------|---------|-------------|
| `vitest` | `4.1.5` | `4.1.5`, modified `2026-05-05T10:41:50.265Z` | Contracts and web tests | Use for pure contract/metric tests and React component tests. [VERIFIED: npm registry; VERIFIED: `packages/contracts/package.json`, `apps/web/package.json`] |
| `jest` | `30.3.0` | `30.3.0`, modified `2026-03-10T02:00:06.708Z` | API unit/e2e tests | Use for NestJS service/controller/e2e tests, matching existing API pattern. [VERIFIED: npm registry; VERIFIED: `apps/api/package.json`, `apps/api/jest.config.ts`] |
| `supertest` | `7.2.2` | `7.2.2`, modified `2026-01-06T09:29:48.496Z` | HTTP e2e assertions | Use for `/json-analysis/*` e2e tests. [VERIFIED: npm registry; VERIFIED: `apps/api/test/contracts.e2e-spec.ts`] |
| `@testing-library/react` | `16.3.2` | `16.3.2`, modified `2026-01-19T10:59:08.691Z` | UI behavior tests | Use for paste/upload/sample/analyze UI flows. [VERIFIED: npm registry; VERIFIED: `apps/web/components/status-panel.test.tsx`] |
| `@testing-library/user-event` | `14.6.1` | Not rechecked against npm | User interaction simulation | Already used for button click tests; use for paste, upload, tab, and details toggles. [VERIFIED: `apps/web/components/status-panel.test.tsx`, `apps/web/package.json`] |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Shared Zod contracts | DTO classes with Nest `ValidationPipe` | Would duplicate schema logic and diverge from Phase 1 shared-contract decision. Do not switch in Phase 2. [VERIFIED: Phase 1 verification; ASSUMED tradeoff] |
| Backend metric computation | Frontend-only metric computation | Contradicts locked decision D-04 and makes future Gemini prompt construction less centralized. [VERIFIED: `02-CONTEXT.md`; ASSUMED future impact] |
| Third-party visualization/chart libraries | Manual cards/tabs/lists | UI spec forbids adding component libraries/registry blocks in Phase 2 and defers timelines/charts to Phase 6. [VERIFIED: `02-UI-SPEC.md`] |
| shadcn/ui | Existing manual CSS tokens | `components.json` was not detected and UI spec says do not introduce shadcn in Phase 2 without explicit approval. [VERIFIED: `02-UI-SPEC.md`] |

**Installation:**

No new packages are required for Phase 2. [VERIFIED: existing package manifests] If a planner nevertheless adds dependencies, it must justify them against the UI spec’s no-component-library/no-registry direction. [VERIFIED: `02-UI-SPEC.md`]

```bash
pnpm install
```

**Version verification commands run:**

```bash
npm view zod version time.modified
npm view @nestjs/common version time.modified
npm view next version time.modified
npm view react version time.modified
npm view vitest version time.modified
npm view jest version time.modified
npm view supertest version time.modified
npm view @testing-library/react version time.modified
pnpm -r list zod @nestjs/common next react vitest jest supertest @testing-library/react --depth 0
```

## Architecture Patterns

### System Architecture Diagram

```text
User paste/upload/sample JSON
        |
        v
Next.js JSON Analysis Page
  - local JSON.parse syntax check only
  - 600ms debounce before preview
  - shared Zod parsing of backend responses
        |
        | POST /api/json-analysis/preview
        v
NestJS JsonAnalysisController
  - maps body to shared contract
  - SpeechAssessmentResponseSchema.safeParse()
  - converts Zod issues to learner issues
  - computes warnings only, no full metrics
        |
        v
ValidationPreviewResponse
  - valid / valid_with_warnings / invalid
  - top issues + full issue details
  - exact JSON paths
        |
        v
User clicks "Analyze JSON"
        |
        | POST /api/json-analysis/analyze
        v
NestJS JsonAnalysisService
  - validates schema again
  - extracts words/phones/timings
  - computes pronunciation metrics
  - computes fluency metrics
  - returns deterministic response
        |
        v
Next.js Results UI
  - summary metric cards
  - Summary / Words / Phonemes / Pauses tabs
  - warning callouts
  - no Gemini, no persistence, no third-party sharing
```

[VERIFIED responsibilities: `02-CONTEXT.md`, `02-UI-SPEC.md`; ASSUMED endpoint names/service split]

### Recommended Project Structure

```text
packages/contracts/src/
├── speech-assessment.ts          # tighten speech assessment schema where metric computation needs non-empty arrays
├── json-analysis.ts              # expand request/response/result metric schemas
└── index.ts                      # already exports json-analysis and speech-assessment

packages/contracts/test/
├── speech-assessment.fixture.test.ts
└── json-analysis.metrics.test.ts # new pure contract/fixture expectations

apps/api/src/json-analysis/
├── json-analysis.module.ts
├── json-analysis.controller.ts
├── json-analysis.service.ts
├── json-analysis.metrics.ts      # pure deterministic metric functions
└── json-analysis.validation.ts   # Zod issue -> friendly issue mapping and warnings

apps/api/test/
├── json-analysis.e2e-spec.ts
└── json-analysis.service.spec.ts # optional if service logic not fully covered in contracts tests

apps/web/components/json-analysis/
├── json-analysis-panel.tsx
├── json-input-card.tsx
├── validation-preview-card.tsx
├── summary-metric-cards.tsx
├── result-tabs.tsx
├── words-tab.tsx
├── phonemes-tab.tsx
└── pauses-tab.tsx

apps/web/components/json-analysis/
└── json-analysis-panel.test.tsx

apps/web/app/
├── page.tsx                      # replace Phase 1 status panel with JSON analysis panel
└── globals.css                   # extend existing LocalSpeak tokens/classes
```

[ASSUMED file split; VERIFIED existing files: `packages/contracts/src/index.ts`, `apps/api/src/app.module.ts`, `apps/web/app/page.tsx`, `apps/web/app/globals.css`]

### Recommended API Endpoints and Contract Shapes

#### `GET /json-analysis/sample`

Use this endpoint to load the canonical sample into the textarea. [ASSUMED] The frontend calls it through `/api/json-analysis/sample` because `apps/web/next.config.ts` already rewrites `/api/:path*` to the API. [VERIFIED: `apps/web/next.config.ts`]

```ts
type JsonAnalysisSampleResponse = {
  contract: "speech-assessment-response.v1";
  speechAssessment: SpeechAssessmentResponse;
};
```

Rationale: the browser should not depend on importing `.artifacts/speech-response.json` directly from outside the app tree. [ASSUMED] The backend already imports the fixture in `ContractsController`, so this is consistent with Phase 1. [VERIFIED: `apps/api/src/contracts/contracts.controller.ts`]

#### `POST /json-analysis/preview`

```ts
type JsonAnalysisPreviewRequest = {
  speechAssessment: unknown;
};

type JsonAnalysisPreviewResponse = {
  contract: "json-analysis-preview.v1";
  status: "valid" | "valid_with_warnings" | "invalid";
  valid: boolean;
  acceptedForAnalysis: boolean;
  issueCount: number;
  issues: ValidationIssue[];
  warnings: ValidationWarning[];
};
```

Preview must not compute full pronunciation/fluency metrics. [VERIFIED: `02-UI-SPEC.md`]

#### `POST /json-analysis/analyze`

```ts
type JsonAnalysisRequest = {
  speechAssessment: SpeechAssessmentResponse;
};

type JsonAnalysisResponse = {
  contract: "json-analysis-response.v1";
  inputMode: "json";
  summary: JsonAnalysisSummary;
  extracted: ExtractedSpeechAssessment;
  pronunciation: PronunciationMetrics;
  fluency: FluencyMetrics;
  words: WordMetric[];
  phonemes: PhonemeMetric[];
  weakPhonemePatterns: WeakPhonemePattern[];
  pauses: PauseMetric[];
  warnings: ValidationWarning[];
};
```

Recommendation: do not echo the full original `speechAssessment` in the analysis response unless a test or downstream contract explicitly needs it. [ASSUMED] The existing shell currently includes `speechAssessment`, but omitting the echo reduces response size and avoids accidentally rendering raw vendor fields. [VERIFIED shell: `packages/contracts/src/json-analysis.ts`; ASSUMED security/payload rationale]

### Data Structures

```ts
type JsonPath = string; // e.g. "result[12].start_time"

type ValidationIssue = {
  severity: "error";
  code:
    | "invalid_json"
    | "missing_required_field"
    | "invalid_type"
    | "invalid_range"
    | "invalid_url"
    | "invalid_timing"
    | "empty_result"
    | "empty_phone_list";
  label: string;          // learner-friendly
  path: JsonPath;         // exact path relative to pasted JSON root
  message: string;        // concise explanation
  hint?: string;          // actionable fix
  technical?: string;     // collapsed by default; never stack traces/secrets
};

type ValidationWarning = {
  severity: "warning";
  code:
    | "overlapping_words"
    | "zero_duration_word"
    | "zero_duration_phone"
    | "unusual_duration"
    | "score_mismatch"
    | "very_low_word_count"
    | "very_high_wpm"
    | "very_low_wpm";
  label: string;
  path?: JsonPath;
  value?: number | string;
  message: string;
  hint?: string;
};

type ExtractedSpeechAssessment = {
  totalScore: number;       // 0..1
  referenceText: string;
  wordCount: number;
  phoneCount: number;
  durationSeconds: number;
};

type JsonAnalysisSummary = {
  pronunciationPercentage: number; // integer percent
  pronunciationBand: number;       // one decimal
  fluencyBand: number;             // one decimal
  wpm: number;                     // integer
  pauseRatio: number;              // 0..1
};

type WordBand = "weak" | "okay" | "good";

type WordMetric = {
  index: number;
  word: string;
  score: number;
  scorePercent: number;
  band: WordBand;
  startTime: number;
  endTime: number;
  duration: number;
};

type PhonemeMetric = {
  arpabet: string;
  ipaExamples: string[];
  averageScore: number;
  averageScorePercent: number;
  occurrenceCount: number;
  weakOccurrenceCount: number;
  exampleWords: string[];
};

type WeakPhonemePattern = {
  arpabet: string;
  ipaExamples: string[];
  averageScore: number;
  weakOccurrenceCount: number;
  exampleWords: string[];
};

type PauseSeverity = "natural" | "noticeable" | "critical";

type PauseMetric = {
  index: number;              // gap after word index
  severity: PauseSeverity;
  duration: number;
  startTime: number;
  endTime: number;
  beforeWord: string;
  afterWord: string;
  nearbyWords: string;
  explanation: string;
};

type PronunciationMetrics = {
  totalScore: number;
  percentage: number;
  band: number;
  phonemeAverages: PhonemeMetric[];
  weakPatterns: WeakPhonemePattern[];
  wordBandCounts: Record<WordBand, number>;
};

type FluencyMetrics = {
  durationSeconds: number;
  wordCount: number;
  wpm: number;
  totalPauseTime: number;
  pauseRatio: number;
  pauseCount: number;
  criticalPauseCount: number;
  band: number;
  notablePauses: PauseMetric[];
};
```

[VERIFIED field needs: `02-CONTEXT.md`, `02-UI-SPEC.md`, `.planning/REQUIREMENTS.md`; ASSUMED exact TypeScript names]

### Deterministic Metric Formulas and Thresholds

#### Extraction

```ts
const words = speechAssessment.result;
const totalScore = speechAssessment.total_score;
const referenceText = speechAssessment.text_refs;
const phones = words.flatMap((word) =>
  word.phones.map((phone) => ({ ...phone, word: word.word })),
);
```

Existing input schema fields include `result`, `text_refs`, `total_score`, word timings/scores, and phone ARPAbet/IPA scores. [VERIFIED: `packages/contracts/src/speech-assessment.ts`]

#### Pronunciation percentage

```ts
pronunciationPercentage = Math.round(total_score * 100);
```

Use `total_score` for the primary pronunciation percentage because Phase 2 success criteria require extracting total score and UI requires a pronunciation percentage summary. [VERIFIED: `.planning/ROADMAP.md`, `02-UI-SPEC.md`; ASSUMED exact formatting source]

#### IELTS-style Pronunciation band

```ts
function pronunciationBand(score: number): number {
  if (score >= 0.95) return 8.5;
  if (score >= 0.90) return 7.5;
  if (score >= 0.85) return 7.0;
  if (score >= 0.80) return 6.5;
  if (score >= 0.75) return 6.0;
  return 5.5;
}
```

This mapping is copied from `.planning/PROJECT.md`. [VERIFIED: `.planning/PROJECT.md`]

#### Phoneme averages

```ts
group phones by phone.phone;
averageScore = sum(score) / occurrenceCount;
weakOccurrenceCount = count(score < 0.85);
```

Per-phoneme averages are required by MET-01. [VERIFIED: `.planning/REQUIREMENTS.md`] The weak score threshold `< 0.85` is copied from `.planning/PROJECT.md`. [VERIFIED: `.planning/PROJECT.md`]

#### Repeated weak phoneme patterns

```ts
weakPatterns = phonemeAverages
  .filter((p) => p.weakOccurrenceCount >= 2)
  .sort((a, b) =>
    b.weakOccurrenceCount - a.weakOccurrenceCount ||
    a.averageScore - b.averageScore ||
    a.arpabet.localeCompare(b.arpabet)
  )
  .slice(0, 5);
```

Repeated weak pattern requires at least 2 low-scoring occurrences and the UI must show at most top 5 repeated weak ARPAbet phones with IPA examples. [VERIFIED: `.planning/PROJECT.md`, `02-CONTEXT.md`, `02-UI-SPEC.md`]

#### Word quality bands

Use the Phase 2 UI spec thresholds:

```ts
function wordBand(score: number): "weak" | "okay" | "good" {
  if (score < 0.65) return "weak";
  if (score < 0.85) return "okay";
  return "good";
}
```

The UI spec explicitly defines Weak `< 0.65`, Okay `>= 0.65 && < 0.85`, Good `>= 0.85`. [VERIFIED: `02-UI-SPEC.md`] `.planning/PROJECT.md` has older thresholds: Good `>= 0.9`, Okay `0.7-0.9`, Weak `< 0.7`; planner should treat this as a documented conflict and either implement the approved UI spec or ask the user to reconcile before execution. [VERIFIED: `.planning/PROJECT.md`, `02-UI-SPEC.md`]

#### Duration, WPM, and pause gaps

```ts
durationSeconds = lastWord.end_time - firstWord.start_time;
wordCount = words.length;
wpm = Math.round(wordCount / (durationSeconds / 60));

rawGap = words[i].start_time - words[i - 1].end_time;
gap = Math.max(0, rawGap);
```

The gap formula is copied from `.planning/PROJECT.md`. [VERIFIED: `.planning/PROJECT.md`] The WPM formula is standard words-per-minute arithmetic and should be confirmed if the product wants a different denominator. [ASSUMED]

#### Pause severity

Project context gives these thresholds:

```ts
acceptable: 0.3 <= gap < 0.5
warning:    0.5 <= gap < 1.0
critical:   gap >= 1.0
```

[VERIFIED: `.planning/PROJECT.md`]

Recommended Phase 2 UI label mapping:

```ts
function pauseSeverity(gap: number): "natural" | "noticeable" | "critical" | null {
  if (gap < 0.3) return null;          // not notable
  if (gap < 0.5) return "natural";     // project: acceptable
  if (gap < 1.0) return "noticeable";  // project: warning
  return "critical";                   // project: critical
}
```

The UI spec also lists `Long`, but project context says `>= 1.0s` is critical; do not introduce a separate `Long` threshold unless the user confirms it. [VERIFIED conflict: `.planning/PROJECT.md`, `02-UI-SPEC.md`]

#### Pause totals and pause ratio

```ts
notablePauses = gaps.filter((gap) => gap >= 0.3);
totalPauseTime = notablePauses.reduce((sum, p) => sum + p.duration, 0);
pauseRatio = totalPauseTime / durationSeconds;
```

Pause ratio is total pause time divided by total duration. [VERIFIED: `.planning/PROJECT.md`] Counting only notable pauses `>= 0.3s` for total pause time is recommended to align with the documented pause severity thresholds. [ASSUMED]

#### IELTS-style Fluency band

Project context says fluency band starts from critical pause count and pause ratio, with speech rate as supporting evidence, and Band 7+ speech-rate target is 140-160 WPM. [VERIFIED: `.planning/PROJECT.md`] It does not define a complete deterministic rubric. [VERIFIED: `.planning/PROJECT.md`] Use this provisional rubric only if the user confirms it:

```ts
function fluencyBand({
  criticalPauseCount,
  pauseRatio,
  wpm,
}: {
  criticalPauseCount: number;
  pauseRatio: number;
  wpm: number;
}): number {
  let band: number;

  if (criticalPauseCount >= 3 || pauseRatio >= 0.30) band = 5.5;
  else if (criticalPauseCount >= 2 || pauseRatio >= 0.20) band = 6.0;
  else if (criticalPauseCount >= 1 || pauseRatio >= 0.15) band = 6.5;
  else if (pauseRatio <= 0.10 && wpm >= 140 && wpm <= 160) band = 7.5;
  else band = 7.0;

  if (wpm < 100 || wpm > 190) band = Math.min(band, 6.0);
  else if (wpm < 120 || wpm > 180) band = Math.min(band, 6.5);

  return band;
}
```

[ASSUMED] Risk: if implemented without confirmation, MET-06 may pass technically but encode product scoring semantics the user did not approve. [ASSUMED]

### Canonical Fixture Observations

A local script parsed `.artifacts/speech-response.json` and found:

| Metric | Value |
|--------|-------|
| `success` | `true` |
| `total_score` | `0.8944649674274303` |
| Words | `81` |
| Phones | `255` |
| Duration | `31.740012228488922s` |
| WPM | `153.119...` |
| Positive gaps | `9` |
| Total notable pause time using `>=0.3s` | `10.550001621246338s` |
| Pause ratio using notable pauses | `0.332388...` |
| Pronunciation band using PROJECT thresholds | `7.0` |
| Top weak ARPAbet patterns by count | `T`, `Z`, `S`, `IH2`, `R` |

[VERIFIED: `.artifacts/speech-response.json` parsed locally]

This sample likely produces high pronunciation but low fluency if the provisional fluency rubric is used, because pause ratio is about 33% and there are multiple `>=1.0s` pauses. [VERIFIED sample metrics; ASSUMED rubric impact]

## Pattern 1: Shared Contract First

**What:** Expand `packages/contracts/src/json-analysis.ts` before API/web work so request and response schemas are importable by both consumers. [VERIFIED existing shell: `packages/contracts/src/json-analysis.ts`]  
**When to use:** Always for Phase 2 API response shapes. [ASSUMED]  
**Example:**

```ts
import { z } from "zod";
import { SpeechAssessmentResponseSchema } from "./speech-assessment";

export const ValidationIssueSchema = z.object({
  severity: z.literal("error"),
  code: z.string().min(1),
  label: z.string().min(1),
  path: z.string().min(1),
  message: z.string().min(1),
  hint: z.string().min(1).optional(),
  technical: z.string().min(1).optional(),
});

export const JsonAnalysisPreviewRequestSchema = z.looseObject({
  speechAssessment: z.unknown(),
});

export const JsonAnalysisRequestSchema = z.looseObject({
  speechAssessment: SpeechAssessmentResponseSchema,
});
```

Source: existing Zod contract pattern in `packages/contracts/src/json-analysis.ts` and `packages/contracts/src/speech-assessment.ts`. [VERIFIED: codebase]

## Pattern 2: Backend Revalidates on Analyze

**What:** The analyze endpoint must validate the payload even if preview previously succeeded. [ASSUMED]  
**When to use:** Always, because preview and analyze are separate HTTP requests and input may change between them. [ASSUMED]  
**Example:**

```ts
@Post("analyze")
analyze(@Body() body: unknown): JsonAnalysisResponse {
  const request = JsonAnalysisRequestSchema.safeParse(body);

  if (!request.success) {
    return invalidAnalysisResponseFromIssues(request.error.issues);
  }

  return this.jsonAnalysisService.analyze(request.data.speechAssessment);
}
```

Nest `@Post` and `@Body` decorators are available in `@nestjs/common`. [VERIFIED: local `@nestjs/common` type declarations]

## Pattern 3: Friendly Zod Issue Mapping

**What:** Convert Zod issue paths and codes into learner-facing labels while retaining technical details behind a disclosure. [VERIFIED requirement: `02-CONTEXT.md`, `02-UI-SPEC.md`]  
**When to use:** Preview invalid responses and analyze invalid responses. [ASSUMED]  
**Example path formatter:**

```ts
function formatPath(path: Array<string | number>): string {
  return path
    .map((part, index) =>
      typeof part === "number"
        ? `[${part}]`
        : index === 0
          ? part
          : `.${part}`,
    )
    .join("");
}
```

Zod errors expose granular issue data through `ZodError.issues`, and `safeParse()` returns either parsed data or a `ZodError`. [VERIFIED: local Zod README; VERIFIED: local Node safeParse check]

## Pattern 4: Pure Metric Functions

**What:** Put pronunciation and fluency metric code in pure functions with fixture regression tests. [ASSUMED]  
**When to use:** Metric computation should not depend on Nest controller state or React state. [ASSUMED]  
**Example:**

```ts
export function computePronunciationMetrics(
  speechAssessment: SpeechAssessmentResponse,
): PronunciationMetrics {
  const phonemes = collectPhones(speechAssessment.result);
  const phonemeAverages = computePhonemeAverages(phonemes);
  const weakPatterns = selectWeakPatterns(phonemeAverages);

  return {
    totalScore: speechAssessment.total_score,
    percentage: Math.round(speechAssessment.total_score * 100),
    band: pronunciationBand(speechAssessment.total_score),
    phonemeAverages,
    weakPatterns,
    wordBandCounts: countWordBands(speechAssessment.result),
  };
}
```

## Anti-Patterns to Avoid

- **Frontend-authoritative metrics:** Contradicts backend-owned metric decision and can diverge from future Gemini prompt inputs. [VERIFIED: `02-CONTEXT.md`; ASSUMED future risk]
- **Auto-analyzing on paste:** UI spec requires validation preview first and manual `Analyze JSON`. [VERIFIED: `02-UI-SPEC.md`]
- **Returning raw stack traces as learner messages:** UI spec says backend errors must not use raw stack traces as primary messages and technical details must be collapsed. [VERIFIED: `02-UI-SPEC.md`]
- **Adding charts/timelines now:** SVG timeline is deferred to Phase 6. [VERIFIED: `02-UI-SPEC.md`, `.planning/ROADMAP.md`]
- **Introducing Gemini copy or API calls:** Gemini feedback is Phase 3, and pasted JSON must not be sent to Gemini or third-party services in Phase 2. [VERIFIED: `02-CONTEXT.md`, `02-UI-SPEC.md`]
- **Using color alone for score/status:** UI spec requires text labels and accessible status. [VERIFIED: `02-UI-SPEC.md`]
- **Ignoring threshold conflicts:** Word band thresholds differ between PROJECT and UI spec; planner should choose the approved UI spec or ask for confirmation. [VERIFIED: `.planning/PROJECT.md`, `02-UI-SPEC.md`]

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Runtime JSON schema validation | Custom nested `if` validators | Zod schemas in `packages/contracts` | Existing Phase 1 contract package already uses Zod and fixture tests. [VERIFIED: `packages/contracts/src/speech-assessment.ts`, Phase 1 verification] |
| HTTP routing/module structure | Ad-hoc Node server routes | NestJS controller/module/service pattern | Existing API is NestJS with `AppModule`, `ContractsModule`, and e2e tests. [VERIFIED: `apps/api/src/app.module.ts`, `apps/api/src/contracts/contracts.module.ts`] |
| Frontend response trust | Rendering `await response.json()` directly | Shared Zod response parsing before success UI | Existing `StatusPanel` parses backend responses with Zod before rendering success states. [VERIFIED: `apps/web/components/status-panel.tsx`] |
| File upload parsing libraries | Heavy upload/dropzone library | Native `<input type="file" accept=".json,application/json">` + `File.text()` | UI spec says upload is secondary, max 2MB, and no component library is required. [VERIFIED: `02-UI-SPEC.md`; ASSUMED native API adequacy] |
| Chart/timeline library | Recharts/D3/custom SVG timeline | Text list of notable pauses | Timeline visuals are deferred to Phase 6. [VERIFIED: `02-UI-SPEC.md`] |
| LLM/examiner explanations | Gemini prompt/copy in Phase 2 | Deterministic coach-like copy | Phase 2 explicitly excludes Gemini and examiner-like claims. [VERIFIED: `02-CONTEXT.md`, `02-UI-SPEC.md`] |

**Key insight:** The complex part is not UI chrome; it is keeping validation, metrics, response contracts, and tests deterministic and centralized so future Gemini feedback can consume stable backend outputs. [ASSUMED]

## Common Pitfalls

### Pitfall 1: Preview and Analyze Drift

**What goes wrong:** Preview accepts a JSON payload, but analyze computes from a different or stale payload. [ASSUMED]  
**Why it happens:** Frontend state changes after preview, or analyze endpoint assumes preview already validated. [ASSUMED]  
**How to avoid:** Revalidate on analyze; mark results stale when input changes after successful analysis. [VERIFIED stale UI behavior: `02-UI-SPEC.md`; ASSUMED backend revalidation]  
**Warning signs:** Tests only cover preview or only cover analyze, not changed-input behavior. [ASSUMED]

### Pitfall 2: Wrong JSON Paths

**What goes wrong:** Errors show `speechAssessment.result.0.score` while the learner sees raw vendor JSON with `result[0].score`. [ASSUMED]  
**Why it happens:** Backend returns wrapper schema paths directly. [ASSUMED]  
**How to avoid:** Strip request wrapper prefix from preview/analyze validation issues and format array indexes with brackets. [ASSUMED]  
**Warning signs:** UI issue rows cannot be searched in the pasted JSON. [ASSUMED]

### Pitfall 3: Division by Zero / Empty Arrays

**What goes wrong:** Empty `result` or empty `phones` arrays pass schema but produce `NaN` metrics. [VERIFIED current schema allows arrays without `.min(1)`: `packages/contracts/src/speech-assessment.ts`; ASSUMED outcome]  
**Why it happens:** Existing schema uses `z.array(...)` without minimum length. [VERIFIED: `packages/contracts/src/speech-assessment.ts`]  
**How to avoid:** Add stricter Phase 2 analysis schema or post-schema validation requiring non-empty `result` and enough phone data. [ASSUMED]  
**Warning signs:** WPM, pause ratio, or average phoneme scores become `NaN`, `Infinity`, or empty while response says valid. [ASSUMED]

### Pitfall 4: Pause Ratio Semantics

**What goes wrong:** One implementation counts every tiny positive gap, another counts only gaps `>=0.3s`, causing fluency band drift. [ASSUMED]  
**Why it happens:** PROJECT defines severity thresholds but not whether total pause time includes sub-0.3s gaps. [VERIFIED: `.planning/PROJECT.md`]  
**How to avoid:** Lock `totalPauseTime` to notable pauses `>=0.3s` for Phase 2, or ask the user before implementation. [ASSUMED]  
**Warning signs:** Fixture regression values change after harmless refactors. [ASSUMED]

### Pitfall 5: Backend Request Size Mismatch

**What goes wrong:** UI accepts a 2MB JSON file, but backend rejects the POST body before controller validation. [ASSUMED]  
**Why it happens:** Upload limit and server JSON body limit are configured separately. [ASSUMED]  
**How to avoid:** Explicitly configure backend JSON body size to match the UI’s 2MB max, and return friendly errors for too-large requests. [VERIFIED UI max: `02-UI-SPEC.md`; ASSUMED backend config need]  
**Warning signs:** Browser shows generic network/backend unavailable errors for large but allowed files. [ASSUMED]

### Pitfall 6: Threshold Conflict Between PROJECT and UI Spec

**What goes wrong:** Tests fail or UI expectations differ because word bands use 0.7/0.9 in one layer and 0.65/0.85 in another. [VERIFIED conflict: `.planning/PROJECT.md`, `02-UI-SPEC.md`]  
**Why it happens:** UI spec approved newer Phase 2 display thresholds but PROJECT retains older thresholds. [VERIFIED: `.planning/PROJECT.md`, `02-UI-SPEC.md`]  
**How to avoid:** Use a single exported constants object and document the selected source. [ASSUMED]  
**Warning signs:** Fixture word band counts differ: with UI thresholds sample is 57 good / 19 okay / 5 weak; with PROJECT thresholds sample is 48 good / 26 okay / 7 weak. [VERIFIED: local fixture computation]

## Code Examples

### Zod-Friendly Path Formatting

```ts
function formatJsonPath(path: Array<string | number>): string {
  if (path.length === 0) return "$";

  return path
    .map((part, index) => {
      if (typeof part === "number") return `[${part}]`;
      return index === 0 ? part : `.${part}`;
    })
    .join("");
}
```

Source: built from Zod issue path arrays observed via local `safeParse()` check. [VERIFIED: local Node check]

### Pronunciation Band

```ts
export function pronunciationBand(score: number): number {
  if (score >= 0.95) return 8.5;
  if (score >= 0.9) return 7.5;
  if (score >= 0.85) return 7.0;
  if (score >= 0.8) return 6.5;
  if (score >= 0.75) return 6.0;
  return 5.5;
}
```

Source: `.planning/PROJECT.md`. [VERIFIED: `.planning/PROJECT.md`]

### Pause Extraction

```ts
export function computePauses(words: SpeechWord[]): PauseMetric[] {
  return words
    .slice(1)
    .map((word, offset) => {
      const previousIndex = offset;
      const previous = words[previousIndex];
      const rawGap = word.start_time - previous.end_time;
      const duration = Math.max(0, rawGap);
      const severity = pauseSeverity(duration);

      if (!severity) return null;

      return {
        index: previousIndex,
        severity,
        duration,
        startTime: previous.end_time,
        endTime: word.start_time,
        beforeWord: previous.word,
        afterWord: word.word,
        nearbyWords: `${previous.word} ${word.word}`,
        explanation:
          severity === "critical"
            ? "This suggests a planning or word-search pause."
            : "This pause is noticeable in the word timing data.",
      };
    })
    .filter((pause): pause is PauseMetric => pause !== null)
    .sort((a, b) => b.duration - a.duration);
}
```

Source: pause gap/severity requirements from `.planning/PROJECT.md` and UI pause row contract from `02-UI-SPEC.md`. [VERIFIED: project docs; ASSUMED exact wording]

### Existing Frontend Response-Parse Pattern

```ts
const data = ContractResponseSchema.parse(await response.json());
if (!data.valid) {
  setContractFixture({
    badge: "Invalid",
    detail: CONTRACT_INVALID_COPY,
    meta: `issues: ${data.issues.length}`,
  });
  return;
}
```

Source: `apps/web/components/status-panel.tsx`. [VERIFIED: codebase]

## Existing Code Patterns and Files Likely to Modify

| File | Action |
|------|--------|
| `packages/contracts/src/speech-assessment.ts` | Tighten arrays needed for analysis or create analysis-specific schema refinements; preserve unknown vendor fields. [VERIFIED existing schema] |
| `packages/contracts/src/json-analysis.ts` | Expand request/preview/response schemas and exported TypeScript types. [VERIFIED existing shell] |
| `packages/contracts/src/index.ts` | Already exports `json-analysis`; ensure new schemas/types are exported by that module. [VERIFIED existing barrel] |
| `packages/contracts/test/speech-assessment.fixture.test.ts` | Add stricter fixture coverage if schema changes. [VERIFIED existing tests] |
| `packages/contracts/test/json-analysis.metrics.test.ts` | Add fixture regression tests for band, word counts, phoneme patterns, pauses, WPM, and warning behavior. [ASSUMED new file] |
| `apps/api/src/app.module.ts` | Import `JsonAnalysisModule`. [VERIFIED module wiring pattern] |
| `apps/api/src/json-analysis/*` | Add new Nest module/controller/service and pure metrics helpers. [ASSUMED new files] |
| `apps/api/test/json-analysis.e2e-spec.ts` | Add endpoint e2e tests for sample, preview, analyze, invalid schema, warnings, and no secret leaks. [ASSUMED new file] |
| `apps/web/app/page.tsx` | Replace Phase 1 `StatusPanel` page with JSON analysis panel. [VERIFIED current page] |
| `apps/web/components/status-card.tsx` | Reuse or generalize warm card/accessibility pattern if helpful. [VERIFIED existing component] |
| `apps/web/components/status-panel.tsx` | Replace or leave unused; current fetch/parse pattern should be copied. [VERIFIED existing component] |
| `apps/web/app/globals.css` | Extend existing warm LocalSpeak CSS tokens and classes; do not introduce shadcn. [VERIFIED CSS and UI spec] |
| `apps/web/components/json-analysis/*.tsx` | Add UI components for input, validation, summary cards, tabs. [ASSUMED new files] |
| `apps/web/components/json-analysis/*.test.tsx` | Add frontend behavior tests. [ASSUMED new files] |

## State of the Art

| Old Approach | Current Phase 2 Approach | When Changed | Impact |
|--------------|--------------------------|--------------|--------|
| Foundation status page only | JSON analysis single page with input panel and deterministic results | Phase 2 | `apps/web/app/page.tsx` should no longer only render `StatusPanel`. [VERIFIED: Phase 1 files; VERIFIED: `02-UI-SPEC.md`] |
| Contract shell with empty metric objects | Full JSON analysis contracts with preview, warnings, pronunciation, fluency, words, phonemes, pauses | Phase 2 | Planner must schedule contract work before API/web consumers. [VERIFIED: `packages/contracts/src/json-analysis.ts`; ASSUMED sequencing] |
| `/contracts/sample-json/validate` fixture health endpoint | Dedicated JSON analysis preview/analyze/sample endpoints | Phase 2 | Keep Phase 1 health endpoint if tests rely on it, but add feature endpoints for learner flow. [VERIFIED existing endpoint; ASSUMED route additions] |
| PROJECT word bands 0.7/0.9 | UI spec word bands 0.65/0.85 | Phase 2 UI spec approval | Planner must reconcile or implement UI spec. [VERIFIED conflict] |

**Deprecated/outdated:**
- Treating `JsonAnalysisResponseSchema.pronunciation` and `.fluency` as loose empty objects is insufficient for Phase 2 metrics. [VERIFIED: `packages/contracts/src/json-analysis.ts`; ASSUMED "insufficient" based on requirements]
- Full dashboard/timeline/Gemini IELTS tab is out of scope for Phase 2. [VERIFIED: `02-UI-SPEC.md`, `.planning/ROADMAP.md`]

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Use `GET /json-analysis/sample`, `POST /json-analysis/preview`, and `POST /json-analysis/analyze`. | API endpoints | Route names may need to align with a preferred API convention. |
| A2 | Do not echo full original speech assessment in analysis response. | API contract | Existing shell currently includes `speechAssessment`; downstream tests might expect echo unless updated. |
| A3 | WPM is `wordCount / (durationSeconds / 60)`. | Metric formulas | Product may prefer excluding long pauses or using audio duration if available. |
| A4 | Total pause time should include notable pauses `>=0.3s`, not every tiny positive gap. | Metric formulas | Pause ratio and fluency band will differ if all positive gaps are counted. |
| A5 | Provisional Fluency band rubric thresholds. | Metric formulas | This is the highest-risk assumption; user should confirm before implementation. |
| A6 | Browser should load sample through backend rather than direct `.artifacts` import. | Architecture patterns | A direct import/static copy might be acceptable if the project prefers no new sample endpoint. |
| A7 | Configure backend body size explicitly to match 2MB UI max. | Security/pitfalls | Actual Nest/Express default behavior was not verified in this session. |
| A8 | Pure metric functions should live in API or shared non-UI helpers rather than contracts package. | Recommended structure | If contracts package is meant to be schema-only, API-local is correct; if future packages need metrics, a shared utility package may be better. |
| A9 | Pause label `Long` should not be used without confirmation because PROJECT says `>=1.0s` is critical. | Metric formulas | UI may require all four labels: Natural, Noticeable, Long, Critical. |

## Open Questions

1. **Which word band thresholds are authoritative?**
   - What we know: `.planning/PROJECT.md` says Good `>=0.9`, Okay `0.7-0.9`, Weak `<0.7`; approved UI spec says Good `>=0.85`, Okay `>=0.65 && <0.85`, Weak `<0.65`. [VERIFIED: `.planning/PROJECT.md`, `02-UI-SPEC.md`]
   - What's unclear: Whether UI spec intentionally revised the metric thresholds or only visual thresholds. [ASSUMED]
   - Recommendation: Use the approved UI spec for Phase 2, but log the conflict and ask the user if strict metric semantics matter. [ASSUMED]

2. **What is the exact Fluency band rubric?**
   - What we know: It must use critical pauses, pause ratio, and speech-rate evidence; Band 7+ target is 140-160 WPM. [VERIFIED: `.planning/PROJECT.md`]
   - What's unclear: Exact pause-ratio thresholds and how WPM caps/boosts the band. [VERIFIED absence in `.planning/PROJECT.md`]
   - Recommendation: Confirm the provisional rubric before execution or implement with constants clearly named `PROVISIONAL_FLUENCY_BAND_THRESHOLDS`. [ASSUMED]

3. **How should the UI use the `Long` pause label?**
   - What we know: UI spec lists Natural, Noticeable, Long, Critical; PROJECT says `>=1.0s` is critical. [VERIFIED: `02-UI-SPEC.md`, `.planning/PROJECT.md`]
   - What's unclear: Whether Long should be an intermediate label above 1.0s or a display alias. [ASSUMED]
   - Recommendation: Use Natural/Noticeable/Critical now and ask before adding Long. [ASSUMED]

4. **Should the analysis response include the full original JSON?**
   - What we know: Existing `JsonAnalysisResponseSchema` shell includes `speechAssessment`. [VERIFIED: `packages/contracts/src/json-analysis.ts`]
   - What's unclear: Whether that was intentional for Phase 2 rendering/debugging or just a placeholder. [ASSUMED]
   - Recommendation: Avoid echoing full input unless tests or user requirements demand it. [ASSUMED]

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|-------------|-----------|---------|----------|
| Node.js | Next/Nest/pnpm scripts | ✓ | `v22.22.2` | None needed. [VERIFIED: local command] |
| pnpm | Workspace scripts | ✓ | `10.33.0` | None needed. [VERIFIED: local command; root `package.json`] |
| npm | Version verification | ✓ | `10.9.7` | Use package manifests if registry unavailable. [VERIFIED: local command] |
| git | Normal GSD workflow/verification | ✓ | `2.43.0` | None needed. [VERIFIED: local command] |
| Python 3 | Research-only fixture inspection | ✓ | `3.12.3` | Not required for implementation. [VERIFIED: local command] |
| Context7 CLI | Docs lookup | ✗ | `ctx7` fetch failed | Use official docs/local package docs/codebase verification. [VERIFIED: failed `npx ctx7` attempts] |
| Brave/Exa/Firecrawl | Web research | ✗ | Disabled in `.planning/config.json` | Use npm registry and official docs where reachable. [VERIFIED: `.planning/config.json`] |

**Missing dependencies with no fallback:**
- None for implementation. [VERIFIED: local environment audit]

**Missing dependencies with fallback:**
- Context7 docs lookup failed with `fetch failed`; use official docs/local installed package docs/codebase verification. [VERIFIED: command output]

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Contracts framework | Vitest `4.1.5`; config `packages/contracts/vitest.config.mts`; command `pnpm --filter @localspeak/contracts test`. [VERIFIED: package list, test config discovery] |
| API framework | Jest `30.3.0` + Supertest `7.2.2`; config `apps/api/jest.config.ts`; quick command `pnpm --filter api test:e2e -- --runTestsByPath test/json-analysis.e2e-spec.ts`; full command `pnpm --filter api test`. [VERIFIED: package list, `apps/api/package.json`; ASSUMED new test path] |
| Web framework | Vitest `4.1.5` + Testing Library React `16.3.2`; config `apps/web/vitest.config.mts`; quick command `pnpm --filter web test -- components/json-analysis/json-analysis-panel.test.tsx`; full command `pnpm --filter web test`. [VERIFIED: package list, config; ASSUMED new test path] |
| Full repository gate | `pnpm check && pnpm test && pnpm build`. [VERIFIED: root package scripts] |

### Existing Baseline Results

- `pnpm --filter @localspeak/contracts test` passed 5 tests. [VERIFIED: command output]
- `pnpm --filter api test:e2e` passed 2 e2e suites. [VERIFIED: command output]
- `pnpm --filter web test` passed 4 component tests. [VERIFIED: command output]
- `pnpm check` passed across contracts, API, and web. [VERIFIED: command output]

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|--------------|
| JSON-01 | Paste/upload/sample JSON can populate input and send wrapped speech assessment to backend. | Web component + API e2e | `pnpm --filter web test -- components/json-analysis/json-analysis-panel.test.tsx` and `pnpm --filter api test:e2e -- --runTestsByPath test/json-analysis.e2e-spec.ts` | ❌ Wave 0 |
| JSON-02 | Invalid/malformed input surfaces friendly issue labels, exact paths, top 3-5 issues, technical details collapsed. | Contracts unit + API e2e + web component | `pnpm --filter @localspeak/contracts test` and API/web quick tests | ❌ Wave 0 |
| JSON-03 | Valid fixture extracts total score, text, word timings/scores, ARPAbet, IPA, phone scores. | Contracts fixture regression + API e2e | `pnpm --filter @localspeak/contracts test -- test/json-analysis.metrics.test.ts` | ❌ Wave 0 |
| MET-01 | Per-phoneme average scores grouped by ARPAbet. | Unit/fixture | `pnpm --filter @localspeak/contracts test -- test/json-analysis.metrics.test.ts` or API service test | ❌ Wave 0 |
| MET-02 | Weak phoneme patterns require score `<0.85` repeated at least twice and top 5 output. | Unit/fixture | Same as above | ❌ Wave 0 |
| MET-03 | Word bands use selected thresholds and include score/timing. | Unit + web render | Contracts/API metric test + web component test | ❌ Wave 0 |
| MET-04 | Pronunciation band uses configured thresholds. | Unit | Contracts/API metric test | ❌ Wave 0 |
| MET-05 | Pause gaps/severity/total pause time/pause ratio/duration/word count/WPM computed from timings. | Unit/fixture | Contracts/API metric test | ❌ Wave 0 |
| MET-06 | Fluency band uses critical pauses, pause ratio, and WPM evidence. | Unit/fixture | Contracts/API metric test | ❌ Wave 0 pending rubric confirmation |

### Sampling Rate

- **Per task commit:** `pnpm --filter @localspeak/contracts test` for contract/metric tasks; `pnpm --filter api test:e2e -- --runTestsByPath test/json-analysis.e2e-spec.ts` for API tasks; `pnpm --filter web test -- components/json-analysis/json-analysis-panel.test.tsx` for UI tasks. [ASSUMED commands after files exist]
- **Per wave merge:** `pnpm check && pnpm test`. [VERIFIED root scripts]
- **Phase gate:** `pnpm check && pnpm test && pnpm build` must be green before `/gsd-verify-work`. [VERIFIED root scripts; ASSUMED gate]

### Wave 0 Gaps

- [ ] `packages/contracts/test/json-analysis.metrics.test.ts` — covers JSON-03, MET-01, MET-02, MET-03, MET-04, MET-05, MET-06. [ASSUMED new file]
- [ ] `apps/api/test/json-analysis.e2e-spec.ts` — covers preview/analyze/sample endpoint behavior and invalid/warning cases. [ASSUMED new file]
- [ ] `apps/web/components/json-analysis/json-analysis-panel.test.tsx` — covers paste, upload validation, sample load, disabled Analyze, warning/error display, tabs, and response contract parsing. [ASSUMED new file]
- [ ] Fluency band constants/rubric confirmation — covers MET-06. [ASSUMED blocker]
- [ ] Test fixture variants for missing required field, malformed type, overlapping timings, empty result, empty phones, suspicious WPM, and no weak/no pause positive empty states. [ASSUMED new fixtures]

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|------------------|
| V2 Authentication | No for Phase 2 | Supabase Auth is Phase 5 and no user session is required now. [VERIFIED: `.planning/ROADMAP.md`, `02-CONTEXT.md`] |
| V3 Session Management | No for Phase 2 | No saved sessions or auth state in this phase. [VERIFIED: `02-CONTEXT.md`] |
| V4 Access Control | Low | Keep endpoints unauthenticated for local JSON mode unless future auth is introduced; do not expose secrets. [ASSUMED endpoint auth] |
| V5 Input Validation | Yes | Use shared Zod contracts and backend validation source of truth. [VERIFIED: `packages/contracts/src/speech-assessment.ts`, `02-CONTEXT.md`] |
| V6 Cryptography | No direct crypto | Do not handle secrets in Phase 2 except preserving backend-only Gemini/Supabase env separation. [VERIFIED: `.planning/PROJECT.md`, Phase 1 verification] |
| V8 Data Protection | Yes | Do not send pasted JSON to Gemini or third parties; do not persist analysis history in Phase 2. [VERIFIED: `02-CONTEXT.md`, `02-UI-SPEC.md`] |
| V12 File and Resources | Yes | Enforce `.json`/`application/json`, max 2MB upload in UI, and matching backend body-size guard. [VERIFIED UI max: `02-UI-SPEC.md`; ASSUMED backend guard] |
| V14 Configuration | Yes | Ensure no secret/env values appear in validation errors or technical details. [VERIFIED UI spec prohibits secrets in technical details] |

### Known Threat Patterns for This Stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Oversized JSON body causing memory/CPU pressure | Denial of Service | UI max 2MB, backend explicit JSON/body limit, reject too-large input with friendly error. [VERIFIED UI: `02-UI-SPEC.md`; ASSUMED backend implementation] |
| Secret leakage in technical details | Information Disclosure | Never include env vars, stack traces, or process config in learner messages; collapsed technical details may include parser/Zod path/status only. [VERIFIED: `02-UI-SPEC.md`] |
| Third-party JSON sharing | Information Disclosure | Do not call Gemini, analytics, or external services with pasted JSON in Phase 2. [VERIFIED: `02-CONTEXT.md`, `02-UI-SPEC.md`] |
| HTML/script injection via words or reference text | Cross-site scripting | React escapes text by default when rendering strings; do not use `dangerouslySetInnerHTML` for words, paths, or technical details. [ASSUMED React behavior; VERIFIED no need for HTML in UI spec] |
| Contract bypass | Tampering | Backend revalidates on analyze even after preview; frontend validates backend response with shared Zod before rendering success. [ASSUMED revalidate; VERIFIED existing frontend parse pattern] |
| Path confusion in errors | Spoofing/Tampering UX | Return exact JSON paths relative to pasted root and include labels/hints. [VERIFIED: `02-CONTEXT.md`, `02-UI-SPEC.md`] |
| Suspicious-but-computable values silently accepted | Integrity/UX | Return warnings and still compute metrics. [VERIFIED: `02-CONTEXT.md`, `02-UI-SPEC.md`] |

## Sources

### Primary (HIGH confidence)

- `.planning/phases/02-json-input-pronunciation-fluency-metrics/02-CONTEXT.md` — locked Phase 2 decisions, boundary, validation behavior, output priorities. [VERIFIED: codebase]
- `.planning/phases/02-json-input-pronunciation-fluency-metrics/02-UI-SPEC.md` — approved UI contract, upload limit, tabs, copy, word band thresholds, accessibility, API/UI boundary. [VERIFIED: codebase]
- `.planning/PROJECT.md` — metric thresholds for weak phonemes, pronunciation band, pause severity, pause ratio, WPM target. [VERIFIED: codebase]
- `.planning/REQUIREMENTS.md` — JSON-01 through JSON-03 and MET-01 through MET-06. [VERIFIED: codebase]
- `.planning/ROADMAP.md` — Phase 2 goal, success criteria, dependencies, deferred phases. [VERIFIED: codebase]
- `.planning/phases/01-monorepo-foundation-contracts/01-VERIFICATION.md` — verified Phase 1 foundation, commands, endpoints, tests. [VERIFIED: codebase]
- `packages/contracts/src/speech-assessment.ts` — current speech assessment Zod schema. [VERIFIED: codebase]
- `packages/contracts/src/json-analysis.ts` — current JSON analysis contract shell. [VERIFIED: codebase]
- `.artifacts/speech-response.json` — canonical fixture and computed sample metrics. [VERIFIED: codebase + local parse]
- `apps/api/src/contracts/contracts.controller.ts`, `apps/api/test/contracts.e2e-spec.ts` — existing API fixture validation/e2e pattern. [VERIFIED: codebase]
- `apps/web/components/status-panel.tsx`, `apps/web/components/status-panel.test.tsx`, `apps/web/components/status-card.tsx`, `apps/web/app/globals.css` — existing web fetch/parse/UI/test patterns. [VERIFIED: codebase]
- npm registry via `npm view` — current package versions and modified dates for core libraries. [VERIFIED: npm registry]
- Local baseline commands: `pnpm check`, contracts Vitest, API Jest e2e, web Vitest all passed. [VERIFIED: local command output]

### Secondary (MEDIUM confidence)

- Official NestJS docs page `https://docs.nestjs.com/controllers` was reachable, but detailed content was not scraped beyond reachability preview. [CITED: docs.nestjs.com/controllers]
- Official Next rewrites docs page `https://nextjs.org/docs/app/api-reference/config/next-config-js/rewrites` was reachable, but detailed content was not scraped beyond reachability preview. [CITED: nextjs.org/docs/app/api-reference/config/next-config-js/rewrites]
- Official Vitest guide `https://vitest.dev/guide/` was reachable, but detailed content was not scraped beyond reachability preview. [CITED: vitest.dev/guide]
- Local installed Zod README documents `.safeParse()` and `ZodError.issues`. [VERIFIED: local package README]

### Tertiary (LOW confidence)

- Provisional Fluency band rubric. [ASSUMED]
- Backend sample endpoint choice and exact route naming. [ASSUMED]
- Backend body-size default risk; explicit 2MB limit recommendation is prudent but default behavior was not verified. [ASSUMED]

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — package manifests, installed versions, npm registry versions, and Phase 1 verification all align. [VERIFIED]
- Architecture: MEDIUM-HIGH — frontend/backend/shared-contract responsibilities are locked, but exact endpoint names and sample-loading strategy are assumed. [VERIFIED + ASSUMED]
- Metric formulas: MEDIUM — pronunciation and pause basics are verified; word band conflict and fluency rubric need confirmation. [VERIFIED + ASSUMED]
- Pitfalls: MEDIUM — most derive from verified schema/UI constraints, but some are implementation-risk assumptions. [VERIFIED + ASSUMED]
- Security: MEDIUM-HIGH — no third-party sharing/no Gemini/no secrets are locked; backend body-size implementation detail remains assumed. [VERIFIED + ASSUMED]

**Research date:** 2026-05-07  
**Valid until:** 2026-06-06 for stack/codebase facts; 2026-05-14 for npm current-version facts because package versions are fast-moving.

## RESEARCH COMPLETE

**Phase:** 02 - JSON Input & Pronunciation/Fluency Metrics  
**Confidence:** MEDIUM-HIGH

### Key Findings

- Backend must own validation and deterministic metrics; frontend may only do local JSON syntax parsing and response rendering. [VERIFIED: `02-CONTEXT.md`, `02-UI-SPEC.md`]
- Expand shared Zod contracts first, then implement NestJS preview/analyze/sample endpoints, then build the Next.js single-page UI. [VERIFIED existing patterns; ASSUMED planning sequence]
- Pronunciation metrics are mostly locked: total-score percentage, pronunciation band thresholds, weak phoneme `<0.85` repeated `>=2`, top 5 weak ARPAbet phones. [VERIFIED: `.planning/PROJECT.md`, `02-UI-SPEC.md`]
- Fluency ingredients are locked, but the exact Fluency band rubric is not fully specified and should be confirmed before execution. [VERIFIED partial: `.planning/PROJECT.md`; ASSUMED provisional rubric]
- Approved UI spec conflicts with PROJECT word band thresholds; use UI spec for Phase 2 unless user confirms otherwise. [VERIFIED: `.planning/PROJECT.md`, `02-UI-SPEC.md`]

### File Created

Not written by this agent due the environment’s hard “do not write files” constraint. Save this Markdown to:

`.planning/phases/02-json-input-pronunciation-fluency-metrics/02-RESEARCH.md`

### Confidence Assessment

| Area | Level | Reason |
|------|-------|--------|
| Standard Stack | HIGH | Existing packages, npm versions, and tests were verified. |
| Architecture | MEDIUM-HIGH | Tier responsibilities are locked; endpoint names are recommended but assumed. |
| Metrics | MEDIUM | Pronunciation formulas are verified; fluency rubric and word-band conflict need confirmation. |
| Validation/Test Strategy | HIGH | Existing test infrastructure and baseline commands were verified. |
| Security | MEDIUM-HIGH | No Gemini/no third-party/no secrets constraints are verified; backend size-limit implementation is assumed. |

### Open Questions

1. Confirm whether Phase 2 word bands should use UI spec thresholds (`0.65/0.85`) or PROJECT thresholds (`0.7/0.9`).
2. Confirm exact Fluency band rubric for MET-06.
3. Confirm whether the UI’s `Long` pause label should split the PROJECT `>=1.0s critical` threshold.
4. Confirm whether analysis response should omit or include the full original speech assessment JSON.

### Ready for Planning

Research complete. Planner can now create PLAN.md files, but should treat the Fluency band rubric and threshold conflicts as decisions requiring confirmation before implementation.
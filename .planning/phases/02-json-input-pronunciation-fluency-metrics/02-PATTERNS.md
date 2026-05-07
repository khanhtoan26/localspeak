# Phase 2: JSON Input & Pronunciation/Fluency Metrics - Pattern Map

**Mapped:** 2026-05-07  
**Files analyzed:** 26  
**Analogs found:** 26 / 26

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `packages/contracts/src/speech-assessment.ts` | model/contract | request-response validation | `packages/contracts/src/speech-assessment.ts` | exact-existing |
| `packages/contracts/src/json-analysis.ts` | model/contract | request-response transform | `packages/contracts/src/speech-assessment.ts` + `packages/contracts/src/json-analysis.ts` | role-match |
| `packages/contracts/src/index.ts` | config/barrel | transform | `packages/contracts/src/index.ts` | exact-existing |
| `packages/contracts/test/speech-assessment.fixture.test.ts` | test | validation/fixture | `packages/contracts/test/speech-assessment.fixture.test.ts` | exact-existing |
| `packages/contracts/test/json-analysis.metrics.test.ts` | test | batch/transform | `packages/contracts/test/speech-assessment.fixture.test.ts` | role-match |
| `apps/api/src/json-analysis/json-analysis.module.ts` | module | request-response | `apps/api/src/contracts/contracts.module.ts` | role-match |
| `apps/api/src/json-analysis/json-analysis.controller.ts` | controller | request-response | `apps/api/src/contracts/contracts.controller.ts` | role-match |
| `apps/api/src/json-analysis/json-analysis.service.ts` | service | request-response transform | `apps/api/src/contracts/contracts.controller.ts` + `apps/api/src/config/env.ts` | partial |
| `apps/api/src/json-analysis/json-analysis.metrics.ts` | utility | transform | `packages/contracts/src/speech-assessment.ts` + research metric examples | partial |
| `apps/api/src/json-analysis/json-analysis.validation.ts` | utility | transform | `packages/contracts/src/speech-assessment.ts` + research path-format examples | partial |
| `apps/api/src/app.module.ts` | config/module | request-response | `apps/api/src/app.module.ts` | exact-existing |
| `apps/api/src/main.ts` | config/bootstrap | request-response | `apps/api/src/main.ts` | exact-existing |
| `apps/api/test/json-analysis.e2e-spec.ts` | test | request-response | `apps/api/test/contracts.e2e-spec.ts` + `apps/api/test/health.e2e-spec.ts` | role-match |
| `apps/web/app/page.tsx` | component/page | request-response | `apps/web/app/page.tsx` | exact-existing |
| `apps/web/app/globals.css` | config/styling | transform | `apps/web/app/globals.css` | exact-existing |
| `apps/web/components/status-card.tsx` | component | request-response/status rendering | `apps/web/components/status-card.tsx` | exact-existing |
| `apps/web/components/status-panel.tsx` | component | request-response | `apps/web/components/status-panel.tsx` | exact-existing |
| `apps/web/components/json-analysis/json-analysis-panel.tsx` | component | request-response/event-driven | `apps/web/components/status-panel.tsx` | role-match |
| `apps/web/components/json-analysis/json-input-card.tsx` | component | file-I/O/event-driven | `apps/web/components/status-panel.tsx` + UI-SPEC file upload contract | partial |
| `apps/web/components/json-analysis/validation-preview-card.tsx` | component | request-response | `apps/web/components/status-card.tsx` + `apps/web/components/status-panel.tsx` | role-match |
| `apps/web/components/json-analysis/summary-metric-cards.tsx` | component | transform/rendering | `apps/web/components/status-card.tsx` | role-match |
| `apps/web/components/json-analysis/result-tabs.tsx` | component | event-driven/rendering | `apps/web/components/status-panel.tsx` + UI-SPEC tab contract | partial |
| `apps/web/components/json-analysis/words-tab.tsx` | component | transform/rendering | `apps/web/components/status-card.tsx` + UI-SPEC Words tab | partial |
| `apps/web/components/json-analysis/phonemes-tab.tsx` | component | transform/rendering | `apps/web/components/status-card.tsx` + UI-SPEC Phonemes tab | partial |
| `apps/web/components/json-analysis/pauses-tab.tsx` | component | transform/rendering | `apps/web/components/status-card.tsx` + UI-SPEC Pauses tab | partial |
| `apps/web/components/json-analysis/json-analysis-panel.test.tsx` | test | event-driven/request-response | `apps/web/components/status-panel.test.tsx` | role-match |

## Pattern Assignments

### `packages/contracts/src/speech-assessment.ts` (model/contract, request-response validation)

**Analog:** `packages/contracts/src/speech-assessment.ts`

**Imports pattern** (lines 1-1):
```typescript
import { z } from "zod";
```

**Primitive schema pattern** (lines 3-15):
```typescript
const TimeSchema = z.number().nonnegative();
const ScoreSchema = z.number().min(0).max(1);
const RawScoreSchema = z.number();
const NumericResponseTimeSchema = z.union([
  z.number().nonnegative(),
  z.string().regex(/^\d+(\.\d+)?$/, "response_time must be numeric"),
]);
const HttpUrlSchema = z
  .string()
  .url()
  .refine((value) => /^https?:\/\//i.test(value), {
    message: "audio_url must be an http(s) URL",
  });
```

**Cross-field validation pattern** (lines 17-23):
```typescript
const hasValidTimeRange = (value: { start_time: number; end_time: number }) =>
  value.end_time >= value.start_time;

const timeRangeIssue = {
  message: "end_time must be greater than or equal to start_time",
  path: ["end_time"],
};
```

**Nested loose vendor-object schema pattern** (lines 25-57):
```typescript
export const SpeechPhoneSchema = z
  .looseObject({
    start_time: TimeSchema,
    end_time: TimeSchema,
    phone: z.string().min(1),
    phone_ipa: z.string().min(1),
    score: ScoreSchema,
    score_raw: RawScoreSchema,
  })
  .refine(hasValidTimeRange, timeRangeIssue);

export const SpeechLetterSchema = z
  .looseObject({
    start_time: TimeSchema,
    end_time: TimeSchema,
    letter: z.string().min(1),
    phones: z.array(SpeechPhoneSchema),
    score: ScoreSchema,
    score_raw: RawScoreSchema,
  })
  .refine(hasValidTimeRange, timeRangeIssue);

export const SpeechWordSchema = z
  .looseObject({
    start_time: TimeSchema,
    end_time: TimeSchema,
    word: z.string().min(1),
    score: ScoreSchema,
    score_raw: RawScoreSchema,
    phones: z.array(SpeechPhoneSchema),
    letters: z.array(SpeechLetterSchema),
  })
  .refine(hasValidTimeRange, timeRangeIssue);
```

**Top-level response + inferred type pattern** (lines 59-74):
```typescript
export const SpeechAssessmentResponseSchema = z.looseObject({
  success: z.boolean(),
  msg: z.string().min(1),
  result: z.array(SpeechWordSchema),
  text_refs: z.string().min(1),
  audio_url: HttpUrlSchema,
  total_score: ScoreSchema,
  response_time: NumericResponseTimeSchema,
});

export type SpeechPhone = z.infer<typeof SpeechPhoneSchema>;
export type SpeechLetter = z.infer<typeof SpeechLetterSchema>;
export type SpeechWord = z.infer<typeof SpeechWordSchema>;
export type SpeechAssessmentResponse = z.infer<
  typeof SpeechAssessmentResponseSchema
>;
```

**Planner guidance:** Preserve `z.looseObject()` behavior so unknown vendor fields continue to pass. If Phase 2 needs non-empty arrays for analysis, prefer adding analysis-specific refinements or clearly covered `.min(1)` changes with fixture tests.

---

### `packages/contracts/src/json-analysis.ts` (model/contract, request-response transform)

**Analog:** `packages/contracts/src/json-analysis.ts`

**Imports pattern** (lines 1-2):
```typescript
import { z } from "zod";
import { SpeechAssessmentResponseSchema } from "./speech-assessment";
```

**Existing request shell pattern** (lines 4-6):
```typescript
export const JsonAnalysisRequestSchema = z.looseObject({
  speechAssessment: SpeechAssessmentResponseSchema,
});
```

**Existing response shell to replace/expand** (lines 8-13):
```typescript
export const JsonAnalysisResponseSchema = z.looseObject({
  inputMode: z.literal("json"),
  speechAssessment: SpeechAssessmentResponseSchema,
  pronunciation: z.looseObject({}).optional(),
  fluency: z.looseObject({}).optional(),
});
```

**Inferred type export pattern** (lines 15-16):
```typescript
export type JsonAnalysisRequest = z.infer<typeof JsonAnalysisRequestSchema>;
export type JsonAnalysisResponse = z.infer<typeof JsonAnalysisResponseSchema>;
```

**Research contract shape to apply** (`02-RESEARCH.md` lines 259-299):
```typescript
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

**Validation issue/warning structure to implement** (`02-RESEARCH.md` lines 305-342):
```typescript
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
  label: string;
  path: JsonPath;
  message: string;
  hint?: string;
  technical?: string;
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
```

**Response echo rule:** Do not keep the existing full `speechAssessment` echo in successful analysis responses. Context decision D-20 requires analysis responses to return derived/extracted analysis fields, warnings, and metrics only.

---

### `packages/contracts/src/index.ts` (config/barrel, transform)

**Analog:** `packages/contracts/src/index.ts`

**Barrel export pattern** (lines 1-5):
```typescript
export * from "./audio-analysis";
export * from "./gemini-feedback";
export * from "./json-analysis";
export * from "./saved-session";
export * from "./speech-assessment";
```

**Planner guidance:** Because `json-analysis.ts` is already exported, only update this file if new files are added under `packages/contracts/src/` that are not re-exported through `json-analysis.ts`. Prefer keeping all Phase 2 JSON schemas/types exported from `json-analysis.ts`.

---

### `packages/contracts/test/speech-assessment.fixture.test.ts` (test, validation/fixture)

**Analog:** `packages/contracts/test/speech-assessment.fixture.test.ts`

**Imports pattern** (lines 1-3):
```typescript
import { describe, expect, it } from "vitest";
import fixture from "../../../.artifacts/speech-response.json";
import { SpeechAssessmentResponseSchema } from "../src";
```

**Fixture validates pattern** (lines 5-10):
```typescript
describe("speech assessment fixture contract", () => {
  it("validates the real sample fixture", () => {
    const result = SpeechAssessmentResponseSchema.safeParse(fixture);

    expect(result.success).toBe(true);
  });
```

**Parse and preserve field pattern** (lines 12-25):
```typescript
  it("accepts the fixture response_time string", () => {
    const result = SpeechAssessmentResponseSchema.parse(fixture);

    expect(result.response_time).toBe("1.711");
  });

  it("preserves unknown vendor fields", () => {
    const result = SpeechAssessmentResponseSchema.parse({
      ...fixture,
      vendor_extra: { kept: true },
    });

    expect(result.vendor_extra).toEqual({ kept: true });
  });
```

**Negative validation pattern** (lines 27-51):
```typescript
  it("rejects invalid timing and score ranges", () => {
    const result = SpeechAssessmentResponseSchema.safeParse({
      ...fixture,
      total_score: 1.2,
      result: [
        {
          ...fixture.result[0],
          start_time: 2,
          end_time: 1,
          score: -0.1,
        },
      ],
    });

    expect(result.success).toBe(false);
  });

  it("rejects non-http audio URLs", () => {
    const result = SpeechAssessmentResponseSchema.safeParse({
      ...fixture,
      audio_url: "javascript:alert(1)",
    });

    expect(result.success).toBe(false);
  });
});
```

**Planner guidance:** For stricter Phase 2 schema changes, add tests here that prove fixture validity remains true and vendor extras remain preserved.

---

### `packages/contracts/test/json-analysis.metrics.test.ts` (test, batch/transform)

**Analog:** `packages/contracts/test/speech-assessment.fixture.test.ts`

**Imports pattern to copy** (`speech-assessment.fixture.test.ts` lines 1-3):
```typescript
import { describe, expect, it } from "vitest";
import fixture from "../../../.artifacts/speech-response.json";
import { SpeechAssessmentResponseSchema } from "../src";
```

**Fixture-first test style to copy** (`speech-assessment.fixture.test.ts` lines 5-10):
```typescript
describe("speech assessment fixture contract", () => {
  it("validates the real sample fixture", () => {
    const result = SpeechAssessmentResponseSchema.safeParse(fixture);

    expect(result.success).toBe(true);
  });
```

**Metric formulas to assert** (`02-RESEARCH.md` lines 585-603):
```typescript
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
```

**Thresholds to assert** (`02-VALIDATION.md` lines 84-91):
```text
Word bands:
Weak `<0.65`, Okay `>=0.65 && <0.85`, Good `>=0.85`.

Fluency band rubric:
criticalPauseCount >= 3 || pauseRatio >= 0.30 -> 5.5
criticalPauseCount >= 2 || pauseRatio >= 0.20 -> 6.0
criticalPauseCount >= 1 || pauseRatio >= 0.15 -> 6.5
pauseRatio <= 0.10 && wpm >= 140 && wpm <= 160 -> 7.5
otherwise 7.0
cap to 6.0 when wpm < 100 || wpm > 190
cap to 6.5 when wpm < 120 || wpm > 180

Pause severities:
natural/acceptable 0.3s <= gap < 0.5s
noticeable/warning 0.5s <= gap < 1.0s
critical gap >= 1.0s
```

---

### `apps/api/src/json-analysis/json-analysis.module.ts` (module, request-response)

**Analog:** `apps/api/src/contracts/contracts.module.ts`

**Imports + module decorator pattern** (lines 1-7):
```typescript
import { Module } from "@nestjs/common";
import { ContractsController } from "./contracts.controller";

@Module({
  controllers: [ContractsController],
})
export class ContractsModule {}
```

**Also copy from health module** (`apps/api/src/health/health.module.ts` lines 1-7):
```typescript
import { Module } from "@nestjs/common";
import { HealthController } from "./health.controller";

@Module({
  controllers: [HealthController],
})
export class HealthModule {}
```

**Planner guidance:** For Phase 2, add `providers: [JsonAnalysisService]` if controller delegates analysis/validation to service. Keep the same relative import convention.

---

### `apps/api/src/json-analysis/json-analysis.controller.ts` (controller, request-response)

**Analog:** `apps/api/src/contracts/contracts.controller.ts`

**Imports pattern** (lines 1-3):
```typescript
import { Controller, Get } from "@nestjs/common";
import { SpeechAssessmentResponseSchema } from "@localspeak/contracts";
import fixture from "../../../../.artifacts/speech-response.json";
```

**Controller route/decorator pattern** (lines 5-8):
```typescript
@Controller("contracts")
export class ContractsController {
  @Get("sample-json/validate")
  validateSampleJson() {
```

**Runtime schema validation + safe response pattern** (lines 9-16):
```typescript
    const result = SpeechAssessmentResponseSchema.safeParse(fixture);

    return {
      valid: result.success,
      contract: "speech-assessment-response.v1",
      issues: result.success ? [] : result.error.issues,
    };
  }
}
```

**Use `@Post`/`@Body` from research pattern** (`02-RESEARCH.md` lines 644-654):
```typescript
@Post("analyze")
analyze(@Body() body: unknown): JsonAnalysisResponse {
  const request = JsonAnalysisRequestSchema.safeParse(body);

  if (!request.success) {
    return invalidAnalysisResponseFromIssues(request.error.issues);
  }

  return this.jsonAnalysisService.analyze(request.data.speechAssessment);
}
```

**Planner guidance:** Implement `GET /json-analysis/sample`, `POST /json-analysis/preview`, and `POST /json-analysis/analyze`. Revalidate in `analyze` even if preview already succeeded.

---

### `apps/api/src/json-analysis/json-analysis.service.ts` (service, request-response transform)

**Analog:** `apps/api/src/contracts/contracts.controller.ts` for shared contract validation; `apps/api/src/config/env.ts` for pure exported helper style.

**Shared contract safeParse pattern** (`contracts.controller.ts` lines 9-15):
```typescript
const result = SpeechAssessmentResponseSchema.safeParse(fixture);

return {
  valid: result.success,
  contract: "speech-assessment-response.v1",
  issues: result.success ? [] : result.error.issues,
};
```

**Pure exported function style** (`apps/api/src/config/env.ts` lines 28-30):
```typescript
export function validateApiEnv(config: Record<string, unknown>): ApiEnv {
  return ApiEnvSchema.parse(config);
}
```

**Service responsibility from research** (`02-RESEARCH.md` lines 184-190):
```text
NestJS JsonAnalysisService
  - validates schema again
  - extracts words/phones/timings
  - computes pronunciation metrics
  - computes fluency metrics
  - returns deterministic response
```

**Planner guidance:** Keep metric math pure in `json-analysis.metrics.ts`; service should orchestrate validation, warnings, metrics, and response shaping.

---

### `apps/api/src/json-analysis/json-analysis.metrics.ts` (utility, transform)

**Analog:** `packages/contracts/src/speech-assessment.ts` for typed pure helpers; `02-RESEARCH.md` metric examples.

**Extraction formula** (`02-RESEARCH.md` lines 431-440):
```typescript
const words = speechAssessment.result;
const totalScore = speechAssessment.total_score;
const referenceText = speechAssessment.text_refs;
const phones = words.flatMap((word) =>
  word.phones.map((phone) => ({ ...phone, word: word.word })),
);
```

**Pronunciation band formula** (`02-RESEARCH.md` lines 452-463):
```typescript
function pronunciationBand(score: number): number {
  if (score >= 0.95) return 8.5;
  if (score >= 0.90) return 7.5;
  if (score >= 0.85) return 7.0;
  if (score >= 0.80) return 6.5;
  if (score >= 0.75) return 6.0;
  return 5.5;
}
```

**Weak phoneme sort pattern** (`02-RESEARCH.md` lines 477-488):
```typescript
weakPatterns = phonemeAverages
  .filter((p) => p.weakOccurrenceCount >= 2)
  .sort((a, b) =>
    b.weakOccurrenceCount - a.weakOccurrenceCount ||
    a.averageScore - b.averageScore ||
    a.arpabet.localeCompare(b.arpabet)
  )
  .slice(0, 5);
```

**Word band function** (`02-RESEARCH.md` lines 492-502):
```typescript
function wordBand(score: number): "weak" | "okay" | "good" {
  if (score < 0.65) return "weak";
  if (score < 0.85) return "okay";
  return "good";
}
```

**Pause severity function** (`02-RESEARCH.md` lines 531-540):
```typescript
function pauseSeverity(gap: number): "natural" | "noticeable" | "critical" | null {
  if (gap < 0.3) return null;          // not notable
  if (gap < 0.5) return "natural";     // project: acceptable
  if (gap < 1.0) return "noticeable";  // project: warning
  return "critical";                   // project: critical
}
```

**Fluency band formula** (`02-RESEARCH.md` lines 558-580):
```typescript
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

**Pause extraction pattern** (`02-RESEARCH.md` lines 807-839):
```typescript
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

---

### `apps/api/src/json-analysis/json-analysis.validation.ts` (utility, transform)

**Analog:** `packages/contracts/src/speech-assessment.ts` for schema validation issues; research path formatter.

**Zod issue path formatter** (`02-RESEARCH.md` lines 775-788):
```typescript
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

**Friendly issue data shape** (`02-RESEARCH.md` lines 308-324):
```typescript
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
```

**Security/error handling rules** (`02-VALIDATION.md` lines 62-70):
```text
T-02-01 Invalid/adversarial JSON must not cause crashes, NaN, Infinity, or misleading metrics.
T-02-02 Oversized body must get friendly too-large error.
T-02-03 Technical details must not leak stack traces, env values, or unrelated internals.
T-02-04 Vendor text/JSON paths render as React text, never executable HTML/script.
T-02-05 Pasted JSON is not sent to Gemini, analytics, or third parties.
```

---

### `apps/api/src/app.module.ts` (config/module, request-response)

**Analog:** `apps/api/src/app.module.ts`

**Module import wiring pattern** (lines 1-8):
```typescript
import { Module } from "@nestjs/common";
import { ContractsModule } from "./contracts/contracts.module";
import { HealthModule } from "./health/health.module";

@Module({
  imports: [HealthModule, ContractsModule],
})
export class AppModule {}
```

**Planner guidance:** Add `JsonAnalysisModule` import beside `HealthModule` and `ContractsModule`, then include it in the `imports` array.

---

### `apps/api/src/main.ts` (config/bootstrap, request-response)

**Analog:** `apps/api/src/main.ts`

**Bootstrap imports pattern** (lines 1-5):
```typescript
import "reflect-metadata";
import "dotenv/config";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { validateApiEnv } from "./config/env";
```

**Bootstrap pattern** (lines 7-14):
```typescript
async function bootstrap() {
  const env = validateApiEnv(process.env);
  const app = await NestFactory.create(AppModule);

  await app.listen(env.PORT);
}

void bootstrap();
```

**Planner guidance:** If implementing the 2 MB backend body-size guard, configure it here after `NestFactory.create(AppModule)` and before `app.listen()`. Keep env validation first and do not expose env/secrets in responses.

---

### `apps/api/test/json-analysis.e2e-spec.ts` (test, request-response)

**Analog:** `apps/api/test/contracts.e2e-spec.ts`

**Imports pattern** (lines 1-4):
```typescript
import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { AppModule } from "../src/app.module";
```

**Nest e2e app lifecycle pattern** (lines 6-20):
```typescript
describe("ContractsController (e2e)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });
```

**Supertest assertion pattern** (lines 22-32):
```typescript
  it("validates the canonical speech assessment fixture", async () => {
    const response = await request(app.getHttpServer())
      .get("/contracts/sample-json/validate")
      .expect(200);

    expect(response.body).toEqual({
      valid: true,
      contract: "speech-assessment-response.v1",
      issues: [],
    });
  });
});
```

**No-secret leak assertion pattern** (`apps/api/test/health.e2e-spec.ts` lines 25-31):
```typescript
expect(response.body).toMatchObject({
  status: "ok",
  service: "localspeak-api",
});
expect(response.body.timestamp).toEqual(expect.any(String));
expect(response.body).not.toHaveProperty("GEMINI_API_KEY");
expect(response.body).not.toHaveProperty("SUPABASE_SECRET_KEY");
```

**Planner guidance:** Cover `GET /json-analysis/sample`, `POST /json-analysis/preview`, `POST /json-analysis/analyze`, invalid schema, warnings, too-large body, and no stack trace/secret leak.

---

### `apps/web/app/page.tsx` (component/page, request-response)

**Analog:** `apps/web/app/page.tsx`

**Current page handoff pattern** (lines 1-5):
```tsx
import { StatusPanel } from "../components/status-panel";

export default function Home() {
  return <StatusPanel />;
}
```

**Planner guidance:** Replace `StatusPanel` with the Phase 2 JSON analysis panel, e.g. import from `../components/json-analysis/json-analysis-panel`. Keep this server component thin and delegate client state to a `"use client"` component.

---

### `apps/web/app/globals.css` (config/styling, transform)

**Analog:** `apps/web/app/globals.css`

**LocalSpeak CSS token pattern** (lines 1-16):
```css
:root {
  --bg: #fafaf7;
  --card: #ffffff;
  --ink: #161513;
  --ink-soft: #5a564f;
  --ink-muted: #9b968d;
  --line: #ebe7df;
  --beige-soft: #f1ede4;
  --accent: #d97757;
  --success: #3f6b4f;
  --warning: #b88a3e;
  --danger: #9f2d20;
  --font-display: "Instrument Serif", "Iowan Old Style", Georgia, serif;
  --font-body: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace;
}
```

**Global form font inheritance pattern** (lines 34-39):
```css
button,
input,
textarea,
select {
  font: inherit;
}
```

**Page shell/card pattern** (lines 41-96):
```css
.status-page {
  min-height: 100vh;
  padding: 24px;
}

.status-shell {
  display: flex;
  width: min(100%, 720px);
  margin: 0 auto;
  flex-direction: column;
  gap: 16px;
}

.status-card {
  border: 1px solid var(--line);
  border-radius: 18px;
  background: var(--card);
  padding: 16px;
}
```

**Badge/status color pattern** (lines 136-170):
```css
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border-radius: 999px;
  padding: 4px 8px;
  font-size: 11px;
  font-weight: 600;
  line-height: 1.2;
}

.status-badge::before {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: currentColor;
  content: "";
}

.status-badge--checking {
  background: var(--beige-soft);
  color: var(--warning);
}

.status-badge--ok,
.status-badge--valid {
  background: #edf5ef;
  color: var(--success);
}

.status-badge--unavailable,
.status-badge--invalid {
  background: #f6ebe8;
  color: var(--danger);
}
```

**Button/focus pattern** (lines 172-195):
```css
.status-refresh {
  min-height: 44px;
  border: 1px solid transparent;
  border-radius: 14px;
  background: var(--ink);
  color: #ffffff;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.5;
  padding: 16px 24px;
}

.status-refresh:hover,
.status-refresh:focus-visible {
  border-color: var(--accent);
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.status-refresh:disabled {
  cursor: wait;
  opacity: 0.64;
}
```

**UI-SPEC constraints to apply** (`02-UI-SPEC.md` lines 242-272):
```text
Use a single analysis page:
1. Page header.
2. JSON input card.
3. Validation preview card.
4. Results region.
5. Lightweight result tabs.

Page shell uses max-width: 960px.
Mobile padding: 16px.
Tablet/desktop padding: 24px.
Header bottom margin: 24px.
```

---

### `apps/web/components/status-card.tsx` (component, request-response/status rendering)

**Analog:** `apps/web/components/status-card.tsx`

**Typed badge union pattern** (lines 1-7):
```tsx
export type StatusBadge =
  | "Checking"
  | "OK"
  | "Valid"
  | "Unavailable"
  | "Invalid";
```

**Props pattern** (lines 8-13):
```tsx
type StatusCardProps = {
  title: string;
  badge: StatusBadge;
  detail: string;
  meta?: string;
};
```

**Class mapping pattern** (lines 15-21):
```tsx
const badgeClassName: Record<StatusBadge, string> = {
  Checking: "status-badge--checking",
  OK: "status-badge--ok",
  Valid: "status-badge--valid",
  Unavailable: "status-badge--unavailable",
  Invalid: "status-badge--invalid",
};
```

**Accessible card/live region pattern** (lines 23-35):
```tsx
export function StatusCard({ title, badge, detail, meta }: StatusCardProps) {
  return (
    <article className="status-card">
      <div className="status-card__header">
        <h2 className="status-card__title">{title}</h2>
        <span className={`status-badge ${badgeClassName[badge]}`}>{badge}</span>
      </div>
      <div className="status-card__body" aria-live="polite">
        <p className="status-card__detail">{detail}</p>
        {meta ? <p className="status-card__meta">{meta}</p> : null}
      </div>
    </article>
  );
}
```

**Planner guidance:** Reuse/generalize this card pattern for validation preview, summary metric cards, warnings, and positive empty states.

---

### `apps/web/components/status-panel.tsx` (component, request-response)

**Analog:** `apps/web/components/status-panel.tsx`

**Client component + imports pattern** (lines 1-5):
```tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import { z } from "zod";
import { StatusCard, type StatusBadge } from "./status-card";
```

**Runtime response schema pattern** (lines 18-27):
```tsx
const HealthResponseSchema = z.object({
  status: z.literal("ok"),
  service: z.literal("localspeak-api"),
});

const ContractResponseSchema = z.object({
  valid: z.boolean(),
  contract: z.string().min(1),
  issues: z.array(z.unknown()),
});
```

**Async fetch + response.ok + Zod parse pattern** (lines 52-71):
```tsx
const healthCheck = fetch("/api/health", { cache: "no-store" })
  .then(async (response) => {
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.status}`);
    }

    const data = HealthResponseSchema.parse(await response.json());
    setApiHealth({
      badge: "OK",
      detail: `${data.service} is responding.`,
      meta: `status: ${data.status}`,
    });
  })
  .catch(() => {
    setApiHealth({
      badge: "Unavailable",
      detail: API_UNAVAILABLE_COPY,
      meta: "status: unavailable",
    });
  });
```

**Contract validation response pattern** (lines 73-103):
```tsx
const contractCheck = fetch("/api/contracts/sample-json/validate", {
  cache: "no-store",
})
  .then(async (response) => {
    if (!response.ok) {
      throw new Error(`Contract check failed: ${response.status}`);
    }

    const data = ContractResponseSchema.parse(await response.json());
    if (!data.valid) {
      setContractFixture({
        badge: "Invalid",
        detail: CONTRACT_INVALID_COPY,
        meta: `issues: ${data.issues.length}`,
      });
      return;
    }

    setContractFixture({
      badge: "Valid",
      detail: `${data.contract} fixture validates.`,
      meta: "issues: 0",
    });
  })
  .catch(() => {
    setContractFixture({
      badge: "Unavailable",
      detail: API_UNAVAILABLE_COPY,
      meta: "contract: unavailable",
    });
  });
```

**Concurrent async pattern** (lines 105-111):
```tsx
await Promise.allSettled([healthCheck, contractCheck]);
setIsRefreshing(false);
}, []);

useEffect(() => {
  void refreshStatus();
}, [refreshStatus]);
```

**Planner guidance:** For JSON analysis panel, use shared `@localspeak/contracts` response schemas instead of component-local Zod schemas once `json-analysis.ts` is expanded.

---

### `apps/web/components/json-analysis/json-analysis-panel.tsx` (component, request-response/event-driven)

**Analog:** `apps/web/components/status-panel.tsx`

**Client component pattern** (`status-panel.tsx` lines 1-5):
```tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import { z } from "zod";
import { StatusCard, type StatusBadge } from "./status-card";
```

**State + refresh callback pattern** (`status-panel.tsx` lines 41-50):
```tsx
export function StatusPanel() {
  const [apiHealth, setApiHealth] = useState<CardState>(checkingHealth);
  const [contractFixture, setContractFixture] =
    useState<CardState>(checkingContract);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshStatus = useCallback(async () => {
    setIsRefreshing(true);
    setApiHealth(checkingHealth);
    setContractFixture(checkingContract);
```

**Render page shell pattern** (`status-panel.tsx` lines 113-143):
```tsx
return (
  <main className="status-page">
    <section className="status-shell" aria-label="LocalSpeak foundation status">
      <header className="status-header">
        <span className="status-tag">LocalSpeak</span>
        <h1 className="status-title">LocalSpeak</h1>
        <p className="status-intro">
          Monorepo foundation status for the Next.js frontend, NestJS API, and
          shared contracts.
        </p>
      </header>

      <StatusCard title="API Health" {...apiHealth} />
      <StatusCard title="Contract Fixture" {...contractFixture} />

      <button
        className="status-refresh"
        type="button"
        disabled={isRefreshing}
        onClick={() => void refreshStatus()}
      >
        Refresh Status
      </button>

      <p className="status-helper">
        This page proves the frontend can reach the backend and validate the
        shared speech JSON fixture.
      </p>
    </section>
  </main>
);
```

**UI flow contract** (`02-UI-SPEC.md` lines 443-454):
```text
1. User pastes JSON into textarea.
2. UI waits 600ms after typing stops.
3. UI performs local JSON syntax check.
4. If parseable, UI sends JSON to backend validation preview.
5. UI shows validation preview.
6. If valid or valid with warnings, Analyze JSON becomes enabled.
7. User selects Analyze JSON.
8. UI sends JSON to backend analysis route.
9. UI renders deterministic results.
10. User inspects Summary, Words, Phonemes, and Pauses tabs.
```

---

### `apps/web/components/json-analysis/json-input-card.tsx` (component, file-I/O/event-driven)

**Analog:** `apps/web/components/status-panel.tsx` for event handlers + UI-SPEC file input contract.

**Button handler pattern** (`status-panel.tsx` lines 128-135):
```tsx
<button
  className="status-refresh"
  type="button"
  disabled={isRefreshing}
  onClick={() => void refreshStatus()}
>
  Refresh Status
</button>
```

**Textarea/input contract** (`02-UI-SPEC.md` lines 291-300):
```text
- Uses mono font.
- aria-label="Speech assessment JSON input".
- Placeholder: Paste the full speech assessment JSON here.
- No syntax highlighting in Phase 02.
- No line numbers in Phase 02 unless trivial to implement accessibly.
- Preserve pasted whitespace.
- Do not auto-analyze on paste.
- Do not send pasted JSON to Gemini or any third-party service.
```

**Upload contract** (`02-UI-SPEC.md` lines 302-309):
```text
- Visible trigger label: Upload .json file.
- Accept only .json and application/json.
- Maximum file size: 2 MB.
- If file is too large, show:
  This file is too large for JSON mode. Upload a .json file under 2 MB.
- If file cannot be read, show:
  We couldn't read this file. Try pasting the JSON instead.
```

**Sample/clear behavior** (`02-UI-SPEC.md` lines 311-322):
```text
Load sample JSON:
- Loads .artifacts/speech-response.json into the textarea.
- Replaces existing input only after confirmation if textarea is non-empty:
  Replace the current JSON with the sample JSON?
- After loading, show validation preview automatically.

Clear JSON:
- If textarea or results are non-empty, require confirmation:
  Clear the pasted JSON and current results? This cannot be undone.
- Clears input, validation preview, warnings, and results.
```

---

### `apps/web/components/json-analysis/validation-preview-card.tsx` (component, request-response)

**Analog:** `apps/web/components/status-card.tsx` + `apps/web/components/status-panel.tsx`

**Accessible card pattern** (`status-card.tsx` lines 23-35):
```tsx
export function StatusCard({ title, badge, detail, meta }: StatusCardProps) {
  return (
    <article className="status-card">
      <div className="status-card__header">
        <h2 className="status-card__title">{title}</h2>
        <span className={`status-badge ${badgeClassName[badge]}`}>{badge}</span>
      </div>
      <div className="status-card__body" aria-live="polite">
        <p className="status-card__detail">{detail}</p>
        {meta ? <p className="status-card__meta">{meta}</p> : null}
      </div>
    </article>
  );
}
```

**Validation preview states** (`02-UI-SPEC.md` lines 324-350):
```text
Required states:
1. Empty.
2. Checking.
3. Parseable but not backend-validated.
4. Valid.
5. Valid with warnings.
6. Invalid.

Enable Analyze JSON only when latest backend preview is valid or valid_with_warnings.
If preview is invalid, keep Analyze JSON disabled.
```

**Issue display contract** (`02-UI-SPEC.md` lines 352-369):
```text
- Show top 3-5 issues first.
- If more than 5 issues exist, show: Showing 5 of {count} issues.
- Provide Show all issues.
- Each issue row must contain learner-friendly label, exact JSON path, and short fix hint.

Example:
Missing word timings
path: result[12].start_time
Add start_time and end_time for each word.
```

**Malformed/warning display** (`02-UI-SPEC.md` lines 371-381):
```text
Malformed JSON:
This does not look like valid JSON yet.
Check for a missing comma, quote, or closing bracket.
Technical parser error hidden by default.

Warning:
Analyzable with warnings
Metrics will still be computed, but review these unusual values.
```

---

### `apps/web/components/json-analysis/summary-metric-cards.tsx` (component, transform/rendering)

**Analog:** `apps/web/components/status-card.tsx`

**Card structure pattern** (`status-card.tsx` lines 25-33):
```tsx
<article className="status-card">
  <div className="status-card__header">
    <h2 className="status-card__title">{title}</h2>
    <span className={`status-badge ${badgeClassName[badge]}`}>{badge}</span>
  </div>
  <div className="status-card__body" aria-live="polite">
    <p className="status-card__detail">{detail}</p>
    {meta ? <p className="status-card__meta">{meta}</p> : null}
  </div>
</article>
```

**Metric order/helpers** (`02-UI-SPEC.md` lines 510-541):
```text
Show these five metrics in exact order:
1. Pronunciation percentage.
2. Pronunciation Band.
3. Fluency Band.
4. WPM.
5. Pause ratio.

Helpers:
- Pronunciation percentage: Computed from word and phone scores.
- Pronunciation Band: Estimated from deterministic score thresholds.
- Fluency Band: Estimated from WPM, pause ratio, and critical pauses.
- WPM: Words per minute from word timings.
- Pause ratio: Share of speaking time spent in detected pauses.

Formatting:
- Pronunciation percentage: integer percent, e.g. 86%.
- IELTS-style bands: one decimal, e.g. 6.5.
- WPM: integer, e.g. 112.
- Pause ratio: integer percent, e.g. 18%.
```

---

### `apps/web/components/json-analysis/result-tabs.tsx` (component, event-driven/rendering)

**Analog:** `apps/web/components/status-panel.tsx` for stateful buttons; UI-SPEC tab contract.

**Stateful component pattern** (`status-panel.tsx` lines 41-47):
```tsx
export function StatusPanel() {
  const [apiHealth, setApiHealth] = useState<CardState>(checkingHealth);
  const [contractFixture, setContractFixture] =
    useState<CardState>(checkingContract);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshStatus = useCallback(async () => {
```

**Tab rules** (`02-UI-SPEC.md` lines 473-489):
```text
Tabs:
- Summary
- Words
- Phonemes
- Pauses

Rules:
- Default active tab after successful analysis: Summary.
- Tabs are implemented as buttons with role="tab" if using ARIA tab pattern.
- Active tab must be keyboard-focusable and visibly selected.
- Left/right arrow navigation is recommended if implementing full ARIA tabs.
- If simple buttons are used instead of ARIA tabs, use aria-pressed and keep markup simple.
```

**Accessibility selected-state requirement** (`02-UI-SPEC.md` lines 760-768):
```text
- Main content uses <main>.
- Page header uses one <h1>.
- Each card has a semantic heading.
- Async validation and analysis status uses aria-live="polite".
- Tabs must expose selected state using either ARIA tab pattern or button group with aria-pressed.
```

---

### `apps/web/components/json-analysis/words-tab.tsx` (component, transform/rendering)

**Analog:** `apps/web/components/status-card.tsx` + UI-SPEC Words tab.

**Card/list style foundation** (`status-card.tsx` lines 25-33):
```tsx
<article className="status-card">
  <div className="status-card__header">
    <h2 className="status-card__title">{title}</h2>
    <span className={`status-badge ${badgeClassName[badge]}`}>{badge}</span>
  </div>
  <div className="status-card__body" aria-live="polite">
    <p className="status-card__detail">{detail}</p>
    {meta ? <p className="status-card__meta">{meta}</p> : null}
  </div>
</article>
```

**Words tab contract** (`02-UI-SPEC.md` lines 564-599):
```text
Purpose: show color-banded weak/okay/good word list with score and timing.

Required row fields:
- Word.
- Band: Weak, Okay, or Good.
- Score as percent.
- Timing range in seconds.

Row format:
canoe
Good - 97%
1.05s-1.53s

Sorting:
- Default: original speech order.
- Provide no sorting controls in Phase 02.
- Use visual color banding without relying on color alone by including Weak, Okay, or Good.

Band thresholds:
- Weak: < 0.65
- Okay: >= 0.65 and < 0.85
- Good: >= 0.85
```

---

### `apps/web/components/json-analysis/phonemes-tab.tsx` (component, transform/rendering)

**Analog:** `apps/web/components/status-card.tsx` + UI-SPEC Phonemes tab.

**Status/card pattern** (`status-card.tsx` lines 23-35):
```tsx
export function StatusCard({ title, badge, detail, meta }: StatusCardProps) {
  return (
    <article className="status-card">
      <div className="status-card__header">
        <h2 className="status-card__title">{title}</h2>
        <span className={`status-badge ${badgeClassName[badge]}`}>{badge}</span>
      </div>
      <div className="status-card__body" aria-live="polite">
        <p className="status-card__detail">{detail}</p>
        {meta ? <p className="status-card__meta">{meta}</p> : null}
      </div>
    </article>
  );
}
```

**Phonemes tab contract** (`02-UI-SPEC.md` lines 600-630):
```text
Purpose: show top 5 repeated weak ARPAbet phones by low score, with IPA examples.

Required fields:
- ARPAbet phone.
- IPA examples.
- Average score.
- Weak occurrence count.
- Example words if returned by backend.

Rules:
- Show maximum 5 repeated weak phones.
- A repeated weak pattern requires at least 2 low-scoring occurrences.
- Use ARPAbet label as primary identifier and IPA as secondary.
- Do not show a full phoneme analytics dashboard in Phase 02.

Empty state:
No repeated weak pattern found.
The JSON did not show the same low-scoring phone repeated at least twice.
```

---

### `apps/web/components/json-analysis/pauses-tab.tsx` (component, transform/rendering)

**Analog:** `apps/web/components/status-card.tsx` + UI-SPEC Pauses tab.

**Pauses tab contract** (`02-UI-SPEC.md` lines 632-668):
```text
Purpose: show notable pauses with severity, duration, and nearby words.

Required fields:
- Severity label.
- Duration.
- Timing gap.
- Nearby words.

Rules:
- Sort pauses by duration descending.
- Include exact duration in seconds.
- Include nearby words/context where backend provides it.
- Do not build SVG timeline in Phase 02; timeline is deferred to Phase 06.

Empty state:
No notable pauses found.
The word timings did not include pauses long enough to flag in this analysis.
```

**Locked Phase 2 severity override** (`02-CONTEXT.md` lines 35-36):
```text
Pause severity should use PROJECT thresholds only in Phase 2:
natural/acceptable 0.3s <= gap < 0.5s
noticeable/warning 0.5s <= gap < 1.0s
critical gap >= 1.0s
Do not add a separate Long severity yet.
```

**Planner guidance:** UI-SPEC lists `Long`, but CONTEXT D-19 supersedes it. Do not render `Long` in Phase 2 unless product decision changes.

---

### `apps/web/components/json-analysis/json-analysis-panel.test.tsx` (test, event-driven/request-response)

**Analog:** `apps/web/components/status-panel.test.tsx`

**Testing imports pattern** (lines 1-4):
```tsx
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { StatusPanel } from "./status-panel";
```

**Mock response helper pattern** (lines 17-22):
```tsx
function jsonResponse(body: unknown) {
  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve(body),
  } as Response);
}
```

**Global fetch stub pattern** (lines 24-38):
```tsx
describe("StatusPanel", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockImplementationOnce(() => jsonResponse(healthResponse))
        .mockImplementationOnce(() => jsonResponse(contractResponse)),
    );
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });
```

**Render + async assertion pattern** (lines 40-58):
```tsx
it("renders LocalSpeak status cards and successful API results", async () => {
  render(<StatusPanel />);

  expect(screen.getAllByText("LocalSpeak")).toHaveLength(2);
  expect(screen.getByText("API Health")).toBeInTheDocument();
  expect(screen.getByText("Contract Fixture")).toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: /refresh status/i }),
  ).toBeInTheDocument();

  expect(
    await screen.findByText("localspeak-api is responding."),
  ).toBeInTheDocument();
  expect(
    await screen.findByText(
      "speech-assessment-response.v1 fixture validates.",
    ),
  ).toBeInTheDocument();
});
```

**Failure response pattern** (lines 60-70):
```tsx
it("shows actionable API guidance when backend calls fail", async () => {
  vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));

  render(<StatusPanel />);

  expect(
    await screen.findAllByText(
      "Couldn't reach LocalSpeak API. Start the backend with pnpm dev:api or run pnpm dev, then refresh.",
    ),
  ).toHaveLength(2);
});
```

**Malformed response parsing pattern** (lines 72-94):
```tsx
it("does not show success for malformed API responses", async () => {
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockImplementationOnce(() => jsonResponse({ status: "ok" }))
      .mockImplementationOnce(() =>
        jsonResponse({
          valid: "false",
          contract: "speech-assessment-response.v1",
          issues: [],
        }),
      ),
  );

  render(<StatusPanel />);

  expect(
    await screen.findAllByText(
      "Couldn't reach LocalSpeak API. Start the backend with pnpm dev:api or run pnpm dev, then refresh.",
    ),
  ).toHaveLength(2);
});
```

**User-event click pattern** (lines 96-116):
```tsx
it("re-runs both checks when Refresh Status is clicked", async () => {
  const fetchMock = vi
    .fn()
    .mockImplementationOnce(() => jsonResponse(healthResponse))
    .mockImplementationOnce(() => jsonResponse(contractResponse))
    .mockImplementationOnce(() => jsonResponse(healthResponse))
    .mockImplementationOnce(() => jsonResponse(contractResponse));
  vi.stubGlobal("fetch", fetchMock);

  render(<StatusPanel />);

  await screen.findByText("localspeak-api is responding.");
  await userEvent.click(screen.getByRole("button", { name: /refresh status/i }));

  expect(fetchMock).toHaveBeenCalledWith("/api/health", { cache: "no-store" });
  expect(fetchMock).toHaveBeenCalledWith(
    "/api/contracts/sample-json/validate",
    { cache: "no-store" },
  );
  expect(fetchMock).toHaveBeenCalledTimes(4);
});
```

**Validation map required cases** (`02-VALIDATION.md` lines 74-80):
```text
Create json-analysis-panel.test.tsx covering:
- paste
- upload limit
- sample load
- disabled Analyze
- warning/error details
- result tabs
- malformed backend response parsing
- word bands
- no full input echo
```

## Shared Patterns

### Shared Zod Contracts

**Source:** `packages/contracts/src/speech-assessment.ts` and `packages/contracts/src/json-analysis.ts`  
**Apply to:** Contracts, API controller/service, web response parsing.

```typescript
import { z } from "zod";
import { SpeechAssessmentResponseSchema } from "./speech-assessment";

export const JsonAnalysisRequestSchema = z.looseObject({
  speechAssessment: SpeechAssessmentResponseSchema,
});

export type JsonAnalysisRequest = z.infer<typeof JsonAnalysisRequestSchema>;
```

**Rules:**
- Use Zod runtime schemas as source of truth.
- Export inferred TypeScript types from schemas.
- Preserve vendor unknown fields with `z.looseObject()` where validating raw speech assessment input.
- Frontend must parse backend responses with shared schemas before rendering success UI.

---

### Backend Controller Validation

**Source:** `apps/api/src/contracts/contracts.controller.ts` lines 1-17  
**Apply to:** `json-analysis.controller.ts`.

```typescript
import { Controller, Get } from "@nestjs/common";
import { SpeechAssessmentResponseSchema } from "@localspeak/contracts";
import fixture from "../../../../.artifacts/speech-response.json";

@Controller("contracts")
export class ContractsController {
  @Get("sample-json/validate")
  validateSampleJson() {
    const result = SpeechAssessmentResponseSchema.safeParse(fixture);

    return {
      valid: result.success,
      contract: "speech-assessment-response.v1",
      issues: result.success ? [] : result.error.issues,
    };
  }
}
```

**Rules:**
- Use Nest decorators for route structure.
- Use shared contracts from `@localspeak/contracts`.
- Use `.safeParse()` for learner-safe validation branches.
- Return safe issue data only, never stack traces or secrets.

---

### NestJS Module Wiring

**Source:** `apps/api/src/app.module.ts` lines 1-8  
**Apply to:** `json-analysis.module.ts`, `app.module.ts`.

```typescript
import { Module } from "@nestjs/common";
import { ContractsModule } from "./contracts/contracts.module";
import { HealthModule } from "./health/health.module";

@Module({
  imports: [HealthModule, ContractsModule],
})
export class AppModule {}
```

**Rules:**
- Feature modules live under `apps/api/src/<feature>/`.
- Controllers are registered in feature modules.
- Root `AppModule` imports feature modules.

---

### API E2E Tests

**Source:** `apps/api/test/contracts.e2e-spec.ts` lines 1-33  
**Apply to:** `apps/api/test/json-analysis.e2e-spec.ts`.

```typescript
import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { AppModule } from "../src/app.module";

describe("ContractsController (e2e)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("validates the canonical speech assessment fixture", async () => {
    const response = await request(app.getHttpServer())
      .get("/contracts/sample-json/validate")
      .expect(200);

    expect(response.body).toEqual({
      valid: true,
      contract: "speech-assessment-response.v1",
      issues: [],
    });
  });
});
```

---

### Next Client Component Runtime Response Parsing

**Source:** `apps/web/components/status-panel.tsx` lines 1-5, 18-27, 52-58, 73-82  
**Apply to:** `json-analysis-panel.tsx`.

```tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import { z } from "zod";
import { StatusCard, type StatusBadge } from "./status-card";

const ContractResponseSchema = z.object({
  valid: z.boolean(),
  contract: z.string().min(1),
  issues: z.array(z.unknown()),
});

const data = ContractResponseSchema.parse(await response.json());
```

**Rules:**
- Client components that use hooks start with `"use client"`.
- Fetch same-origin `/api/*`; `next.config.ts` rewrites to the Nest API.
- Check `response.ok` before parsing JSON.
- Parse response JSON with Zod/shared schemas before success rendering.
- Catch parse/network errors and show learner-safe failure copy.

---

### Next API Rewrite

**Source:** `apps/web/next.config.ts` lines 1-17  
**Apply to:** All web fetch calls.

```typescript
import type { NextConfig } from "next";

const apiBaseUrl = process.env.API_INTERNAL_URL ?? "http://localhost:3001";

const nextConfig: NextConfig = {
  transpilePackages: ["@localspeak/contracts"],
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${apiBaseUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
```

**Rules:**
- Browser calls `/api/json-analysis/...`.
- Do not hard-code `localhost:3001` in React components.
- Shared contracts package is already transpiled.

---

### Testing Library / Vitest Component Tests

**Source:** `apps/web/components/status-panel.test.tsx` lines 1-4, 17-22, 24-38  
**Apply to:** `json-analysis-panel.test.tsx`.

```tsx
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { StatusPanel } from "./status-panel";

function jsonResponse(body: unknown) {
  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve(body),
  } as Response);
}

beforeEach(() => {
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockImplementationOnce(() => jsonResponse(healthResponse))
      .mockImplementationOnce(() => jsonResponse(contractResponse)),
  );
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
```

---

### LocalSpeak Warm Card Styling

**Source:** `apps/web/app/globals.css` lines 1-16, 91-96, 172-190  
**Apply to:** All Phase 2 web components and CSS extensions.

```css
:root {
  --bg: #fafaf7;
  --card: #ffffff;
  --ink: #161513;
  --ink-soft: #5a564f;
  --ink-muted: #9b968d;
  --line: #ebe7df;
  --beige-soft: #f1ede4;
  --accent: #d97757;
  --success: #3f6b4f;
  --warning: #b88a3e;
  --danger: #9f2d20;
  --font-display: "Instrument Serif", "Iowan Old Style", Georgia, serif;
  --font-body: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace;
}

.status-card {
  border: 1px solid var(--line);
  border-radius: 18px;
  background: var(--card);
  padding: 16px;
}

.status-refresh:hover,
.status-refresh:focus-visible {
  border-color: var(--accent);
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
```

**UI-SPEC rules:**
- No shadcn/component library in Phase 2.
- Use manual CSS tokens.
- Page shell max-width becomes `960px`.
- Typography sizes only: `11px`, `16px`, `20px`, `32px`.
- Weights only: `400`, `600`.
- Controls minimum hit target: `44px`.

---

### Accessibility

**Source:** `apps/web/components/status-card.tsx` lines 25-33 and `02-UI-SPEC.md` lines 739-768  
**Apply to:** All web components.

```tsx
<article className="status-card">
  <div className="status-card__header">
    <h2 className="status-card__title">{title}</h2>
    <span className={`status-badge ${badgeClassName[badge]}`}>{badge}</span>
  </div>
  <div className="status-card__body" aria-live="polite">
    <p className="status-card__detail">{detail}</p>
    {meta ? <p className="status-card__meta">{meta}</p> : null}
  </div>
</article>
```

**Rules:**
- Main content uses `<main>`.
- Page header has one `<h1>`.
- Async validation/analysis status uses `aria-live="polite"`.
- Blocking validation errors may use `role="alert"`.
- Tabs expose selected state with `role="tab"` or `aria-pressed`.
- Do not rely on color alone; include labels like `Weak`, `Okay`, `Good`, `Warning`, `Invalid`.

---

### Security / Error Handling

**Source:** `02-VALIDATION.md` lines 62-70 and `apps/api/test/health.e2e-spec.ts` lines 25-31  
**Apply to:** API validation, API e2e, web rendering.

```typescript
expect(response.body).not.toHaveProperty("GEMINI_API_KEY");
expect(response.body).not.toHaveProperty("SUPABASE_SECRET_KEY");
```

**Rules:**
- Do not call Gemini, analytics, or third-party systems in Phase 2.
- Do not persist pasted JSON.
- Do not echo full original speech assessment in successful analysis response.
- Do not return stack traces or env values.
- Render all vendor strings and JSON paths as React text nodes; do not use `dangerouslySetInnerHTML`.

## No Analog Found

All new/modified files have at least a role-match or partial analog in the current codebase. The weakest analogs are pure metric/validation utilities because the project does not yet have existing API service or metric-helper files; use the research examples and contracts test style for those.

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `apps/api/src/json-analysis/json-analysis.metrics.ts` | utility | transform | No existing metric helper file; use research formulas and contracts fixture tests. |
| `apps/api/src/json-analysis/json-analysis.validation.ts` | utility | transform | No existing friendly Zod issue mapper; use research path formatter and shared schema issue patterns. |
| `apps/api/src/json-analysis/json-analysis.service.ts` | service | request-response transform | No existing Nest service; use controller/module style plus pure helper exports. |

## Metadata

**Analog search scope:** `packages/contracts/src`, `packages/contracts/test`, `apps/api/src`, `apps/api/test`, `apps/web/app`, `apps/web/components`, `apps/web/test`  
**Files scanned/read:** 35+ project files and phase artifacts  
**Pattern extraction date:** 2026-05-07  
**Project instructions:** `copilot-instructions.md` says to follow existing patterns; no direct source edits were made.  
**Skills:** `.github/skills/` exists with GSD skills; no Phase 2-specific implementation skill changed the pattern map.  

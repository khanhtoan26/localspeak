# Phase 3: JSON-Mode IELTS Feedback - Research

**Researched:** 2025-01-27
**Domain:** Google Gemini API structured output via `@google/genai` SDK in NestJS
**Confidence:** HIGH

## Summary

Phase 3 adds AI-powered IELTS feedback to the existing deterministic analysis pipeline. The backend receives Phase 2's `JsonAnalysisResponse` data, constructs a structured prompt, sends it to Gemini with JSON-mode enforcement (`responseMimeType` + `responseJsonSchema`), validates the response with Zod, and returns it to the frontend. The frontend adds a "Get AI Feedback" button and an "AI Coach" tab.

The key technical insight is that Google has released a **new unified SDK** (`@google/genai` v1.52.0) that replaces the older `@google-ai/generativelanguage` and `@google/generative-ai` packages. This SDK provides a clean `ai.models.generateContent()` API with `config.responseMimeType` and `config.responseJsonSchema` for strict JSON-mode output. The SDK also supports `httpOptions.timeout` for request timeouts and throws `ApiError` (extending `Error`) with an HTTP `status` code field.

**Primary recommendation:** Use `@google/genai` v1.52.0 with `responseMimeType: "application/json"` + `responseJsonSchema` for strict JSON output. Create a dedicated `GeminiFeedbackModule` in NestJS with its own service, following the existing `JsonAnalysisModule` pattern.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- D-01: Separate "Get AI Feedback" button after results show (NOT automatic)
- D-02: Button lives in results area — learner sees metrics first
- D-03: Full context in prompt (weak words, phonemes, pauses, WPM, pause ratio, bands, sentence text)
- D-04: System instruction sets IELTS coaching persona + locale; user message contains structured metrics as JSON
- D-05: System instruction emphasizes concise, direct, learner-specific. No generic platitudes.
- D-06: Strict JSON schema mode (`responseMimeType: "application/json"` + `responseJsonSchema`)
- D-07: Validate response with Zod before returning to frontend
- D-08: On failure: return friendly error, no retry, no fallback to deterministic summary
- D-09: Deterministic results remain visible, only AI tab shows error
- D-10: Feedback language matches user locale: Vietnamese default, English fallback
- D-11: Locale from Accept-Language header, include in system prompt
- D-12: No explicit language toggle in v1
- D-13: AI Coach tab alongside Summary/Words/Phonemes/Pauses tabs
- D-14: Loading skeleton with "Generating personalized feedback…"
- D-15: Error state in AI Coach tab with retry button
- D-16: `GEMINI_MODEL` env var, default `gemini-2.0-flash`
- D-17: `ApiEnvSchema` adds `GEMINI_MODEL` as optional with default
- D-18: Coach-like tone, "You" language, references specific words/sounds
- D-19: topErrors: exactly 3 specific errors with word/phoneme and IELTS relevance
- D-20: drills: exactly 3 actionable practice exercises
- D-21: summary: 2-3 sentences with band context

### Agent's Discretion
- Prompt template wording and exact system instruction text
- HTTP timeout duration for Gemini calls
- Whether to stream or wait for full response (recommend: wait, since JSON-mode needs complete response)

### Deferred Ideas (OUT OF SCOPE)
- Audio input (Phase 4)
- Saved history (Phase 5)
- Gemini Live API
- Language toggle UI
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| GEM-01 | Backend builds structured Gemini prompts from JSON-derived weak words, weak phonemes, pause stats, WPM, pause ratio, and notable pauses | `@google/genai` SDK `generateContent` with `systemInstruction` + structured user message from `JsonAnalysisResponse` fields |
| GEM-02 | Gemini JSON-mode feedback returns Pronunciation Band, Fluency Band, top 3 errors with examples, and 3 actionable drills | `responseMimeType: "application/json"` + `responseJsonSchema` enforces structure; Zod validates on receipt |
| GEM-04 | Feedback is concise, direct, learner-specific, and avoids generic advice | System instruction persona design + passing full context (weak words, phonemes, pauses) so Gemini references actual data |
</phase_requirements>

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Gemini API call + prompt construction | API / Backend | — | API key must stay server-side (security constraint) |
| Response validation (Zod) | API / Backend | — | Backend validates before returning to client |
| Accept-Language parsing | API / Backend | — | HTTP header extracted in controller/middleware |
| "Get AI Feedback" button + loading state | Browser / Client | — | User interaction trigger, no server rendering needed |
| "AI Coach" tab rendering | Browser / Client | — | Client-side tab with response data |
| Env config (GEMINI_MODEL) | API / Backend | — | Server environment only |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@google/genai` | 1.52.0 | Gemini API SDK (unified, replaces older packages) | Official Google SDK for Gemini 2.0+, supports JSON-mode natively [VERIFIED: npm registry] |
| `zod` | 4.1.13 | Response validation | Already in project; validates Gemini JSON output matches contract [VERIFIED: package.json] |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `accept-language-parser` | — | Parse Accept-Language header | Only if manual parsing is too complex (simple regex may suffice for vi/en) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `@google/genai` | `@google/generative-ai` (v0.24.1) | Old SDK, deprecated patterns, doesn't align with official codegen instructions |
| `accept-language-parser` | Manual regex | For vi/en only, regex is simpler — no extra dep needed |

**Installation:**
```bash
cd apps/api && pnpm add @google/genai
```

**Version verification:**
- `@google/genai`: 1.52.0 [VERIFIED: npm registry 2025-01-27]
- `zod`: 4.1.13 (already installed) [VERIFIED: package.json]

## Architecture Patterns

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│ Browser (Next.js Client)                                         │
│                                                                   │
│  [Results Panel] ──► "Get AI Feedback" button click              │
│       │                                                           │
│       ▼                                                           │
│  POST /api/gemini-feedback  ─── Accept-Language: vi ───►         │
│                                                                   │
│  ◄─── { pronunciationBand, fluencyBand, topErrors, drills, ... } │
│       │                                                           │
│       ▼                                                           │
│  [AI Coach Tab] renders structured feedback                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ NestJS Backend                                                    │
│                                                                   │
│  GeminiFeedbackController                                        │
│    ├── Extract Accept-Language → locale (vi/en)                  │
│    ├── Validate request body (Zod)                               │
│    └── Call GeminiFeedbackService.getFeedback(analysis, locale)  │
│                                                                   │
│  GeminiFeedbackService                                           │
│    ├── Build system instruction (persona + locale directive)     │
│    ├── Build user message (JSON metrics from request)            │
│    ├── Call ai.models.generateContent() with JSON schema         │
│    ├── Parse JSON response                                       │
│    ├── Validate with GeminiFeedbackResponseSchema (Zod)          │
│    └── Return validated response OR throw error                  │
│                                                                   │
│  ConfigService → GEMINI_API_KEY, GEMINI_MODEL                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ Gemini API (Google)                                               │
│  model: gemini-2.0-flash                                         │
│  responseMimeType: "application/json"                            │
│  responseJsonSchema: { pronunciationBand, fluencyBand, ... }     │
└─────────────────────────────────────────────────────────────────┘
```

### Recommended Project Structure
```
apps/api/src/
├── gemini-feedback/
│   ├── gemini-feedback.module.ts      # NestJS module
│   ├── gemini-feedback.controller.ts  # POST endpoint, header extraction
│   ├── gemini-feedback.service.ts     # Prompt building + Gemini call
│   └── gemini-feedback.service.spec.ts # Unit tests with mocked SDK
├── config/
│   └── env.ts                         # Updated: drop Supabase, add GEMINI_MODEL
packages/contracts/src/
├── gemini-feedback.ts                 # Enriched request/response schemas
└── index.ts                           # Re-export
apps/web/components/json-analysis/
├── ai-coach-tab.tsx                   # New: renders feedback
└── result-tabs.tsx                    # Updated: add AI Coach tab
```

### Pattern 1: Gemini JSON-Mode Call with `@google/genai`
**What:** Use the unified SDK to call Gemini with strict JSON output
**When to use:** Any structured LLM output requirement
**Example:**
```typescript
// Source: https://raw.githubusercontent.com/googleapis/js-genai/main/codegen_instructions.md
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const response = await ai.models.generateContent({
  model: "gemini-2.0-flash",
  contents: JSON.stringify(metricsPayload),
  config: {
    systemInstruction: "You are an IELTS pronunciation coach...",
    responseMimeType: "application/json",
    responseJsonSchema: {
      type: Type.OBJECT,
      properties: {
        pronunciationBand: { type: Type.NUMBER, description: "IELTS band 0-9" },
        fluencyBand: { type: Type.NUMBER, description: "IELTS band 0-9" },
        topErrors: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              word: { type: Type.STRING },
              phoneme: { type: Type.STRING },
              explanation: { type: Type.STRING },
            },
            propertyOrdering: ["word", "phoneme", "explanation"],
          },
        },
        drills: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
        summary: { type: Type.STRING },
      },
      propertyOrdering: ["pronunciationBand", "fluencyBand", "topErrors", "drills", "summary"],
    },
    httpOptions: { timeout: 30000 },
  },
});

const parsed = JSON.parse(response.text!);
```

### Pattern 2: NestJS Service with Dependency Injection
**What:** Wrap Gemini SDK in a NestJS injectable service
**When to use:** Following existing project patterns (see `JsonAnalysisService`)
```typescript
import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { GoogleGenAI, Type, ApiError } from "@google/genai";
import { GeminiFeedbackResponseSchema } from "@localspeak/contracts";

@Injectable()
export class GeminiFeedbackService {
  private readonly ai: GoogleGenAI;
  private readonly model: string;

  constructor() {
    // ApiEnvSchema already validates GEMINI_API_KEY exists
    this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    this.model = process.env.GEMINI_MODEL ?? "gemini-2.0-flash";
  }

  async getFeedback(analysisData: unknown, locale: string) {
    try {
      const response = await this.ai.models.generateContent({
        model: this.model,
        contents: JSON.stringify(analysisData),
        config: {
          systemInstruction: this.buildSystemInstruction(locale),
          responseMimeType: "application/json",
          responseJsonSchema: GEMINI_FEEDBACK_SCHEMA,
          httpOptions: { timeout: 30000 },
        },
      });

      const parsed = JSON.parse(response.text!);
      const validated = GeminiFeedbackResponseSchema.safeParse(parsed);
      if (!validated.success) {
        throw new InternalServerErrorException({
          message: "AI feedback unavailable, please try again.",
        });
      }
      return validated.data;
    } catch (error) {
      if (error instanceof ApiError) {
        // Log error.status, error.message
      }
      throw new InternalServerErrorException({
        message: "AI feedback unavailable, please try again.",
      });
    }
  }
}
```

### Pattern 3: Accept-Language Extraction
**What:** Parse browser locale from HTTP header
**When to use:** Determining feedback language
```typescript
// In controller — NestJS gives access to raw headers
@Post("feedback")
async getFeedback(
  @Body() body: unknown,
  @Headers("accept-language") acceptLanguage?: string,
) {
  const locale = this.extractLocale(acceptLanguage);
  // ...
}

private extractLocale(header?: string): "vi" | "en" {
  if (!header) return "vi"; // Vietnamese default
  // Accept-Language: vi-VN,vi;q=0.9,en;q=0.8
  const primary = header.split(",")[0].trim().toLowerCase();
  if (primary.startsWith("vi")) return "vi";
  return "en";
}
```

### Anti-Patterns to Avoid
- **Using `@google/generative-ai` (old SDK):** This is the legacy package. The new unified `@google/genai` is the standard. [VERIFIED: codegen_instructions.md]
- **Using `generationConfig` key:** The new SDK uses `config` directly, not `generationConfig`. [VERIFIED: codegen_instructions.md]
- **Using `response_schema` / `response_mime_type` (snake_case):** The JS SDK uses camelCase: `responseJsonSchema`, `responseMimeType`. [VERIFIED: codegen_instructions.md]
- **Streaming JSON-mode responses:** JSON-mode requires the complete response to be valid JSON. Don't stream; wait for full response.
- **Exposing raw Gemini errors to users:** Always wrap in a friendly message per D-08.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Gemini API communication | Custom HTTP/fetch calls | `@google/genai` SDK | Handles auth, retries internally, typed responses |
| JSON schema enforcement | Prompt-only "please return JSON" | `responseMimeType` + `responseJsonSchema` | Guaranteed valid JSON structure from API level |
| Response validation | Manual field checks | Zod schema parse | Already in project, catches edge cases |
| Accept-Language parsing | Full RFC 7231 parser | Simple split on first segment | Only need vi vs en, two-language support |

**Key insight:** The Gemini SDK's native JSON-mode eliminates the need for output parsing heuristics or retry loops for malformed JSON — the API guarantees schema-conformant output.

## Common Pitfalls

### Pitfall 1: Using the Wrong SDK Package
**What goes wrong:** Import from `@google/generative-ai` instead of `@google/genai`
**Why it happens:** Many tutorials and Stack Overflow answers reference the old package
**How to avoid:** Only install `@google/genai`. The codegen instructions explicitly mark the old package as incorrect.
**Warning signs:** Imports like `GoogleGenerativeAI`, `getGenerativeModel`, `generationConfig`

### Pitfall 2: responseJsonSchema vs response_schema Naming
**What goes wrong:** Using Python SDK naming (`response_schema`, `response_mime_type`) in JS
**Why it happens:** Google's own docs sometimes show Python examples first
**How to avoid:** Always use camelCase in JS SDK: `responseJsonSchema`, `responseMimeType`
**Warning signs:** TypeScript type errors on config object

### Pitfall 3: Empty Object in Schema
**What goes wrong:** Defining `{ type: Type.OBJECT }` without properties
**Why it happens:** Forgetting that Gemini requires OBJECT types to have properties defined
**How to avoid:** Always include `properties` map for any OBJECT type
**Warning signs:** API returns 400 error about invalid schema

### Pitfall 4: Not Handling null response.text
**What goes wrong:** `response.text` can be null/undefined if the model is blocked or returns no content
**Why it happens:** Safety filters, empty responses on certain inputs
**How to avoid:** Check `response.text` before `JSON.parse()`, treat null as error
**Warning signs:** Uncaught TypeError on JSON.parse(null)

### Pitfall 5: Supabase Env Vars Still Required
**What goes wrong:** App crashes on startup because `SUPABASE_URL` and `SUPABASE_SECRET_KEY` are still required in `ApiEnvSchema`
**Why it happens:** Phase 3 needs to clean env.ts but forgets the schema validation
**How to avoid:** Remove Supabase vars from schema AND .env.example in the same task
**Warning signs:** Zod validation error on app boot without Supabase vars set

### Pitfall 6: Prompt Too Generic
**What goes wrong:** Gemini returns platitudes like "Practice more" instead of specific feedback
**Why it happens:** System instruction doesn't strongly enforce specificity, or user message lacks enough data
**How to avoid:** Include ALL weak words, phonemes, pauses with scores in user message. System instruction must say "Reference specific words and phonemes from the data. Never give generic advice."
**Warning signs:** Feedback doesn't mention any actual words from the learner's recording

## Code Examples

### Enriched GeminiFeedbackRequestSchema
```typescript
// Source: Based on existing JsonAnalysisResponseSchema fields + D-03 decisions
import { z } from "zod";

export const GeminiFeedbackRequestSchema = z.strictObject({
  referenceText: z.string().min(1),
  pronunciationBand: z.number(),
  fluencyBand: z.number(),
  wpm: z.number().int().nonnegative(),
  pauseRatio: z.number().nonnegative(),
  weakWords: z.array(z.strictObject({
    word: z.string().min(1),
    score: z.number().min(0).max(1),
  })),
  weakPhonemePatterns: z.array(z.strictObject({
    arpabet: z.string().min(1),
    ipaExamples: z.array(z.string()),
    averageScore: z.number().min(0).max(1),
    exampleWords: z.array(z.string()),
  })),
  notablePauses: z.array(z.strictObject({
    duration: z.number(),
    severity: z.enum(["natural", "noticeable", "critical"]),
    beforeWord: z.string(),
    afterWord: z.string(),
  })),
});
```

### Enriched GeminiFeedbackResponseSchema
```typescript
// Source: D-06, D-19, D-20, D-21 decisions
import { z } from "zod";

export const TopErrorSchema = z.strictObject({
  word: z.string().min(1),
  phoneme: z.string().min(1),
  explanation: z.string().min(1),
});

export const GeminiFeedbackResponseSchema = z.strictObject({
  pronunciationBand: z.number().min(0).max(9),
  fluencyBand: z.number().min(0).max(9),
  topErrors: z.array(TopErrorSchema).length(3),
  drills: z.array(z.string().min(1)).length(3),
  summary: z.string().min(1),
});
```

### Gemini responseJsonSchema (for SDK config)
```typescript
// Source: codegen_instructions.md pattern
import { Type } from "@google/genai";

export const GEMINI_FEEDBACK_JSON_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    pronunciationBand: { type: Type.NUMBER, description: "IELTS pronunciation band estimate (0-9, step 0.5)" },
    fluencyBand: { type: Type.NUMBER, description: "IELTS fluency band estimate (0-9, step 0.5)" },
    topErrors: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          word: { type: Type.STRING, description: "The specific word with the error" },
          phoneme: { type: Type.STRING, description: "The phoneme that was mispronounced (IPA)" },
          explanation: { type: Type.STRING, description: "Brief explanation of why this matters for IELTS" },
        },
        propertyOrdering: ["word", "phoneme", "explanation"],
      },
      description: "Exactly 3 top pronunciation errors from the data",
    },
    drills: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Exactly 3 actionable practice exercises",
    },
    summary: { type: Type.STRING, description: "2-3 sentence overall assessment with band context" },
  },
  propertyOrdering: ["pronunciationBand", "fluencyBand", "topErrors", "drills", "summary"],
};
```

### System Instruction Template (Agent's Discretion)
```typescript
// Agent's discretion on exact wording
function buildSystemInstruction(locale: "vi" | "en"): string {
  const langDirective = locale === "vi"
    ? "Respond entirely in Vietnamese."
    : "Respond entirely in English.";

  return `You are an expert IELTS Speaking examiner and pronunciation coach.
${langDirective}

Your task: Analyze the pronunciation and fluency metrics provided and give specific, actionable feedback.

Rules:
- Be concise and direct. No platitudes or generic advice.
- Reference SPECIFIC words and phonemes from the provided data.
- Each error must cite the actual word/phoneme that triggered it.
- Each drill must be a concrete exercise the learner can do immediately.
- Summary must contextualize the bands (e.g., "Band 6.5 means...")
- Use "You" language — address the learner directly.
- For Vietnamese learners: be aware of common L1 interference (/θ/ → /t/, dropped finals, cluster reduction).`;
}
```

### Updated env.ts
```typescript
// Drop Supabase, add GEMINI_MODEL
import { z } from "zod";

export const ApiEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3001),
  GEMINI_API_KEY: z.preprocess(
    (v) => (typeof v === "string" ? v.trim() : ""),
    z.string().min(1, "GEMINI_API_KEY is required"),
  ),
  GEMINI_MODEL: z.string().default("gemini-2.0-flash"),
});
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `@google/generative-ai` SDK | `@google/genai` unified SDK | 2024-2025 | New API surface, different method names, config structure |
| `generationConfig.responseMimeType` | `config.responseMimeType` | With new SDK | Config is top-level in generateContent params |
| `GoogleGenerativeAI` class | `GoogleGenAI` class | With new SDK | Different import, different instantiation |
| `model.generateContent()` | `ai.models.generateContent()` | With new SDK | Models accessed via `ai.models` submodule |
| `response_schema` (Python naming) | `responseJsonSchema` (JS camelCase) | Always for JS | Common confusion from Python docs |

**Deprecated/outdated:**
- `@google/generative-ai` (v0.24.1): Still published but superseded by `@google/genai`. The official codegen instructions explicitly say to use the new package.
- `getGenerativeModel()`: Old pattern. Use `ai.models.generateContent()` directly.
- `GoogleGenerativeAI`: Old class name. Use `GoogleGenAI`.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `gemini-2.0-flash` supports `responseJsonSchema` for structured output | Standard Stack | Would need different model; low risk — flash models support JSON mode [CITED: ai.google.dev/gemini-api/docs] |
| A2 | `ApiError` has a `status` field for HTTP code | Error handling | Would need to check different field; low risk |
| A3 | 30s timeout is sufficient for Gemini flash model JSON responses | Architecture | Might need increase; easily adjustable via env var |

## Open Questions

1. **Array length enforcement in responseJsonSchema**
   - What we know: Schema defines `topErrors` as ARRAY with 3 items, `drills` as ARRAY with 3 items
   - What's unclear: Whether Gemini's schema mode can enforce exact array length (min/max items) or if this is prompt-enforced only
   - Recommendation: Enforce "exactly 3" in both the schema description AND the system instruction. Validate with Zod `.length(3)` on response.

2. **Number precision for bands**
   - What we know: IELTS bands are in 0.5 steps (5.5, 6.0, 6.5, 7.0, etc.)
   - What's unclear: Whether `Type.NUMBER` can be constrained to 0.5 steps in schema
   - Recommendation: Use prompt instruction ("bands must be in 0.5 increments") + Zod validation with `.multipleOf(0.5)`

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | `@google/genai` (requires ≥20) | ✓ | (monorepo runs on Node) | — |
| `@google/genai` | Gemini API calls | ✗ (not yet installed) | 1.52.0 target | — |
| GEMINI_API_KEY | Authentication | Required at runtime | — | No fallback — hard requirement |
| Gemini API network access | API calls | Assumed ✓ | — | Return friendly error per D-08 |

**Missing dependencies with no fallback:**
- `@google/genai` must be installed (`pnpm add @google/genai` in apps/api)
- `GEMINI_API_KEY` must be set in environment

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest 30.2.0 + ts-jest 29.4.5 |
| Config file | `apps/api/jest.config.ts` |
| Quick run command | `cd apps/api && pnpm test:unit` |
| Full suite command | `cd apps/api && pnpm test` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| GEM-01 | Service builds correct prompt from analysis data | unit | `cd apps/api && pnpm test:unit -- --testPathPattern gemini-feedback` | ❌ Wave 0 |
| GEM-02 | Service handles JSON response + Zod validation | unit | `cd apps/api && pnpm test:unit -- --testPathPattern gemini-feedback` | ❌ Wave 0 |
| GEM-04 | System instruction enforces specific/concise feedback | unit (prompt snapshot) | `cd apps/api && pnpm test:unit -- --testPathPattern gemini-feedback` | ❌ Wave 0 |
| GEM-02 | E2E: POST /gemini-feedback returns valid schema | e2e | `cd apps/api && pnpm test:e2e -- --testPathPattern gemini-feedback` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `cd apps/api && pnpm test:unit -- --testPathPattern gemini-feedback`
- **Per wave merge:** `cd apps/api && pnpm test`
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] `apps/api/src/gemini-feedback/gemini-feedback.service.spec.ts` — covers GEM-01, GEM-02, GEM-04 (mock SDK)
- [ ] `apps/api/test/gemini-feedback.e2e-spec.ts` — E2E with mocked Gemini (covers GEM-02 integration)

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | — |
| V3 Session Management | no | — |
| V4 Access Control | no | No auth in this phase |
| V5 Input Validation | yes | Zod schema validation on request body |
| V6 Cryptography | no | — |

### Known Threat Patterns for this stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| API key exposure in client | Information Disclosure | Key stays server-side only (architectural constraint) |
| Prompt injection via user input | Tampering | Request body is validated structured data, not freeform text; analysis data is computed server-side |
| Excessive API cost from abuse | Denial of Service | Rate limiting (can add later); request size already limited by Phase 2 |

## Sources

### Primary (HIGH confidence)
- npm registry: `@google/genai` v1.52.0, `@google/generative-ai` v0.24.1 [VERIFIED]
- GitHub codegen_instructions.md: https://raw.githubusercontent.com/googleapis/js-genai/refs/heads/main/codegen_instructions.md [VERIFIED: fetched and read]
- SDK types.ts: `HttpOptions.timeout`, `GenerateContentConfig.httpOptions`, `ApiError` [VERIFIED: source inspection]
- Existing codebase: `env.ts`, `json-analysis.service.ts`, `gemini-feedback.ts`, `package.json` [VERIFIED: file reads]

### Secondary (MEDIUM confidence)
- SDK README on npm: initialization pattern, `ai.models.generateContent()` API [VERIFIED]

### Tertiary (LOW confidence)
- None

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - verified SDK version, read official codegen instructions
- Architecture: HIGH - follows existing NestJS patterns in codebase
- Pitfalls: HIGH - derived from verified SDK docs and existing code inspection

**Research date:** 2025-01-27
**Valid until:** 2025-02-27 (SDK is actively maintained, check for breaking changes)

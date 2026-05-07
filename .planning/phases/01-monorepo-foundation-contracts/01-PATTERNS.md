# Phase 01: Monorepo Foundation & Contracts - Pattern Map

**Mapped:** 2026-05-07  
**Files analyzed:** 36  
**Analogs found:** 36 / 36  
**Production code analogs:** 0 / 36  
**Reference analogs:** `.planning/phases/01-monorepo-foundation-contracts/01-RESEARCH.md`, `.planning/phases/01-monorepo-foundation-contracts/01-UI-SPEC.md`, `.wireframe/*`, `.artifacts/speech-response.json`

> This is a greenfield repo with no production app code yet. Treat `.wireframe/` and `.artifacts/speech-response.json` as reference artifacts, not production code to copy wholesale.

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---:|---:|---|---|
| `package.json` | config | batch | `01-RESEARCH.md` stack/scripts guidance | research-exact |
| `pnpm-workspace.yaml` | config | batch | `01-RESEARCH.md` workspace guidance | research-exact |
| `README.md` | config/docs | request-response | `01-CONTEXT.md`, `01-RESEARCH.md` setup guidance | research-exact |
| `.gitignore` | config | file-I/O | standard scaffold pattern | no-codebase-analog |
| `tsconfig.base.json` | config | transform | standard TypeScript monorepo pattern | no-codebase-analog |
| `packages/contracts/package.json` | config | batch | `01-RESEARCH.md` contracts package guidance | research-exact |
| `packages/contracts/tsconfig.json` | config | transform | `01-RESEARCH.md` TypeScript package guidance | research-structure |
| `packages/contracts/src/index.ts` | utility | transform | `01-RESEARCH.md` public barrel guidance | research-exact |
| `packages/contracts/src/speech-assessment.ts` | model | transform | `01-RESEARCH.md`, `.artifacts/speech-response.json` | reference-exact |
| `packages/contracts/src/json-analysis.ts` | model | request-response | `01-RESEARCH.md` v1 shell guidance | research-shell |
| `packages/contracts/src/audio-analysis.ts` | model | file-I/O | `01-RESEARCH.md` v1 shell guidance | research-shell |
| `packages/contracts/src/saved-session.ts` | model | CRUD | `01-RESEARCH.md` v1 shell guidance | research-shell |
| `packages/contracts/src/gemini-feedback.ts` | model | request-response | `01-RESEARCH.md` v1 shell guidance | research-shell |
| `packages/contracts/test/speech-assessment.fixture.test.ts` | test | transform | `01-RESEARCH.md` fixture test pattern | research-exact |
| `apps/api/package.json` | config | batch | `01-RESEARCH.md` Nest package guidance | research-exact |
| `apps/api/.env.example` | config | request-response | `01-CONTEXT.md`, `01-RESEARCH.md` env guidance | research-exact |
| `apps/api/src/main.ts` | config | request-response | `01-RESEARCH.md` Nest bootstrap guidance | research-pattern |
| `apps/api/src/app.module.ts` | provider | request-response | `01-RESEARCH.md` Nest module guidance | research-structure |
| `apps/api/src/config/env.ts` | config | transform | `01-RESEARCH.md` Zod env validation pattern | research-exact |
| `apps/api/src/config/env.spec.ts` | test | transform | `01-RESEARCH.md` env test map | research-exact |
| `apps/api/src/health/health.controller.ts` | controller | request-response | `01-RESEARCH.md` health controller pattern | research-exact |
| `apps/api/src/health/health.module.ts` | provider | request-response | `01-RESEARCH.md` Nest module guidance | research-structure |
| `apps/api/src/contracts/contracts.controller.ts` | controller | request-response | `01-RESEARCH.md` contracts controller pattern | research-exact |
| `apps/api/src/contracts/contracts.module.ts` | provider | request-response | `01-RESEARCH.md` Nest module guidance | research-structure |
| `apps/api/test/health.e2e-spec.ts` | test | request-response | `01-RESEARCH.md` API e2e test map | research-exact |
| `apps/api/test/contracts.e2e-spec.ts` | test | request-response | `01-RESEARCH.md` API e2e test map | research-exact |
| `apps/web/package.json` | config | batch | `01-RESEARCH.md` Next package guidance | research-exact |
| `apps/web/.env.example` | config | request-response | `01-RESEARCH.md` frontend env security guidance | research-security |
| `apps/web/next.config.ts` | config | request-response | `01-RESEARCH.md` Next rewrite pattern | research-exact |
| `apps/web/app/page.tsx` | component | request-response | `01-UI-SPEC.md` page scope and interaction contract | ui-exact |
| `apps/web/app/globals.css` | config/component | transform | `01-UI-SPEC.md`, `.wireframe/components.jsx` tokens | visual-reference |
| `apps/web/components/status-panel.tsx` | component | request-response | `01-UI-SPEC.md` layout and state contract | ui-exact |
| `apps/web/components/status-card.tsx` | component | request-response | `01-UI-SPEC.md`, `.wireframe/components.jsx` card/tag atom | ui-exact |
| `apps/web/components/status-panel.test.tsx` | test | request-response | `01-RESEARCH.md`, `01-UI-SPEC.md` frontend test pattern | research-exact |
| `apps/web/vitest.config.mts` | config | batch | `01-RESEARCH.md` frontend test guidance | research-pattern |
| `apps/web/test/setup.ts` | config/test | batch | `01-RESEARCH.md` frontend test guidance | research-pattern |

---

## Pattern Assignments

### Root workspace/config files

Applies to:

- `package.json`
- `pnpm-workspace.yaml`
- `README.md`
- `.gitignore`
- `tsconfig.base.json`
- app/package config files

**Analog:** `01-RESEARCH.md`

**Workspace layout pattern:**

```text
.
├── package.json
├── pnpm-workspace.yaml
├── README.md
├── apps/
│   ├── web/
│   └── api/
└── packages/
    └── contracts/
```

**pnpm workspace pattern:**

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

```json
{
  "dependencies": {
    "@localspeak/contracts": "workspace:*"
  }
}
```

**Root command pattern:**

```text
Root scripts must include:
- dev
- dev:web
- dev:api
- check
- test
- build
```

**Implementation guidance:**

- Use `concurrently` for root `dev`.
- Keep Phase 1 simple; do not introduce Turborepo unless planner explicitly chooses to.
- Apps must consume `@localspeak/contracts` via `workspace:*`.

---

### `packages/contracts/src/speech-assessment.ts`

**Role:** model  
**Data flow:** transform  
**Analog:** `01-RESEARCH.md` and `.artifacts/speech-response.json`

**Core schema pattern:**

```ts
import { z } from "zod";

export const SpeechPhoneSchema = z.looseObject({
  start_time: z.number(),
  end_time: z.number(),
  phone: z.string(),
  phone_ipa: z.string(),
  score: z.number(),
  score_raw: z.number(),
});

export const SpeechWordSchema = z.looseObject({
  start_time: z.number(),
  end_time: z.number(),
  word: z.string(),
  score: z.number(),
  score_raw: z.number(),
  phones: z.array(SpeechPhoneSchema),
});

export const SpeechAssessmentResponseSchema = z.looseObject({
  success: z.boolean(),
  msg: z.string(),
  result: z.array(SpeechWordSchema),
  text_refs: z.string(),
  audio_url: z.string(),
  total_score: z.number(),
  response_time: z.union([z.string(), z.number()]),
});

export type SpeechAssessmentResponse = z.infer<typeof SpeechAssessmentResponseSchema>;
```

**Important correction for implementation:**

- The actual fixture has `"response_time": "1.711"` as a string.
- Planner should require the implemented schema/test to match fixture reality, likely `z.string()` or a coercing/union schema.
- Keep vendor layers loose: required known fields validate, unknown fields pass through.

---

### Contract shell files

Applies to:

- `packages/contracts/src/json-analysis.ts`
- `packages/contracts/src/audio-analysis.ts`
- `packages/contracts/src/saved-session.ts`
- `packages/contracts/src/gemini-feedback.ts`
- `packages/contracts/src/index.ts`

**Role:** model/utility  
**Data flow:** request-response, file-I/O, CRUD, transform  
**Analog:** `01-RESEARCH.md`

**Implementation guidance:**

- Each shell file should export a Zod schema and inferred TypeScript type.
- `index.ts` should be the public barrel export consumed by `apps/web` and `apps/api`.
- Avoid duplicating types in app folders.

---

### `packages/contracts/test/speech-assessment.fixture.test.ts`

**Role:** test  
**Data flow:** transform  
**Analog:** `01-RESEARCH.md`

**Imports/test pattern:**

```ts
import { describe, expect, it } from "vitest";
import fixture from "../../../.artifacts/speech-response.json";
import { SpeechAssessmentResponseSchema } from "../src";

describe("speech assessment fixture contract", () => {
  it("validates the real sample fixture", () => {
    expect(SpeechAssessmentResponseSchema.safeParse(fixture).success).toBe(true);
  });

  it("preserves unknown vendor fields", () => {
    const result = SpeechAssessmentResponseSchema.parse({
      ...fixture,
      vendor_extra: { kept: true },
    });

    expect(result.vendor_extra).toEqual({ kept: true });
  });
});
```

**Validation guidance:**

- Test the real fixture.
- Test unknown vendor passthrough.
- Include a regression expectation for the actual `response_time` fixture type.

---

### `apps/api/src/config/env.ts`

**Role:** config  
**Data flow:** transform/startup validation  
**Analog:** `01-RESEARCH.md`

**Core validation pattern:**

```ts
import { z } from "zod";

const ApiEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3001),
  GEMINI_API_KEY: z.string().min(1, "GEMINI_API_KEY is required"),
  SUPABASE_URL: z.string().url("SUPABASE_URL must be a URL"),
  SUPABASE_SECRET_KEY: z.string().min(1, "SUPABASE_SECRET_KEY is required"),
});

export type ApiEnv = z.infer<typeof ApiEnvSchema>;

export function validateApiEnv(config: Record<string, unknown>): ApiEnv {
  return ApiEnvSchema.parse(config);
}
```

**Error/security pattern:**

- Missing backend env vars fail fast at API startup with clear variable names.
- Tests should use dummy values.
- `/health` must not call Gemini or Supabase.
- Gemini API key and Supabase secret key must not appear in frontend env.

---

### `apps/api/src/health/health.controller.ts`

**Role:** controller  
**Data flow:** request-response  
**Analog:** `01-RESEARCH.md`

**Controller pattern:**

```ts
import { Controller, Get } from "@nestjs/common";

@Controller("health")
export class HealthController {
  @Get()
  getHealth() {
    return {
      status: "ok",
      service: "localspeak-api",
      timestamp: new Date().toISOString(),
    };
  }
}
```

**Important constraints:**

- Do not call Gemini.
- Do not call Supabase.
- Do not leak env details.
- Response is generic and safe.

---

### `apps/api/src/contracts/contracts.controller.ts`

**Role:** controller  
**Data flow:** request-response + transform  
**Analog:** `01-RESEARCH.md`

**Controller pattern:**

```ts
import { Controller, Get } from "@nestjs/common";
import fixture from "../../../../.artifacts/speech-response.json";
import { SpeechAssessmentResponseSchema } from "@localspeak/contracts";

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

**Validation/error pattern:**

- Use `safeParse`, not `parse`, so endpoint returns structured validation status instead of crashing.
- Return `issues: []` on success.
- Return Zod issues on validation failure.
- Do not mutate fixture.

---

### API modules/bootstrap/tests

Applies to:

- `apps/api/src/main.ts`
- `apps/api/src/app.module.ts`
- `apps/api/src/health/health.module.ts`
- `apps/api/src/contracts/contracts.module.ts`
- `apps/api/test/health.e2e-spec.ts`
- `apps/api/test/contracts.e2e-spec.ts`
- `apps/api/src/config/env.spec.ts`

**Role:** provider/config/test  
**Data flow:** request-response/startup validation  
**Analog:** `01-RESEARCH.md`

**Required backend test coverage:**

```text
Nest /health returns ok.
Backend /contracts/sample-json/validate returns valid result.
Missing backend env fails startup with clear variable names.
.env.example files document Gemini and Supabase variables.
```

---

### `apps/web/next.config.ts`

**Role:** config  
**Data flow:** request-response proxy  
**Analog:** `01-RESEARCH.md`

**Rewrite pattern:**

```ts
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

**Integration guidance:**

- Frontend should fetch same-origin `/api/health`.
- Frontend should fetch same-origin `/api/contracts/sample-json/validate`.
- Do not expose backend-only secrets to the browser.
- Use `NEXT_PUBLIC_*` only for safe public values.

---

### `apps/web/app/page.tsx`

**Role:** component/page  
**Data flow:** request-response  
**Analog:** `01-UI-SPEC.md`

**Required UI scope:**

```text
The page must show:
1. Project name: LocalSpeak
2. Backend /health status
3. /contracts/sample-json/validate fixture validation status
4. A manual refresh action
5. Loading, success, and error states for both checks

Do not implement:
- Full dashboard
- Auth UI
- JSON input UI
- Audio upload/recording UI
- IELTS analysis tabs
- Charts, score rings, timelines, history, or mode switching
- Shared component library beyond simple local atoms if useful
```

**Fetch interaction pattern:**

```text
Show shell immediately.
Start both cards in Checking state.
Fetch /api/health and /api/contracts/sample-json/validate independently.
Refresh Status button re-runs both checks and disables while in flight.
Do not crash page on fetch failure.
```

---

### `apps/web/components/status-panel.tsx`

**Role:** component  
**Data flow:** request-response  
**Analog:** `01-UI-SPEC.md`, `.wireframe/app.jsx`

**Layout pattern:**

```text
main
└── section.status-shell
    ├── header
    │   ├── LocalSpeak tag
    │   ├── h1 "LocalSpeak"
    │   └── paragraph
    ├── card: API Health
    ├── card: Contract Fixture
    ├── button: Refresh Status
    └── helper text
```

**Adaptation guidance:**

- Do not use the iOS device frame in Phase 1.
- Copy the warm centered shell feeling, not the demo wrapper.
- Use max width `720px`, centered container, single-column stack.

---

### `apps/web/components/status-card.tsx`

**Role:** component  
**Data flow:** request-response  
**Analog:** `01-UI-SPEC.md`, `.wireframe/components.jsx`

**Status card contract:**

```text
Background: #ffffff
Border: 1px solid #ebe7df
Radius: 18px
Padding: 16px
Layout: Header row + status badge + detail text
Title: 20px, 600, dark ink
Detail: 16px, 400, soft ink
Metadata: 11px, mono or uppercase sans

States:
- Loading: Beige badge, muted text
- Success: Healthy badge/dot
- Error: Neutral/destructive-tinted badge, clear error text
```

**Wireframe atoms to adapt, not copy wholesale:**

- Card: white background, `18px` radius, `1px solid #ebe7df`, `16px` padding.
- Tag/badge: pill shape and compact metadata style, but use UI-SPEC-compliant `4px 8px` padding.
- Button: dark ink primary button style, but use UI-SPEC-compliant `16px 24px` padding and `44px` minimum height.

---

### `apps/web/app/globals.css`

**Role:** config/component styling  
**Data flow:** transform  
**Analog:** `01-UI-SPEC.md`, `.wireframe/components.jsx`

**Design tokens reference:**

```text
--bg: #fafaf7
--card: #ffffff
--ink: #161513
--ink-soft: #5a564f
--ink-muted: #9b968d
--line: #ebe7df
--beige-soft: #f1ede4
--accent: #d97757
--success: #3f6b4f
--warning: #b88a3e
```

**Typography contract:**

```text
Label: 11px / 600 / 1.2
Body: 16px / 400 / 1.5
Heading: 20px / 600 / 1.2
Display: 32px / 400 / 1.1
```

---

### `apps/web/components/status-panel.test.tsx`

**Role:** test  
**Data flow:** request-response  
**Analog:** `01-RESEARCH.md`, `01-UI-SPEC.md`

**Frontend test pattern:**

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StatusPanel } from "./status-panel";

describe("StatusPanel", () => {
  it("renders API health and contract fixture status", () => {
    render(
      <StatusPanel
        apiHealth={{ status: "ok", service: "localspeak-api" }}
        contractCheck={{ valid: true, contract: "speech-assessment-response.v1" }}
      />,
    );

    expect(screen.getByText(/localspeak/i)).toBeInTheDocument();
    expect(screen.getByText(/api.*ok/i)).toBeInTheDocument();
    expect(screen.getByText(/fixture.*valid/i)).toBeInTheDocument();
  });
});
```

**Minimum UI assertions:**

```text
screen.getByText(/localspeak/i)
screen.getByText(/api health/i)
screen.getByText(/contract fixture/i)
screen.getByRole("button", { name: /refresh status/i })
screen.getByText(/api.*ok/i) OR screen.getByText(/responding/i)
screen.getByText(/fixture.*valid/i) OR screen.getByText(/validates/i)
```

---

## Shared Patterns

### 1. Greenfield source-of-truth pattern

No production application code exists yet. New frontend app starts at `apps/web`, new backend app starts at `apps/api`, and shared contracts live in `packages/contracts`.

### 2. Shared contract boundary

Use `packages/contracts` for Zod schemas consumed by both apps. Backend validates the real fixture using shared schemas. Frontend/backend integration uses Nest endpoints accessed from Next through a rewrite.

### 3. Zod loose vendor validation

```ts
z.looseObject({
  // required known fields here
});
```

Validate known required fields and preserve unknown vendor fields.

### 4. Backend-owned secrets

Gemini API key must stay server-side. Missing backend environment variables should fail fast. Health endpoint should not call Gemini or Supabase. Never put Gemini keys or Supabase secret keys in `NEXT_PUBLIC_*` variables.

### 5. Next same-origin API rewrite

Use `/api/:path*` rewrites to the Nest dev server; frontend calls same-origin paths.

### 6. LocalSpeak visual atoms

Use `.wireframe/components.jsx` only as visual reference:

```text
bg #fafaf7, card #ffffff, ink #161513, inkSoft #5a564f, inkMute #9b968d, line #ebe7df, accent #d97757, success #3f6b4f
```

Implement idiomatic Next/React/TypeScript, not global `window.T`.

---

## No Analog Found

There is no production codebase analog because the repository is greenfield. These files should use scaffold/framework defaults plus the research/UI reference patterns above:

| File | Role | Data Flow | Reason |
|---|---:|---:|---|
| `.gitignore` | config | file-I/O | No existing repo app scaffold |
| `tsconfig.base.json` | config | transform | No existing TypeScript config |
| `apps/api/src/main.ts` | config | request-response | No existing Nest bootstrap |
| `apps/api/src/app.module.ts` | provider | request-response | No existing Nest module |
| `apps/web/vitest.config.mts` | config | batch | No existing frontend test config |
| `apps/web/test/setup.ts` | config/test | batch | No existing frontend test setup |

---

## Planner Implementation Warnings

1. Do not copy `.wireframe/` wholesale. It uses global browser objects (`window.T`, `window.Icon`) and inline demo patterns. Use only visual tokens and layout direction.
2. Do not expose secrets in frontend env. Gemini and Supabase secret keys belong only in `apps/api`.
3. Do not make `/health` call external services. It should be fast, local, and safe.
4. Check fixture reality before finalizing schema. Actual `.artifacts/speech-response.json` has `response_time` as a string.
5. Prefer shared contract imports. Apps should import schemas/types from `@localspeak/contracts`; do not duplicate response types.
6. Keep Phase 1 UI minimal. No auth, upload, recording, charts, score rings, history, tabs, or full design system.

---

## Metadata

**Analog search scope:**

- `.planning/phases/01-monorepo-foundation-contracts/01-CONTEXT.md`
- `.planning/phases/01-monorepo-foundation-contracts/01-RESEARCH.md`
- `.planning/phases/01-monorepo-foundation-contracts/01-UI-SPEC.md`
- `.artifacts/speech-response.json`
- `.wireframe/components.jsx`
- `.wireframe/app.jsx`
- `.wireframe/screens-static.jsx`
- `.wireframe/data.js`
- root project instructions

**Production app files found:** 0  
**Pattern extraction date:** 2026-05-07

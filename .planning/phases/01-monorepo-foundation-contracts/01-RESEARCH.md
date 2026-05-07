# Phase 01: Monorepo Foundation & Contracts - Research

**Researched:** 2026-05-07  
**Domain:** pnpm monorepo, Next.js frontend, NestJS backend, shared Zod contracts, env validation, walking skeleton testing  
**Confidence:** HIGH for stack and framework patterns; MEDIUM for exact scaffold sequencing because no production app exists yet.

## User Constraints

### Locked Decisions

- Use a pnpm workspace.
- Use top-level layout `apps/web`, `apps/api`, and `packages/contracts`.
- Provide root `dev`, `dev:web`, and `dev:api` commands.
- Phase 1 baseline must prove the Next.js page can call a NestJS health endpoint.
- Shared API contracts use Zod schemas with inferred TypeScript types.
- Phase 1 defines top-level v1 shells for JSON analysis, audio analysis, saved sessions, and Gemini feedback.
- Speech assessment JSON validation should require known fields while passing through unknown vendor fields.
- Use `.artifacts/speech-response.json` as a validation fixture.
- Document hosted Supabase env vars now; defer local Supabase CLI.
- Backend validates Gemini env at startup, but `/health` does not call Gemini.
- Include root setup docs plus app-specific `.env.example` files for `apps/web` and `apps/api`.
- Missing backend env vars fail fast at API startup with clear variable names.
- Phase 1 UI is a minimal status page that references `.wireframe/` visual direction.
- Backend exposes `/health` and `/contracts/sample-json/validate`.
- Automated checks cover contract fixture validation, API health behavior, and frontend health-status rendering.

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| ARCH-01 | Monorepo contains a Next.js frontend app and NestJS backend app with clear local development commands. | Use pnpm workspace with `apps/web`, `apps/api`, `packages/contracts`, root `dev`, `dev:web`, `dev:api`. |
| ARCH-02 | Shared request/response contracts exist for JSON analysis, audio analysis, saved sessions, and Gemini feedback. | Use `packages/contracts` with Zod schemas and inferred TypeScript types; export v1 shells; validate `.artifacts/speech-response.json`. |
| ARCH-04 | Server-side configuration documents required Gemini and Supabase environment variables. | Use app-specific `.env.example` files; Nest config validation fails fast for backend secrets; Next only exposes `NEXT_PUBLIC_` values. |

## Summary

Use a small pnpm workspace as the foundation: `apps/web` for Next.js, `apps/api` for NestJS, and `packages/contracts` for Zod schemas consumed by both apps. A root `pnpm-workspace.yaml` should declare `apps/*` and `packages/*`; apps should depend on the contracts package with `workspace:*` to force local resolution.

The shared contracts package should be the first stable boundary. Define v1 shell schemas for JSON analysis, audio analysis, saved sessions, and Gemini feedback, plus a concrete speech-assessment fixture schema for `.artifacts/speech-response.json`. For vendor payloads, use Zod loose object behavior so required known fields are validated but unknown vendor fields survive parsing.

For local frontend/backend integration, prefer a Next.js rewrite from `/api/:path*` to the NestJS dev server. The web app can fetch same-origin `/api/health` and `/api/contracts/sample-json/validate`, while Nest remains a separate backend process on its own port.

Primary recommendation: build the walking skeleton as a pnpm workspace with root orchestration, a compiled `@localspeak/contracts` Zod package, Nest `/health` and `/contracts/sample-json/validate`, and a minimal Next status page that fetches those endpoints through a rewrite.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|--------------|----------------|-----------|
| Local monorepo orchestration | Repository/tooling | Frontend + backend | Root pnpm scripts coordinate apps; individual apps own their dev servers. |
| Shared API contracts | Shared package | Frontend + backend | Contracts belong in `packages/contracts`; apps consume schemas/types rather than duplicating shapes. |
| Speech fixture validation | Backend API | Shared package | Backend endpoint validates the real fixture using shared Zod schemas; package tests validate the schema directly. |
| Health status display | Browser/client | API/backend | Next page renders status; Nest owns health response. |
| Gemini env validation | API/backend | Repository docs | Gemini key must stay backend-only; Nest should fail fast at startup when required backend env is missing. |
| Supabase env documentation | Repository docs | Frontend + backend | Phase 1 documents hosted Supabase variables only; local Supabase CLI is deferred. |
| Minimal visual direction | Frontend | Wireframe reference | Use warm card-based LocalSpeak styling from `.wireframe/` without implementing a full design system. |

## Standard Stack

| Library / Tool | Recommended Version | Purpose | Notes |
|----------------|---------------------|---------|-------|
| pnpm | local `10.33.0` | Workspace package manager and root scripts | Use `pnpm-workspace.yaml` and `workspace:*`. |
| Next.js | current stable (`16.x` observed) | Frontend app in `apps/web` | Use TypeScript and App Router. |
| React / React DOM | current stable (`19.x` observed) | Next.js UI runtime | Match the Next.js scaffold. |
| NestJS | current stable (`11.x` observed) | Backend API in `apps/api` | Use controllers/modules and Nest testing utilities. |
| Zod | current stable (`4.x` observed) | Runtime schemas and inferred types | Use loose object schemas for vendor payloads. |
| TypeScript | current stable (`5.x` observed) | Shared type system | Required across apps and contracts. |
| concurrently | current stable | Root `dev` orchestration | Simpler than Turborepo for Phase 1. |
| Vitest | current stable (`4.x` observed) | Contracts and frontend unit tests | Good fit for Zod fixture tests and presentational React tests. |
| Jest + Supertest | current stable | Nest unit/e2e tests | Standard Nest testing approach. |

## Recommended File Structure

```text
.
├── package.json
├── pnpm-workspace.yaml
├── README.md
├── apps/
│   ├── web/
│   │   ├── app/
│   │   ├── components/
│   │   ├── next.config.ts
│   │   ├── .env.example
│   │   └── package.json
│   └── api/
│       ├── src/
│       │   ├── app.module.ts
│       │   ├── main.ts
│       │   ├── health/
│       │   ├── contracts/
│       │   └── config/
│       ├── test/
│       ├── .env.example
│       └── package.json
└── packages/
    └── contracts/
        ├── src/
        │   ├── index.ts
        │   ├── speech-assessment.ts
        │   ├── json-analysis.ts
        │   ├── audio-analysis.ts
        │   ├── saved-session.ts
        │   └── gemini-feedback.ts
        ├── test/
        │   └── speech-assessment.fixture.test.ts
        └── package.json
```

## Implementation Patterns

### Pattern 1: pnpm workspace + local package dependency

Root workspace:

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

App dependency:

```json
{
  "dependencies": {
    "@localspeak/contracts": "workspace:*"
  }
}
```

### Pattern 2: Zod loose object for vendor speech JSON

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
  response_time: z.number(),
});

export type SpeechAssessmentResponse = z.infer<typeof SpeechAssessmentResponseSchema>;
```

Fixture facts: top-level fixture keys include `success`, `msg`, `result`, `text_refs`, `audio_url`, `total_score`, and `response_time`. Word entries include timing, scores, `letters`, `phones`, and `word`; phone entries include timing, `phone`, `phone_ipa`, `score`, and `score_raw`.

### Pattern 3: Nest env validation with Zod

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

Use the validation function in Nest config bootstrap. Tests should inject dummy values; Phase 1 should not require real Gemini or Supabase credentials.

### Pattern 4: Next rewrite for same-origin walking skeleton

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

## Anti-Patterns to Avoid

- Duplicating contract types in `apps/web` and `apps/api`; import schemas/types from `@localspeak/contracts`.
- Using strict Zod object behavior for vendor fixture layers where unknown fields must survive.
- Putting Gemini API keys or Supabase secret keys in `NEXT_PUBLIC_*` variables.
- Making `/health` call Gemini or Supabase.
- Building the full design system from `.wireframe/` during Phase 1.
- Solving local dev integration with broad production CORS before trying the Next rewrite path.

## Code Examples

### Contract fixture validation test

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

### Nest health controller

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

### Nest sample fixture validation endpoint

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

### Next status component test pattern

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

## Environment Availability

| Dependency | Required By | Availability | Fallback |
|------------|-------------|--------------|----------|
| Node.js | Next/Nest/pnpm | Available locally | None needed |
| npm | Scaffolding/version checks | Available locally | pnpm |
| pnpm | Workspace install/scripts | Available locally | None recommended |
| Gemini API key | Backend startup env validation | Not verified and should not be printed | Use dummy values in automated tests; real Gemini calls are out of Phase 1. |
| Hosted Supabase URL/key | Env docs and future setup | Not verified and should not be printed | Phase 1 documents variables only; no Supabase call required. |
| Supabase CLI | Local Supabase | Not required | Deferred by user decision. |

## Validation Architecture

### Test Infrastructure

| Property | Value |
|----------|-------|
| Contracts tests | Vitest |
| Frontend tests | Vitest + React Testing Library + jsdom |
| Backend tests | Jest + `@nestjs/testing` + Supertest |
| Quick run command | `pnpm check` |
| Full suite command | `pnpm test && pnpm build` |

### Phase Requirements -> Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|--------------|
| ARCH-01 | Root `dev`, `dev:web`, `dev:api` scripts exist and apps can compile | smoke/build | `pnpm build` | no, Wave 0 |
| ARCH-01 | Nest `/health` returns ok | API e2e | `pnpm --filter api test:e2e -- health` | no, Wave 0 |
| ARCH-01 | Next status page renders API health | frontend unit | `pnpm --filter web test -- status-panel` | no, Wave 0 |
| ARCH-02 | Speech fixture validates against shared contract | contract unit | `pnpm --filter @localspeak/contracts test` | no, Wave 0 |
| ARCH-02 | Unknown vendor fields pass through | contract unit | `pnpm --filter @localspeak/contracts test` | no, Wave 0 |
| ARCH-02 | Backend `/contracts/sample-json/validate` returns valid result | API e2e | `pnpm --filter api test:e2e -- contracts` | no, Wave 0 |
| ARCH-04 | Missing backend env fails startup with clear variable names | config unit | `pnpm --filter api test -- env` | no, Wave 0 |
| ARCH-04 | `.env.example` files document Gemini and Supabase variables | docs/static check | `pnpm check` or manual review | no, Wave 0 |

### Sampling Rate

- **Per task commit:** `pnpm check`
- **Per wave merge:** `pnpm test && pnpm build`
- **Phase gate:** root `pnpm dev` manually starts both apps; web page shows API health and valid fixture status.

### Wave 0 Gaps

- [ ] Root `package.json`, `pnpm-workspace.yaml`, and workspace packages.
- [ ] `packages/contracts/test/speech-assessment.fixture.test.ts`.
- [ ] `apps/api/test/health.e2e-spec.ts`.
- [ ] `apps/api/test/contracts.e2e-spec.ts`.
- [ ] `apps/api/src/config/env.spec.ts`.
- [ ] `apps/web/components/status-panel.test.tsx`.
- [ ] `apps/web/vitest.config.mts`.
- [ ] Root `check`, `test`, and `build` scripts.

## Security Domain

### Applicable Controls

| Category | Applies | Standard Control |
|----------|---------|------------------|
| Authentication/session management | No | Supabase Auth is later Phase 5. |
| Access control | Minimal | Do not expose backend secret env; no protected data endpoints in Phase 1. |
| Input validation | Yes | Zod for fixture and contract validation. |
| Secret handling | Yes | Do not commit or expose API keys. |
| Configuration | Yes | `.env.example` docs and startup env validation. |

### Threat Patterns

| Pattern | Risk | Mitigation |
|---------|------|------------|
| Gemini API key exposed in frontend bundle | Information disclosure | Keep Gemini key only in `apps/api`; never use `NEXT_PUBLIC_GEMINI_*`. |
| Supabase secret key exposed to browser | Information disclosure / privilege escalation | Use publishable key in frontend; use secret key only in backend. |
| Invalid vendor JSON accepted silently | Tampering / incorrect analysis | Validate fixture and request bodies with Zod; return structured validation issues. |
| Health endpoint leaks env details | Information disclosure | Return generic status only; do not include secret names, values, or external dependency responses. |
| Broad CORS defaults | Information disclosure | Prefer Next rewrite for local same-origin calls; if CORS is enabled, scope origins explicitly. |

## Assumptions Log

| # | Claim | Risk if Wrong |
|---|-------|---------------|
| A1 | Turborepo is unnecessary for Phase 1 compared with simple root scripts and `concurrently`. | Planner may miss useful caching, but Phase 1 is small enough that this is acceptable. |
| A2 | A compiled contracts package is safer than relying on TypeScript-only package imports. | If the planner picks a different strategy, it must still ensure both apps can import runtime JS and types. |
| A3 | Next rewrite is enough for local dev integration. | If later deployment topology changes, CORS/proxy setup may need revision outside Phase 1. |

## Planner Guidance

Plan this as a small number of concrete implementation plans:

1. **Workspace scaffold and contracts package** — root pnpm setup, shared package, contract schemas, fixture validation tests.
2. **NestJS API skeleton** — env validation, `/health`, `/contracts/sample-json/validate`, backend tests, app env example.
3. **Next.js status page skeleton** — rewrite proxy, status page, visual reference styling, frontend tests, web env example.
4. **Root docs and verification scripts** — root dev/check/test/build scripts and README setup.

Each plan must reference the relevant decisions from `01-CONTEXT.md` and the phase requirements `ARCH-01`, `ARCH-02`, and `ARCH-04`.

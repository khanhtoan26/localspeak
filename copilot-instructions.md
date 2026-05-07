<!-- GSD:project-start source:PROJECT.md -->
## Project

**IELTS Pronunciation Scorer**

IELTS Pronunciation Scorer is a web app for English pronunciation training, optimized first for Vietnamese IELTS learners. It analyzes either phoneme-level speech assessment JSON or raw uploaded/recorded audio, then returns IELTS-style Pronunciation and Fluency feedback with concrete error patterns and drills.

The app uses a Next.js frontend, a NestJS backend for LLM/API processing, Gemini for multimodal and structured analysis, and Supabase for authentication and saved learner history.

**Core Value:** Vietnamese IELTS learners can identify their highest-priority pronunciation and fluency problems from real speaking attempts and get specific, actionable drills to improve them.

### Constraints

- **Tech stack**: Next.js frontend, NestJS backend, Supabase Auth/database, Gemini API — chosen by project direction.
- **Architecture**: Monorepo — frontend and backend should be developed together with shared contracts where useful.
- **Security**: Gemini API key must stay server-side — frontend-only LLM calls are out of scope for v1.
- **Input support**: Audio mode should support upload and in-browser microphone recording — learners need both existing recordings and new attempts.
- **Scoring scope**: v1 focuses on Pronunciation and Fluency only — Lexical Resource and Grammar are deferred.
- **UI direction**: Use a rich web UI with mode toggle, dashboard header, tabs, timeline, charts, and streamed LLM response.
<!-- GSD:project-end -->

<!-- GSD:stack-start source:STACK.md -->
## Technology Stack

Technology stack not yet documented. Will populate after codebase mapping or first phase.
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->
## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, `.github/skills/`, or `.codex/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->

# Contributing to Skrun

Thanks for your interest in contributing!

## Setup

```bash
git clone https://github.com/skrun-dev/skrun.git
cd skrun
pnpm install
pnpm build
pnpm test
```

## Architecture

```
Monorepo (pnpm workspaces):
  packages/
    schema/    → @skrun-dev/schema   — Parser & validator (Zod)
    cli/       → @skrun-dev/cli      — CLI tool (Commander.js + clack)
    runtime/   → @skrun-dev/runtime  — Agent executor (LLM router, tools, state)
    api/       → @skrun-dev/api      — Registry + POST /run API (Hono)
```

## Code Conventions

### Style
- TypeScript strict mode, ESM modules
- Biome for linting and formatting (`pnpm lint`)
- Zod for all runtime validation

### Naming
- Files: `kebab-case.ts`
- Types/Interfaces: `PascalCase` (no `I` prefix)
- Functions/variables: `camelCase`
- Constants: `UPPER_SNAKE_CASE`

### Testing
- Vitest, colocated: `foo.ts` → `foo.test.ts`
- Run: `pnpm test` (all) or `pnpm --filter @skrun-dev/schema test` (single package)

### Git
- Branch: `feature/<epic>-<slug>`, `fix/<slug>`, `chore/<slug>`
- Commit: `type(scope): description` (types: feat, fix, test, refactor, docs, chore)
- Scopes: `schema`, `cli`, `runtime`, `api`, `infra`, `deps`
- One commit per logical change, squash merge into main

## Local E2E Testing

1. Copy `.env.example` to `.env`, set at least one LLM API key
2. `pnpm dev:registry` — starts API on localhost:4000
3. `pnpm test:e2e` — runs all demo agents against the real LLM

## Questions?

Open an issue on GitHub.

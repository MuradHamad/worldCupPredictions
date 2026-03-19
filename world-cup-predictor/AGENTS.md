# AGENTS Guide - WorldCupPrediction2026

This guide is for agentic coding assistants working in this repository.
Primary application directory: `world-cup-predictor/`.

## Scope and precedence

- Apply these rules for all work under `world-cup-predictor/`.
- If a deeper folder contains another AGENTS.md, that file overrides for its subtree.
- Direct user instructions override this guide.

## Tech stack snapshot

- Next.js 16 App Router + React 19
- TypeScript (`strict: true`)
- Tailwind CSS v4 + `src/app/globals.css` theme vars
- NextAuth (Google provider)
- Prisma ORM + PostgreSQL datasource
- Framer Motion, Zod, Axios

## Working directory

Run project commands from:

```bash
cd world-cup-predictor
```

## Build / lint / run commands

```bash
npm run dev      # start local dev server
npm run build    # production build + type checks
npm run start    # run production server
npm run lint     # run ESLint
```

## Database / Prisma commands

```bash
npx prisma generate
npx prisma db push
npx prisma studio
npx prisma migrate dev --name <migration_name>
npx prisma migrate deploy
npm run prisma seed
```

## Test commands (including single test)

Current status:
- No test runner scripts exist in `package.json` yet.
- `npm test`/single-test commands will fail until a test framework is added.

Recommended setup (Vitest):

```bash
npm i -D vitest @testing-library/react @testing-library/jest-dom
```

Suggested scripts:

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:single": "vitest run"
  }
}
```

Run a single test file:

```bash
npm run test:single -- src/app/groups/groups.test.tsx
```

Run a single test by name:

```bash
npm run test:single -- -t "reorders teams"
```

## Cursor / Copilot instructions check

No repository-level files were found for:
- `.cursor/rules/`
- `.cursorrules`
- `.github/copilot-instructions.md`

If they are later added, update this guide and follow them.

## Coding standards

### TypeScript

- Keep code strict-type safe; do not weaken `tsconfig` strictness.
- Avoid `any`; use explicit interfaces, unions, and narrowing.
- Handle nullable auth/DB values safely (`session?.user?.id`).

### Imports

- Use `@/*` alias for internal imports.
- Order imports: external -> internal alias -> local relative.
- Separate import groups with one blank line.

### Naming

- Components and types/interfaces: PascalCase.
- Variables/functions: camelCase.
- Constants: UPPER_SNAKE_CASE only for true constants.
- Route handlers: named HTTP exports (`GET`, `POST`, etc.).

### Formatting and structure

- Follow existing style: double quotes, semicolons.
- Prefer early returns over nested conditionals.
- Keep handlers/functions small and focused.
- Add comments only when logic is non-obvious.

### React / Next.js

- Prefer Server Components; add `"use client"` only when required.
- Keep state local and minimal in client components.
- Use proper loading/empty/error states for async UI.
- Use `next/navigation` APIs for app routing.

### API route patterns

- Standard flow in handlers:
  1) authenticate,
  2) parse + validate input,
  3) execute DB logic,
  4) return structured JSON.
- Use status codes consistently: 400, 401, 404, 500.
- Wrap route logic in `try/catch` and log contextual errors.
- Do not expose secrets or raw internals in response bodies.

### Prisma

- Always use shared client from `src/lib/prisma.ts`.
- Use explicit `where/select/include` clauses.
- Use transactions for multi-step dependent writes.
- Keep upsert-like behavior deterministic.

### Styling/UI

- Prefer Tailwind utilities and shared `wc-*` classes.
- Reuse theme tokens from `globals.css`.
- Verify responsive behavior (mobile + desktop).
- For drag/drop and gestures, ensure touch + pointer support.

### Security/config

- Never commit `.env` secrets.
- Common required env vars:
  - `DATABASE_URL`
  - `GOOGLE_CLIENT_ID`
  - `GOOGLE_CLIENT_SECRET`
  - NextAuth secret/base URL settings

## Agent workflow

- Inspect adjacent files before editing to match local patterns.
- After changes, run `npm run lint` or `npm run build`.
- Prefer small, reviewable patches over broad rewrites.
- When tests are present, add/adjust focused tests with each bug fix.

## Project-specific product guardrails

- Avoid trademarked tournament branding in UI text unless explicitly requested.
- Keep naming and palette consistent with current app theme choices.

## Documentation rule

- Always use Context7 MCP when library/API documentation, setup, configuration,
  or code-generation guidance is needed.
- Do not guess external API signatures when docs are available.

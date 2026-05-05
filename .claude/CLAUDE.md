# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository state

Both `backend/` and `frontend/` are scaffolded and working end-to-end (register → login → CRUD todos → logout). The blueprint at `.claude/todo_blueprint.md` is the **authoritative spec**; treat the existing code as a reference implementation of it. If a request conflicts with the blueprint, surface the conflict before deviating.

The user is an intern software engineer who wants intern-level but professional code. Stick to what the blueprint requires — do not introduce frameworks, abstractions, or features that aren't in it.

Companion docs in `.claude/`:
- `todo_plan.md` — atomic task list (98 tasks across 13 milestones)
- `specs/` — per-feature spec files (created by `/feature-spec-creator`); `specs/template.md` is the canonical template
- `sprint/` — 7 sprint files (P1–P7) tracking the phase-by-phase implementation; Sprints 1–6 are complete (see `sprint/velocity_tracking.md`); Sprint 7 (hardening) is not started. **Note:** all sprint file headers show `Status: Not started` regardless of actual completion — treat the code and git log as the source of truth for what is done, not the sprint file metadata.

Skill references (read before working in the relevant area):
- `SKILL.md` (repo root) — Node.js / Express backend patterns
- `.claude/skills/security/SKILL.md` — **read before touching auth, middleware, SQL, or adding endpoints**
- `.claude/skills/typescript/SKILL.md` — TypeScript strict-mode patterns for this todo app
- `.claude/skills/tailwind/SKILL.md` — Tailwind patterns for the frontend
- `.claude/skills/react-ui-patterns/SKILL.md` — Loading states, error handling, optimistic updates, empty states, button disable-during-async patterns
- `.claude/skills/adapt/SKILL.md` — **read before any UI work** — responsive/cross-platform patterns: breakpoints (360px→1280px+), touch targets, mobile-first Tailwind, iOS fixes, anti-patterns
- `.claude/skills/impeccable/SKILL.md` — UI design audit, polish, visual hierarchy, UX copy, accessibility, responsive behavior, design systems

The README at the repo root has a quickstart and a curl-based manual smoke test.

## Source of truth

`.claude/todo_blueprint.md` is the binding spec. Key sections to reread when relevant:
- §3 — Clean Architecture layering rules
- §6 — API contract (endpoints, error envelope, error codes)
- §8 — Security features (the non-negotiable list)
- §9 — Authentication flow
- §18 — Implementation phases (work in this order)

## Architecture (must-follow)

**Clean / layered architecture, dependencies point inward only:**

```
Presentation ─▶ Application ─▶ Domain ◀─ Infrastructure
```

| Layer          | May import                        | Must NOT import                   |
|----------------|-----------------------------------|-----------------------------------|
| Domain         | TS standard lib only              | express, sqlite, jwt, zod         |
| Application    | Domain + repo interfaces          | express, sqlite directly          |
| Infrastructure | Domain interfaces                 | presentation                      |
| Presentation   | Application use cases             | infrastructure internals          |

**Wiring:** all concrete implementations are constructed in `backend/src/composition.ts` and injected via constructors. Use cases never reach for module-level singletons. The `container` exported from `composition.ts` is the only place infra implementations are instantiated; controllers receive use cases from it. All use cases are under `container.uc` (e.g. `container.uc.createTodo`, `container.uc.login`).

**Request flow:** `route → controller → use case → repo interface → SQLite repo`. No layer skipping.

**Module resolution:** backend is ESM (`"type": "module"`). Internal imports use the `.js` extension even when importing `.ts` source (TypeScript NodeNext convention) — e.g. `import { x } from './foo.js'`. Match this when adding files.

**Authorization rule:** ownership checks live **inside use cases** (fetch resource, compare `resource.userId === req.user.id`, throw `ForbiddenError`/`NotFoundError`). Auth middleware only proves identity; it does not authorize resources.

**Cross-user reads return `404`, not `403`** — do not leak existence of other users' data.

**Layering exception:** `auth.mw.ts` imports `container` directly from `composition.ts`. This is the only deliberate exception; all other middleware and controllers receive dependencies via the container passed from routes.

**Pagination:** the `GET /api/todos` endpoint is cursor-based. The repo's `list()` returns `{ items, nextCursor }`. The cursor is an opaque todo ID; pass it as `?cursor=<id>` to page forward.

## Security non-negotiables (from blueprint §8 — see `.claude/skills/security/SKILL.md` for implementation patterns)

- Passwords: `bcrypt` cost 12. Never log or return password hashes; DTO mappers strip them.
- JWT: HS256, 15-min access TTL, stored in `httpOnly` + `Secure` + `SameSite=Strict` cookies. Never put tokens in `localStorage` or response bodies.
- Logout: insert `jti` into `token_blacklist` table; auth middleware checks the blacklist on every request.
- SQL: **prepared statements only** via `better-sqlite3`. No string concatenation, ever.
- Validation: every controller calls `schema.parse(req.body)`. Server **never trusts** client validation — re-validate even fields the frontend already checked.
- Auth errors: always generic `"Invalid credentials"`. Never reveal which field was wrong, and run `bcrypt.compare` even when the user lookup fails (timing-attack defense).
- Rate limits: `authLimiter` = 20 req/15 min on `/api/auth/*`; `globalLimiter` = 100 req/min across all routes (applied in `app.ts`).
- Env vars: validated with Zod at boot via `infrastructure/config/env.ts`. Fail fast if invalid. (`JWT_REFRESH_TTL` is wired in env but the refresh-token flow is not yet implemented — leave it there for future phases.)
- Logger redaction: `pino` redacts `req.headers.cookie`, `req.body.password`, `req.body.token`. Don't add log lines that bypass this.

## Conventions

- TypeScript `strict: true` and `noUncheckedIndexedAccess: true`. No `any` — use `unknown` and narrow.
- Zod-inferred types: `type X = z.infer<typeof xSchema>`. Don't duplicate the type by hand.
- File size: keep files under ~150 lines, one responsibility per file.
- IDs are **UUID strings** (not auto-increment integers), generated with `randomUUID()`.
- SQLite booleans are stored as `INTEGER` (0/1); convert at the repo boundary, never let `0|1` leak past the repo.
- Naming: `camelCase` (vars/funcs), `PascalCase` (types/classes/components), `SCREAMING_SNAKE_CASE` (env/constants), `kebab-case` (files except React components).
- Filenames follow blueprint suffixes: `*.uc.ts` (use cases), `*.ctrl.ts` (controllers), `*.mw.ts` (middleware), `*.schema.ts` (Zod schemas).

## Errors

Throw, don't return error tuples — but only **domain errors** (`DomainError`, `NotFoundError`, `ConflictError`, `ForbiddenError`, `UnauthorizedError`). The central `error.mw.ts` maps:
- `ZodError` → `400 VALIDATION_ERROR` with field map
- `DomainError` (and subclasses) → its `status` + `code`; `UnauthorizedError` always uses the generic `"Invalid credentials"` message
- anything else → `500 INTERNAL_ERROR` with a generic message (real error logged server-side only)

Response envelopes are fixed (blueprint §6): success is `{ data: ... }`, errors are `{ error: { code, message, fields? } }`.

## Frontend patterns

- **Auth state:** `AuthContext` calls `GET /api/auth/me` on mount to rehydrate the session. `useAuth()` exposes `{ user, loading, login, register, logout }`.
- **Protected routes:** `<ProtectedRoute>` waits for `loading` before redirecting; wrap any route that requires auth.
- **Filter state:** todo filter (`all` / `active` / `completed`) lives in URL search params (`useSearchParams`), not component state — preserves the filter on refresh.
- **Optimistic updates:** toggle and delete mutate local state immediately and roll back on API error. Follow this pattern for any new mutations.
- **Toast notifications:** `ToastContext.tsx` is fully implemented in `frontend/src/context/`; consume it via `useToast()` — do not add a second toast system.
- **Dark mode:** `useTheme.ts` is fully implemented in `frontend/src/hooks/`; reads `localStorage` + system preference, toggles a `dark` class on `<html>`, and returns `{ dark, toggle }`.
- **Shared types:** `frontend/src/types/models.ts` is the single source of truth for `Todo`, `User`, `TodoStatus`, and `ApiError` — import from there, never redefine.
- **Data hook:** `useTodos(status)` in `frontend/src/hooks/useTodos.ts` owns all todo state for the Dashboard — fetches on mount, exposes `{ todos, loading, add, toggle, update, remove }`, and handles optimistic updates with rollback internally.
- **API layer:** all requests go through `frontend/src/api/axios.ts` (sets `withCredentials: true`); add new endpoints as typed wrappers in `auth.api.ts` or `todos.api.ts`.
- **Component extraction:** reusable UI primitives (Button, Input, Card, Modal) belong in `frontend/src/components/ui/`. Custom hooks go in `frontend/src/hooks/`. Shared Zod schemas go in `frontend/src/schemas/`. `Dashboard.tsx` is currently a single large component — follow the ~150-line rule when adding UI features by extracting to `ui/`.

## Custom slash commands

| Command | What it does |
|---------|-------------|
| `/feature-spec-creator <idea>` | Creates a `feature/<slug>` branch and writes `.claude/specs/<slug>.md` from the template |
| `/run_sprint [n]` | Executes the next unfinished sprint from `.claude/sprint/` following the runbook |
| `/security-review` | Audits pending changes against the security checklist |

## Commands

```bash
# Backend (from backend/)
npm run dev          # tsx watch src/server.ts (hot reload)
npm run build        # tsc → dist/
npm start            # node dist/server.js
npm run migrate      # tsx src/infrastructure/db/runMigrations.ts
npm test             # vitest run (single-shot)
npm run test:watch   # vitest in watch mode
npm test -- <path>   # run a single test file
npm run sweep        # delete expired rows from token_blacklist (run periodically in prod)
npm run lint         # eslint src --ext .ts
npm run typecheck    # tsc --noEmit

# Frontend (from frontend/)
npm run dev          # vite dev server on :5173
npm run build        # tsc -b && vite build
npm run preview      # serve built bundle
npm run lint         # eslint src --ext .ts,.tsx
npm run typecheck    # tsc --noEmit
```

- Backend listens on port `4000`; frontend dev server on `5173`. CORS is whitelisted to `CORS_ORIGIN` only — keep them in sync.
- `GET /healthz` returns `{ ok: true }` — useful for smoke-testing without auth.
- The dev server auto-applies migrations on first run, so `npm run migrate` is only needed when adding a new `migrations/*.sql` file outside the dev loop.
- `backend/data/todo.db` (and `-shm`/`-wal`) is the local SQLite file — gitignored. Delete it to reset state.
- `backend/tests/` has `unit/`, `integration/`, and `helpers/` subdirectories scaffolded; fill them per blueprint §18 phase 5 using vitest + `supertest` for HTTP tests.

## Implementation order

Follow blueprint §18 phases strictly: **foundation → domain/infra → auth → todos CRUD → error handling/tests → frontend → hardening**. Don't skip ahead — for example, don't write controllers before the use cases and repo interfaces they depend on exist.

## When making changes

- Match the blueprint's file/folder names exactly when scaffolding (see §4 tree). Don't invent parallel structures.
- New endpoints must be added to the API table in §6 of the blueprint as well as the code.
- Any deviation from the blueprint should be flagged to the user before implementing.
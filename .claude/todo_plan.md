# TODO Web App — Implementation Plan

> Step-by-step execution plan derived from `todo_blueprint.md` and `todo_spec.md`.
> Every task is **atomic** (≤ 30 min for an intern), has a **deliverable**, and a **verification step**.
> Work top-to-bottom — later tasks depend on earlier ones.

**Status:** Ready to execute · 2026-04-28
**Estimated total effort:** ~5 working days for an intern (40 hours)

---

## How to use this plan

- Each task has an **ID** (`T-###`), **deliverable**, and **done-when** check.
- Do not skip ahead — Clean Architecture means lower layers must exist before higher layers can compile.
- After each milestone (`M-#`), run the verification block before moving on.
- If something deviates from the blueprint/spec, **stop and confirm** with the user.

---

## Milestone overview

| Milestone | Title                          | Tasks       | Effort | Outcome                                            |
|-----------|--------------------------------|-------------|--------|----------------------------------------------------|
| M-1       | Project scaffold & tooling     | T-001..T-008 | 3 h    | Both apps boot; lint/typecheck pass on empty code |
| M-2       | DB + config foundation         | T-009..T-014 | 2 h    | Migrations apply; env validated at boot            |
| M-3       | Domain layer                   | T-015..T-019 | 1.5 h  | Entities, errors, repo & service interfaces        |
| M-4       | Infrastructure layer           | T-020..T-026 | 3 h    | Repos + JWT/bcrypt services + composition wiring   |
| M-5       | Authentication feature         | T-027..T-035 | 4 h    | Register/Login/Logout/Me end-to-end                |
| M-6       | Todos CRUD feature             | T-036..T-046 | 4 h    | Full CRUD with ownership checks                    |
| M-7       | Cross-cutting middleware       | T-047..T-052 | 2 h    | Error handler, rate limit, request ID, logging     |
| M-8       | Backend tests                  | T-053..T-060 | 4 h    | Unit + integration tests; coverage targets met     |
| M-9       | Frontend scaffold              | T-061..T-067 | 2 h    | Vite + Tailwind + routing skeleton                 |
| M-10      | Frontend auth                  | T-068..T-074 | 3 h    | Login/Register pages + AuthContext                 |
| M-11      | Frontend dashboard             | T-075..T-083 | 4 h    | Dashboard with optimistic CRUD, filters, dark mode |
| M-12      | Polish & UX                    | T-084..T-090 | 2 h    | Toasts, skeletons, keyboard, mobile, a11y          |
| M-13      | Hardening & release            | T-091..T-098 | 3 h    | Security checks, audit, deployment notes           |
| **Total** |                                | **98 tasks** | **~38 h** |                                                |

---

## M-1 · Project scaffold & tooling

| ID    | Task                                                                                  | Deliverable                                  |
|-------|---------------------------------------------------------------------------------------|----------------------------------------------|
| T-001 | Create root folder structure: `backend/`, `frontend/`                                 | Two empty dirs                               |
| T-002 | `npm init` in `backend/`; install deps from blueprint §17                             | `backend/package.json` + `node_modules`      |
| T-003 | Add `backend/tsconfig.json` with `strict`, `noUncheckedIndexedAccess`, path aliases   | TS compiles `src/`                           |
| T-004 | Add `backend/.eslintrc.cjs` + `.prettierrc` + `.gitignore` (incl. `data/*.db`, `.env`) | Tooling files                                |
| T-005 | Add npm scripts: `dev` (tsx watch), `build`, `start`, `lint`, `typecheck`, `test`     | `package.json` scripts section               |
| T-006 | Create `frontend/` via `npm create vite@latest -- --template react-ts`                | `frontend/package.json`                      |
| T-007 | Add Tailwind to frontend (per official Vite guide); enable dark-mode `class` strategy | `tailwind.config.ts`, `index.css` with directives |
| T-008 | Add root `README.md` with quickstart commands from blueprint appendix                 | README                                       |

**M-1 verification:**
```bash
cd backend && npm run lint && npm run typecheck
cd ../frontend && npm run build
```
Both must pass. Commit: `chore: project scaffold`.

---

## M-2 · DB + config foundation

| ID    | Task                                                                                  | Deliverable                          |
|-------|---------------------------------------------------------------------------------------|--------------------------------------|
| T-009 | Create `backend/.env.example` matching blueprint §16; copy to `.env` locally          | Env files                            |
| T-010 | Implement `infrastructure/config/env.ts` — Zod schema, parse `process.env`            | Validated `env` export               |
| T-011 | Add a unit test that `env.ts` throws when `JWT_SECRET` is too short                   | Test passing                         |
| T-012 | Implement `infrastructure/db/sqlite.ts` — open DB, set `journal_mode=WAL`, `foreign_keys=ON` | Module exporting `db`           |
| T-013 | Write `infrastructure/db/migrations/001_init.sql` (DDL + indexes + trigger from blueprint §5) | Migration file              |
| T-014 | Write a tiny migration runner (`runMigrations()`); call it on boot                    | DB created with correct schema       |

**M-2 verification:** Run `npm run dev` — server boots without errors and `data/todo.db` is created with `users`, `todos`, `token_blacklist` tables (`sqlite3 data/todo.db ".schema"`).

---

## M-3 · Domain layer (zero framework imports)

| ID    | Task                                                                                  | Deliverable                          |
|-------|---------------------------------------------------------------------------------------|--------------------------------------|
| T-015 | `domain/entities/User.ts`, `Todo.ts` — interfaces matching blueprint §10              | Entity types                         |
| T-016 | `domain/repositories/IUserRepo.ts`, `ITodoRepo.ts`                                    | Repo interfaces                      |
| T-017 | `domain/services/IPasswordHasher.ts`, `ITokenService.ts`, `ITokenBlacklist.ts`        | Service interfaces                   |
| T-018 | `domain/errors/` — `DomainError`, `NotFoundError`, `ConflictError`, `ForbiddenError`, `UnauthorizedError` | Error classes |
| T-019 | Add ESLint rule (or comment) reminding domain layer must not import express/sqlite/jwt/zod | Lint rule or doc note          |

**M-3 verification:** `grep -r "from 'express'\|better-sqlite3\|jsonwebtoken\|zod" src/domain/` returns nothing.

---

## M-4 · Infrastructure layer

| ID    | Task                                                                                  | Deliverable                          |
|-------|---------------------------------------------------------------------------------------|--------------------------------------|
| T-020 | `infrastructure/security/BcryptHasher.ts` implementing `IPasswordHasher` (cost 12)    | Class                                |
| T-021 | `infrastructure/security/JwtTokenService.ts` (HS256, 15 min, returns `{token, jti}`)  | Class                                |
| T-022 | `infrastructure/security/SqliteTokenBlacklist.ts` — `add(jti, expiresAt)`, `has(jti)` | Class                                |
| T-023 | `infrastructure/repositories/SqliteUserRepo.ts` — prepared statements, UUID IDs       | Class implementing `IUserRepo`       |
| T-024 | `infrastructure/repositories/SqliteTodoRepo.ts` — incl. cursor pagination + `0|1` ↔ boolean mapping | Class implementing `ITodoRepo` |
| T-025 | `infrastructure/logging/logger.ts` — `pino` with redaction config from blueprint §13  | `logger` export                      |
| T-026 | `composition.ts` — instantiate everything once, export `container` object             | Wiring module                        |

**M-4 verification:** `npm run typecheck` passes. Write a temporary script that creates a user via `container.users.create()` and reads it back — delete the script after.

---

## M-5 · Authentication feature

| ID    | Task                                                                                  | Deliverable                          |
|-------|---------------------------------------------------------------------------------------|--------------------------------------|
| T-027 | `application/auth/register.uc.ts` — checks duplicate email, hashes, inserts           | Use case class                       |
| T-028 | `application/auth/login.uc.ts` — fetch user, bcrypt.compare (run on missing user too), sign JWT | Use case class             |
| T-029 | `application/auth/logout.uc.ts` — blacklist `jti` with original expiry                | Use case class                       |
| T-030 | `application/auth/me.uc.ts` — fetch user by id; throw `UnauthorizedError` if not found | Use case class                      |
| T-031 | `presentation/validators/auth.schema.ts` — `registerSchema`, `loginSchema` (rules from spec §5) | Zod schemas                |
| T-032 | `presentation/controllers/auth.ctrl.ts` — 4 handlers calling use cases, set/clear cookie per spec §4.4 | Controllers              |
| T-033 | `presentation/middleware/auth.mw.ts` — verify JWT, check blacklist, attach `req.user` | Middleware                           |
| T-034 | `presentation/routes/auth.routes.ts` — wire the 4 endpoints                           | Router                               |
| T-035 | Smoke test via `curl` or Postman: register → login → me → logout                      | All status codes match spec §4.1     |

**M-5 verification:** Run §12.1 "Register → Login → Me" and "Logout then call protected route" scenarios manually. Cookie has `HttpOnly; SameSite=Strict`.

---

## M-6 · Todos CRUD feature

| ID    | Task                                                                                  | Deliverable                          |
|-------|---------------------------------------------------------------------------------------|--------------------------------------|
| T-036 | `application/todos/create.uc.ts`                                                      | Use case                             |
| T-037 | `application/todos/list.uc.ts` — accepts `userId, limit, cursor, status`              | Use case                             |
| T-038 | `application/todos/get.uc.ts` — owner check, throw `NotFoundError` on miss/foreign    | Use case                             |
| T-039 | `application/todos/update.uc.ts` — owner check, partial patch                         | Use case                             |
| T-040 | `application/todos/delete.uc.ts` — owner check, hard delete                           | Use case                             |
| T-041 | `presentation/validators/todos.schema.ts` — create / patch / list-query / id-param    | Zod schemas                          |
| T-042 | DTO mapper `todoToDto(todo)` — converts dates to ISO, `0|1` → boolean                 | Pure function                        |
| T-043 | `presentation/controllers/todos.ctrl.ts` — 5 handlers                                 | Controllers                          |
| T-044 | `presentation/routes/todos.routes.ts` — wire endpoints behind `requireAuth`           | Router                               |
| T-045 | Verify cross-user `GET /todos/:id` returns **404** (not 403) — spec EC-10             | Manual test                          |
| T-046 | Verify `PATCH {}` returns 400 (spec EC-07)                                            | Manual test                          |

**M-6 verification:** Manually run the happy-path CRUD test from spec §12.1.

---

## M-7 · Cross-cutting middleware

| ID    | Task                                                                                  | Deliverable                          |
|-------|---------------------------------------------------------------------------------------|--------------------------------------|
| T-047 | `presentation/middleware/requestId.mw.ts` — assigns UUID to `req.id`, sets `X-Request-Id` header | Middleware                |
| T-048 | `presentation/middleware/error.mw.ts` — `ZodError` → 400 + fields; `DomainError` → mapped; else → 500 generic | Middleware  |
| T-049 | `presentation/middleware/rateLimit.mw.ts` — 5/15min on `/auth/*`; 100/min global      | Two limiters                         |
| T-050 | Wire `helmet`, `cors` (whitelist `CORS_ORIGIN`, `credentials: true`), `compression`, `cookie-parser`, `express.json({ limit: '10kb' })` in `app.ts` | Configured app |
| T-051 | Add `GET /healthz` → `{ ok: true }` (no auth)                                         | Endpoint                             |
| T-052 | Add `pino-http` access log middleware with redaction                                  | Logging middleware                   |

**M-7 verification:** 6 rapid login attempts → 6th returns 429. 11 KB body to `/api/auth/register` → 413. `GET /healthz` returns 200 without a cookie.

---

## M-8 · Backend tests

| ID    | Task                                                                                  | Deliverable                          |
|-------|---------------------------------------------------------------------------------------|--------------------------------------|
| T-053 | Add `vitest` config; `tests/helpers/db.ts` builds a fresh `:memory:` DB per test file | Test infra                           |
| T-054 | Unit tests for all 9 use cases (mocked repos) — happy path + each thrown error        | Tests pass; coverage ≥ 95% on use cases |
| T-055 | Schema tests — accept canonical example, reject one example per rule (spec §5)        | Tests pass                           |
| T-056 | Integration: register → login → me; duplicate email; weak password                    | Tests pass                           |
| T-057 | Integration: full todo CRUD happy path                                                | Tests pass                           |
| T-058 | Integration: cross-user 404, PATCH `{}` 400, DELETE non-existent 404                  | Tests pass                           |
| T-059 | Integration: rate limit triggers; 11 KB body returns 413                              | Tests pass                           |
| T-060 | Integration: SQL injection payload stored verbatim; XSS payload stored verbatim       | Tests pass                           |

**M-8 verification:** `npm test` green. `npm run typecheck` and `npm run lint` clean.

---

## M-9 · Frontend scaffold

| ID    | Task                                                                                  | Deliverable                          |
|-------|---------------------------------------------------------------------------------------|--------------------------------------|
| T-061 | Frontend `tsconfig.json` strict mode + path alias `@/`                                | Config                               |
| T-062 | Add `react-router-dom`, `axios`, `zod`; install                                       | `package.json` updated               |
| T-063 | `frontend/.env.example` with `VITE_API_URL`                                           | Env file                             |
| T-064 | Create routing skeleton in `App.tsx`: `/login`, `/register`, `/`, `/todos/:id`, `*`   | Routes render placeholders           |
| T-065 | `api/axios.ts` — instance with `baseURL`, `withCredentials: true`, response interceptor that redirects to `/login` on 401 | Module |
| T-066 | Tailwind design tokens — palette in `tailwind.config.ts`, Inter font, dark-mode class | Configured                           |
| T-067 | Build basic `ui/` primitives: `Button`, `Input`, `Card` (presentational only)         | Components                           |

**M-9 verification:** `npm run dev` shows route placeholders; switching `<html class="dark">` toggles dark theme.

---

## M-10 · Frontend auth

| ID    | Task                                                                                  | Deliverable                          |
|-------|---------------------------------------------------------------------------------------|--------------------------------------|
| T-068 | `schemas/auth.schema.ts` — copy/share Zod schemas with backend                        | Module                               |
| T-069 | `api/auth.api.ts` — `register`, `login`, `logout`, `me` functions                     | Module                               |
| T-070 | `context/AuthContext.tsx` + `useAuth` hook — `{user, login, logout, isAuthenticated}` | Context + hook                       |
| T-071 | `pages/Login.tsx` — form with inline validation, disable while submitting             | Page                                 |
| T-072 | `pages/Register.tsx` — form + password strength meter (UI-001)                        | Page                                 |
| T-073 | `components/ProtectedRoute.tsx` — redirects to `/login` when no user                  | Component                            |
| T-074 | On app boot, call `me`; populate context if 200, else stay logged out                 | Boot effect                          |

**M-10 verification:** Register a new user via UI → redirected to `/`. Logout → redirected to `/login`. Refresh stays logged in (cookie present).

---

## M-11 · Frontend dashboard

| ID    | Task                                                                                  | Deliverable                          |
|-------|---------------------------------------------------------------------------------------|--------------------------------------|
| T-075 | `api/todos.api.ts` — `list`, `create`, `update`, `remove`                             | Module                               |
| T-076 | `hooks/useTodos.ts` — fetch + cache locally; expose `add/toggle/edit/remove`          | Hook                                 |
| T-077 | `components/TodoForm.tsx` — title input, Enter to add (UI-008)                        | Component                            |
| T-078 | `components/TodoItem.tsx` — checkbox toggle (strike-through), inline edit, delete button | Component                         |
| T-079 | `pages/Dashboard.tsx` — list, filter tabs (URL-synced via `?status=`), empty state    | Page                                 |
| T-080 | Wire optimistic updates: mutate local state first, rollback on rejection (UI-005)     | Behavior verified                    |
| T-081 | `components/Navbar.tsx` — username + logout                                           | Component                            |
| T-082 | `pages/TodoDetail.tsx` — full view + edit form                                        | Page                                 |
| T-083 | Loading **skeleton** (not spinner) during initial fetch (UI-004)                      | Visual                               |

**M-11 verification:** Run end-to-end manually: register → create 3 todos → toggle one → edit one → delete one → filter Active → Completed. No full-page reloads visible.

---

## M-12 · Polish & UX

| ID    | Task                                                                                  | Deliverable                          |
|-------|---------------------------------------------------------------------------------------|--------------------------------------|
| T-084 | Toast component + global error toast on any 4xx/5xx (UI-009)                          | Toast working                        |
| T-085 | Esc cancels inline edit; Enter saves (UI-008)                                         | Keyboard works                       |
| T-086 | Dark-mode toggle persists in `localStorage`; default to `prefers-color-scheme` (UI-011) | Toggle persists                    |
| T-087 | Audit at 360 × 640 px — fix any overflow / cramped layouts (UI-013)                   | Responsive                           |
| T-088 | Add visible `:focus` ring to all interactive elements (UI-012)                        | Verified via keyboard nav            |
| T-089 | Form field errors use `aria-describedby` + announce via `role="alert"`                | a11y                                 |
| T-090 | Run Lighthouse — fix until a11y ≥ 90, perf ≥ 80                                       | Lighthouse scores                    |

**M-12 verification:** Lighthouse run on `/login` and `/` (logged in).

---

## M-13 · Hardening & release

| ID    | Task                                                                                  | Deliverable                          |
|-------|---------------------------------------------------------------------------------------|--------------------------------------|
| T-091 | Manual security pass: try cross-user todo IDs, expired token, revoked token, oversized body | All return expected codes      |
| T-092 | Confirm logger redaction — log a fake login, ensure `password` is `[Redacted]`        | Inspection                           |
| T-093 | Run `npm audit --production` in both apps; resolve high/critical                      | 0 high/critical                      |
| T-094 | Verify `.env` is gitignored; `.env.example` has placeholders only                     | Confirmed                            |
| T-095 | Walk through blueprint §20 acceptance checklist; tick every box                       | Checklist done                       |
| T-096 | Walk through spec §15 traceability matrix; confirm each US has tests                  | Matrix complete                      |
| T-097 | Add `scripts/sweep-blacklist.ts` (delete expired rows) + cron note in README          | Script + doc                         |
| T-098 | Tag `v1.0.0`; write release notes referencing the spec §1 goals                       | Git tag                              |

**M-13 verification:** All checkboxes in blueprint §20 + spec §12.1 tests pass.

---

## File-level deliverables (final tree)

By the end of M-13, the repo SHOULD match the structure in **blueprint §4** exactly. If you find yourself creating files outside that tree, stop and revisit the blueprint.

---

## Daily targets (intern, ~8 h/day)

| Day | Milestones        | Outcome at end of day                                  |
|-----|-------------------|--------------------------------------------------------|
| 1   | M-1 → M-4         | Backend boots; DB + config + composition wired         |
| 2   | M-5 → M-7         | Full backend API working manually                      |
| 3   | M-8               | Backend tests green                                    |
| 4   | M-9 → M-11        | Frontend functional end-to-end                         |
| 5   | M-12 → M-13       | Polished, hardened, ready for review                   |

---

## Risk register

| Risk                                        | Likelihood | Impact | Mitigation                                                |
|---------------------------------------------|-----------|--------|-----------------------------------------------------------|
| `better-sqlite3` native build fails on Windows | Med    | High   | Ensure Visual Studio Build Tools + Python installed; or use `node-gyp` prebuilt binaries |
| Forgetting ownership check inside use case  | Med       | High   | Spec §6 SEC-015 test catches it; add lint or grep guard   |
| Cookie `Secure` blocks dev (no HTTPS)       | High      | Low    | `COOKIE_SECURE=false` in `.env` for local                  |
| CORS misconfig blocks frontend              | Med       | Med    | Test early in M-7; ensure `credentials: true` + exact origin |
| Scope creep ("just one more feature")       | High      | Med    | Re-read spec §13 (Out of Scope); user approval before adding |

---

## Workflow rules

1. **One commit per task** (or small group). Reference task ID: `feat(auth): T-027 RegisterUser use case`.
2. **Never commit a red build.** Run `npm run typecheck && npm test` before committing.
3. **Never break a layer rule** (blueprint §3). If tempted, the use case probably needs a new repo method instead.
4. **Always update spec/blueprint** if a deviation is approved — keep docs as source of truth.
5. **Never invent endpoints, fields, or pages** that aren't in the spec without first updating the spec.

---

## What to do when stuck

- **Type error you can't resolve in 15 min** → ask, don't `as unknown as X`.
- **A test that won't pass** → re-read the related FR/SEC/UI item; the spec defines the truth.
- **Tempted to add a feature** → check spec §13. If it's there, it's out of scope.
- **A library has a vulnerability** → upgrade or replace; don't ignore.

---

**Definition of project done:** every task above has its checkbox ticked, blueprint §20 acceptance checklist is green, and spec §15 traceability matrix is fully covered by passing tests.

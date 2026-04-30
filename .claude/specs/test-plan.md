# Test Plan — Todo App (All Sprints)

> **Stack:** Vitest (unit/integration) · Supertest (HTTP) · React Testing Library (frontend)  
> **Test location:** `backend/tests/unit/`, `backend/tests/integration/`, `frontend/src/__tests__/`  
> **Run all:** `cd backend && npm test` · `cd frontend && npm test`

---

## Sprint 1 — Backend Foundation

### Unit Tests

#### `env.ts` — Environment Validation
| # | Test | Expected |
|---|------|----------|
| 1 | `JWT_SECRET` < 32 chars → throws on import | Process exits / throws `ZodError` |
| 2 | All required vars present with valid values → no throw | `env` object returned cleanly |
| 3 | Missing `PORT` → uses default `4000` | `env.PORT === 4000` |
| 4 | `BCRYPT_ROUNDS` is not a number → throws | `ZodError` |
| 5 | `JWT_SECRET` exactly 32 chars → valid | Passes |

#### `sqlite.ts` — Database Connection
| # | Test | Expected |
|---|------|----------|
| 6 | `db.pragma('foreign_keys')` returns `1` | `[{ foreign_keys: 1 }]` |
| 7 | `db.pragma('journal_mode')` returns `wal` | `[{ journal_mode: 'wal' }]` |
| 8 | `users`, `todos`, `token_blacklist` tables exist after migration | All 3 tables present |
| 9 | All expected indexes exist on `todos` and `users` tables | Indexes confirmed via `sqlite_master` |

### TypeScript / Lint Checks
| # | Check | Expected |
|---|-------|----------|
| 10 | `npm run typecheck` | Zero errors |
| 11 | `npm run lint` | Zero warnings |

### Manual Smoke Tests
| # | Step | Expected |
|---|------|----------|
| 12 | `npm run dev` starts | Logs show `migrations applied`, no crash |
| 13 | Set `JWT_SECRET=short` → restart | Non-zero exit with clear error message |
| 14 | `cd frontend && npm run dev` | Vite serves on `:5173` |

---

## Sprint 2 — Domain & Infrastructure

### Unit Tests

#### Layer Boundary
| # | Test | Expected |
|---|------|----------|
| 1 | `grep -r "express\|better-sqlite3\|jsonwebtoken\|zod" src/domain/` | Zero matches |
| 2 | Domain entities import only from TS standard lib | No framework imports |

#### `BcryptHasher`
| # | Test | Expected |
|---|------|----------|
| 3 | `hash("password")` returns a string starting with `$2b$12$` | bcrypt format, cost 12 |
| 4 | `compare("password", hash("password"))` → `true` | Match |
| 5 | `compare("wrong", hash("password"))` → `false` | No match |
| 6 | `hash` output is different every call (unique salt) | Two hashes are not equal |

#### `JwtTokenService`
| # | Test | Expected |
|---|------|----------|
| 7 | `sign(userId)` returns `{ token: string, jti: string }` | Both fields present |
| 8 | `jti` is a valid UUID | Matches UUID regex |
| 9 | `verify(token)` returns `{ userId, jti }` matching what was signed | Payload matches |
| 10 | `verify(tamperedToken)` throws `UnauthorizedError` | Error thrown |
| 11 | `verify(expiredToken)` throws `UnauthorizedError` | Error thrown |

#### `SqliteTokenBlacklist`
| # | Test | Expected |
|---|------|----------|
| 12 | `add(jti, futureDate)` then `has(jti)` → `true` | Blacklisted |
| 13 | `has("unknown-jti")` → `false` | Not blacklisted |
| 14 | `add(jti, pastDate)` then `has(jti)` → `false` (expired row) | Expired = not active |

#### `SqliteUserRepo`
| # | Test | Expected |
|---|------|----------|
| 15 | `create(user)` inserts row; `findById(id)` returns it | Round-trip works |
| 16 | `findByEmail("TEST@EXAMPLE.COM")` matches row with `test@example.com` | Case-insensitive |
| 17 | `create` duplicate email → throws (UNIQUE constraint) | Error thrown |
| 18 | Returned user never contains `passwordHash` in queries after `findById` | Field excluded via DTO |
| 19 | IDs are UUID strings (not integers) | UUID format confirmed |

#### `SqliteTodoRepo`
| # | Test | Expected |
|---|------|----------|
| 20 | `create(todo)` → `findById(id)` round-trip | Todo returned correctly |
| 21 | `completed` stored as `1`/`0`; `findById` returns boolean `true`/`false` | No `0\|1` leaks past repo |
| 22 | `list({ userId, limit: 2 })` with 3 todos → 2 items + `nextCursor` set | Pagination correct |
| 23 | `list({ cursor: nextCursor })` → returns the 3rd item; `nextCursor` is `null` | Last page |
| 24 | `list({ status: 'active' })` only returns `completed: false` todos | Filter works |
| 25 | `list` returns only the requesting user's todos | Ownership enforced at DB level |
| 26 | `update({ id, userId, title: 'New' })` → `findById` shows new title | Update persists |
| 27 | `delete(id, userId)` → `findById` returns `null` | Hard delete |
| 28 | All repo methods use `db.prepare()` — no template-literal SQL | Code review / grep check |

#### `composition.ts`
| # | Test | Expected |
|---|------|----------|
| 29 | `container` exports `users`, `todos`, `hasher`, `tokens`, `blacklist`, `logger`, `uc` | All keys present |
| 30 | `container.uc` has all 9 use cases | `register`, `login`, `logout`, `me`, `createTodo`, `listTodos`, `getTodo`, `updateTodo`, `deleteTodo` |

---

## Sprint 3 — Authentication

### Unit Tests (Use Cases — mocked repos)

#### `RegisterUser`
| # | Test | Expected |
|---|------|----------|
| 1 | Valid input → calls `hasher.hash` then `users.create` | User created, no plain password stored |
| 2 | `users.findByEmail` returns existing user → throws `ConflictError` | `409` |
| 3 | Returned user DTO has no `passwordHash` field | Field stripped |

#### `LoginUser`
| # | Test | Expected |
|---|------|----------|
| 4 | Correct email + password → returns `{ token, jti, user }` | Success |
| 5 | Unknown email → `bcrypt.compare` still runs (dummy hash) → throws `UnauthorizedError` | Constant-time defense |
| 6 | Known email, wrong password → throws `UnauthorizedError` | `401` |
| 7 | Error message is exactly `"Invalid credentials"` in both wrong-email and wrong-password cases | Generic message |

#### `LogoutUser`
| # | Test | Expected |
|---|------|----------|
| 8 | Calls `blacklist.add(jti, expiry)` with the JTI from the token | JTI blacklisted |

#### `GetMe`
| # | Test | Expected |
|---|------|----------|
| 9 | `users.findById(userId)` returns user → returned | Success |
| 10 | `users.findById` returns `null` → throws `NotFoundError` | `404` |

### Integration Tests (HTTP via Supertest)

| # | Request | Expected |
|---|---------|----------|
| 11 | `POST /api/auth/register` — missing `email` | `400 VALIDATION_ERROR` with `email` in `fields` |
| 12 | `POST /api/auth/register` — weak password (`"abc"`) | `400 VALIDATION_ERROR` with `password` in `fields` |
| 13 | `POST /api/auth/register` — valid body | `201 { data: { id, username, email } }` — no `passwordHash` |
| 14 | `POST /api/auth/register` — same email different case | `409 CONFLICT` |
| 15 | `POST /api/auth/login` — valid credentials | `200`, `Set-Cookie: access=...; HttpOnly; SameSite=Strict` |
| 16 | `POST /api/auth/login` — wrong password | `401 { error: { code: "UNAUTHORIZED", message: "Invalid credentials" } }` |
| 17 | `POST /api/auth/login` — non-existent email | `401` same generic message |
| 18 | `GET /api/auth/me` — with valid cookie | `200 { data: { id, username, email } }` |
| 19 | `GET /api/auth/me` — no cookie | `401` |
| 20 | `POST /api/auth/logout` — with valid cookie | `204`, cookie cleared |
| 21 | `GET /api/auth/me` — after logout with same cookie | `401` (JTI blacklisted) |

### Security-Specific Tests
| # | Test | Expected |
|---|------|----------|
| 22 | Login response cookie has `HttpOnly` flag | Confirmed in `Set-Cookie` header |
| 23 | Login response cookie has `SameSite=Strict` | Confirmed |
| 24 | Login response body does NOT contain token string | Token only in cookie |
| 25 | Login response body does NOT contain `passwordHash` | Field stripped |
| 26 | Timing: wrong-email login vs wrong-password login take similar time | Delta < 100 ms (bcrypt constant-time) |

---

## Sprint 4 — Todos CRUD

### Unit Tests (Use Cases — mocked repos)

#### `CreateTodo`
| # | Test | Expected |
|---|------|----------|
| 1 | Valid input → `todos.create` called with `userId` set | Todo created with correct owner |
| 2 | Returns todo DTO with UUID `id`, ISO dates, `completed: false` | DTO shape correct |

#### `ListTodos`
| # | Test | Expected |
|---|------|----------|
| 3 | Calls `todos.list({ userId, limit, cursor, status })` | Args forwarded |
| 4 | Returns `{ items, nextCursor }` | Pagination envelope |

#### `GetTodo`
| # | Test | Expected |
|---|------|----------|
| 5 | Todo exists and `todo.userId === userId` → returns DTO | Success |
| 6 | `todos.findById` returns `null` → throws `NotFoundError` | `404` |
| 7 | Todo exists but belongs to different user → throws `NotFoundError` (NOT `ForbiddenError`) | `404` — no existence leak |

#### `UpdateTodo`
| # | Test | Expected |
|---|------|----------|
| 8 | Own todo + valid patch → `todos.update` called, returns updated DTO | Success |
| 9 | Foreign user's todo ID → throws `NotFoundError` | `404` |
| 10 | `todos.findById` returns `null` → throws `NotFoundError` | `404` |

#### `DeleteTodo`
| # | Test | Expected |
|---|------|----------|
| 11 | Own todo → `todos.delete` called → `void` | Success |
| 12 | Foreign user's todo ID → throws `NotFoundError` | `404` |

### Integration Tests (HTTP via Supertest)

| # | Request | Expected |
|---|---------|----------|
| 13 | `POST /api/todos` — empty title | `400 VALIDATION_ERROR` with `title` in `fields` |
| 14 | `POST /api/todos` — title too long (>255 chars) | `400 VALIDATION_ERROR` |
| 15 | `POST /api/todos` — valid | `201 { data: { id, title, completed: false, createdAt, updatedAt } }` |
| 16 | `POST /api/todos` — no auth cookie | `401` |
| 17 | `GET /api/todos` — returns only requester's todos | Only own todos in `data.items` |
| 18 | `GET /api/todos` — returns items in `createdAt DESC` order | Correct order |
| 19 | `GET /api/todos?status=active` — only incomplete todos | All items have `completed: false` |
| 20 | `GET /api/todos?status=completed` — only complete todos | All items have `completed: true` |
| 21 | `GET /api/todos?limit=2` with 3 todos | 2 items + `nextCursor` not null |
| 22 | `GET /api/todos?limit=2&cursor=<nextCursor>` | Remaining 1 item, `nextCursor: null` |
| 23 | `GET /api/todos/:id` — own todo | `200 { data: todo }` |
| 24 | `GET /api/todos/:id` — another user's todo ID | `404` (NOT `403`) |
| 25 | `GET /api/todos/:id` — non-existent ID | `404` |
| 26 | `PATCH /api/todos/:id` — `{ completed: true }` | `200`, only `completed` + `updatedAt` changed |
| 27 | `PATCH /api/todos/:id` — `{}` (empty body) | `400 VALIDATION_ERROR` |
| 28 | `PATCH /api/todos/:id` — another user's todo | `404` |
| 29 | `DELETE /api/todos/:id` — own todo | `204` |
| 30 | `DELETE /api/todos/:id` — again (already deleted) | `404` |
| 31 | `DELETE /api/todos/:id` — another user's todo | `404`, row still exists in DB |

### DTO Tests
| # | Test | Expected |
|---|------|----------|
| 32 | Todo DTO never contains `userId` field | Field not in response |
| 33 | `completed` field is boolean `true`/`false` | Not `1`/`0` |
| 34 | `createdAt` and `updatedAt` are ISO 8601 strings | Valid date strings |

---

## Sprint 5 — Middleware & Tests

### Unit Tests

#### `error.mw.ts`
| # | Test | Expected |
|---|------|----------|
| 1 | `ZodError` passed to handler → `400 { error: { code: "VALIDATION_ERROR", fields: {...} } }` | Field map present |
| 2 | `NotFoundError` → `404 { error: { code: "NOT_FOUND" } }` | Correct status |
| 3 | `ConflictError` → `409 { error: { code: "CONFLICT" } }` | Correct status |
| 4 | `UnauthorizedError` → `401 { error: { message: "Invalid credentials" } }` | Generic message always |
| 5 | `ForbiddenError` → `403` | Correct status |
| 6 | Unknown `Error` → `500 { error: { code: "INTERNAL_ERROR", message: "Internal server error" } }` | Real error NOT in response |
| 7 | Unknown error → real stack trace is logged server-side | Logged with `requestId` |

#### `rateLimit.mw.ts`
| # | Test | Expected |
|---|------|----------|
| 8 | 5 auth requests in 15 min → all pass; 6th → `429` with `Retry-After` header | Rate limited |
| 9 | 100 global requests in 1 min → all pass; 101st → `429` | Rate limited |
| 10 | Rate limit resets after window expires (fake timers) | Passes again after window |

#### `logger.ts` — Redaction
| # | Test | Expected |
|---|------|----------|
| 11 | Log object with `password: "secret"` → output shows `[Redacted]` | Field redacted |
| 12 | Log object with `token: "abc"` → output shows `[Redacted]` | Field redacted |
| 13 | Access log for a `POST /api/auth/register` call → `req.body.password` is `[Redacted]` | Cookie + body redacted |

### Integration Tests

#### Auth flows
| # | Test | Expected |
|---|------|----------|
| 14 | Full flow: register → login → `GET /me` → `204` logout → `GET /me` → 401 | All pass |
| 15 | Register duplicate email → `409` | Correct error |
| 16 | Register with weak password → `400` with field errors | Correct validation |

#### Todos flows
| # | Test | Expected |
|---|------|----------|
| 17 | Create → list → get → update → delete todo happy path | Each returns correct status |
| 18 | Cross-user `GET /todos/:id` → `404` | Not `403` |
| 19 | `PATCH /todos/:id {}` → `400` | Empty patch rejected |
| 20 | `DELETE /todos/:id` twice → first `204`, second `404` | Idempotent delete |

#### Security edge cases
| # | Test | Expected |
|---|------|----------|
| 21 | 6th login from same IP in 15 min → `429` | Rate limit enforced |
| 22 | POST body > 10 KB → `413 Payload Too Large` | Body cap enforced |
| 23 | SQL-injection string as todo title (e.g. `"'; DROP TABLE todos; --"`) → stored verbatim | Prepared statements prevent injection |
| 24 | XSS payload as todo title (e.g. `"<script>alert(1)</script>"`) → stored and returned verbatim | No sanitization needed (stored, not executed server-side) |
| 25 | `GET /healthz` — no cookie | `200 { ok: true }` |

#### Infra tests
| # | Test | Expected |
|---|------|----------|
| 26 | Every response has `X-Request-Id` header | UUID present |
| 27 | Request log line contains `requestId` | Correlates with header |
| 28 | CORS preflight from `CORS_ORIGIN` → `200` with correct headers | Credentials allowed |
| 29 | CORS preflight from unknown origin → `403` or missing `Access-Control-Allow-Origin` | Blocked |
| 30 | `npm audit --production` | 0 high / critical vulnerabilities |

---

## Sprint 6 — Frontend

### Unit Tests (Vitest + React Testing Library)

#### `AuthContext` + `useAuth`
| # | Test | Expected |
|---|------|----------|
| 1 | On mount calls `GET /api/auth/me`; success → `user` set, `loading: false` | Context populated |
| 2 | On mount `GET /api/auth/me` returns `401` → `user: null`, `loading: false` | No crash, unauthenticated |
| 3 | `login()` calls `POST /api/auth/login`; success → `user` set | State updated |
| 4 | `logout()` calls `POST /api/auth/logout`; success → `user: null` | State cleared |
| 5 | `register()` calls `POST /api/auth/register` | API called with correct body |

#### `ProtectedRoute`
| # | Test | Expected |
|---|------|----------|
| 6 | `loading: true` → renders nothing (no redirect) | Avoids flash of redirect |
| 7 | `loading: false`, `user: null` → redirects to `/login` | Unauthenticated redirect |
| 8 | `loading: false`, `user` present → renders children | Auth passed |

#### `Login.tsx`
| # | Test | Expected |
|---|------|----------|
| 9 | Submit with empty email → inline validation error shown | Error visible |
| 10 | Submit while loading → button is disabled | No double submit |
| 11 | API returns `401` → error message rendered | Error displayed |
| 12 | Successful login → redirects to `/` | Navigation triggered |

#### `Register.tsx`
| # | Test | Expected |
|---|------|----------|
| 13 | Password strength meter advances as password gets stronger | Meter updates |
| 14 | Passwords don't match → error shown before submit | Client validation |
| 15 | API `409` conflict → "Email already in use" shown | Error displayed |

#### `axios.ts` — Interceptor
| # | Test | Expected |
|---|------|----------|
| 16 | Any API response `401` → client redirects to `/login` | Interceptor fires |
| 17 | All requests have `withCredentials: true` | Cookie sent automatically |

#### `Dashboard.tsx`
| # | Test | Expected |
|---|------|----------|
| 18 | Filter tab "Active" → URL has `?status=active` | URL-synced |
| 19 | Filter tab "Completed" → URL has `?status=completed` | URL-synced |
| 20 | Reload with `?status=active` in URL → "Active" tab selected, correct todos shown | URL restores state |
| 21 | Empty state shown when no todos match filter | Empty state renders |
| 22 | Loading skeleton shown during initial fetch | Skeleton renders |

#### Optimistic Updates
| # | Test | Expected |
|---|------|----------|
| 23 | Toggle complete → UI updates immediately before API response | Optimistic UI |
| 24 | Toggle complete → API fails → UI rolls back to original state | Rollback works |
| 25 | Delete → item removed from list immediately | Optimistic delete |
| 26 | Delete → API fails → item re-appears | Rollback works |

#### `TodoForm.tsx`
| # | Test | Expected |
|---|------|----------|
| 27 | Enter key submits the form | Keyboard accessible |
| 28 | Empty title → submit disabled | Validation |

#### `TodoItem.tsx`
| # | Test | Expected |
|---|------|----------|
| 29 | Click title → enters inline edit mode | Edit state |
| 30 | Press `Esc` in inline edit → cancels, reverts to original | Keyboard cancel |
| 31 | Press `Enter` in inline edit → saves | Keyboard save |

#### Toast Component
| # | Test | Expected |
|---|------|----------|
| 32 | API error triggers global error toast | Toast appears |
| 33 | Toast auto-dismisses after 5 seconds | Disappears |

### Accessibility Tests (Lighthouse / Manual)
| # | Test | Expected |
|---|------|----------|
| 34 | All form fields have `<label>` or `aria-label` | No unlabelled inputs |
| 35 | Form errors use `aria-describedby` + `role="alert"` | Screen reader accessible |
| 36 | All interactive elements have visible `:focus` ring | Focus visible |
| 37 | Lighthouse a11y score on `/login` and `/` | ≥ 90 |
| 38 | Lighthouse performance score | ≥ 80 |

### Responsive / Visual Tests
| # | Test | Expected |
|---|------|----------|
| 39 | App at 360 × 640 px viewport — no horizontal scroll | Responsive |
| 40 | Dark mode toggle → `localStorage` key set, `dark` class on `<html>` | Persists |
| 41 | Reload after dark mode → dark mode still active | `localStorage` restored |
| 42 | Default respects `prefers-color-scheme: dark` | System preference honoured |

### End-to-End Browser Flow
| # | Step | Expected |
|---|------|----------|
| 43 | Visit `/` → redirected to `/login` | ProtectedRoute works |
| 44 | Register → land on dashboard, empty state | Full register flow |
| 45 | Add 3 todos via Enter key | All 3 appear |
| 46 | Toggle one complete → strike-through applied | UI updates |
| 47 | Filter "Active" → 2 todos; Filter "Completed" → 1 todo | Filter works |
| 48 | Refresh page → still logged in, filter preserved | Cookie + URL state |
| 49 | Kill backend → toggle → rollback + error toast | Resilience |
| 50 | Logout → cookie cleared → redirect to `/login` | Full logout flow |

---

## Sprint 7 — Hardening & Release

### Security Manual Tests
| # | Test | Expected |
|---|------|----------|
| 1 | User A logs in; User B does `GET /api/todos/<A's-todo-id>` | `404` (not `403`) |
| 2 | Set `JWT_ACCESS_TTL=5s`, login, wait 6 s, call `GET /api/auth/me` | `401` expired token |
| 3 | Login, logout, replay the exact same cookie | `401` blacklisted JTI |
| 4 | POST body > 10 KB → `413` | Body cap confirmed |
| 5 | Access log during a register → `password` field is `[Redacted]` | Redaction confirmed |
| 6 | `cookie` header in access log is `[Redacted]` | Redaction confirmed |

### Dependency & Secret Hygiene
| # | Test | Expected |
|---|------|----------|
| 7 | `npm audit --production` in `backend/` | 0 high / critical |
| 8 | `npm audit --production` in `frontend/` | 0 high / critical |
| 9 | `git ls-files \| grep -E "(^\\|/)\.env$"` | No results (`.env` not tracked) |
| 10 | `.env.example` contains only placeholder values, no real secrets | Confirmed |

### Blacklist Sweep Script
| # | Test | Expected |
|---|------|----------|
| 11 | Insert rows with `expires_at` in the past; run `sweep-blacklist.ts` | Expired rows deleted |
| 12 | Insert rows with `expires_at` in the future; run sweep | Future rows NOT deleted |
| 13 | Row count before and after sweep matches expected | Only expired removed |

### Acceptance Checklist (Blueprint §20)
| # | Check | Expected |
|---|-------|----------|
| 14 | Every user story (US-01 → US-09) has at least one passing integration test | Traceability confirmed |
| 15 | All spec §12.1 must-have tests are in the test suite | 100% coverage of must-haves |
| 16 | `npm test` is green in CI (or local) | No failures |
| 17 | `npm run typecheck` clean on both `backend/` and `frontend/` | No TS errors |
| 18 | `npm run lint` clean on both | No lint warnings |

### Release Gate
| # | Check | Expected |
|---|-------|----------|
| 19 | `git status` is clean before tagging | No dirty files |
| 20 | `git tag --list` shows `v1.0.0` | Tag exists |
| 21 | `RELEASE_NOTES_v1.0.0.md` exists referencing spec §1 goals | Release documented |
| 22 | Full browser E2E walkthrough on tagged commit | Golden path passes |

---

## Summary

| Sprint | Unit Tests | Integration Tests | Manual / E2E | Total |
|--------|-----------|-------------------|--------------|-------|
| 1 — Foundation | 9 | 0 | 3 | 12 |
| 2 — Domain/Infra | 26 | 0 | 2 | 28 |
| 3 — Auth | 10 | 12 | 4 | 26 |
| 4 — Todos CRUD | 12 | 19 | 3 | 34 |
| 5 — Middleware | 10 | 17 | 3 | 30 |
| 6 — Frontend | 32 | 0 | 11 | 43 |
| 7 — Hardening | 0 | 0 | 22 | 22 |
| **Total** | **99** | **48** | **48** | **195** |

# TODO Web App — Specification

> Build-ready specification derived from `todo_blueprint.md`. The blueprint defines **how** the system is built (architecture, layers, tooling); this spec defines **what** it must do (user stories, acceptance criteria, contracts, edge cases). Every requirement here is testable.

**Status:** Draft v1 · 2026-04-28
**Spec ID format:** `FR-###` (functional), `NFR-###` (non-functional), `SEC-###` (security), `UI-###` (interface)

---

## Table of Contents

1. [Goals & Non-Goals](#1-goals--non-goals)
2. [Personas & User Stories](#2-personas--user-stories)
3. [Functional Requirements](#3-functional-requirements)
4. [API Contract — Detailed](#4-api-contract--detailed)
5. [Validation Rules](#5-validation-rules)
6. [Security Requirements](#6-security-requirements)
7. [UI / UX Requirements](#7-ui--ux-requirements)
8. [Non-Functional Requirements](#8-non-functional-requirements)
9. [Data Model Constraints](#9-data-model-constraints)
10. [Error Catalog](#10-error-catalog)
11. [Edge Cases & Failure Modes](#11-edge-cases--failure-modes)
12. [Test Scenarios](#12-test-scenarios)
13. [Out of Scope](#13-out-of-scope)
14. [Open Questions](#14-open-questions)
15. [Traceability Matrix](#15-traceability-matrix)

---

## 1. Goals & Non-Goals

### Goals
- Single-tenant TODO app where each registered user manages a private list.
- Stateless backend (JWT-based auth) over SQLite.
- Mobile-first responsive UI; usable from a phone, tablet, or desktop.
- Production-grade security baseline (OWASP Top-10 mitigations as listed in blueprint §8).

### Non-Goals (v1)
- Sharing todos between users.
- Real-time sync / WebSockets.
- File attachments, rich text, recurring tasks, reminders, due dates.
- Social login (Google / GitHub).
- Email verification or password reset (deferred — see §13).
- Multi-language / i18n.

---

## 2. Personas & User Stories

### Persona: Returning User (Riya)
A registered user who logs in daily to manage personal tasks.

| ID    | As a…           | I want to…                         | So that…                                        |
|-------|-----------------|------------------------------------|-------------------------------------------------|
| US-01 | new visitor     | register with email + password     | I can save todos that persist between sessions  |
| US-02 | registered user | log in                             | I can access my todo list                       |
| US-03 | logged-in user  | log out                            | nobody on a shared device can see my todos      |
| US-04 | logged-in user  | create a todo                      | I can capture something I need to do            |
| US-05 | logged-in user  | see all my todos                   | I can review what's outstanding                 |
| US-06 | logged-in user  | mark a todo complete / incomplete  | I can track progress                            |
| US-07 | logged-in user  | edit a todo's title or description | I can correct or refine it                      |
| US-08 | logged-in user  | delete a todo                      | I can clear noise                               |
| US-09 | logged-in user  | filter by All / Active / Completed | I can focus on what's left                      |
| US-10 | mobile user     | use every flow on a 360 px screen  | I'm not blocked when away from my desktop       |

---

## 3. Functional Requirements

### 3.1 Authentication

| ID     | Requirement                                                                                                              |
|--------|--------------------------------------------------------------------------------------------------------------------------|
| FR-001 | The system SHALL allow a visitor to register with `username`, `email`, `password`.                                       |
| FR-002 | Registration SHALL fail with `409 CONFLICT` if `email` or `username` already exists (case-insensitive on `email`).       |
| FR-003 | Registration SHALL reject passwords that violate the policy in §5 with `400 VALIDATION_ERROR` + per-field messages.      |
| FR-004 | The system SHALL allow a registered user to log in with `email` + `password` and SHALL set an `httpOnly` JWT cookie.     |
| FR-005 | Login failures SHALL respond with a generic message (`"Invalid credentials"`) regardless of which field is wrong.        |
| FR-006 | Login SHALL run `bcrypt.compare` against a dummy hash when the email is not found, to equalize timing.                   |
| FR-007 | A logged-in user SHALL be able to log out; the server SHALL blacklist the JWT `jti` and clear the cookie.                |
| FR-008 | After logout, any further request with the revoked token SHALL return `401 UNAUTHORIZED`.                                |
| FR-009 | `GET /api/auth/me` SHALL return the current user (`id`, `username`, `email`) for an authenticated request.               |

### 3.2 Todos

| ID     | Requirement                                                                                                              |
|--------|--------------------------------------------------------------------------------------------------------------------------|
| FR-010 | Authenticated user SHALL be able to create a todo with `title` (required) and optional `description`.                    |
| FR-011 | Newly created todos SHALL have `completed = false` and a server-generated UUID `id`.                                     |
| FR-012 | `GET /api/todos` SHALL return only the requesting user's todos, ordered by `created_at DESC`.                            |
| FR-013 | `GET /api/todos` SHALL support cursor pagination (`?limit=20&cursor=<id>`) with `limit` 1–100, default 20.                |
| FR-014 | `GET /api/todos` SHALL support `?status=all\|active\|completed` (default `all`).                                         |
| FR-015 | `GET /api/todos/:id` SHALL return the todo if the requester owns it, else `404 NOT_FOUND` (do NOT return `403`).         |
| FR-016 | `PATCH /api/todos/:id` SHALL accept partial updates of `title`, `description`, `completed`. Unsent fields are unchanged. |
| FR-017 | `PATCH /api/todos/:id` SHALL update `updated_at` to `CURRENT_TIMESTAMP` (handled by trigger).                            |
| FR-018 | `DELETE /api/todos/:id` SHALL remove the todo and respond `204 No Content`. Idempotent: deleting twice → `404` second.   |
| FR-019 | All todo endpoints SHALL fetch the resource and check `resource.userId === req.user.id` inside the use case.             |
| FR-020 | Cross-user access attempts SHALL return `404 NOT_FOUND`, not `403`.                                                      |

---

## 4. API Contract — Detailed

**Base URL:** `/api` · All bodies are JSON · `Content-Type: application/json` required on POST/PATCH.

### 4.1 Status code matrix

| Endpoint                  | 200 | 201 | 204 | 400 | 401 | 403 | 404 | 409 | 429 | 500 |
|---------------------------|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|
| POST `/auth/register`     |     | ✓   |     | ✓   |     |    |     | ✓   | ✓   | ✓   |
| POST `/auth/login`        | ✓   |     |     | ✓   | ✓   |    |     |     | ✓   | ✓   |
| POST `/auth/logout`       |     |     | ✓   |     | ✓   |     |     |     |     | ✓   |
| GET  `/auth/me`           | ✓   |     |     |     | ✓   |     |     |     |     | ✓   |
| POST `/todos`             |     | ✓   |     | ✓   | ✓   |     |     |     | ✓   | ✓   |
| GET  `/todos`             | ✓   |     |     | ✓   | ✓   |     |     |     | ✓   | ✓   |
| GET  `/todos/:id`         | ✓   |     |     | ✓   | ✓   |     | ✓   |     |     | ✓   |
| PATCH `/todos/:id`        | ✓   |     |     | ✓   | ✓   |     | ✓   |     |     | ✓   |
| DELETE `/todos/:id`       |     |     | ✓   | ✓   | ✓   |     | ✓   |     |     | ✓   |

> **No `403` row** — by design (FR-020). Cross-user attempts mask as `404`.

### 4.2 Sample payloads

**POST /api/auth/register**
```json
// Request
{ "username": "riya_k", "email": "Riya@example.com", "password": "Strong@123" }

// 201 Created
{ "data": { "id": "550e8400-e29b-41d4-a716-446655440000",
            "username": "riya_k", "email": "riya@example.com" } }

// 409 Conflict
{ "error": { "code": "CONFLICT", "message": "Email already registered" } }
```

**POST /api/auth/login**
```json
// Request
{ "email": "riya@example.com", "password": "Strong@123" }

// 200 OK + Set-Cookie: access=<jwt>; HttpOnly; Secure; SameSite=Strict; Path=/
{ "data": { "user": { "id": "550e8400-...", "username": "riya_k",
                      "email": "riya@example.com" } } }

// 401 Unauthorized
{ "error": { "code": "UNAUTHORIZED", "message": "Invalid credentials" } }
```

**GET /api/todos?limit=20&status=active**
```json
// 200 OK
{
  "data": {
    "items": [
      { "id": "...", "title": "Buy milk", "description": null,
        "completed": false, "createdAt": "2026-04-28T08:00:00Z",
        "updatedAt": "2026-04-28T08:00:00Z" }
    ],
    "nextCursor": "01HXY7..."
  }
}
```

**PATCH /api/todos/:id**
```json
// Request — partial; only completed changes
{ "completed": true }

// 200 OK
{ "data": { "id": "...", "title": "Buy milk", "description": null,
            "completed": true, "createdAt": "2026-04-28T08:00:00Z",
            "updatedAt": "2026-04-28T09:15:42Z" } }
```

### 4.3 DTO field rules
- `id`, `userId` → UUID v4 strings.
- `completed` → boolean in JSON (DB stores `0|1`; converted at repo boundary).
- Timestamps → ISO 8601 UTC strings.
- Server NEVER returns `password_hash`, internal flags, or other users' data.

### 4.4 Cookie spec (Set-Cookie on login)
- `Name`: `access`
- `httpOnly`: true
- `Secure`: true (`COOKIE_SECURE=true` in production; `false` only in local dev)
- `SameSite`: `Strict`
- `Path`: `/`
- `Max-Age`: matches `JWT_ACCESS_TTL` (15 min)

### 4.5 CORS
- `Access-Control-Allow-Origin`: exactly `CORS_ORIGIN` (no wildcard).
- `Access-Control-Allow-Credentials`: `true`.
- Allowed methods: `GET, POST, PATCH, DELETE, OPTIONS`.
- Allowed headers: `Content-Type`.

---

## 5. Validation Rules

All rules enforced by Zod in `presentation/validators/`. Frontend reuses the same schemas.

| Field                | Rule                                                                           | Error message hint            |
|----------------------|--------------------------------------------------------------------------------|-------------------------------|
| `username`           | string, 3–20 chars, regex `^[a-zA-Z0-9_]+$`                                    | `"username invalid"`          |
| `email`              | RFC 5322, ≤ 255 chars, lowercased + trimmed by `.transform`                    | `"email invalid"`             |
| `password`           | 8–72 chars, ≥1 uppercase, ≥1 lowercase, ≥1 digit, ≥1 special char              | per-rule message              |
| `todo.title`         | string, 1–120 chars after trim                                                 | `"title required"`            |
| `todo.description`   | string, 0–1000 chars; optional; null allowed                                   | `"description too long"`      |
| `todo.completed`     | boolean                                                                        | `"completed must be boolean"` |
| `:id` path param     | UUID v4                                                                        | `"invalid id"`                |
| `?limit` query       | integer 1–100                                                                  | `"limit out of range"`        |
| `?cursor` query      | string (UUID), optional                                                        | `"invalid cursor"`            |
| `?status` query      | enum: `all` \| `active` \| `completed`; default `all`                          | `"invalid status"`            |

**Server-side normalization** (always re-applied, even if frontend already did):
- Trim whitespace on `username`, `title`, `description`.
- Lowercase `email`.
- Treat empty-string `description` as `null`.

---

## 6. Security Requirements

| ID      | Requirement                                                                                                        | Verification                          |
|---------|--------------------------------------------------------------------------------------------------------------------|---------------------------------------|
| SEC-001 | Passwords SHALL be hashed with `bcrypt` cost factor 12 before storage.                                             | inspect `users.password_hash` prefix `$2b$12$` |
| SEC-002 | Plaintext passwords SHALL NEVER appear in logs, error responses, or DB.                                            | grep + log redaction config           |
| SEC-003 | JWTs SHALL use HS256 with `JWT_SECRET` ≥ 32 bytes; access TTL = 15 min.                                            | env validation + decoded header       |
| SEC-004 | Tokens SHALL be transported only via `httpOnly` + `Secure` + `SameSite=Strict` cookies.                            | response header check                 |
| SEC-005 | Logout SHALL insert the `jti` into `token_blacklist` with the original expiry.                                     | DB row appears post-logout            |
| SEC-006 | Auth middleware SHALL reject any token whose `jti` is in `token_blacklist`.                                        | replay test post-logout → 401         |
| SEC-007 | All SQL SHALL go through `better-sqlite3` prepared statements; **no template-literal SQL with user input**.        | code review + grep                    |
| SEC-008 | Login route SHALL be rate-limited to 5 attempts per 15 min per IP.                                                 | integration test                      |
| SEC-009 | Global API rate limit SHALL be 100 requests / minute / IP.                                                         | integration test                      |
| SEC-010 | Request body size SHALL be capped at 10 KB (`express.json({ limit: '10kb' })`).                                    | oversized POST → 413                  |
| SEC-011 | `helmet()` SHALL be enabled with default CSP plus a tightened `default-src 'self'`.                                | response headers                      |
| SEC-012 | CORS origin SHALL be the exact `CORS_ORIGIN`; wildcards forbidden.                                                 | code review                           |
| SEC-013 | Login SHALL execute `bcrypt.compare` against a dummy hash on missing-user lookups (timing equalization).           | timing test                           |
| SEC-014 | Authentication errors SHALL be generic; never reveal which field was wrong.                                        | response body inspection              |
| SEC-015 | Cross-user resource access SHALL return `404`, not `403`.                                                          | integration test                      |
| SEC-016 | Env vars SHALL be validated by Zod at boot; the process SHALL exit non-zero if invalid.                            | unit test of `env.ts`                 |
| SEC-017 | Logger SHALL redact `req.headers.cookie`, `req.body.password`, `req.body.token`.                                   | log inspection                        |
| SEC-018 | `npm audit --production` SHALL report no high or critical vulnerabilities at release time.                         | CI check                              |
| SEC-019 | Frontend SHALL never use `dangerouslySetInnerHTML` with user-supplied content.                                     | grep                                  |
| SEC-020 | A daily sweep SHALL purge expired rows from `token_blacklist`.                                                     | cron job + sweep script               |

---

## 7. UI / UX Requirements

### 7.1 Routes
| Path           | Page         | Access     | On unauthenticated |
|----------------|--------------|------------|--------------------|
| `/login`       | Login        | Public     | —                  |
| `/register`    | Register     | Public     | —                  |
| `/`            | Dashboard    | Protected  | redirect `/login`  |
| `/todos/:id`   | TodoDetail   | Protected  | redirect `/login`  |
| `*`            | NotFound     | Public     | —                  |

### 7.2 Per-page requirements

| ID     | Page       | Requirement                                                                                                    |
|--------|------------|----------------------------------------------------------------------------------------------------------------|
| UI-001 | Register   | Show password strength meter that updates on each keystroke.                                                   |
| UI-002 | Register   | Display per-field server errors using the `error.fields` map from the API.                                     |
| UI-003 | Login      | Disable submit while request is in-flight; show spinner inside the button.                                     |
| UI-004 | Dashboard  | Render a skeleton (not spinner) while initial `GET /todos` loads.                                              |
| UI-005 | Dashboard  | Apply optimistic updates on create / toggle / edit / delete; rollback + toast on failure.                      |
| UI-006 | Dashboard  | Filter tabs (All / Active / Completed) update the URL query (`?status=`) so reloads preserve the filter.       |
| UI-007 | Dashboard  | Show empty-state illustration + CTA when the list is empty.                                                    |
| UI-008 | TodoItem   | Toggle checkbox strikes through the title; `Enter` on inline edit saves, `Esc` cancels.                        |
| UI-009 | Global     | Show toast for every server error (network, 4xx, 5xx) with a 5 s auto-dismiss.                                 |
| UI-010 | Global     | Receiving any `401` response SHALL clear auth state and redirect to `/login`.                                  |
| UI-011 | Global     | Dark mode toggle persists in `localStorage`; respects `prefers-color-scheme` on first load.                    |
| UI-012 | Global     | All interactive elements have visible `:focus` styles for keyboard users.                                      |
| UI-013 | Global     | App SHALL be usable at 360 × 640 px without horizontal scroll.                                                 |
| UI-014 | Global     | Navbar shows username + logout button when authenticated.                                                      |

### 7.3 Accessibility (a11y)
- Lighthouse a11y score ≥ 90.
- Form fields have `<label>` (or `aria-label`) and announce errors via `aria-describedby`.
- Color contrast ≥ 4.5:1 for text.
- All actions reachable by keyboard alone.

---

## 8. Non-Functional Requirements

| ID      | Category      | Requirement                                                                          |
|---------|---------------|--------------------------------------------------------------------------------------|
| NFR-001 | Performance   | API p95 latency < 100 ms for CRUD on a 10 000-row table on a single user's slice.    |
| NFR-002 | Performance   | Frontend Largest Contentful Paint < 2.5 s on Fast 3G throttle.                       |
| NFR-003 | Reliability   | Server SHALL recover from transient DB errors with a clear 500 response, no crash.   |
| NFR-004 | Reliability   | A failed migration SHALL halt boot — partial schema is unacceptable.                 |
| NFR-005 | Maintainability | No source file > 150 lines; no function > 40 lines.                                |
| NFR-006 | Compatibility | Latest Chrome, Firefox, Safari, Edge (last 2 versions).                              |
| NFR-007 | Observability | Every log line includes `requestId`; access logs include method/path/status/durMs.   |
| NFR-008 | Portability   | Backend runs on Node 20 LTS+ on Linux, macOS, Windows (dev parity).                  |
| NFR-009 | Build         | `tsc --noEmit` and `eslint` both pass with zero warnings on `main`.                  |
| NFR-010 | Deps          | No package with a known high/critical CVE (`npm audit --production`).                |

---

## 9. Data Model Constraints

Beyond the DDL in blueprint §5:

- `users.username` and `users.email` are **case-insensitive unique** in practice (email is lowercased at validation; username comparison is case-sensitive but discouraged confusables aren't deduped — open question Q-04).
- `todos.user_id` has `ON DELETE CASCADE`: deleting a user removes their todos.
- `todos.completed` stored as `INTEGER (0|1)`; the repo layer maps to/from `boolean`.
- `token_blacklist.jti` is the JWT ID claim; `expires_at` matches the original token expiry.
- All timestamps stored as SQLite `DATETIME` in UTC (`CURRENT_TIMESTAMP`).

**Indexes (per blueprint):**
- `users(email)`
- `todos(user_id, created_at DESC)` — composite, supports list queries.

---

## 10. Error Catalog

| Code               | HTTP | When                                              | `fields` map? |
|--------------------|------|---------------------------------------------------|---------------|
| `VALIDATION_ERROR` | 400  | Zod `.parse()` fails                              | Yes           |
| `UNAUTHORIZED`     | 401  | Missing / invalid / expired / revoked token; bad login credentials | No |
| `FORBIDDEN`        | 403  | Reserved (currently unused — see SEC-015)         | No            |
| `NOT_FOUND`        | 404  | Resource does not exist OR caller is not owner    | No            |
| `CONFLICT`         | 409  | Unique constraint hit (email/username taken)      | No            |
| `PAYLOAD_TOO_LARGE`| 413  | Body exceeds `10kb` limit                         | No            |
| `RATE_LIMITED`     | 429  | Rate limiter rejected the request                 | No            |
| `INTERNAL_ERROR`   | 500  | Unhandled exception — message is generic          | No            |

---

## 11. Edge Cases & Failure Modes

| ID     | Scenario                                                              | Expected behavior                                              |
|--------|-----------------------------------------------------------------------|----------------------------------------------------------------|
| EC-01  | Register with email already taken (different case)                    | `409 CONFLICT` (email is normalized to lowercase before check) |
| EC-02  | Login with correct email, wrong password                              | `401` `"Invalid credentials"` — no field hint                  |
| EC-03  | Login with non-existent email                                         | `401` `"Invalid credentials"` — runs dummy bcrypt to equalize  |
| EC-04  | Authenticated request with token from a deleted user                  | `401 UNAUTHORIZED` (user lookup in `me` returns nothing)       |
| EC-05  | Logout called with no token                                           | `401 UNAUTHORIZED`                                             |
| EC-06  | Logout called twice with the same token                               | First → `204`; second → `401` (jti revoked)                    |
| EC-07  | `PATCH` with empty body `{}`                                          | `400 VALIDATION_ERROR` — at least one field required           |
| EC-08  | `PATCH` with `title: "   "` (only whitespace)                         | `400 VALIDATION_ERROR` (post-trim length 0)                    |
| EC-09  | `DELETE /todos/:id` when id is valid UUID but doesn't exist           | `404 NOT_FOUND`                                                |
| EC-10  | `DELETE /todos/:id` when id is valid UUID but belongs to another user | `404 NOT_FOUND` (NOT 403) — SEC-015                            |
| EC-11  | `GET /todos?limit=0` or `limit=101`                                   | `400 VALIDATION_ERROR`                                         |
| EC-12  | Cursor points to a deleted/foreign todo                               | Empty `items`, `nextCursor: null`                              |
| EC-13  | Body containing SQL fragments (`'; DROP TABLE...`)                    | Stored verbatim as a string; no SQL executed                   |
| EC-14  | Body containing `<script>` tags                                       | Stored verbatim; React escapes on render                       |
| EC-15  | Concurrent toggles of the same todo (UI race)                         | Last write wins; updated_at reflects latest write              |
| EC-16  | Network drops mid-request                                             | Optimistic UI rolls back; toast `"Could not save — try again"` |
| EC-17  | DB file missing at boot                                               | Migrations recreate it; app starts cleanly                     |
| EC-18  | `JWT_SECRET` shorter than 32 chars                                    | Process exits with non-zero code on boot                       |
| EC-19  | Clock skew — token `iat` slightly in the future                       | Allow up to 5 s skew via `clockTolerance`                      |
| EC-20  | More than 5 failed logins from one IP in 15 min                       | `429 RATE_LIMITED`                                             |

---

## 12. Test Scenarios

### 12.1 Must-have integration tests (`vitest` + `supertest` + `:memory:` SQLite)

| Scenario                                                    | Asserts                                       |
|-------------------------------------------------------------|-----------------------------------------------|
| Register → Login → Me                                       | Cookie set, `me` returns the new user         |
| Register duplicate email (mixed case)                       | 409                                           |
| Register weak password                                      | 400 with field map                            |
| Login wrong password                                        | 401, generic message                          |
| Login wrong email                                           | 401, generic message, similar latency to wrong-password |
| Logout then call protected route                            | 401                                           |
| Create → List → Get → Update → Delete (happy path)          | All status codes match §4.1                   |
| User A creates todo, User B `GET /todos/:id`                | 404 (not 403)                                 |
| User A creates todo, User B `DELETE /todos/:id`             | 404; row still present in DB                  |
| Patch with `{}`                                             | 400                                           |
| 6 logins in 15 min                                          | 6th returns 429                               |
| 11 KB body to register                                      | 413                                           |
| Body with SQL injection payload in title                    | 201; row reads back as plain string           |
| GET `/todos` with `?status=completed`                       | Returns only completed todos                  |
| Cursor pagination over 25 items, `limit=10`                 | 3 pages, last `nextCursor: null`              |

### 12.2 Unit test focus
- All use cases (mock repos) — happy path + each thrown domain error.
- Zod schemas — accept the canonical example, reject one example per rule.
- DTO mappers — `password_hash` never present in output.
- `env.ts` — fails on missing `JWT_SECRET`.

### 12.3 Frontend tests (`vitest` + Testing Library)
- `AuthContext`: login sets user, logout clears user, 401 interceptor redirects.
- `<ProtectedRoute>`: redirects when unauthenticated.
- TodoItem: optimistic toggle rolls back on rejected promise.
- Form validation messages render from `error.fields`.

---

## 13. Out of Scope (v1)

These are explicitly **not** built in v1 and should not be quietly added:
- Email verification on register.
- Password reset / forgot-password flow.
- Multi-factor auth.
- OAuth / social login.
- Sharing or assigning todos to other users.
- Push notifications, reminders, due dates.
- File attachments.
- Audit log of user actions.
- Admin panel.
- Internationalization.
- Real-time updates (WebSockets / SSE).

---

## 14. Open Questions

| ID    | Question                                                                          | Default until decided                          |
|-------|-----------------------------------------------------------------------------------|------------------------------------------------|
| Q-01  | Do we need a refresh-token flow in v1, or is 15 min access enough?                | Access-only; user re-logs in after 15 min      |
| Q-02  | Should `username` be editable post-registration?                                  | No — immutable in v1                           |
| Q-03  | Hard delete vs soft delete for todos?                                             | Hard delete                                    |
| Q-04  | Block visually-confusable usernames (e.g., `riya` vs `riуa` Cyrillic `у`)?        | Out of scope                                   |
| Q-05  | Pagination strategy: offset vs cursor for first version?                          | Cursor (chosen — see blueprint §15)            |
| Q-06  | Account lockout after N failed logins, or rate limit only?                        | Rate limit only                                |
| Q-07  | CSP `script-src`: allow inline for Vite HMR in dev?                               | Yes in dev only via env-conditional CSP        |

---

## 15. Traceability Matrix

Maps user stories to functional requirements and tests.

| User Story | FR(s)                | Test scenario(s)                                    |
|------------|----------------------|-----------------------------------------------------|
| US-01      | FR-001..003          | Register happy path; weak password; duplicate email |
| US-02      | FR-004..006, FR-009  | Login happy path; wrong password; wrong email       |
| US-03      | FR-007, FR-008       | Logout then call protected route                    |
| US-04      | FR-010, FR-011       | Create todo                                         |
| US-05      | FR-012..014          | List, filter, paginate                              |
| US-06      | FR-016, FR-017       | Toggle completed via PATCH                          |
| US-07      | FR-016, FR-017       | PATCH title/description                             |
| US-08      | FR-018               | Delete; idempotency                                 |
| US-09      | FR-014               | List with each `status` value                       |
| US-10      | UI-013               | Manual mobile-viewport check + Lighthouse           |

---

**Definition of Done for v1:**
1. Every FR-, SEC-, UI-, NFR- has a passing test or signed-off manual verification.
2. All §12 must-have integration tests are green.
3. Acceptance checklist in blueprint §20 fully checked.
4. No items from §13 (Out of Scope) leaked into the codebase.

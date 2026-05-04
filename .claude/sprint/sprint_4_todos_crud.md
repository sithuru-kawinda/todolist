# Sprint 4 — Todos CRUD

## 1. Sprint Info

| Field        | Value                                                  |
| ------------ | ------------------------------------------------------ |
| Phase        | P4 (blueprint §18)                                     |
| Theme        | Full CRUD on todos with per-user ownership enforcement |
| Day          | 4                                                      |
| Effort       | 4 h                                                    |
| Story points | 4                                                      |
| Tasks        | T-036 → T-046                                          |
| Status       | Not started                                            |

## 2. Sprint Goal

An authenticated user can create, list (with pagination + status filter), get one, update (partial PATCH), and delete their own todos. Cross-user access returns `404` (never `403`).

## 3. Dependencies

- Sprint 3 done — `requireAuth` middleware available; user accounts exist.

## 4. Scope

| Story / Req.     | Description                                | Tasks                      |
| ---------------- | ------------------------------------------ | -------------------------- |
| US-04            | Create todo                                | T-036, T-041, T-043, T-044 |
| US-05            | List todos                                 | T-037, T-041, T-043, T-044 |
| US-06            | Toggle complete                            | T-039, T-041, T-043, T-044 |
| US-07            | Edit todo                                  | T-039, T-041, T-043, T-044 |
| US-08            | Delete todo                                | T-040, T-041, T-043, T-044 |
| US-09            | Filter by All / Active / Completed         | T-037, T-041               |
| FR-013           | Cursor pagination (`?limit=20&cursor=...`) | T-037, T-041               |
| FR-019           | Ownership check inside use cases           | T-038, T-039, T-040        |
| FR-020 / SEC-015 | Cross-user access returns `404`            | T-038, T-039, T-040, T-045 |
| EC-07            | `PATCH {}` returns `400`                   | T-041, T-046               |

## 5. Backlog

### M-6 · Todos CRUD feature

- [ ] T-036 — `application/todos/create.uc.ts`
- [ ] T-037 — `application/todos/list.uc.ts` (accepts `userId, limit, cursor, status`)
- [ ] T-038 — `application/todos/get.uc.ts` (owner check; foreign → `NotFoundError`)
- [ ] T-039 — `application/todos/update.uc.ts` (owner check; partial patch)
- [ ] T-040 — `application/todos/delete.uc.ts` (owner check; hard delete)
- [ ] T-041 — `presentation/validators/todos.schema.ts` — create / patch / list-query / id-param
- [ ] T-042 — `todoToDto(todo)` — ISO dates, `0|1` → boolean
- [ ] T-043 — `presentation/controllers/todos.ctrl.ts` — 5 handlers
- [ ] T-044 — `presentation/routes/todos.routes.ts` (behind `requireAuth`)
- [ ] T-045 — Manual: cross-user `GET /todos/:id` returns `404` (EC-10)
- [ ] T-046 — Manual: `PATCH {}` returns `400` (EC-07)

## 6. Definition of Done

- [ ] POST `/api/todos` valid → `201` with todo DTO (no internal flags)
- [ ] POST `/api/todos` empty title → `400` with field map
- [ ] GET `/api/todos` returns only requester's todos, ordered `created_at DESC`
- [ ] GET `/api/todos?status=active` filters correctly
- [ ] GET `/api/todos?limit=10` returns 10 items + `nextCursor` (when more exist)
- [ ] GET `/api/todos/:id` for own todo → `200`; for another user's id → `404`
- [ ] PATCH `/api/todos/:id` with `{ completed: true }` → only that field changes; `updated_at` advances
- [ ] PATCH `/api/todos/:id` with `{}` → `400`
- [ ] DELETE `/api/todos/:id` → `204`; second DELETE → `404`
- [ ] DTO never exposes `password_hash` or other users' data

## 7. Demo Plan

Logged in as User A with cookie jar:

1. POST `/api/todos` with `{ title: "" }` → 400
2. POST `/api/todos` ×3 with valid titles → 201 each
3. GET `/api/todos` → 3 items in `created_at DESC` order
4. PATCH `/api/todos/<id>` with `{ "completed": true }` → 200; `updated_at` advanced
5. GET `/api/todos?status=active` → 2 items (the unfinished ones)
6. GET `/api/todos?status=completed` → 1 item
7. DELETE `/api/todos/<id>` → 204
8. DELETE same id again → 404
9. PATCH `/api/todos/<id>` with `{}` → 400

Then with User B's cookie: 10. GET `/api/todos/<User-A-todo-id>` → 404 (NOT 403) — SEC-015 11. DELETE `/api/todos/<User-A-todo-id>` → 404; verify in DB the row still exists

## 8. Risks & Mitigations

| Risk                                              | Mitigation                                                          |
| ------------------------------------------------- | ------------------------------------------------------------------- | ----------- | ---------- |
| Forgetting ownership check → security hole        | Every read/update/delete use case fetches → compares `userId` first |
| Returning `403` on foreign access leaks existence | Use cases throw `NotFoundError`, not `ForbiddenError`               |
| `PATCH {}` accepted with no field changes         | Schema requires at least one of `title                              | description | completed` |
| DTO leaks fields                                  | Always pass through `todoToDto`; never `res.json(rawRow)`           |
| Cursor pagination off-by-one                      | Test with exactly `limit` items and `limit + 1` items               |

## 9. Daily Standup

**Day 4 — yyyy-mm-dd**

- Yesterday: Sprint 3 complete (T-027 → T-035)
- Today: T-036 → T-046
- Blockers:

## 10. Review Checklist (end of Day 4)

- [ ] All 11 demo steps pass
- [ ] All 11 tasks marked done
- [ ] Sprint DoD ticked
- [ ] Carryover (if any) noted in `sprint_5_middleware_and_tests.md`

## 11. Retrospective Prompts

- **Went well:**
- **Didn't go well:**
- **Try next sprint:**

## 12. Handoff to Next Sprint

After this sprint, **Sprint 5 (Middleware & Tests)** can:

- Build cross-cutting middleware (error handler, rate limiter, request ID) on top of working endpoints
- Write integration tests against a complete API surface

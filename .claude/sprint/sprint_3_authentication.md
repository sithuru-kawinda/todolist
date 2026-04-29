# Sprint 3 — Authentication

## 1. Sprint Info

| Field          | Value                                                       |
|----------------|-------------------------------------------------------------|
| Phase          | P3 (blueprint §18)                                          |
| Theme          | Register / Login / Logout / Me — fully working over HTTP    |
| Day            | 3                                                           |
| Effort         | 4 h                                                         |
| Story points   | 4                                                           |
| Tasks          | T-027 → T-035                                               |
| Status         | Not started                                                 |

## 2. Sprint Goal

A user can register, log in (receiving an HttpOnly JWT cookie), call `GET /api/auth/me` to confirm identity, and log out (with the JWT `jti` blacklisted). All four endpoints return correct status codes per spec §4.1.

## 3. Dependencies

- Sprint 2 done — `container` is wired with users, hasher, tokens, blacklist.

## 4. Scope

| Story / Req. | Description                                              | Tasks                       |
|--------------|----------------------------------------------------------|-----------------------------|
| US-01        | Register                                                 | T-027, T-031, T-032, T-034  |
| US-02        | Login                                                    | T-028, T-031, T-032, T-034  |
| US-03        | Logout                                                   | T-029, T-032, T-034         |
| FR-009       | `GET /api/auth/me`                                       | T-030, T-032, T-034         |
| FR-005       | Generic auth error                                       | T-028                       |
| FR-006       | bcrypt runs on missing user (timing equalization)        | T-028                       |
| SEC-004      | Cookie flags: HttpOnly, Secure, SameSite=Strict          | T-032                       |
| SEC-013      | Constant-time login                                      | T-028                       |
| SEC-014      | Generic auth error message                               | T-028, T-032                |

## 5. Backlog

### M-5 · Authentication feature
- [ ] T-027 — `application/auth/register.uc.ts`
- [ ] T-028 — `application/auth/login.uc.ts` (bcrypt runs even on missing user)
- [ ] T-029 — `application/auth/logout.uc.ts` (blacklist `jti` with original expiry)
- [ ] T-030 — `application/auth/me.uc.ts`
- [ ] T-031 — `presentation/validators/auth.schema.ts` — `registerSchema`, `loginSchema` (rules from spec §5)
- [ ] T-032 — `presentation/controllers/auth.ctrl.ts` — 4 handlers, set/clear cookie per spec §4.4
- [ ] T-033 — `presentation/middleware/auth.mw.ts` — verify JWT, blacklist check, attach `req.user`
- [ ] T-034 — `presentation/routes/auth.routes.ts`
- [ ] T-035 — Smoke test via curl: register → login → me → logout

## 6. Definition of Done

- [ ] Register weak password → `400 VALIDATION_ERROR` with field map
- [ ] Register valid creds → `201` with `{ data: { id, username, email } }`
- [ ] Register duplicate email (different case) → `409 CONFLICT` (FR-002)
- [ ] Login → `200`, response has `Set-Cookie: access=...; HttpOnly; SameSite=Strict`
- [ ] Login wrong password → `401` `"Invalid credentials"`
- [ ] Login wrong email → `401` `"Invalid credentials"` (similar latency to wrong password)
- [ ] `GET /api/auth/me` with cookie → `200` with current user
- [ ] Logout → `204`; subsequent request with same cookie → `401`

## 7. Demo Plan

Live via curl (with `--cookie-jar` and `--cookie`):
1. POST `/api/auth/register` `{ password: "weak" }` → 400 with field map
2. POST `/api/auth/register` valid creds → 201
3. POST `/api/auth/register` same email different case → 409
4. POST `/api/auth/login` valid → 200 + cookie saved to jar
5. GET `/api/auth/me` with cookie → 200, returns the new user
6. POST `/api/auth/login` wrong password → 401, generic message
7. POST `/api/auth/login` non-existent email → 401, generic message (timing similar)
8. POST `/api/auth/logout` → 204
9. GET `/api/auth/me` with same (now revoked) cookie → 401

## 8. Risks & Mitigations

| Risk                                                       | Mitigation                                                       |
|------------------------------------------------------------|------------------------------------------------------------------|
| Forgetting bcrypt-on-missing-user → timing leak            | T-028 explicitly compares against a dummy hash                   |
| Cookie flag missing in dev (no HTTPS)                      | `COOKIE_SECURE=false` in dev `.env`                              |
| Different generic messages leak which field is wrong       | One constant string `"Invalid credentials"` reused everywhere    |
| `jti` not stored at sign time → can't blacklist later      | `JwtTokenService.sign()` returns `{ token, jti }`; cookie issued from `token`, `jti` recorded server-side per request via JWT verify |
| Cookie not cleared on logout                               | Use `res.clearCookie('access', { ... same flags as set })`       |

## 9. Daily Standup

**Day 3 — yyyy-mm-dd**
- Yesterday: Sprint 2 complete (T-015 → T-026)
- Today: T-027 → T-035
- Blockers:

## 10. Review Checklist (end of Day 3)

- [ ] All 9 demo steps pass
- [ ] All 9 tasks marked done
- [ ] Sprint DoD ticked
- [ ] Carryover (if any) noted in `sprint_4_todos_crud.md`

## 11. Retrospective Prompts

- **Went well:**
- **Didn't go well:**
- **Try next sprint:**

## 12. Handoff to Next Sprint

After this sprint, **Sprint 4 (Todos CRUD)** can use:
- `requireAuth` middleware — attaches `req.user = { id }` to authenticated requests
- An existing user account — needed to create todos against

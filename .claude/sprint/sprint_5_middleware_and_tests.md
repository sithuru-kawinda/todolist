# Sprint 5 — Middleware & Automated Tests

## 1. Sprint Info

| Field        | Value                                           |
| ------------ | ----------------------------------------------- |
| Phase        | P5 (blueprint §18)                              |
| Theme        | Cross-cutting middleware + automated test suite |
| Day          | 5                                               |
| Effort       | 6 h                                             |
| Story points | 6                                               |
| Tasks        | T-047 → T-060                                   |
| Status       | Not started                                     |

## 2. Sprint Goal

The backend has central error handling, rate limits, request IDs, security headers, and a `/healthz` probe. ≥ 95% of use cases and all spec §12.1 must-have integration tests pass.

## 3. Dependencies

- Sprint 4 done — full API surface available for integration testing.

## 4. Scope

| ID                            | Requirement                              | Tasks         |
| ----------------------------- | ---------------------------------------- | ------------- |
| Blueprint §6 (error envelope) | Single error shape across all 4xx/5xx    | T-048         |
| SEC-008 / SEC-009             | Rate limits 5/15min auth, 100/min global | T-049         |
| SEC-010                       | 10 KB body cap                           | T-050         |
| SEC-011 / SEC-012             | Helmet + strict CORS                     | T-050         |
| SEC-017                       | Logger redaction                         | T-052         |
| NFR-007                       | Request ID on every log line             | T-047, T-052  |
| Spec §12.1                    | Must-have integration tests              | T-053 → T-060 |

## 5. Backlog

### M-7 · Cross-cutting middleware

- [ ] T-047 — `requestId.mw` — UUID per request, sets `X-Request-Id`
- [ ] T-048 — `error.mw` — `ZodError` → 400 + fields; `DomainError` → mapped; else → 500 generic
- [ ] T-049 — `rateLimit.mw` — 5/15min on `/auth/*`; 100/min global
- [ ] T-050 — `app.ts` wires `helmet`, `cors` (`credentials: true`, exact origin), `compression`, `cookie-parser`, `express.json({ limit: '10kb' })`
- [ ] T-051 — `GET /healthz` → `{ ok: true }` (no auth)
- [ ] T-052 — `pino-http` access log middleware with redaction (cookie, password, token)

### M-8 · Backend tests

- [ ] T-053 — `vitest` config; `tests/helpers/db.ts` builds fresh `:memory:` DB per file
- [ ] T-054 — Unit tests for all 9 use cases (mocked repos): happy path + each thrown error
- [ ] T-055 — Schema tests — accept canonical example, reject one example per rule
- [ ] T-056 — Integration: register → login → me; duplicate email; weak password
- [ ] T-057 — Integration: full todo CRUD happy path
- [ ] T-058 — Integration: cross-user 404; `PATCH {}` 400; DELETE non-existent 404
- [ ] T-059 — Integration: rate limit triggers at 6th login; 11 KB body returns 413
- [ ] T-060 — Integration: SQL-injection payload stored verbatim; `<script>` payload stored verbatim

## 6. Definition of Done

- [ ] `npm test` green
- [ ] Coverage report exists at `coverage/index.html`; use cases ≥ 95 %, controllers ≥ 80 %
- [ ] All §12.1 must-have integration tests pass
- [ ] Manual: 6 logins in 15 min from one IP → 6th returns `429`
- [ ] Manual: 11 KB body → `413`
- [ ] Manual: `GET /healthz` returns `200` without a cookie
- [ ] Access log line for a register request shows `password: [Redacted]`
- [ ] Every log line includes `requestId`
- [ ] `npm audit --production` — 0 high / critical

## 7. Demo Plan

1. Run `npm test` — show full green suite + coverage summary
2. Open `coverage/index.html` — pick a use case and confirm 100 % branch coverage
3. Loop `curl` 6 logins in a tight loop → 6th returns 429 with `Retry-After`
4. `curl -d "@11kb_body.json" /api/auth/register` → 413
5. Trigger an unhandled error path (temporary `throw new Error('boom')`) → response is generic 500; server log shows full stack with `requestId`
6. Tail the access log while making a register call → `password` shows as `[Redacted]`

## 8. Risks & Mitigations

| Risk                                           | Mitigation                                                  |
| ---------------------------------------------- | ----------------------------------------------------------- |
| Rate-limit tests flaky (real time)             | `vitest` fake timers (`vi.useFakeTimers()`)                 |
| In-memory SQLite drifts from file DB schema    | Same migration runner used in test setup                    |
| Coverage gate temptation → write thin tests    | Reviewer checks tests assert behavior, not just statements  |
| Logger redaction silently regresses            | Add a test: log `{ password: 'p' }`, assert `[Redacted]`    |
| CORS misconfig only caught when frontend joins | Add an integration test simulating a cross-origin preflight |

## 9. Daily Standup

**Day 5 — yyyy-mm-dd**

- Yesterday: Sprint 4 complete (T-036 → T-046)
- Today: T-047 → T-060 (start with M-7, then M-8)
- Blockers:

## 10. Review Checklist (end of Day 5)

- [ ] All 6 demo steps pass
- [ ] All 14 tasks marked done
- [ ] Sprint DoD ticked
- [ ] Coverage numbers recorded in `velocity_tracking.md`
- [ ] Carryover (if any) noted in `sprint_6_frontend.md`

## 11. Retrospective Prompts

- **Went well:**
- **Didn't go well:**
- **Try next sprint:**

## 12. Handoff to Next Sprint

After this sprint, **Sprint 6 (Frontend)** can rely on:

- A stable, tested API
- Consistent error envelope (`{ error: { code, message, fields? } }`) for the Axios interceptor
- A `/healthz` probe to confirm the backend is up before running e2e flows

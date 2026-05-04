# Sprint 7 — Hardening & Release

## 1. Sprint Info

| Field        | Value                                      |
| ------------ | ------------------------------------------ |
| Phase        | P7 (blueprint §18)                         |
| Theme        | Final security pass + audit + tag `v1.0.0` |
| Day          | 7                                          |
| Effort       | 3 h                                        |
| Story points | 3                                          |
| Tasks        | T-091 → T-098                              |
| Status       | Not started                                |

## 2. Sprint Goal

The full project (backend + frontend) passes a manual security pass and dependency audit, the daily blacklist sweep is in place, and `v1.0.0` is tagged with release notes referencing spec §1 goals.

## 3. Dependencies

- Sprint 6 done — full UI + backend running together.

## 4. Scope

| ID                    | Requirement                                              | Tasks |
| --------------------- | -------------------------------------------------------- | ----- |
| Spec §11 (edge cases) | Manual pass through cross-user/expired/revoked/oversized | T-091 |
| SEC-017               | Final logger redaction confirmation                      | T-092 |
| SEC-018               | `npm audit --production` clean                           | T-093 |
| Secret hygiene        | `.env` gitignored, `.env.example` placeholders only      | T-094 |
| Blueprint §20         | Acceptance checklist fully ticked                        | T-095 |
| Spec §15              | Traceability matrix fully covered                        | T-096 |
| SEC-020               | Daily blacklist sweep                                    | T-097 |
| Release               | Tag `v1.0.0` with notes                                  | T-098 |

## 5. Backlog

### M-13 · Hardening + release

- [ ] T-091 — Manual security pass: cross-user IDs, expired token, revoked token, oversized body
- [ ] T-092 — Confirm logger redaction on a fake login (final check)
- [ ] T-093 — `npm audit --production` in both apps; resolve high / critical
- [ ] T-094 — Confirm `.env` gitignored; `.env.example` has placeholders only
- [ ] T-095 — Walk through blueprint §20 acceptance checklist; tick every box
- [ ] T-096 — Walk through spec §15 traceability matrix; confirm each US has tests
- [ ] T-097 — `scripts/sweep-blacklist.ts` (delete expired rows) + cron note in README
- [ ] T-098 — Tag `v1.0.0` with release notes referencing spec §1 goals

## 6. Definition of Done

- [ ] Cross-user `GET /todos/:id` returns `404` (verified live)
- [ ] Expired JWT (set TTL to 5 s, wait, retry) returns `401`
- [ ] Revoked JWT (after logout) returns `401`
- [ ] 11 KB body returns `413`
- [ ] Access log shows `password: [Redacted]` on a register call
- [ ] `npm audit --production` reports 0 high / critical (both apps)
- [ ] `git ls-files | grep -E "(^|/)\.env$"` returns nothing
- [ ] Blueprint §20 — every checkbox ticked
- [ ] Spec §15 — every user story has at least one passing test
- [ ] `scripts/sweep-blacklist.ts` runs and removes expired rows
- [ ] `git tag --list` shows `v1.0.0`
- [ ] Release notes file (e.g., `RELEASE_NOTES_v1.0.0.md`) exists and references the spec

## 7. Demo Plan

1. Live: log in as User A, copy a todo `id`; log in as User B → `GET /api/todos/<A-id>` → `404`
2. Live: lower `JWT_ACCESS_TTL` to `5s`, log in, wait 6 s, call `me` → `401`
3. Live: log in, log out, replay the cookie → `401`
4. Live: `curl` an 11 KB body → `413`
5. Show `npm audit --production` output — clean
6. Show `.gitignore` and `git ls-files` — confirm `.env` not tracked
7. Run `scripts/sweep-blacklist.ts` — show row count before / after
8. `git tag v1.0.0 && git show v1.0.0` — display release notes
9. Walk through blueprint §20 with the team — tick every box live
10. Walk through spec §15 traceability — show passing test for each US

## 8. Risks & Mitigations

| Risk                                         | Mitigation                                                    |
| -------------------------------------------- | ------------------------------------------------------------- |
| `npm audit` finds high CVE late              | Run audit at start of sprint, not end                         |
| Manual security pass forgets a case          | Use spec §11 edge-case table as the live checklist            |
| Release notes drift from actual scope        | Generate from spec §1 goals + spec §15 traceability matrix    |
| Tagging from a dirty working tree            | `git status` clean before `git tag`                           |
| Sweep script accidentally deletes valid rows | `WHERE expires_at < CURRENT_TIMESTAMP` — test on a copy first |

## 9. Daily Standup

**Day 7 — yyyy-mm-dd**

- Yesterday: Sprint 6 complete (T-061 → T-090)
- Today: T-091 → T-098
- Blockers:

## 10. Review Checklist (end of Day 7 — Project review)

- [ ] All 10 demo steps pass
- [ ] All 8 tasks in this sprint marked done
- [ ] Blueprint §20 acceptance checklist fully ticked
- [ ] Spec §15 traceability matrix fully covered
- [ ] `v1.0.0` tag exists and is signed (if signing configured)
- [ ] Final velocity recorded in `velocity_tracking.md`

## 11. Retrospective Prompts (project-level retro)

- **Went well across the whole project:**
- **Didn't go well:**
- **Most surprising lesson:**
- **What I'd do differently next project:**

Log in `sprint_retrospective.md`.

## 12. Post-release follow-ups (out of scope for v1)

Captured here so they aren't lost — do **not** start without spec update + PO approval (see `todo_spec.md` §13):

- [ ] Email verification on register
- [ ] Password reset / forgot-password flow
- [ ] Multi-factor authentication
- [ ] OAuth / social login
- [ ] Sharing or assigning todos between users
- [ ] Push notifications / reminders / due dates
- [ ] File attachments
- [ ] Audit log
- [ ] Admin panel
- [ ] Internationalization
- [ ] Real-time updates (WebSockets / SSE)

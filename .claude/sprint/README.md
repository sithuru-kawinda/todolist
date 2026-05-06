# Sprint Plan — Index

Sprint plan for the TODO Web App. One sprint = one phase from `../todo_blueprint.md` §18. Tasks come from `../todo_plan.md` (T-001 … T-098). Requirements come from `../todo_spec.md`.

**Methodology:** Lightweight Scrum
**Team:** 1 intern · **Sprint length:** ~1 working day · **Total:** ~7 working days

---

## How to execute a sprint

See **[run_sprint.md](run_sprint.md)** — operational runbook for daily standup, per-task workflow, end-of-day shutdown, sprint review, and retrospective.

## All sprint files (read in order)

| # | File                                                                              | Phase | Theme                                | Tasks         | Effort |
|---|-----------------------------------------------------------------------------------|-------|--------------------------------------|---------------|--------|
| 1 | [sprint_1_backend_foundation.md](sprint_1_backend_foundation.md)                  | P1    | Scaffold + DB + env validation       | T-001 → T-014 | 5 h    |
| 2 | [sprint_2_domain_and_infrastructure.md](sprint_2_domain_and_infrastructure.md)    | P2    | Domain layer + repos + services      | T-015 → T-026 | 4.5 h  |
| 3 | [sprint_3_authentication.md](sprint_3_authentication.md)                          | P3    | Register / Login / Logout / Me       | T-027 → T-035 | 4 h    |
| 4 | [sprint_4_todos_crud.md](sprint_4_todos_crud.md)                                  | P4    | Todos full CRUD with ownership       | T-036 → T-046 | 4 h    |
| 5 | [sprint_5_middleware_and_tests.md](sprint_5_middleware_and_tests.md)              | P5    | Cross-cutting middleware + tests     | T-047 → T-060 | 6 h    |
| 6 | [sprint_6_frontend.md](sprint_6_frontend.md)                                      | P6    | React UI + auth + dashboard + polish | T-061 → T-090 | 11 h   |
| 7 | [sprint_7_hardening_and_release.md](sprint_7_hardening_and_release.md)            | P7    | Security pass + audit + v1.0.0 tag   | T-091 → T-098 | 3 h    |
| 8 | [sprint_8_mobilefrontend.md](sprint_8_mobilefrontend.md)                          | P8    | Expo mobile: auth + Kanban + perf    | T-099 → T-122 | 7.5 h  |

**Total:** 122 tasks · ~45 h · 8 sprints · ~1 working day each

---

## Common file structure (every sprint)

Every sprint file uses the same 11-section template — easy to scan and compare:

1. **Sprint Info** — dates, points, status
2. **Sprint Goal** — one-sentence outcome
3. **Dependencies** — prior sprints that must be done
4. **Scope** — stories / requirements covered (links to spec IDs)
5. **Backlog** — tasks as checkboxes, grouped by milestone
6. **Definition of Done** — sprint-level acceptance checks
7. **Demo Plan** — numbered demo steps
8. **Risks & Mitigations** — table
9. **Daily Standup** — template for the day(s) in the sprint
10. **Review Checklist** — end-of-sprint review
11. **Retrospective Prompts** — went well / didn't go well / try next
12. **Handoff** — what's now ready for the next sprint

---

## Living docs (create on demand)

| File                       | Purpose                                            |
|----------------------------|----------------------------------------------------|
| `daily_standup_log.md`     | Yesterday / today / blockers, one entry per day    |
| `sprint_retrospective.md`  | Retro notes per sprint                             |
| `velocity_tracking.md`     | Planned vs. completed story points per sprint      |

---

## Working agreements (apply to every sprint)

1. One task in progress at a time. Finish before starting the next.
2. Commit after every task: `feat(area): T-### short description`.
3. Stop and ask if a task seems to require deviating from blueprint or spec.
4. Run `npm run typecheck && npm test` before pushing.
5. No merging on red.
6. Time-box debugging: blocked > 30 min → log impediment, ask.
7. Keep files under 150 lines, one responsibility per file (NFR-005).

## Definition of Ready (per task)

- Referenced in `todo_plan.md` with a `T-###` ID.
- Has a clear deliverable and a done-when check.
- All dependencies (earlier tasks) merged.

## Definition of Done (per task)

- `npm run typecheck` clean.
- `npm run lint` clean.
- New code covered by a test (where the spec calls for one — see `todo_spec.md` §12).
- Committed with a task-ID prefix.
- Self-checked against the related FR / SEC / UI / EC ID.

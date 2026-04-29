# Sprint 1 — Backend Foundation

## 1. Sprint Info

| Field          | Value                                            |
|----------------|--------------------------------------------------|
| Phase          | P1 (blueprint §18)                               |
| Theme          | Project scaffold + SQLite + env validation       |
| Day            | 1                                                |
| Effort         | 5 h                                              |
| Story points   | 5                                                |
| Tasks          | T-001 → T-014                                    |
| Status         | Not started                                      |

## 2. Sprint Goal

The backend project boots cleanly: TypeScript strict mode is configured, dependencies are installed, the SQLite database is created from migrations on boot, and environment variables are Zod-validated.

## 3. Dependencies

None — this is the first sprint.

## 4. Scope

| ID            | Requirement                                              | Tasks            |
|---------------|----------------------------------------------------------|------------------|
| Blueprint §3  | Layered architecture skeleton in place                   | T-001..T-008     |
| Blueprint §5  | DB schema applied via migration                          | T-013, T-014     |
| Blueprint §16 | Env vars validated at boot                               | T-009, T-010     |
| SEC-016       | Process exits non-zero if env invalid                    | T-011            |
| NFR-009       | `tsc --noEmit` and ESLint pass with zero warnings        | T-003, T-004     |

## 5. Backlog

### M-1 · Project scaffold & tooling
- [ ] T-001 — Create `backend/`, `frontend/` folders
- [ ] T-002 — `npm init` in `backend/`; install runtime + dev deps (blueprint §17)
- [ ] T-003 — `backend/tsconfig.json`: `strict`, `noUncheckedIndexedAccess`, path aliases
- [ ] T-004 — ESLint + Prettier + `.gitignore` (`data/*.db`, `.env`)
- [ ] T-005 — npm scripts: `dev`, `build`, `start`, `lint`, `typecheck`, `test`
- [ ] T-006 — Vite React-TS template in `frontend/`
- [ ] T-007 — Tailwind in frontend, dark-mode `class` strategy
- [ ] T-008 — Root `README.md` quickstart from blueprint appendix

### M-2 · DB + config foundation
- [ ] T-009 — `backend/.env.example` per blueprint §16; copy to `.env`
- [ ] T-010 — `infrastructure/config/env.ts` (Zod-validated)
- [ ] T-011 — Unit test: `env.ts` throws when `JWT_SECRET` < 32 chars
- [ ] T-012 — `infrastructure/db/sqlite.ts` (`journal_mode=WAL`, `foreign_keys=ON`)
- [ ] T-013 — `migrations/001_init.sql` (DDL + indexes + trigger from blueprint §5)
- [ ] T-014 — Migration runner; called on boot

## 6. Definition of Done

- [ ] `npm run dev` boots without errors
- [ ] `data/todo.db` is created on first run with `users`, `todos`, `token_blacklist` tables
- [ ] `db.pragma('foreign_keys')` returns `1`
- [ ] `npm run typecheck` and `npm run lint` clean
- [ ] Unit test for `env.ts` failure case passes
- [ ] No file > 150 lines

## 7. Demo Plan

1. `cd backend && npm run dev` — server boots; logs show `migrations applied`
2. Open `data/todo.db` in a SQLite viewer — confirm 3 tables + indexes
3. Set `JWT_SECRET=short` in `.env`, restart — process exits with non-zero code
4. Restore valid `JWT_SECRET`, `npm run typecheck` shows zero errors
5. `cd frontend && npm run dev` — Vite serves on `http://localhost:5173`

## 8. Risks & Mitigations

| Risk                                              | Mitigation                                                       |
|---------------------------------------------------|------------------------------------------------------------------|
| `better-sqlite3` native build fails on Windows    | Install Visual Studio Build Tools + Python 3.x first             |
| Forgetting `journal_mode=WAL` / `foreign_keys=ON` | T-012 adds them at module load; verify in demo                   |
| Path aliases break on different platforms         | Use forward slashes in `tsconfig.json` paths                     |

## 9. Daily Standup

Log entry in `daily_standup_log.md`:

**Day 1 — yyyy-mm-dd**
- Yesterday: —
- Today: T-001 → T-014
- Blockers:

## 10. Review Checklist (end of Day 1)

- [ ] Demo run live; all 5 demo steps pass
- [ ] All 14 tasks in this sprint marked done
- [ ] Sprint DoD checkboxes all ticked
- [ ] Carryover (if any) noted in `sprint_2_domain_and_infrastructure.md`

## 11. Retrospective Prompts

- **Went well:**
- **Didn't go well:**
- **Try next sprint:**

Log in `sprint_retrospective.md`.

## 12. Handoff to Next Sprint

After this sprint, **Sprint 2** can start:
- DB connection is available via `import { db } from 'infrastructure/db/sqlite'`
- Validated env via `import { env } from 'infrastructure/config/env'`
- Project compiles cleanly — domain layer can be added without tooling distractions

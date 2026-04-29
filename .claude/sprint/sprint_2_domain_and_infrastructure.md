# Sprint 2 — Domain & Infrastructure Layers

## 1. Sprint Info

| Field          | Value                                                       |
|----------------|-------------------------------------------------------------|
| Phase          | P2 (blueprint §18)                                          |
| Theme          | Build the inner layers of Clean Architecture                |
| Day            | 2                                                           |
| Effort         | 4.5 h                                                       |
| Story points   | 5                                                           |
| Tasks          | T-015 → T-026                                               |
| Status         | Not started                                                 |

## 2. Sprint Goal

The domain layer (entities, errors, repo & service interfaces) is in place with **zero framework imports**, and the infrastructure layer (SQLite repos, bcrypt, JWT, logger) implements those interfaces. A `composition.ts` file wires concrete implementations once for the whole app.

## 3. Dependencies

- Sprint 1 done — DB connection, env, and TypeScript scaffolding available.

## 4. Scope

| ID                                  | Requirement                                                | Tasks                |
|-------------------------------------|------------------------------------------------------------|----------------------|
| Blueprint §3 (layer rules)          | Domain has no framework imports                            | T-015 → T-019        |
| Blueprint §10 (entities & repos)    | `User`, `Todo`, `IUserRepo`, `ITodoRepo`                   | T-015, T-016         |
| SEC-001 (bcrypt cost 12)            | `BcryptHasher` with cost factor 12                         | T-020                |
| SEC-003 (JWT HS256, 15 min)         | `JwtTokenService` HS256, 15-min TTL                        | T-021                |
| SEC-005 (blacklist persistence)     | `SqliteTokenBlacklist`                                     | T-022                |
| SEC-007 (prepared statements)       | All repo queries via `db.prepare()`                        | T-023, T-024         |
| SEC-017 (log redaction)             | `pino` configured with redact paths                        | T-025                |

## 5. Backlog

### M-3 · Domain layer (zero framework imports)
- [ ] T-015 — `domain/entities/User.ts`, `Todo.ts`
- [ ] T-016 — `domain/repositories/IUserRepo.ts`, `ITodoRepo.ts`
- [ ] T-017 — `domain/services/IPasswordHasher.ts`, `ITokenService.ts`, `ITokenBlacklist.ts`
- [ ] T-018 — `domain/errors/`: `DomainError`, `NotFoundError`, `ConflictError`, `ForbiddenError`, `UnauthorizedError`
- [ ] T-019 — Reminder/lint rule: domain may not import express/sqlite/jwt/zod

### M-4 · Infrastructure layer
- [ ] T-020 — `BcryptHasher` (cost 12)
- [ ] T-021 — `JwtTokenService` (HS256, 15 min, returns `{ token, jti }`)
- [ ] T-022 — `SqliteTokenBlacklist` (`add(jti, expiresAt)`, `has(jti)`)
- [ ] T-023 — `SqliteUserRepo` with prepared statements + UUID IDs
- [ ] T-024 — `SqliteTodoRepo` with prepared statements + cursor pagination + `0|1` ↔ boolean mapping
- [ ] T-025 — `infrastructure/logging/logger.ts` — `pino` with redaction paths
- [ ] T-026 — `composition.ts` — single `container` export wiring everything

## 6. Definition of Done

- [ ] `grep -r "express\|better-sqlite3\|jsonwebtoken\|zod" src/domain/` returns nothing
- [ ] All repos use `db.prepare()` — no template-literal SQL anywhere
- [ ] `BcryptHasher.hash` produces `$2b$12$...` strings
- [ ] `JwtTokenService.sign(userId)` returns a verifiable token + a UUID `jti`
- [ ] `composition.ts` exports a `container` with `users`, `todos`, `hasher`, `tokens`, `blacklist`, `logger`
- [ ] `npm run typecheck` clean

## 7. Demo Plan

1. Show `domain/` folder — `grep` proves no framework imports
2. In a temporary script: `await container.users.create({...})` then `findByEmail` — confirm round-trip works and password is stored hashed
3. `container.tokens.sign('user-id')` → token; `verify(token)` → payload
4. `container.blacklist.add(jti, futureDate)` then `has(jti)` → `true`
5. Delete the temporary script before committing

## 8. Risks & Mitigations

| Risk                                                  | Mitigation                                                  |
|-------------------------------------------------------|-------------------------------------------------------------|
| Accidental framework import in domain layer           | T-019 lint/grep guard; reviewer checks before merge         |
| `0|1` ↔ boolean leak past repo boundary               | Map at every repo method; never expose `INTEGER` to use cases |
| `better-sqlite3` prepared statements cached too late  | Build `db.prepare(...)` once at module load, not per call   |
| Forgetting to add new dep to `composition.ts`         | Per-task commit checklist                                   |

## 9. Daily Standup

**Day 2 — yyyy-mm-dd**
- Yesterday: T-001 → T-014 (Sprint 1 complete)
- Today: T-015 → T-026
- Blockers:

## 10. Review Checklist (end of Day 2)

- [ ] Demo steps 1–5 pass
- [ ] All 12 tasks in this sprint marked done
- [ ] Sprint DoD checkboxes all ticked
- [ ] Carryover (if any) noted in `sprint_3_authentication.md`

## 11. Retrospective Prompts

- **Went well:**
- **Didn't go well:**
- **Try next sprint:**

## 12. Handoff to Next Sprint

After this sprint, **Sprint 3 (Authentication)** can use:
- `container.users` — create, findByEmail, findById
- `container.hasher` — hash, compare
- `container.tokens` — sign, verify
- `container.blacklist` — add, has
- `container.logger` — info, warn, error (with redaction)

---
description: Execute the next unfinished sprint from sprint/ following the runbook workflow
argument-hint: "[sprint-number]"
---

# /run_sprint — Execute a sprint

You are running a sprint of the TODO Web App project. Follow this runbook **exactly** — the user invoked `/run_sprint` to delegate sprint execution to you.

## 0. Decide which sprint to run

If the user passed an argument (`$ARGUMENTS`), that is the sprint number — run that one.

Otherwise, find the next unfinished sprint:
1. List `sprint/sprint_*.md` in numeric order.
2. For each, count `[ ]` (open) vs `[x]` (done) in the **§5 Backlog** section.
3. The first sprint with any `[ ]` is your target sprint. If none, all sprints are complete — tell the user and stop.

Announce your target in one sentence: *"Running Sprint 3 (`sprint_3_authentication.md`) — N tasks remaining."*

## 1. Pre-flight checks

Before any task work, verify:
- Working tree is clean (`git status` — no unstaged changes).
- Previous sprint's review checklist is fully ticked (read the prior `sprint_*.md` §10).
- Backend boots (`npm --prefix backend run typecheck` clean, if `backend/` exists).

If any check fails, stop and report — do not proceed.

## 2. Read the sprint file

Read the target `sprint/sprint_<n>_*.md` end-to-end. Internalize:
- **§2 Goal** — what success looks like.
- **§3 Dependencies** — confirm met.
- **§4 Scope** — spec IDs (FR/SEC/UI/EC) each task ties to.
- **§5 Backlog** — your work queue, top to bottom.
- **§6 DoD** — your end-of-sprint check.
- **§8 Risks** — pitfalls to avoid.

## 3. Per-task inner loop (repeat for each open `[ ] T-###`)

For every unchecked task in **§5 Backlog**, in order:

1. **State** the task ID and its goal in one sentence.
2. **Re-read** the related spec section (FR/SEC/UI/EC) — the spec is the contract.
3. **Check architecture rules** (`todo_blueprint.md` §3) before writing code. Domain layer must not import `express`/`better-sqlite3`/`jsonwebtoken`/`zod`.
4. **Implement** the task — use Edit/Write tools. Keep files under 150 lines (NFR-005). No `any`. No template-literal SQL. No tokens in `localStorage`.
5. **Verify locally** (run all three; all must be clean):
   ```
   npm --prefix backend run typecheck
   npm --prefix backend run lint
   npm --prefix backend test
   ```
   For frontend tasks substitute `--prefix frontend`.
6. **Commit** — one task per commit:
   ```
   git add <files>
   git commit -m "feat(<area>): T-### <short description>"
   ```
   Examples: `feat(auth): T-028 LoginUser bcrypt on missing user`, `test(todos): T-058 cross-user 404`.
7. **Tick the box** in the sprint file: change `[ ] T-###` to `[x] T-###` via Edit.
8. **Brief progress update** to the user (one sentence). Continue to the next task.

## 4. Stop conditions — pause and ask the user

Pause and ask before continuing if **any** of these:

- A task requires deviating from blueprint or spec.
- A test fails and the cause isn't obvious within 15 min.
- The acceptance criterion in the task line is ambiguous.
- You'd need to install a dependency not listed in blueprint §17.
- A security non-negotiable from blueprint §8 is in tension with the task.
- You're tempted to disable a test, silence a type error, or use `--no-verify`.

**Hard rules — never do these without explicit user approval:**
- Force-push to `main`.
- Commit secrets (even temporarily).
- Skip hooks (`--no-verify`).
- `git reset --hard` over uncommitted work.
- Add a feature listed in spec §13 (Out of Scope).

## 5. End-of-sprint workflow (after the last `[ ]` becomes `[x]`)

1. **Final verification:**
   ```
   npm --prefix backend run typecheck && npm --prefix backend run lint && npm --prefix backend test
   ```
   Plus `npm --prefix frontend run build` if the sprint touched frontend.

2. **Walk through §7 Demo Plan** in the sprint file. For each step, run it and report PASS/FAIL.

3. **Tick §6 DoD** checkboxes — only ones you actually verified. Don't tick optimistically.

4. **Tick §10 Review Checklist** — same rule.

5. **Append a retro entry** to `sprint/sprint_retrospective.md` (create if missing):
   ```
   ### Sprint <n> retro — yyyy-mm-dd
   - Went well: ...
   - Didn't go well: ...
   - Try next sprint: ...
   ```

6. **Update `sprint/velocity_tracking.md`** (create if missing) with planned vs. completed SP.

7. **Read §12 Handoff** — confirm what's ready for the next sprint.

8. **Report to user** — one paragraph summary: tasks completed, demo result, any carryover, and what the next sprint can now use.

## 6. If you can't finish in one session

If user runs out of context, time, or hits a blocker:
- Push the branch (`git push -u origin sprint/<n>-<theme>`).
- Add an end-of-day note to `sprint/daily_standup_log.md`.
- Tell the user exactly which task is next (`T-XYZ`) and what blocked you.
- Do **not** mark partially-done tasks as `[x]`.

## 7. Where to find context

| You need…                        | Look in                            |
|----------------------------------|------------------------------------|
| Architecture rules               | `todo_blueprint.md` §3, §4         |
| API contract                     | `todo_blueprint.md` §6 / `todo_spec.md` §4 |
| Validation rules                 | `todo_spec.md` §5                  |
| Security non-negotiables         | `todo_blueprint.md` §8 / `todo_spec.md` §6 |
| Edge cases & expected codes      | `todo_spec.md` §11                 |
| Master task list                 | `todo_plan.md`                     |
| This sprint's backlog            | `sprint/sprint_<n>_*.md` §5        |

---

Begin now: announce your target sprint, run pre-flight, then start the inner loop on the first `[ ]` task. Keep updates brief — one sentence per task, full report at end of sprint.

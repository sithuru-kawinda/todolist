---
name: feature-spec-creator
description: Create a feature spec file and branch from a short idea
argument-hint: Short feature description (e.g. "todo priority levels")
allowed-tools: Read, Write, Glob, Bash
---

# Feature Spec Creator

You are creating a feature spec for the TODO Web App. Follow every step in order.

## 1. Git Check

```bash
git status
```

If the working tree is dirty (any `M` or `??` lines that aren't `.claude/`), stop immediately:

> ❌ Uncommitted changes detected. Commit or stash your work first, then re-run.

## 2. Parse `$ARGUMENTS`

Derive three values from the user's input:

| Value      | Rule                                         | Example                        |
| ---------- | -------------------------------------------- | ------------------------------ |
| **Title**  | Title Case, keep meaningful words            | "Todo Priority Levels"         |
| **Slug**   | kebab-case, a–z 0–9 hyphens only, ≤ 40 chars | `todo-priority-levels`         |
| **Branch** | `feature/<slug>`                             | `feature/todo-priority-levels` |

If the description is too vague to spec (< 3 words, or no clear user-facing goal), ask before continuing:

> ❓ Can you clarify: who uses this feature, what they can do, and what problem it solves?

## 3. Create Branch

```bash
git switch -c feature/<slug>
```

If the branch already exists, append `-01`, `-02`, … until the name is free.

## 4. Load Context

**Core — always read these three:**

|------|---------|
| File | Purpose |
| `.claude/todo_blueprint.md` | Binding spec — re-read §3 (layers), §6 (API contract), §8 (security), §18 (phases) |
| `.claude/todo_spec.md` | Validation rules (§5), security requirements (§6), edge cases (§11) |
| `.claude/specs/template.md` | Template to follow exactly |

**Skill references — read by feature type:**

| Feature touches…                          | Also read                                                      |
| ----------------------------------------- | -------------------------------------------------------------- |
| Backend (use cases, repos, API endpoints) | `SKILL.md` (root) sections 1–2 (security rules + code quality) |
| TypeScript types / strict mode            | `.claude/skills/typescript/SKILL.md`                           |
| Frontend (pages, components, Tailwind)    | `.claude/skills/tailwind/SKILL.md` (if it exists)              |
| Auth / JWT / blacklist                    | Blueprint §8–§9, `todo_spec.md` §6                             |
| DB schema / migrations                    | Blueprint §4 file tree, `todo_spec.md` §5                      |

Only read the files relevant to the feature — don't load everything.

## 5. Determine Scope

Before writing the spec, state in 2–3 sentences:

- Which Clean Architecture layers this feature touches (Domain / Application / Infrastructure / Presentation / Frontend)
- What new endpoints, use cases, or repo methods are needed
- Whether a DB migration is required

If any layer would need to import across the forbidden boundary (see blueprint §3 table), flag it now.

## 6. Write `.claude/specs/<slug>.md`

Use `_specs/template.md` as the exact structure. Rules:

- **WHAT, not HOW** — describe behaviour and acceptance criteria, not implementation
- **Non-technical language** where possible — a PM should be able to read it
- **No code snippets** — reference blueprint §6 for endpoint shapes, §8 for security constraints
- Fill every section; use "N/A" only if a section genuinely doesn't apply
- Non-functional requirements must reference the blueprint §8 checklist, not invent new ones
- If a new endpoint is listed, it must conform to the API contract table in blueprint §6

## 7. Report

```
✅ Feature spec created!

Branch:    feature/<slug>
Spec:      .claude/specs/<slug>.md
Title:     <Title>

📚 References read: <list the files you actually opened>

Layers affected: <Domain / Application / Infrastructure / Presentation / Frontend>
New endpoint(s): <or "none">
Migration needed: <yes / no>

Next steps:
  1. Review .claude/specs/<slug>.md and edit as needed
  2. git add .claude/specs/<slug>.md
  3. git commit -m "spec: <Title>"
  4. Run /run_sprint (or implement manually following blueprint §18 phase order)
```

## Errors

| Issue                                               | Action                                                   |
| --------------------------------------------------- | -------------------------------------------------------- |
| Dirty working tree                                  | Abort — tell user to commit/stash first                  |
| Vague description (< 3 words, no clear goal)        | Ask for goal, users, and functionality before continuing |
| Branch name collision                               | Append `-01`, `-02`, …                                   |
| `_specs/template.md` missing                        | Warn user, continue with built-in template structure     |
| Missing skill reference file                        | Warn and continue — don't block on missing optional refs |
| Feature conflicts with blueprint §13 (Out of Scope) | Surface the conflict, ask user before proceeding         |

## Example

Input: `"add due dates to todos"`

```
✅ Feature spec created!

Branch:    feature/todo-due-dates
Spec:      _specs/todo-due-dates.md
Title:     Todo Due Dates

📚 References read: todo_blueprint.md, todo_spec.md, _specs/template.md, SKILL.md (§1–2)

Layers affected: Domain, Application, Infrastructure (migration), Presentation, Frontend
New endpoint(s): PATCH /api/todos/:id (extend existing — add dueDate field)
Migration needed: yes — add due_date TEXT column to todos table

Next steps:
  1. Review _specs/todo-due-dates.md and edit as needed
  2. git add _specs/todo-due-dates.md
  3. git commit -m "spec: Todo Due Dates"
  4. Run /run_sprint (or implement manually following blueprint §18 phase order)
```

---

v1.0.0

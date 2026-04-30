---
name: typescript-todo
description: Add TypeScript to React todo applications, or build new todo apps in TypeScript from the start. Use this skill whenever the user wants to convert an existing todo/task app from JavaScript to TypeScript, add type safety to a task list, generate `.tsx` versions of todo components, or asks for "types for my todo app," "TypeScript todo," "typed task list," or similar. Also trigger when the user is extending a typed todo app with new features (filters, priorities, due dates, categories) and needs the corresponding type definitions. Do not use this skill for non-todo TypeScript work — route those to a general TypeScript skill if one exists.
---

# TypeScript Todo Skill 

Convert React todo applications to TypeScript, or scaffold new ones with proper types from day one. Output should be strictly typed, idiomatic TypeScript — not JavaScript with `any` sprinkled in.

## When to Use

Trigger this skill for any of:
- "Add TypeScript to my todo app"
- "Convert this todo to .tsx"
- "Give me types for my task list"
- "Build me a TypeScript todo app"
- Adding new typed features (priority, due dates, tags) to an existing typed todo
- Refactoring a `.jsx` todo into `.tsx` while preserving behavior and styling

If the user has an existing `.jsx` todo file, preserve all behavior, styling, and seed data exactly. Only the types and file extension should change unless they ask for more.

## Core Type Definitions

Every typed todo app should start from these primitives. Adapt names and fields to match the existing app, but keep the shape strict.

```typescript
type TodoId = number;

type Priority = "ordinary" | "urgent";

type Filter = "all" | "active" | "done";

interface Todo {
  id: TodoId;
  text: string;
  done: boolean;
  priority: Priority;
  // optional extensions — include only if the app uses them
  createdAt?: number;
  dueDate?: string;
  tags?: string[];
}
```

Extend the `Todo` interface only with fields the app actually uses. Do not add speculative fields.

## Required Typing Patterns

1. **Component signature** — `export default function TodoApp(): JSX.Element` (or `React.FC` only if the user prefers it; default to the explicit return type)
2. **`useState` generics** — always parameterize: `useState<Todo[]>([])`, `useState<Filter>("all")`, `useState<string>("")`
3. **Event handlers** — type the event:
   - `onChange={(e: React.ChangeEvent<HTMLInputElement>) => …}`
   - `onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => …}`
   - `onClick={(e: React.MouseEvent<HTMLButtonElement>) => …}`
4. **Refs** — `useRef<HTMLInputElement>(null)`, then guard with `?.` or null check before use
5. **Helper functions** — explicit parameter and return types. No inferred `any`
6. **Discriminated unions** for filters and priorities — never use raw strings in conditionals; rely on the literal union types above
7. **No `any`** — if a third-party library is missing types, use `unknown` and narrow, or import its `@types/*` package

## File Conventions

- Extension: `.tsx` for components with JSX, `.ts` for pure logic/utilities
- Default-exported component, no required props (or all props optional with defaults)
- If splitting types into a separate file, use `types.ts` and import with `import type { Todo, Filter } from "./types"` to keep imports type-only
- Strict mode assumed (`"strict": true` in `tsconfig.json`) — write code that survives `noImplicitAny`, `strictNullChecks`, and `noUncheckedIndexedAccess`

## Conversion Workflow (JS → TS)

When converting an existing `.jsx` todo app:

1. **Read the original file in full** before touching anything
2. **Identify the data shape** from seed data and state usage
3. **Write the type definitions** at the top of the file (or in a sibling `types.ts` if the user prefers separation)
4. **Annotate state hooks** with generics
5. **Annotate every handler and helper** — parameters and return types
6. **Annotate refs** with the correct DOM element type
7. **Resolve any implicit `any`** — search for parameters without types; either annotate or restructure
8. **Preserve everything else exactly** — same JSX, same Tailwind classes, same animations, same seed data, same copy. Visual output should be byte-identical
9. **Save as `.tsx`** in `/mnt/user-data/outputs/`
10. **Use `present_files`** to share the result

## New-Build Workflow (TS from scratch)

If the user wants a new TypeScript todo app (not a conversion):

1. Apply the same scope and design rules as the `todo-app` skill (add/toggle/delete/filter/counter/empty state, commit to a distinctive aesthetic)
2. Layer the type definitions on top from the start — don't write JS-style code and retrofit types
3. Output a single `.tsx` file unless the user requests multi-file structure

## Common Pitfalls to Avoid

- **`any` as escape hatch** — if you reach for `any`, the type is wrong; redesign it
- **Untyped event handlers** — `(e) => …` is implicit `any` under strict mode and will fail to compile
- **`as` casts to silence errors** — use only as a last resort with a comment explaining why
- **Forgetting null checks on refs** — `inputRef.current` is `HTMLInputElement | null`; always guard
- **Re-declaring types inline** — if `Todo` is used in three places, define it once and reuse
- **Changing behavior during conversion** — conversion preserves runtime behavior exactly; new features go in a separate pass
- **Skipping return types on exported functions** — explicit return types are documentation and catch regressions

## Output Format

End every response with a short summary covering:
- Which file was written (and that it's `.tsx`)
- The key types introduced (`Todo`, `Priority`, `Filter`)
- Any `any` or `unknown` that remained, with a one-line reason
- An offer to extend with new typed features (due dates, tags, persistence layer types, etc.)

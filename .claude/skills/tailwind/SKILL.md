---
name: tailwind-css
description: Use this skill whenever the user is building, styling, or refactoring React components with Tailwind CSS. Triggers include any mention of Tailwind, utility classes, tailwind.config.js, @apply, dark mode, responsive design, or requests to style/beautify a React component, page, or UI element. Also use when fixing broken Tailwind setups, converting plain CSS or styled-components to Tailwind, organizing long className strings, designing todo list items / forms / buttons / cards / modals, implementing themes, or composing variants with libraries like clsx, cva, or tailwind-merge. If the user is working on a React (or Next.js / Vite) project and asks anything about styling, default to using this skill.
---

# Tailwind CSS for React

A skill for writing clean, maintainable, production-quality Tailwind CSS in React applications. Optimized for the kinds of UIs typical in todo apps, dashboards, and CRUD interfaces.

## Core principles

1. **Utility-first, not utility-only.** Compose utilities directly in JSX for most styling. Extract a component (not a CSS class) when the same markup repeats. Reach for `@apply` only for genuinely global primitives like `.btn-primary` in a design system, not as a way to hide long class lists.
2. **Mobile-first.** Write base styles for mobile, then layer on `sm:`, `md:`, `lg:` for larger screens. Never write `max-sm:` style overrides as a default — they're an escape hatch.
3. **Design tokens over magic numbers.** Use spacing, color, and font scales from the theme. Avoid arbitrary values like `w-[437px]` unless there's no scale value that fits.
4. **Readable className strings.** Long classNames are fine, but they should be ordered predictably and split onto multiple lines when they get unwieldy.

## Setup

### Detect which version is in use

Before writing config or imports, check `package.json` for `tailwindcss`:
- **v4.x** → CSS-first config. The user imports Tailwind via `@import "tailwindcss";` in their main CSS file. Theme customization happens in `@theme { ... }` blocks. There is usually no `tailwind.config.js`.
- **v3.x** → JS config. The user has a `tailwind.config.js` with a `content` array and a `theme.extend` object. CSS file uses `@tailwind base; @tailwind components; @tailwind utilities;`.

If you can't tell, ask once. Don't assume.

### Vite + React (v4 example)

```css
/* src/index.css */
@import "tailwindcss";

@theme {
  --color-brand-500: #6366f1;
  --font-display: "Inter", sans-serif;
}
```

```js
// vite.config.js
import tailwindcss from "@tailwindcss/vite";
export default { plugins: [tailwindcss()] };
```

### Vite + React (v3 example)

```js
// tailwind.config.js
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: { brand: { 500: "#6366f1" } },
    },
  },
};
```

```css
/* src/index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**Common setup mistakes to watch for:**
- `content` array missing `.jsx` / `.tsx` → classes appear in source but don't render.
- Forgetting to import the CSS file in `main.jsx` / `index.tsx`.
- Using v3 `@tailwind` directives in a v4 project (or vice versa).

## Class ordering convention

Order utilities consistently so diffs and reviews are easier:

1. Layout (`flex`, `grid`, `block`, `hidden`)
2. Positioning (`absolute`, `relative`, `top-0`)
3. Box model — sizing (`w-`, `h-`, `min-`, `max-`)
4. Box model — spacing (`p-`, `m-`, `gap-`)
5. Typography (`text-`, `font-`, `leading-`, `tracking-`)
6. Visual (`bg-`, `border`, `rounded-`, `shadow-`)
7. Interactive (`hover:`, `focus:`, `active:`, `disabled:`)
8. Responsive prefixes appear with the property they modify

The Prettier plugin `prettier-plugin-tailwindcss` automates this — recommend installing it for any non-trivial project.

## Composition patterns

### Splitting long classNames

When a className gets longer than ~80 characters, break it up using `clsx` (or template strings) for readability:

```jsx
import clsx from "clsx";

<button
  className={clsx(
    "inline-flex items-center justify-center gap-2",
    "rounded-md px-4 py-2",
    "text-sm font-medium text-white",
    "bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800",
    "disabled:bg-gray-300 disabled:cursor-not-allowed",
    "transition-colors"
  )}
>
  Add task
</button>
```

### Conditional classes

Use `clsx` for boolean toggles. For variant systems with many combinations, use `class-variance-authority` (cva).

```jsx
<li
  className={clsx(
    "flex items-center gap-3 rounded-lg border p-3",
    completed && "bg-gray-50 text-gray-400 line-through",
    !completed && "bg-white text-gray-900"
  )}
/>
```

### Avoiding className conflicts

When merging classes from props with defaults, use `tailwind-merge` so `p-2` from props overrides `p-4` from defaults instead of both being applied:

```jsx
import { twMerge } from "tailwind-merge";
<div className={twMerge("rounded-md p-4 bg-white", className)} />
```

## Patterns for todo-app UIs

These are the components you'll write most often. Use them as starting points.

### Todo list item

```jsx
<li className="group flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 hover:border-gray-300">
  <input
    type="checkbox"
    checked={todo.completed}
    onChange={onToggle}
    className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
  />
  <span className={clsx(
    "flex-1 text-sm",
    todo.completed ? "text-gray-400 line-through" : "text-gray-900"
  )}>
    {todo.text}
  </span>
  <button
    onClick={onDelete}
    className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 transition-opacity"
    aria-label="Delete todo"
  >
    ✕
  </button>
</li>
```

Note the `group` / `group-hover:` pattern for revealing the delete button on row hover. This is one of Tailwind's most useful idioms.

### Input with submit button

```jsx
<form className="flex gap-2" onSubmit={onSubmit}>
  <input
    type="text"
    placeholder="What needs to be done?"
    className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
  />
  <button
    type="submit"
    className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
  >
    Add
  </button>
</form>
```

### Filter tabs

```jsx
{["all", "active", "completed"].map(f => (
  <button
    key={f}
    onClick={() => setFilter(f)}
    className={clsx(
      "rounded-md px-3 py-1 text-sm capitalize",
      filter === f
        ? "bg-indigo-100 text-indigo-700"
        : "text-gray-600 hover:bg-gray-100"
    )}
  >
    {f}
  </button>
))}
```

### Empty state

```jsx
<div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 p-8 text-center">
  <p className="text-sm text-gray-500">No tasks yet. Add one above.</p>
</div>
```

## Dark mode

Configure once, then use `dark:` prefixes on any utility.

**v4:** dark mode is enabled by default via `prefers-color-scheme`. To use a class-based toggle:

```css
@import "tailwindcss";
@custom-variant dark (&:where(.dark, .dark *));
```

**v3:** in `tailwind.config.js`:
```js
export default { darkMode: "class", /* ... */ };
```

Then write paired light/dark utilities:
```jsx
<div className="bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100" />
```

Toggle with `document.documentElement.classList.toggle("dark")`.

## Responsive design

Default styles are mobile (no prefix). Add breakpoints upward:

```jsx
<div className="flex flex-col gap-2 sm:flex-row sm:gap-4 lg:gap-6" />
```

Breakpoints (default):
- `sm:` 640px
- `md:` 768px
- `lg:` 1024px
- `xl:` 1280px
- `2xl:` 1536px

For a todo app, focus on `sm:` (phones → small tablets) and `md:` (tablets → desktop). You rarely need `xl:` or above.

## Accessibility essentials

Tailwind makes it easy to forget accessibility because it doesn't include defaults. Always:

- Add visible focus states: `focus:ring-2 focus:ring-indigo-500 focus:outline-none`
- Use `sr-only` for screen-reader-only labels (e.g., on icon buttons)
- Pair color with shape/text — don't communicate state with color alone (`line-through` plus gray text, not just gray text)
- Maintain contrast ratios — avoid `text-gray-400` on `bg-white` for body copy

## When to extract a component

Extract a React component (not a CSS class) when:
- The same markup + classNames repeat 3+ times
- The combination represents a meaningful UI concept (`<TodoItem />`, `<Button variant="primary" />`)

Extract `@apply` styles into a CSS class only when:
- Targeting elements you don't render yourself (e.g., styling `prose` markdown output)
- Building a shared design system across multiple apps

For most React app code, prefer component extraction. `@apply` is a tool of last resort.

## Common pitfalls

- **Dynamic class names that get purged.** `bg-${color}-500` won't work because Tailwind's compiler can't see the full class name. Use a lookup map: `const colors = { red: "bg-red-500", blue: "bg-blue-500" }` and reference `colors[color]`.
- **Mixing inline styles and utilities for the same property.** Pick one. If you need a truly dynamic value (a progress bar width), use `style={{ width: \`${pct}%\` }}` — that's the right tool.
- **Over-using arbitrary values.** `w-[427px]` is a sign the design isn't using a scale. Push back or extend the theme.
- **Forgetting hover/focus on interactive elements.** Every button, link, and input should have a visible state for hover, focus, and (where relevant) disabled.
- **Stacking too many transition utilities.** `transition-colors` is usually enough — `transition-all` is expensive and animates things you didn't intend.

## Quick reference: useful utilities people forget

- `space-y-2` / `space-x-2` — gap between siblings (alternative to `gap-` on flex/grid parent)
- `divide-y divide-gray-200` — borders between flex/block siblings without manual borders
- `truncate` — single-line ellipsis (combines `overflow-hidden`, `text-ellipsis`, `whitespace-nowrap`)
- `line-clamp-2` — multi-line ellipsis
- `aspect-video` / `aspect-square` — maintain ratio without padding hacks
- `peer` / `peer-checked:` — style siblings based on input state, no JS needed
- `group` / `group-hover:` — style children based on parent hover
- `pointer-events-none` / `select-none` — disable interaction or selection on a region

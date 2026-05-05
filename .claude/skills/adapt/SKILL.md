---
name: adapt
description: "Responsive, cross-platform design for this React + Tailwind todo app. Use when adding or styling any UI component to ensure it works on mobile (360px), tablet (768px), and desktop (1280px+)."
risk: low
source: local
date_added: "2026-04-30"
---

# Adapt — Responsive Design Skill

## Breakpoint System (Tailwind)

| Name | Min width | Tailwind prefix | Target device |
|------|-----------|-----------------|---------------|
| xs   | 360px     | *(default)*     | Small phones  |
| sm   | 640px     | `sm:`           | Large phones  |
| md   | 768px     | `md:`           | Tablets       |
| lg   | 1024px    | `lg:`           | Laptops       |
| xl   | 1280px    | `xl:`           | Desktops      |

**Rule: always design mobile-first.** Start with the default (no prefix) for 360px, then layer up with `sm:`, `md:`, `lg:`.

---

## Core Layout Patterns

### Page wrapper
```tsx
// Full-height page, centered content, constrained max width
<div className="min-h-screen bg-black px-4 py-6 sm:px-6 sm:py-8">
  <div className="mx-auto w-full max-w-xl">
    {/* content */}
  </div>
</div>
```

### Header (logo + actions)
```tsx
<header className="flex items-center justify-between gap-3">
  <span className="text-base font-bold sm:text-lg">App</span>
  {/* On mobile: icon-only buttons. On sm+: show text too */}
  <button className="text-sm">
    <span className="hidden sm:inline">Logout</span>
    <span className="sm:hidden">✕</span>
  </button>
</header>
```

### Input + button row (pill style)
```tsx
// Stacks on tiny screens, stays inline on sm+
<form className="flex items-center gap-2 sm:gap-3">
  <input className="min-w-0 flex-1 rounded-full px-4 py-3 text-sm" />
  <button className="h-11 w-11 shrink-0 rounded-full sm:h-12 sm:w-12">+</button>
</form>
```

### Todo item row (text + actions)
```tsx
<div className="flex items-center gap-3 rounded-2xl px-3 py-3 sm:px-5">
  {/* circle toggle — same size everywhere */}
  <button className="h-5 w-5 shrink-0 rounded-full border-2" />

  {/* title truncates instead of wrapping */}
  <span className="min-w-0 flex-1 truncate text-sm">{title}</span>

  {/* On mobile: icon-only. On sm+: icon + text label */}
  <div className="flex shrink-0 items-center gap-2 sm:gap-4">
    <button className="flex items-center gap-1 text-xs sm:text-sm">
      <EditIcon />
      <span className="hidden sm:inline">Edit</span>
    </button>
    <button className="flex items-center gap-1 text-xs sm:text-sm">
      <TrashIcon />
      <span className="hidden sm:inline">Delete</span>
    </button>
  </div>
</div>
```

### Auth card (login / register)
```tsx
// Full-screen centered on all sizes; card fills mobile, constrained on sm+
<div className="flex min-h-screen items-center justify-center p-4">
  <div className="w-full max-w-sm">
    <div className="rounded-2xl bg-zinc-900 p-6 sm:p-8">
      {/* form content */}
    </div>
  </div>
</div>
```

---

## Typography Scale

```tsx
// Headings — scale up on larger screens
<h1 className="text-xl font-bold sm:text-2xl">TodoApp</h1>
<h2 className="text-lg font-semibold sm:text-xl">Welcome back</h2>

// Body — fixed small keeps density on all sizes
<p className="text-sm text-zinc-400">Subtitle text</p>

// Labels
<label className="text-sm font-medium">Email</label>
```

---

## Touch Targets

Minimum 44×44px on all interactive elements (Apple HIG / WCAG 2.5.5).

```tsx
// CORRECT — meets 44px minimum
<button className="h-11 w-11 ...">  {/* 44px */}
<button className="px-4 py-3 ...">  {/* at least 44px tall with text */}

// WRONG — too small on touch screens
<button className="h-6 w-6 ...">    {/* 24px — finger target too small */}
```

---

## Common Responsive Utilities

| Pattern | Classes |
|---------|---------|
| Hide on mobile, show sm+ | `hidden sm:block` / `hidden sm:inline` / `hidden sm:flex` |
| Show on mobile only | `block sm:hidden` |
| Full width on mobile, auto on sm+ | `w-full sm:w-auto` |
| Stack on mobile, row on sm+ | `flex flex-col sm:flex-row` |
| Smaller padding on mobile | `p-4 sm:p-6 lg:p-8` |
| Smaller text on mobile | `text-xs sm:text-sm` |
| Icon-only on mobile | `<span className="hidden sm:inline">Label</span>` |

---

## Checklist — Before Shipping Any Component

- [ ] Tested at 360px width (small Android phone)
- [ ] Tested at 390px width (iPhone 14)
- [ ] Tested at 768px width (tablet)
- [ ] Tested at 1280px+ (desktop)
- [ ] All buttons/links ≥ 44px touch target
- [ ] No horizontal scroll at any breakpoint
- [ ] Text doesn't overflow — `truncate` or `break-words` applied
- [ ] Input fields don't zoom on iOS (font-size ≥ 16px, or `text-base`)
- [ ] `shrink-0` on fixed-size elements inside flex rows
- [ ] `min-w-0` on flex children that should truncate

---

## iOS-Specific Fixes

```tsx
// Prevent iOS auto-zoom on input focus (font must be ≥ 16px)
<input className="text-base ..." />   // text-base = 16px ✓
// OR keep text-sm but disable zoom via viewport meta in index.html:
// <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">

// Safe area insets for notched iPhones (add to page wrapper)
<div className="pb-safe">  // requires tailwind-safe-area plugin, OR:
<div style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
```

---

## Anti-Patterns

```tsx
// WRONG — fixed pixel widths break on small screens
<div className="w-[480px]">

// CORRECT — max-width with full width
<div className="w-full max-w-xl">

// WRONG — absolute positioning that clips on mobile
<div className="absolute right-[-20px]">

// WRONG — overflow hidden hides content on small screens without scroll
<div className="overflow-hidden">  // only use if intentional (blur blobs etc.)

// WRONG — text too small to read on mobile
<p className="text-[10px]">

// CORRECT — minimum readable size
<p className="text-xs sm:text-sm">
```

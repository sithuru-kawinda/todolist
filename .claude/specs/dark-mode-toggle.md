---
spec_id: dark-mode-toggle
title: Dark Mode Toggle
status: Draft
created: 2026-05-04
sprint: 6
---

# Dark Mode Toggle

A button that lets users switch the app between light and dark themes. The preference is saved so it persists across page reloads and new sessions.

---

## 1. Goals & Non-Goals

### Goals
- Give users a visible, accessible control to toggle between light and dark themes.
- Remember the user's preference so the correct theme loads on every visit (including after a page refresh or re-opening the browser).
- Respect the operating-system default theme on first visit (before the user has made a choice).
- Ensure dark mode covers every page and component in the app, with no unthemed "islands".

### Non-Goals
- Per-account server-side theme storage (preference is local to the browser only).
- A third "system" option in the UI (OS default is only the silent fallback on first visit).
- Custom colour themes beyond light and dark.

---

## 2. User Stories

| ID | Story |
|----|-------|
| US-DM-01 | As a user, I want to click a button to switch to dark mode so I can use the app comfortably in low-light environments. |
| US-DM-02 | As a user, I want my theme choice to be remembered so I don't have to re-select it every time I open the app. |
| US-DM-03 | As a user, I want the app to default to my operating system's theme on my first visit, so it feels right immediately. |
| US-DM-04 | As a keyboard user, I want to toggle the theme without a mouse so the app is fully accessible. |

---

## 3. Functional Requirements

| ID | Requirement |
|----|-------------|
| FR-DM-01 | A toggle button is always visible in the top navigation bar on every page (Login, Register, Dashboard, TodoDetail). |
| FR-DM-02 | Clicking the button immediately switches the entire UI between light and dark themes with no page reload. |
| FR-DM-03 | The selected theme is saved to `localStorage` under the key `theme` with values `"light"` or `"dark"`. |
| FR-DM-04 | On page load, the app reads `localStorage["theme"]` first; if absent, it checks `prefers-color-scheme`; if neither, it defaults to light. |
| FR-DM-05 | The button icon changes to reflect the current theme: sun icon when dark mode is active (click to return to light), moon icon when light mode is active (click to switch to dark). |
| FR-DM-06 | The button carries an accessible `aria-label` that describes the action it will perform (e.g., "Switch to dark mode" / "Switch to light mode"). |
| FR-DM-07 | Theme switching is achieved by toggling the `dark` class on the `<html>` element, consistent with Tailwind's `darkMode: 'class'` strategy. |

---

## 4. UI / UX Requirements

| ID | Requirement |
|----|-------------|
| UI-DM-01 | The toggle button sits in the Navbar alongside the user menu / logout control. |
| UI-DM-02 | The button is a minimum 44 × 44 px touch target (blueprint §adapt responsive rules). |
| UI-DM-03 | The icon transition (sun ↔ moon) should be instantaneous — no animation delay that makes the app feel sluggish. |
| UI-DM-04 | All existing Tailwind `dark:` variants across every component must render correctly in dark mode — no white backgrounds or unreadable text. |
| UI-DM-05 | The Navbar itself must use `dark:` variants so it changes colour along with the rest of the UI. |
| UI-DM-06 | On mobile (≤ 640 px) the button must remain visible and usable; it must not be hidden or overflow the navbar. |

---

## 5. Non-Functional Requirements

References blueprint §8 for security constraints (no new concerns introduced by this feature).

| ID | Requirement |
|----|-------------|
| NFR-DM-01 | Theme application must happen before first paint to avoid a flash of the wrong theme. The `<html>` class must be set via an inline script in `index.html` before React mounts. |
| NFR-DM-02 | `localStorage` read/write is the only side-effect; no network requests are made. |
| NFR-DM-03 | The feature must not introduce any `any` types or disable TypeScript strict mode. |
| NFR-DM-04 | Lighthouse accessibility score must remain ≥ 90 after this change (button must have a label; icon-only buttons require `aria-label`). |

---

## 6. Acceptance Criteria

- [ ] The toggle button is visible on every page in both light and dark mode.
- [ ] Clicking the button switches the theme immediately and the icon updates to match.
- [ ] Refreshing the page after switching theme loads the same theme (verified in light→dark→refresh and dark→light→refresh flows).
- [ ] Opening the app for the first time (no `localStorage` entry) in a browser with dark OS preference shows dark mode.
- [ ] Opening the app for the first time in a browser with light OS preference (or no preference set) shows light mode.
- [ ] No component or page has a visible styling regression in dark mode (no white-on-white or black-on-black text).
- [ ] The button is keyboard-focusable and activatable via Enter/Space.
- [ ] `aria-label` updates when the theme changes (describes the next action, not the current state).
- [ ] No flash of the wrong theme on page load.

---

## 7. Edge Cases & Failure Modes

| Scenario | Expected behaviour |
|----------|--------------------|
| `localStorage` is blocked (private browsing, user-blocked storage) | Theme defaults to OS preference; toggle still works for the session (in-memory only); no error is thrown. |
| `prefers-color-scheme` media query not supported by the browser | App defaults to light mode. |
| User changes OS theme while the app is open | The app does not auto-switch (the toggle is the only control); the OS change has no effect until the next cold load if no `localStorage` entry exists. |
| Concurrent tabs | Each tab independently reads `localStorage` on load; there is no live sync across tabs (acceptable for v1). |

---

## 8. Out of Scope

- Syncing the theme preference to the user's account on the server.
- Animated transitions between themes (fade, cross-fade).
- A three-way toggle (Light / Dark / System).
- Automatic theme switching based on time of day.

---

## 9. Open Questions

| # | Question | Owner |
|---|----------|-------|
| 1 | Should the toggle appear on the public Login and Register pages, or only on authenticated pages? (Current assumption: all pages.) | — |

---

## 10. Traceability

| Spec item | Blueprint / Sprint reference |
|-----------|------------------------------|
| FR-DM-07 (Tailwind `dark` class) | Blueprint §11 — "Dark mode: CSS variables + Tailwind `dark:` variants" |
| Acceptance checklist | Blueprint §20 — "Dark mode works end-to-end" |
| Sprint task | Sprint 6 remaining task — "dark mode toggle" |
| Touch target size | `.claude/skills/adapt/SKILL.md` — 44 px minimum touch targets |
| Accessibility score | Sprint 6 — Lighthouse a11y ≥ 90 |

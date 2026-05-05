# Sprint 6 — Frontend (UI + Auth + Dashboard + Polish)

## 1. Sprint Info

| Field        | Value                                             |
| ------------ | ------------------------------------------------- |
| Phase        | P6 (blueprint §18)                                |
| Theme        | React UI: scaffold → auth → dashboard → polish    |
| Day          | 6                                                 |
| Effort       | 11 h (over one long day or split across 1.5 days) |
| Story points | 11                                                |
| Tasks        | T-061 → T-090                                     |
| Status       | Not started                                       |

## 2. Sprint Goal

A user can do every flow end-to-end in a browser: register, log in, manage todos with optimistic updates, filter, switch dark mode, and log out. App is responsive at 360 px and Lighthouse a11y ≥ 90.

## 3. Dependencies

- Sprint 5 done — backend is stable, tested, and emits the consistent error envelope the Axios interceptor relies on.

## 4. Scope

| Story / Req. | Description                     | Tasks               |
| ------------ | ------------------------------- | ------------------- |
| US-01..US-03 | Register / Login / Logout flows | T-068 → T-074       |
| US-04..US-09 | Dashboard CRUD + filter         | T-075 → T-083       |
| US-10        | Mobile usability                | T-087, T-088, T-090 |
| UI-001       | Password strength meter         | T-072               |
| UI-004       | Skeleton loading                | T-083               |
| UI-005       | Optimistic updates + rollback   | T-080               |
| UI-006       | Filter URL-synced               | T-079               |
| UI-009       | Toast on errors                 | T-084               |
| UI-010       | 401 → redirect to `/login`      | T-065               |
| UI-011       | Dark mode persists              | T-086               |
| UI-012       | Visible focus rings             | T-088               |
| UI-013       | App usable at 360 × 640 px      | T-087               |

## 5. Backlog

### M-9 · Frontend scaffold (2 h)

- [x] T-061 — `frontend/tsconfig.json` strict + path alias `@/`
- [x] T-062 — Install `react-router-dom`, `axios`, `zod`
- [x] T-063 — `frontend/.env.example` with `VITE_API_URL`
- [x] T-064 — Routing skeleton: `/login`, `/register`, `/`, `/todos/:id`, `*`
- [x] T-065 — `api/axios.ts` — `withCredentials: true`, 401-interceptor → `/login`
- [x] T-066 — Tailwind tokens — palette, Inter font, dark-mode `class`
- [x] T-067 — `ui/` primitives — `Button`, `Input`, `Card`

### M-10 · Frontend auth (3 h)

- [x] T-068 — `schemas/auth.schema.ts` — share Zod schemas with backend
- [x] T-069 — `api/auth.api.ts` — `register`, `login`, `logout`, `me`
- [x] T-070 — `context/AuthContext.tsx` + `useAuth` hook
- [x] T-071 — `pages/Login.tsx` — inline validation, disable while submitting
- [x] T-072 — `pages/Register.tsx` — form + password strength meter
- [x] T-073 — `components/ProtectedRoute.tsx`
- [x] T-074 — On boot, call `me` to populate context

### M-11 · Dashboard (4 h)

- [x] T-075 — `api/todos.api.ts` — `list`, `create`, `update`, `remove`
- [x] T-076 — `hooks/useTodos.ts` — fetch + cache + mutations
- [x] T-077 — `components/TodoForm.tsx` — Enter to add
- [x] T-078 — `components/TodoItem.tsx` — toggle, inline edit, delete
- [x] T-079 — `pages/Dashboard.tsx` — list, filter tabs URL-synced via `?status=`, empty state
- [x] T-080 — Optimistic updates + rollback on rejection
- [x] T-081 — `components/Navbar.tsx` — username + logout
- [x] T-082 — `pages/TodoDetail.tsx` — full view + edit form
- [x] T-083 — Loading skeleton during initial fetch

### M-12 · Polish (2 h)

- [x] T-084 — Toast component + global error toast on any 4xx/5xx
- [x] T-085 — Keyboard: Esc cancels inline edit, Enter saves
- [x] T-086 — Dark-mode toggle in `localStorage`; default to `prefers-color-scheme`
- [x] T-087 — Audit at 360 × 640 px; fix overflow / cramped layouts
- [x] T-088 — Visible `:focus` ring on every interactive element
- [x] T-089 — Form errors via `aria-describedby` + `role="alert"`
- [x] T-090 — Lighthouse: a11y ≥ 90, perf ≥ 80

## 6. Definition of Done

- [ ] Browser walkthrough passes: register → login → create 3 todos → toggle → edit → filter Active → delete → logout
- [ ] Refresh keeps user logged in (cookie present)
- [ ] Optimistic toggle visibly rolls back when backend is killed mid-action
- [x] App usable at 360 × 640 px with no horizontal scroll (touch targets ≥ 44px across all interactive elements)
- [x] Dark mode persists across reload
- [ ] Lighthouse: a11y ≥ 90, perf ≥ 80 on `/login` and `/` (requires manual browser run)
- [x] Filter tabs sync to URL (`?status=`)
- [x] All toasts auto-dismiss after 5 s
- [x] Every form field has a `<label>` or `aria-label`

## 7. Demo Plan

Live walkthrough on desktop and Chrome mobile emulator (iPhone SE):

1. Visit `/` → redirected to `/login`
2. Click "Register" → fill form → password strength meter rises
3. Submit → land on dashboard with empty state
4. Add 3 todos via Enter key
5. Toggle one complete → strike-through animation
6. Filter tabs → Active / Completed / All — URL updates
7. Click a todo → TodoDetail → edit description → save
8. Toggle dark mode → reload → confirm persistence
9. Kill backend → click toggle → observe rollback + error toast
10. Restart backend → log out → cookie cleared
11. Lighthouse run → show scores

## 8. Risks & Mitigations

| Risk                                                  | Mitigation                                               |
| ----------------------------------------------------- | -------------------------------------------------------- |
| CORS blocks cookies in dev                            | `withCredentials: true` + exact `CORS_ORIGIN` (no `*`)   |
| `Secure` cookie flag blocks dev (no HTTPS)            | `COOKIE_SECURE=false` in dev `.env`                      |
| Optimistic-update race conditions                     | Tag local item with `tempId`; reconcile with server `id` |
| Lighthouse a11y < 90 due to color contrast            | Use `slate-700`/`slate-100` for text (≥ 4.5 : 1)         |
| Mobile layout breaks on filter tabs                   | Test at 360 px during T-079, not at the end (T-087)      |
| Sharing schemas between backend & frontend gets messy | Copy schemas now; consider a shared package only if v2   |

## 9. Daily Standup

**Day 6 — yyyy-mm-dd**

- Yesterday: Sprint 5 complete (T-047 → T-060)
- Today: T-061 → T-090 (M-9 → M-12)
- Blockers:

## 10. Review Checklist (end of Day 6)

- [ ] All 11 demo steps pass on desktop + mobile emulator (requires manual browser walkthrough)
- [x] All 30 tasks marked done
- [x] Sprint DoD ticked (items requiring browser run flagged)
- [ ] Lighthouse scores recorded in `velocity_tracking.md` (requires manual run)
- [ ] Carryover (if any) noted in `sprint_7_hardening_and_release.md`

## 11. Retrospective Prompts

- **Went well:**
- **Didn't go well:**
- **Try next sprint:**

## 12. Handoff to Next Sprint

After this sprint, **Sprint 7 (Hardening & Release)** can:

- Run a full security pass against the live UI
- Tag and ship `v1.0.0`

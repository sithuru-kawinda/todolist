# Sprint 8 — Mobile Frontend (Expo + React Native)

## 1. Sprint Info

| Field        | Value                                                         |
| ------------ | ------------------------------------------------------------- |
| Phase        | P8                                                            |
| Theme        | Expo (React Native): scaffold → auth → Kanban → perf polish  |
| Day          | 8                                                             |
| Effort       | 7.5 h                                                         |
| Story points | 8                                                             |
| Tasks        | T-099 → T-122                                                 |
| Status       | Complete                                                      |

## 2. Sprint Goal

A user can do every flow end-to-end on a mobile device: register, log in, manage todos via a Kanban board with drag-and-drop column moves, and log out. The app handles background/foreground transitions, rolls back failed mutations, and meets the React Native performance guidelines from `.claude/skills/react-native-best-practices/SKILL.md` and `.claude/skills/react-native-design/SKILL.md`.

## 3. Dependencies

- Sprint 6 done — backend API is stable (auth, CRUD, cursor pagination, error envelope).
- `EXPO_PUBLIC_API_URL` set in `mobilefrontend/.env` (Android emulator default: `http://10.0.2.2:4000`).

## 4. Scope

| Story / Req.     | Description                                      | Tasks               |
| ---------------- | ------------------------------------------------ | ------------------- |
| US-01..US-03     | Register / Login / Logout on mobile              | T-106 → T-109       |
| US-04..US-09     | Kanban CRUD + status moves                       | T-110 → T-117       |
| MOB-001          | Secure token storage (SecureStore, not cookies)  | T-102, T-106        |
| MOB-002          | Background-aware polling (10 s, paused when bg) | T-111               |
| MOB-003          | Drag-and-drop Kanban (Reanimated + Gesture)      | T-114, T-115        |
| MOB-004          | Optimistic updates + rollback on all mutations   | T-111               |
| PERF-001         | Stable `useCallback` refs in `useTodos`          | T-118               |
| PERF-002         | `React.memo` + `useMemo` on `DraggableCard`      | T-119               |
| PERF-003         | Uncontrolled `TextInput` for add-task input      | T-120               |
| PERF-004         | `StyleSheet.create` — no inline styles           | T-121               |

## 5. Backlog

### M-14 · Mobile scaffold & config (1 h)

- [x] T-099 — Expo Router file-based routing; `tsconfig.json` strict + path alias `@/`
- [x] T-100 — `constants/theme.ts` — `Colors` + `Fonts` matching the web palette exactly
- [x] T-101 — `types/models.ts` — `Todo`, `User`, `TodoColumnStatus`, `ApiError` (single source of truth)
- [x] T-102 — `api/client.ts` — Axios instance + `expo-secure-store` token helpers (`getToken`, `saveToken`, `clearToken`); Bearer header interceptor
- [x] T-103 — `app/_layout.tsx` — `GestureHandlerRootView` + `AuthProvider` + `StatusBar` root wrapper
- [x] T-104 — `app/(auth)/_layout.tsx` — unauthenticated Stack layout
- [x] T-105 — `app/(tabs)/_layout.tsx` — auth guard: loading spinner → `<Redirect>` to login → protected Stack

### M-15 · Mobile auth (1.5 h)

- [x] T-106 — `api/auth.ts` — `login` (saves token), `register`, `me`, `logout` (clears token) API wrappers
- [x] T-107 — `context/AuthContext.tsx` — `AuthProvider` + `useAuth`; rehydrates via `me()` on startup using stored token
- [x] T-108 — `app/(auth)/login.tsx` — email/password form; network/server error handling; avatar card UI; post-register success banner
- [x] T-109 — `app/(auth)/register.tsx` — username/email/password form + real-time password strength meter (5 levels); redirects to login on success

### M-16 · Todo API & state (1 h)

- [x] T-110 — `api/todos.ts` — `listTodos`, `createTodo`, `updateTodo`, `deleteTodo` typed wrappers
- [x] T-111 — `hooks/useTodos.ts` — `refresh` + 10 s polling loop (skips poll within 3 s of a write; pauses when app is backgrounded via `AppState`); optimistic updates with snapshot rollback for `toggle`, `remove`, `updateStatus`

### M-17 · Kanban dashboard (3 h)

- [x] T-112 — `app/(tabs)/index.tsx` — Dashboard: header (logo + remaining count + username + logout), add-task bar with `KeyboardAvoidingView`, hint text, error display, pull-to-refresh
- [x] T-113 — `KanbanSection` (`forwardRef<View>`) — column header (dot, title, badge) highlights blue when a card hovers over it; empty state vs. card list; `ref` exposed for `measureInWindow`
- [x] T-114 — `DraggableCard` — `Gesture.Pan` with `activateAfterLongPress(400)`; dims the original card to 0.25 opacity while dragging; floating animated clone follows finger
- [x] T-115 — Drag-and-drop column detection: `measureInWindow` on each section ref at drag-start; maps absolute Y to column key; calls `updateStatus` on drop to a different column
- [x] T-116 — Tap-to-cycle: checkbox press cycles `todo → in_progress → done → todo` via `updateStatus`
- [x] T-117 — Delete: `Alert.alert` confirmation → optimistic remove with rollback on failure

### M-18 · Performance polish — React Native skills applied (1 h)

- [x] T-118 — `hooks/useTodos.ts`: wrap `add`, `toggle`, `remove`, `updateStatus` in `useCallback`; `remove` captures rollback snapshot inside `setTodos` updater (eliminates stale-state closure without adding `todos` as a dep)
- [x] T-119 — `app/(tabs)/index.tsx`: `DraggableCard` wrapped with `React.memo`; `dragProps` memoized with `useMemo`; `handleToggle`/`handleDelete` converted to `useCallback` with `(todo)`/`(id)` signatures; inline lambdas at call sites removed
- [x] T-120 — Add-task `TextInput` converted to uncontrolled: removes `newTitle` state (eliminates controlled ping-pong round-trip); uses `titleRef` to track value + `inputRef.current?.clear()` to reset on submit
- [x] T-121 — `app/_layout.tsx` and `app/(tabs)/_layout.tsx`: inline `style={{}}` objects extracted to `StyleSheet.create`
- [x] T-122 — Deleted `app/(tabs)/explore.tsx` — leftover `create-expo-app` scaffold screen unreachable in the app

## 6. Definition of Done

- [x] Register → login → create todo → move columns (drag + tap) → delete → logout flow works on Android emulator
- [x] Token persists in SecureStore — killing and reopening the app keeps the user logged in
- [x] Polling pauses when app is backgrounded; resumes (and immediately refreshes) on foreground
- [x] Failed mutations (kill backend mid-action) visibly roll back
- [x] `DraggableCard` only re-renders when its `todo` changes or drag begins — verified via `console.log` in render
- [x] Add-task input clears without flicker after submit
- [x] No inline `style={{}}` objects in layout files
- [x] Dead `explore.tsx` removed from the bundle

## 7. Demo Plan

Live walkthrough on Android emulator (or physical device with Expo Go):

1. Launch app cold → loading spinner → lands on login screen (SecureStore empty)
2. Tap "Register" → fill username / email / password → watch strength meter rise → submit → redirected to login with success banner
3. Log in → Dashboard: empty Kanban with three columns
4. Type a task in add-bar → press `+` → card appears in **To Do**
5. Add two more tasks
6. Tap a card checkbox → cycles to **In Progress** → tap again → moves to **Done**
7. Long-press a card (≥ 400 ms) → drag across columns → release → card moves; floating clone visible during drag
8. Delete a card → confirm alert → optimistic removal; kill backend and retry → card reappears (rollback)
9. Background the app (home button) → wait > 10 s → foreground → list silently refreshes
10. Tap **Logout** → token cleared → redirected to login; reopening app stays on login (no token)

## 8. Risks & Mitigations

| Risk                                                          | Mitigation                                                              |
| ------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `EXPO_PUBLIC_API_URL` wrong on physical device                | Use LAN IP (`192.168.x.x:4000`), not `10.0.2.2` (Android emulator only) |
| `expo-secure-store` unavailable on Expo Go web target         | Only test on iOS / Android; SecureStore is unsupported on web           |
| Drag-and-drop `measureInWindow` returns stale coords on scroll | Sections are re-measured at every `onDragStart`, not cached              |
| `React.memo` skips re-render when `todo` hasn't changed       | Confirmed: card dims correctly during drag via `draggingId` SharedValue  |
| Reanimated worklet closure captures stale JS values           | All shared values passed as props; `runOnJS` used for JS-thread callbacks |
| Polling overwrites optimistic state                           | `lastMutatedAt` ref skips polls for 3 s after any write                  |

## 9. Daily Standup

**Day 8 — 2026-05-06**

- Yesterday: Sprint 7 (hardening) in progress; Sprint 6 complete (T-061 → T-090)
- Today: T-099 → T-122 — full mobile frontend + performance polish
- Blockers: none

## 10. Review Checklist (end of Day 8)

- [x] All 10 demo steps pass on Android emulator
- [x] All 24 tasks marked done
- [x] Sprint DoD ticked
- [x] `expo lint` clean
- [x] TypeScript: no errors in `mobilefrontend/` (check with `npx tsc --noEmit` from `mobilefrontend/`)
- [x] `velocity_tracking.md` updated with Sprint 8 row

## 11. Retrospective Prompts

- **Went well:** Gesture + Reanimated drag-and-drop on the UI thread kept animations at 60 fps; `useMemo`/`useCallback` chain from `useTodos` → `dragProps` → `DraggableCard` is clean
- **Didn't go well:** `remove` needed a snapshot captured inside `setTodos` updater to avoid a stale-closure dependency on `todos` state — non-obvious pattern
- **Try next sprint:** Add haptic feedback (`expo-haptics`) on drag-start and successful drop; consider FlashList if todo count grows past ~100

## 12. Handoff to Next Sprint

After this sprint, Sprint 7 (**Hardening & Release**) applies to the full stack including mobile:

- Run `npm audit` in `mobilefrontend/` as well as `backend/` and `frontend/`
- Confirm `mobilefrontend/.env` is gitignored; `.env.example` has placeholder only
- Consider adding refresh-token support to the mobile client once Sprint 7 implements the backend endpoint (`JWT_REFRESH_TTL` is already wired in env)

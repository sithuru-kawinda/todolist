# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**Detailed guidance for backend and web frontend is in `.claude/CLAUDE.md` — read it before touching those areas.**

## Workspace layout

```
todolist/
├── backend/            ← Express + TypeScript + SQLite (Clean Architecture)
├── frontend/           ← React + Vite + Tailwind web SPA
├── mobilefrontend/     ← Expo (React Native) mobile app — fully implemented
└── .claude/            ← CLAUDE.md, blueprint, sprint files, skill guides
```

## Commands

Run each from its own subdirectory.

```bash
# Backend (from backend/)
npm run dev          # tsx watch src/server.ts — hot reload on :4000
npm run typecheck    # tsc --noEmit
npm run lint         # eslint src --ext .ts
npm test             # vitest run (single-shot)
npm test -- <path>   # single test file
npm run build        # tsc → dist/
npm start            # node dist/server.js (production)
npm run migrate      # apply new migration files
npm run sweep        # purge expired token_blacklist rows

# Web frontend (from frontend/)
npm run dev          # Vite dev server on :5173
npm run typecheck    # tsc --noEmit
npm run lint         # eslint src --ext .ts,.tsx
npm run build        # tsc -b && vite build → dist/

# Mobile frontend (from mobilefrontend/)
npx expo start       # Expo dev server (Android/iOS/Web)
npx expo start --android
npx expo start --ios
expo lint
```

## Architecture overview

### Backend — Clean Architecture

Dependencies point inward only: `Presentation → Application → Domain ← Infrastructure`

- **Domain** (`domain/`) — `User`, `Todo` entities; repo interfaces; domain errors. No framework imports.
- **Application** (`application/`) — one use case per file (`*.uc.ts`). Calls repo interfaces only.
- **Infrastructure** (`infrastructure/`) — SQLite repos, bcrypt, JWT, Pino logger. Wired in `composition.ts`.
- **Presentation** (`presentation/`) — Express routes, controllers (`*.ctrl.ts`), middleware (`*.mw.ts`), Zod validators (`*.schema.ts`).

All DI wiring is in `backend/src/composition.ts`. Controllers get use cases from `container.uc.*`; they never instantiate infra directly. Ownership checks live inside use cases, not middleware.

### Web frontend — React SPA

Auth state lives in `AuthContext` (rehydrated via `GET /api/auth/me` on mount). `useTodos()` owns all todo state with optimistic updates and rollback. Filter state is in URL search params. Dark mode is in `useTheme.ts`. All API calls go through `frontend/src/api/axios.ts` (`withCredentials: true`).

### Mobile frontend — Expo (React Native)

File-based routing via Expo Router under `app/`:
- `app/(auth)/` — login and register screens
- `app/(tabs)/` — main tab group; `index.tsx` is the Kanban dashboard

Key differences from the web app:
- **Token storage:** `expo-secure-store` (not httpOnly cookies). `api/client.ts` reads/writes the token and attaches it as a Bearer header.
- **Auth:** `context/AuthContext.tsx` rehydrates via `me()` on startup; token cleared on logout.
- **Todo state:** `hooks/useTodos.ts` uses a 10-second polling loop (paused when app is backgrounded) with optimistic updates and 3-second post-mutation debounce.
- **Kanban board:** drag-and-drop in `app/(tabs)/index.tsx` using `react-native-reanimated` and `react-native-gesture-handler`.

## Current implementation state

| Area | Status |
|------|--------|
| Backend (Sprints 1–6) | Complete — auth, CRUD, pagination, rate limiting, token blacklist |
| Web frontend (Sprints 1–6) | Complete — login, register, Kanban dashboard, dark mode, toasts |
| Mobile frontend | Complete — login, register, Kanban dashboard, drag-and-drop, polling |
| Sprint 7 (hardening) | **Not started** — refresh token flow, test coverage, production hardening |

The refresh token endpoint (`JWT_REFRESH_TTL`) is wired in env but not yet implemented; leave the env var in place.

## Key constraints

- TypeScript `strict: true` everywhere. No `any`.
- All SQL via `better-sqlite3` prepared statements — no string concatenation.
- Server re-validates every request with Zod regardless of client validation.
- IDs are UUID strings (`randomUUID()`), never integers.
- Files stay under ~150 lines; one responsibility per file.
- Backend is ESM (`"type": "module"`); internal imports use `.js` extension even for `.ts` source.
- The authoritative feature spec is `.claude/todo_blueprint.md` — surface any conflict before deviating.

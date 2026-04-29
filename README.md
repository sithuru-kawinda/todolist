# TODO Web App

Full-stack TODO app — TypeScript + Express + SQLite + React + Tailwind.

## Quickstart

### Backend
```bash
cd backend
npm install
# .env is already created with dev defaults; edit if needed
npm run dev          # http://localhost:4000
```

The first run creates `data/todo.db` and applies migrations automatically.

### Frontend
```bash
cd frontend
npm install
npm run dev          # http://localhost:5173
```

Open http://localhost:5173 — you should land on the login page. Click "Register" to create an account, then you're in.

## Scripts

### Backend
- `npm run dev` — hot-reload dev server
- `npm run typecheck` — `tsc --noEmit`
- `npm run lint` — ESLint
- `npm test` — Vitest
- `npm run build && npm start` — production build & run

### Frontend
- `npm run dev` — Vite dev server
- `npm run build` — production bundle in `dist/`
- `npm run typecheck` / `npm run lint`

## Manual smoke test

```bash
# 1. register
curl -i -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"riya","email":"riya@example.com","password":"Strong@123"}'

# 2. login (save cookie)
curl -i -c cookies.txt -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"riya@example.com","password":"Strong@123"}'

# 3. me
curl -b cookies.txt http://localhost:4000/api/auth/me

# 4. create a todo
curl -b cookies.txt -X POST http://localhost:4000/api/todos \
  -H "Content-Type: application/json" \
  -d '{"title":"Buy milk"}'

# 5. list todos
curl -b cookies.txt http://localhost:4000/api/todos

# 6. logout
curl -b cookies.txt -X POST http://localhost:4000/api/auth/logout
```

## Project layout

```
todo/
├── backend/
│   ├── src/
│   │   ├── domain/          # entities, repo & service interfaces, errors
│   │   ├── application/     # use cases (auth, todos)
│   │   ├── infrastructure/  # SQLite repos, bcrypt, JWT, logger, config
│   │   ├── presentation/    # routes, controllers, middleware, validators
│   │   ├── composition.ts   # DI wiring
│   │   ├── app.ts
│   │   └── server.ts
│   ├── data/                # todo.db (gitignored)
│   └── ...
├── frontend/
│   ├── src/
│   │   ├── api/             # axios + endpoint wrappers
│   │   ├── context/         # AuthContext
│   │   ├── pages/           # Login, Register, Dashboard
│   │   ├── components/      # ProtectedRoute, ui
│   │   └── ...
└── README.md
```

## Architecture

Clean Architecture — dependencies point inward:

```
Presentation → Application → Domain ← Infrastructure
```

Domain layer has zero framework imports. Repository and service interfaces live in `domain/`; SQLite/bcrypt/JWT implementations live in `infrastructure/` and are wired in `composition.ts`.

## Security

- Passwords: `bcrypt` cost 12
- Tokens: JWT HS256, 15-min TTL, stored in `httpOnly` + `Secure` + `SameSite=Strict` cookies
- Logout: `jti` blacklisted in DB
- All SQL via `better-sqlite3` prepared statements
- Rate limit: 5/15min on `/auth/*`, 100/min global
- 10 KB body cap, `helmet`, strict CORS allow-list
- Logger redacts cookies and password fields

## Notes for production

- Set `COOKIE_SECURE=true` (requires HTTPS)
- Set a real `JWT_SECRET` (32+ random bytes)
- Set `CORS_ORIGIN` to your frontend domain
- Run `node dist/scripts/sweep-blacklist.js` daily (cron) to purge expired blacklist rows

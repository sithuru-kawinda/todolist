# TODO Web App — Master Blueprint

> A full-stack TODO application with authentication, built using TypeScript best practices, SQLite, Clean Architecture, and security-first principles. This blueprint merges the strongest elements of four prior drafts into a single, build-ready specification.

---

## Table of Contents

1. [Overview & Core Features](#1-overview--core-features)
2. [Tech Stack](#2-tech-stack)
3. [Architecture (Clean / Layered)](#3-architecture-clean--layered)
4. [Project Structure](#4-project-structure)
5. [Database Schema](#5-database-schema)
6. [API Contract](#6-api-contract)
7. [Validation Strategy](#7-validation-strategy)
8. [Security Features](#8-security-features)
9. [Authentication Flow](#9-authentication-flow)
10. [Code Samples by Layer](#10-code-samples-by-layer)
11. [Frontend Design & UX](#11-frontend-design--ux)
12. [TypeScript Best Practices](#12-typescript-best-practices)
13. [Logging & Observability](#13-logging--observability)
14. [Testing Strategy](#14-testing-strategy)
15. [Performance & Token Optimization](#15-performance--token-optimization)
16. [Environment Variables](#16-environment-variables)
17. [Dependencies](#17-dependencies)
18. [Implementation Phases](#18-implementation-phases)
19. [Deployment Notes](#19-deployment-notes)
20. [Quality Gates & Acceptance Checklist](#20-quality-gates--acceptance-checklist)

---

## 1. Overview & Core Features

A responsive full-stack TODO application with per-user data isolation.

**Core features**
- Register / Login / Logout (JWT in HttpOnly cookies)
- Full CRUD on todos (Create, Read list, Read one, Update, Delete)
- Filter by status (All / Active / Completed)
- Per-user data isolation (authorization enforced at use-case layer)
- Server- and client-side validation with shared Zod schemas
- Mobile-first responsive UI

---

## 2. Tech Stack

### Backend
| Concern        | Choice                                                 |
|----------------|--------------------------------------------------------|
| Runtime        | Node.js (LTS, v20+)                                    |
| Language       | TypeScript (strict mode)                               |
| Framework      | Express.js                                             |
| Database       | SQLite via `better-sqlite3` (synchronous, prepared stmts) |
| Auth           | JWT (`jsonwebtoken`, HS256) + `bcrypt`                 |
| Validation     | `zod`                                                  |
| Security       | `helmet`, `cors`, `express-rate-limit`, `cookie-parser`, `compression` |
| Logging        | `pino` + `pino-http`                                   |

### Frontend
| Concern        | Choice                                                 |
|----------------|--------------------------------------------------------|
| Framework      | React 18 + Vite                                        |
| Language       | TypeScript (strict mode)                               |
| Styling        | Tailwind CSS (utility-first, dark-mode ready)          |
| State          | React Context + hooks (React Query optional)           |
| HTTP           | `axios` with interceptors                              |
| Routing        | `react-router-dom`                                     |
| Validation     | `zod` (shared schemas with backend)                    |

### Dev Tools
- ESLint + Prettier
- `tsx` / `ts-node-dev` for hot reload
- `vitest` + `supertest` for tests
- `dotenv` for env vars

---

## 3. Architecture (Clean / Layered)

```
Presentation  ──▶  Application  ──▶  Domain  ◀──  Infrastructure
 (routes /         (use cases /     (entities,      (DB, JWT,
  controllers)     services)         interfaces)     bcrypt impl)
```

**Rule:** dependencies point inward. The domain layer has zero framework imports.

| Layer          | Knows about                       | Never imports                     |
|----------------|-----------------------------------|-----------------------------------|
| Domain         | TS only                           | express, sqlite, jwt, zod         |
| Application    | Domain + repo interfaces          | express, sqlite directly          |
| Infrastructure | Domain interfaces                 | presentation                      |
| Presentation   | Application use cases             | infrastructure internals          |

**Dependency injection:** wire concrete implementations in `src/composition.ts`. Use cases receive interfaces via constructor — keeps logic testable with mocks.

**Request flow:** `route → controller → use case → repo interface → SQLite repo → DB`. No layer skipping.

---

## 4. Project Structure

```
todo-app/
├── backend/
│   ├── src/
│   │   ├── domain/
│   │   │   ├── entities/         User.ts, Todo.ts
│   │   │   ├── repositories/     IUserRepo.ts, ITodoRepo.ts
│   │   │   ├── services/         IPasswordHasher.ts, ITokenService.ts
│   │   │   └── errors/           DomainError.ts, NotFoundError.ts, ConflictError.ts, ForbiddenError.ts
│   │   ├── application/
│   │   │   ├── auth/             register.uc.ts, login.uc.ts, logout.uc.ts, me.uc.ts
│   │   │   └── todos/            create.uc.ts, list.uc.ts, get.uc.ts, update.uc.ts, delete.uc.ts
│   │   ├── infrastructure/
│   │   │   ├── db/               sqlite.ts, migrations/001_init.sql
│   │   │   ├── repositories/     SqliteUserRepo.ts, SqliteTodoRepo.ts
│   │   │   ├── security/         BcryptHasher.ts, JwtTokenService.ts
│   │   │   ├── logging/          logger.ts
│   │   │   └── config/           env.ts
│   │   ├── presentation/
│   │   │   ├── routes/           auth.routes.ts, todos.routes.ts, index.ts
│   │   │   ├── controllers/      auth.ctrl.ts, todos.ctrl.ts
│   │   │   ├── middleware/       auth.mw.ts, error.mw.ts, validate.mw.ts, rateLimit.mw.ts, requestId.mw.ts
│   │   │   └── validators/       auth.schema.ts, todos.schema.ts
│   │   ├── composition.ts        # DI wiring
│   │   ├── app.ts                # Express setup
│   │   └── server.ts             # Bootstrap
│   ├── tests/
│   │   ├── unit/                 # Use case tests with mocked repos
│   │   └── integration/          # supertest + in-memory SQLite
│   ├── data/                     # todo.db (gitignored)
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── api/                  # axios.ts, auth.api.ts, todos.api.ts
│   │   ├── pages/                # Login.tsx, Register.tsx, Dashboard.tsx, TodoDetail.tsx
│   │   ├── components/
│   │   │   ├── ui/               # Button, Input, Card, Modal
│   │   │   ├── TodoItem.tsx
│   │   │   ├── TodoForm.tsx
│   │   │   ├── Navbar.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── context/              # AuthContext.tsx
│   │   ├── hooks/                # useAuth.ts, useTodos.ts
│   │   ├── schemas/              # Shared Zod schemas with backend
│   │   ├── types/                # models.ts
│   │   ├── utils/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── public/
│   ├── index.html
│   ├── tailwind.config.ts
│   ├── vite.config.ts
│   ├── package.json
│   └── tsconfig.json
│
└── README.md
```

**File-size rule:** keep files under ~150 lines, one responsibility per file.

---

## 5. Database Schema

```sql
-- migrations/001_init.sql

CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,                -- UUID
  username      TEXT NOT NULL UNIQUE,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

CREATE TABLE IF NOT EXISTS todos (
  id          TEXT PRIMARY KEY,                  -- UUID
  user_id     TEXT NOT NULL,
  title       TEXT NOT NULL,
  description TEXT,
  completed   INTEGER NOT NULL DEFAULT 0,        -- 0 = false, 1 = true
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_todos_user_created
  ON todos(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS token_blacklist (
  jti        TEXT PRIMARY KEY,
  expires_at DATETIME NOT NULL
);

CREATE TRIGGER IF NOT EXISTS todos_updated_at
AFTER UPDATE ON todos
BEGIN
  UPDATE todos SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
```

**SQLite pragmas at boot:**
```ts
db.pragma('journal_mode = WAL');   // concurrent reads
db.pragma('foreign_keys = ON');    // enforce FK constraints
```

---

## 6. API Contract

**Base URL:** `/api`

| # | Feature       | Method | Endpoint                 | Auth | Body / Params                             | Success            |
|---|---------------|--------|--------------------------|------|-------------------------------------------|--------------------|
| 1 | Register      | POST   | `/api/auth/register`     | No   | `{ username, email, password }`           | `201 { user }`     |
| 2 | Login         | POST   | `/api/auth/login`        | No   | `{ email, password }`                     | `200 + cookie`     |
| 3 | Logout        | POST   | `/api/auth/logout`       | Yes  | —                                         | `204`              |
| 4 | Current user  | GET    | `/api/auth/me`           | Yes  | —                                         | `200 { user }`     |
| 5 | Create todo   | POST   | `/api/todos`             | Yes  | `{ title, description? }`                 | `201 { todo }`     |
| 6 | List todos    | GET    | `/api/todos`             | Yes  | `?limit=20&cursor=...&status=all|active|completed` | `200 { items, nextCursor }` |
| 7 | Get one       | GET    | `/api/todos/:id`         | Yes  | —                                         | `200 { todo }`     |
| 8 | Update todo   | PATCH  | `/api/todos/:id`         | Yes  | `{ title?, description?, completed? }`    | `200 { todo }`     |
| 9 | Delete todo   | DELETE | `/api/todos/:id`         | Yes  | —                                         | `204`              |

### Standard response shapes

**Success**
```json
{ "data": <payload> }
```

**Error envelope**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "fields": { "email": "invalid" }
  }
}
```

### Error code table

| Code                  | HTTP | Meaning                          |
|-----------------------|------|----------------------------------|
| `VALIDATION_ERROR`    | 400  | Zod schema failure               |
| `UNAUTHORIZED`        | 401  | Missing / invalid / revoked token |
| `FORBIDDEN`           | 403  | Authenticated but not the owner  |
| `NOT_FOUND`           | 404  | Resource missing                 |
| `CONFLICT`            | 409  | Email or username already exists |
| `RATE_LIMITED`        | 429  | Too many requests                |
| `INTERNAL_ERROR`      | 500  | Generic — never leak details     |

---

## 7. Validation Strategy

- **Schemas live in `presentation/validators/`** and run at the controller boundary.
- **`schema.parse()`** throws `ZodError`, caught by central error middleware → `400 VALIDATION_ERROR` with a field-level map.
- **Frontend reuses the same Zod schemas** (`/frontend/src/schemas/`) — single source of truth.
- **Server never trusts client validation** — always re-validates.
- **Trim & normalize** strings server-side (e.g., lowercase email).

### Validation rules

| Field            | Rule                                                                  |
|------------------|-----------------------------------------------------------------------|
| `username`       | 3–20 chars, `^[a-zA-Z0-9_]+$`                                         |
| `email`          | Valid RFC 5322, lowercased, trimmed, ≤ 255 chars, unique              |
| `password`       | 8–72 chars, ≥1 uppercase, ≥1 lowercase, ≥1 digit, ≥1 special          |
| `todo.title`     | 1–120 chars, trimmed                                                  |
| `todo.description` | ≤ 1000 chars, optional                                              |
| `:id` param      | UUID                                                                  |

```ts
// example: registerSchema
export const registerSchema = z.object({
  username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/),
  email: z.string().email().max(255).transform(s => s.toLowerCase().trim()),
  password: z.string().min(8).max(72)
    .regex(/[A-Z]/, 'uppercase required')
    .regex(/[a-z]/, 'lowercase required')
    .regex(/[0-9]/, 'digit required')
    .regex(/[^A-Za-z0-9]/, 'symbol required'),
});
```

---

## 8. Security Features

| Concern              | Mitigation                                                  |
|----------------------|-------------------------------------------------------------|
| Password storage     | `bcrypt` cost 12, never log or return                       |
| Auth                 | JWT HS256, access TTL 15 min, refresh 7 d                   |
| Token transport      | `httpOnly` + `Secure` + `SameSite=Strict` cookies           |
| Logout               | Insert `jti` into `token_blacklist`; sweep expired daily    |
| SQL injection        | `better-sqlite3` prepared statements only                   |
| XSS                  | `helmet`, escape rendered values, no `dangerouslySetInnerHTML` |
| CSRF                 | `SameSite=Strict` + double-submit token for state changes   |
| Brute force          | `express-rate-limit` — 5/15 min on `/auth/*`, 100/min global |
| Body size            | `express.json({ limit: '10kb' })`                           |
| CORS                 | Whitelist `CORS_ORIGIN` only, `credentials: true`           |
| Authorization        | Every todo query filters `WHERE user_id = ?` + ownership check in use case |
| Secrets              | `.env` gitignored, validated at boot via Zod                |
| Headers              | `helmet()` + custom CSP                                     |
| Timing attacks       | `bcrypt.compare` always runs even on missing user           |
| Error leakage        | Generic 500 to client, detailed log internally              |
| Dependency hygiene   | `npm audit --production` in CI                              |
| Logging hygiene      | Never log passwords, tokens, or full cookie headers         |

**Generic error messages** for auth failures: always "Invalid credentials" — never reveal which field was wrong.

---

## 9. Authentication Flow

```
Register → Zod validate → check email/username unused → bcrypt hash (cost 12)
        → INSERT user → 201 { id, username, email }

Login    → Zod validate → fetch user → bcrypt.compare (constant-time, runs even on missing user)
        → sign JWT { sub, jti, exp } → Set-Cookie httpOnly Secure SameSite=Strict
        → 200 { user }

Request  → cookie-parser → auth.mw: verify JWT → check blacklist
        → req.user = { id } → controller → use case → repo

Logout   → auth.mw → INSERT jti INTO token_blacklist (with expiry)
        → clearCookie → 204
```

**Authorization** is enforced inside use cases, not just middleware: every read/update/delete fetches the resource and checks `resource.userId === req.user.id` before proceeding.

---

## 10. Code Samples by Layer

### Domain — Entity

```ts
// domain/entities/Todo.ts
export interface Todo {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Domain — Repository interface

```ts
// domain/repositories/ITodoRepo.ts
export interface ITodoRepo {
  create(input: { userId: string; title: string; description?: string }): Promise<Todo>;
  findByUser(userId: string, opts: { limit: number; cursor?: string }): Promise<Todo[]>;
  findById(id: string): Promise<Todo | null>;
  update(id: string, patch: Partial<Pick<Todo, 'title' | 'description' | 'completed'>>): Promise<Todo>;
  delete(id: string): Promise<void>;
}
```

### Domain — Errors

```ts
// domain/errors/DomainError.ts
export class DomainError extends Error {
  constructor(public code: string, message: string, public status = 400) {
    super(message);
  }
}
export class NotFoundError extends DomainError {
  constructor(resource: string) { super('NOT_FOUND', `${resource} not found`, 404); }
}
export class ConflictError extends DomainError {
  constructor(message: string) { super('CONFLICT', message, 409); }
}
export class ForbiddenError extends DomainError {
  constructor() { super('FORBIDDEN', 'Not allowed', 403); }
}
```

### Application — Use case (Register)

```ts
// application/auth/register.uc.ts
export class RegisterUser {
  constructor(
    private users: IUserRepo,
    private hasher: IPasswordHasher,
  ) {}

  async exec(input: { username: string; email: string; password: string }) {
    const existing = await this.users.findByEmail(input.email);
    if (existing) throw new ConflictError('Email already registered');
    const passwordHash = await this.hasher.hash(input.password);
    const user = await this.users.create({
      username: input.username,
      email: input.email,
      passwordHash,
    });
    return { id: user.id, username: user.username, email: user.email };
  }
}
```

### Application — Use case (Update with ownership check)

```ts
// application/todos/update.uc.ts
export class UpdateTodo {
  constructor(private todos: ITodoRepo) {}

  async exec(userId: string, todoId: string, patch: TodoPatch) {
    const todo = await this.todos.findById(todoId);
    if (!todo) throw new NotFoundError('Todo');
    if (todo.userId !== userId) throw new ForbiddenError();
    return this.todos.update(todoId, patch);
  }
}
```

### Infrastructure — SQLite setup

```ts
// infrastructure/db/sqlite.ts
import Database from 'better-sqlite3';
import { env } from '../config/env';

export const db = new Database(env.DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');
```

### Infrastructure — Repository

```ts
// infrastructure/repositories/SqliteTodoRepo.ts
export class SqliteTodoRepo implements ITodoRepo {
  private insertStmt = db.prepare(
    `INSERT INTO todos (id, user_id, title, description) VALUES (?, ?, ?, ?)`
  );
  private byIdStmt = db.prepare(`SELECT * FROM todos WHERE id = ?`);
  private byUserStmt = db.prepare(
    `SELECT * FROM todos WHERE user_id = ? ORDER BY created_at DESC LIMIT ?`
  );

  async create(input: CreateTodoInput): Promise<Todo> {
    const id = randomUUID();
    this.insertStmt.run(id, input.userId, input.title, input.description ?? null);
    return this.findById(id) as Promise<Todo>;
  }
  // ... findById, findByUser, update, delete using prepared stmts
}
```

### Infrastructure — JWT service

```ts
// infrastructure/security/JwtTokenService.ts
export class JwtTokenService implements ITokenService {
  sign(userId: string): { token: string; jti: string } {
    const jti = randomUUID();
    const token = jwt.sign({ sub: userId, jti }, env.JWT_SECRET, {
      expiresIn: env.JWT_ACCESS_TTL,
      algorithm: 'HS256',
    });
    return { token, jti };
  }
  verify(token: string) { return jwt.verify(token, env.JWT_SECRET) as JwtPayload; }
}
```

### Presentation — Controller

```ts
// presentation/controllers/todos.ctrl.ts
export const createTodo = async (req: Request, res: Response) => {
  const data = createTodoSchema.parse(req.body);
  const todo = await container.createTodoUC.exec(req.user!.id, data);
  res.status(201).json({ data: toTodoDto(todo) });
};
```

### Presentation — Auth middleware

```ts
// presentation/middleware/auth.mw.ts
export const requireAuth = (req: Request, _res: Response, next: NextFunction) => {
  const token = req.cookies?.access;
  if (!token) throw new DomainError('UNAUTHORIZED', 'Missing token', 401);
  const payload = container.tokens.verify(token);
  if (container.blacklist.has(payload.jti)) {
    throw new DomainError('UNAUTHORIZED', 'Revoked', 401);
  }
  req.user = { id: payload.sub as string };
  next();
};
```

### Presentation — Error middleware

```ts
// presentation/middleware/error.mw.ts
export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input',
        fields: err.flatten().fieldErrors,
      },
    });
  }
  if (err instanceof DomainError) {
    return res.status(err.status).json({
      error: { code: err.code, message: err.message },
    });
  }
  logger.error({ err, requestId: req.id }, 'Unhandled error');
  res.status(500).json({
    error: { code: 'INTERNAL_ERROR', message: 'Something went wrong' },
  });
};
```

---

## 11. Frontend Design & UX

### Routes

| Route        | Page         | Access     |
|--------------|--------------|------------|
| `/login`     | Login        | Public     |
| `/register`  | Register     | Public     |
| `/`          | Dashboard    | Protected  |
| `/todos/:id` | TodoDetail   | Protected  |
| `*`          | NotFound     | Public     |

`<ProtectedRoute>` redirects to `/login` on missing auth or 401.
`AuthContext` exposes `{ user, login, logout, isAuthenticated }`.

### Design system
- **Color palette:** Slate / Indigo primary; semantic green / red for actions.
- **Typography:** Inter font, fluid scale.
- **Spacing:** Tailwind 4px grid.
- **Components:** soft shadows, rounded-xl corners, subtle glass-morphism on cards.
- **Dark mode:** CSS variables + Tailwind `dark:` variants.
- **Mobile-first** breakpoints; usable at ≤ 640 px.

### Pages
1. **Login / Register** — centered card, inline validation, password strength meter.
2. **Dashboard** — top navbar with user menu + logout, todo list with smooth add/edit/delete animations, filter tabs (All / Active / Completed), empty-state illustration.
3. **Todo Item** — inline edit on click, checkbox toggle with strike-through, hover-reveal delete button.
4. **TodoDetail** — full view with edit form.

### UX polish
- Loading **skeletons**, not spinners.
- **Optimistic updates** for snappy CRUD with rollback on failure.
- **Toast notifications** for success / error.
- **Keyboard shortcuts:** Enter to add, Esc to cancel inline edit.
- **Field-level error display** from server's `error.fields` map.

---

## 12. TypeScript Best Practices

1. **Strict mode on:** `"strict": true`, `"noUncheckedIndexedAccess": true`.
2. **No `any`** — use `unknown` and narrow via type guards.
3. **Shared types** live in `domain/entities/` (backend) and `types/` (frontend); single source of truth.
4. **Zod-inferred types:** `type RegisterInput = z.infer<typeof registerSchema>` — schema and type stay in sync.
5. **Branded types** for IDs (e.g., `type UserId = string & { __brand: 'UserId' }`) — prevents mixing IDs at compile time.
6. **Path aliases** in `tsconfig.json` (`@/domain`, `@/application`) — cleaner imports.
7. **Async/await everywhere** — never mix `.then()` callbacks.
8. **Discriminated unions** for known error states; throw only domain errors caught by central middleware.
9. **Constructor injection** in use cases — never reach for module-level singletons.

### Naming conventions
- `camelCase` — variables, functions
- `PascalCase` — types, classes, React components
- `SCREAMING_SNAKE_CASE` — constants, env vars
- `kebab-case` — file names except React components

---

## 13. Logging & Observability

- **Logger:** `pino` — JSON output, redacts `req.headers.cookie`, `req.body.password`, `req.body.token`.
- **Request ID:** `requestId.mw` generates a UUID, attaches to `req.id`, included in every log line.
- **Access log:** method, path, status, duration, requestId, userId (if authenticated).
- **Error log:** stack + requestId; never log raw user input that could contain secrets.
- **Health check:** `GET /healthz` → `{ ok: true }` (no auth, used by load balancers).

---

## 14. Testing Strategy

| Layer          | Tooling                            | Scope                                       |
|----------------|------------------------------------|---------------------------------------------|
| Unit           | `vitest` + mocked repos            | Use case logic, validators, pure utilities  |
| Integration    | `vitest` + `supertest` + `:memory:` SQLite | Routes end-to-end (auth + CRUD + ownership) |
| Schema         | `vitest`                           | Zod schemas accept / reject correctly       |
| Frontend       | `vitest` + Testing Library         | Components, hooks, AuthContext              |
| E2E (optional) | Playwright                         | Login → create → update → delete flow       |

**Coverage targets:** use cases 100%, controllers 80%, repos 70%.

**Test DB:** spin up fresh SQLite per test file via `new Database(':memory:')` and run migrations.

**Must-have test cases:**
- Register rejects weak passwords and duplicate emails.
- Login returns generic error on wrong email vs wrong password.
- Cross-user todo access returns 404 (not 403 — don't leak existence).
- Expired / revoked JWT returns 401.
- Rate limiter blocks after 5 failed logins in 15 min.
- SQL injection payloads in title/description are stored as plain strings, not executed.

---

## 15. Performance & Token Optimization

| Layer       | Technique                                                       |
|-------------|-----------------------------------------------------------------|
| HTTP        | `compression` (gzip), `ETag` on GETs → `304 Not Modified`       |
| Payloads    | DTO mappers strip `password_hash`, internal flags               |
| List reads  | Cursor pagination (`?limit=20&cursor=<id>`)                     |
| Updates     | `PATCH` semantics — only persist provided fields                |
| DB          | Composite index on `(user_id, created_at DESC)`                 |
| DB          | Prepared statements cached at module load                       |
| DB          | `journal_mode = WAL` for concurrent reads                       |
| Bundle      | Frontend code-split per route, tree-shake Zod                   |
| Code        | Files under ~150 lines, one responsibility per file             |

---

## 16. Environment Variables

**backend/.env.example**
```env
NODE_ENV=development
PORT=4000
DB_PATH=./data/todo.db
JWT_SECRET=change_me_min_32_chars_random
JWT_ACCESS_TTL=15m
JWT_REFRESH_TTL=7d
CORS_ORIGIN=http://localhost:5173
COOKIE_SECURE=false   # true in production
LOG_LEVEL=info
BCRYPT_ROUNDS=12
```

**frontend/.env.example**
```env
VITE_API_URL=http://localhost:4000/api
```

**Boot-time validation:**
```ts
// infrastructure/config/env.ts
const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']),
  PORT: z.coerce.number().int().positive(),
  DB_PATH: z.string().min(1),
  JWT_SECRET: z.string().min(32),
  JWT_ACCESS_TTL: z.string(),
  JWT_REFRESH_TTL: z.string(),
  CORS_ORIGIN: z.string().url(),
  COOKIE_SECURE: z.coerce.boolean(),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  BCRYPT_ROUNDS: z.coerce.number().int().min(10).max(15),
});
export const env = schema.parse(process.env);
```

Fail fast at boot if any required var is missing or invalid.

---

## 17. Dependencies

### Backend runtime
`express`, `better-sqlite3`, `bcrypt`, `jsonwebtoken`, `zod`, `helmet`, `cors`, `cookie-parser`, `compression`, `express-rate-limit`, `pino`, `pino-http`, `dotenv`

### Backend dev
`typescript`, `tsx`, `vitest`, `supertest`, `eslint`, `prettier`, `@types/express`, `@types/jsonwebtoken`, `@types/bcrypt`, `@types/cookie-parser`, `@types/compression`, `@types/cors`

### Frontend runtime
`react`, `react-dom`, `react-router-dom`, `axios`, `zod`

### Frontend dev
`vite`, `@vitejs/plugin-react`, `typescript`, `tailwindcss`, `postcss`, `autoprefixer`, `vitest`, `@testing-library/react`, `@types/react`, `@types/react-dom`

---

## 18. Implementation Phases

### Phase 1 — Backend foundation
1. Init backend, install deps, configure TS strict mode.
2. SQLite + migrations runner; pragmas at boot.
3. Express app skeleton: `helmet`, `cors`, `cookie-parser`, JSON limit, `compression`.
4. Env validation with Zod (fail fast).
5. `requestId.mw` + `pino-http` access logger.

### Phase 2 — Domain & infrastructure
1. Domain entities, errors, repo interfaces.
2. `BcryptHasher`, `JwtTokenService`.
3. `SqliteUserRepo`, `SqliteTodoRepo` with prepared statements.
4. `composition.ts` wiring.

### Phase 3 — Authentication
1. Use cases: `RegisterUser`, `LoginUser`, `LogoutUser`, `GetMe`.
2. Auth routes + Zod schemas + controllers.
3. `requireAuth` middleware with blacklist check.
4. Rate limit on `/auth/*`.

### Phase 4 — Todos CRUD
1. Use cases: `CreateTodo`, `ListTodos`, `GetTodo`, `UpdateTodo`, `DeleteTodo`.
2. Ownership check inside every read/update/delete use case.
3. Routes + Zod schemas + controllers.
4. Cursor pagination on list.

### Phase 5 — Error handling & tests
1. Central error middleware (`ZodError` → 400, `DomainError` → mapped, else 500).
2. Unit tests for use cases (mocked repos).
3. Integration tests for routes (in-memory SQLite + supertest).
4. Schema accept/reject tests.

### Phase 6 — Frontend
1. Vite + React + Tailwind setup; dark-mode tokens.
2. `axios` instance with `withCredentials: true` + 401 redirect interceptor.
3. `AuthContext` + Login / Register pages with shared Zod schemas.
4. `<ProtectedRoute>`, `Dashboard` with optimistic CRUD.
5. `TodoDetail` page.
6. Toasts, skeletons, keyboard shortcuts, responsive polish.

### Phase 7 — Hardening
1. Manual security tests: ownership bypass attempts, SQL injection inputs, expired tokens, rate limits.
2. `npm audit --production` — resolve high/critical.
3. CSP review; log redaction check.
4. Lighthouse pass for performance & a11y.

---

## 19. Deployment Notes

- **Build:** `tsc` for backend, `vite build` for frontend.
- **Serve frontend statically** behind same origin (e.g., Express static or reverse proxy) to simplify cookies.
- **Reverse proxy** (nginx / Caddy) terminates TLS → enables `Secure` cookies in prod.
- **DB file** mounted on a persistent volume; back up via `sqlite3 .backup`.
- **Process manager:** `pm2` or `systemd`; restart on crash.
- **Cron job:** daily sweep of expired rows in `token_blacklist`:
  ```sql
  DELETE FROM token_blacklist WHERE expires_at < CURRENT_TIMESTAMP;
  ```
- **Logs:** ship pino JSON to stdout; aggregate via your platform of choice.
- **Health probe:** point load balancer at `/healthz`.

---

## 20. Quality Gates & Acceptance Checklist

### CI quality gates
- [ ] `tsc --noEmit` passes
- [ ] `eslint` passes
- [ ] All tests green (unit + integration + schema)
- [ ] `npm audit --production` — no high / critical
- [ ] Migrations apply cleanly to a fresh DB
- [ ] No `console.log` or `TODO` left in changed files

### Acceptance checklist
- [ ] User can register with valid credentials; weak passwords rejected
- [ ] User can log in; receives `httpOnly` `Secure` `SameSite=Strict` cookie
- [ ] User can log out; `jti` blacklisted; cookie cleared
- [ ] Authenticated user can create, read, update, delete their todos
- [ ] User cannot access another user's todos (returns 404, not 403)
- [ ] All inputs validated with Zod; bad payloads return 400 with field map
- [ ] Rate limits trigger on login brute-force (5 / 15 min)
- [ ] No secrets in git; `.env` ignored, `.env.example` committed
- [ ] TypeScript strict — no `any` in codebase
- [ ] UI responsive and usable on mobile (≤ 640 px), tablet, and desktop
- [ ] Dark mode works end-to-end
- [ ] Optimistic UI rolls back on failed mutations

---

## Appendix — Build & Run

```bash
# Backend
cd backend
cp .env.example .env
npm install
npm run migrate
npm run dev                 # development
npm run build && npm start  # production

# Frontend
cd frontend
cp .env.example .env
npm install
npm run dev                 # http://localhost:5173
npm run build               # production bundle in dist/
```

---

**Status:** Approved blueprint — ready for Phase 1 implementation.

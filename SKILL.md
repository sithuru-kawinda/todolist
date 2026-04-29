---
name: node
description: Build, test, secure, and deploy Node.js backends with Express, Fastify, and NestJS. Trigger on any request involving REST APIs, GraphQL, CLI tools, Microservices, API versioning, Docker backend patterns, integration testing, Zod validation, authentication, rate limiting, or files like *.router.ts, *.service.ts, *.controller.ts, docker-compose.yml.
---

# Node.js Backend Development Skill

**Node.js 22 LTS · Express / Fastify / NestJS · Security-first approach**

## References (Read Before Working)

Always read the relevant reference **before** writing code.

| Reference | When to Read |
|-----------|--------------|
| `references/project-setup.md` | Starting new project, configuring tsconfig, installing deps |
| `references/api-versioning/SKILL.md` | Designing versioned REST APIs (v1/v2, headers, URL prefix) |
| `references/zod-validation/SKILL.md` | Input validation schemas, request parsing, error formatting |
| `references/integration-testing/SKILL.md` | Writing integration tests with Supertest, Vitest, Jest |
| `references/docker-backend-patterns/SKILL.md` | Dockerfiles, docker-compose, multi-stage builds, networking |
| `references/rest-api.md` | Route design, status codes, pagination, error responses |
| `references/graphql.md` | Schema-first design, resolvers, DataLoader, subscriptions |
| `references/cli.md` | CLI tools with Commander.js / Yargs, prompts, exit codes |
| `references/microservices.md` | Service boundaries, message queues, health checks, tracing |
| `references/auth.md` | JWT, refresh tokens, OAuth2, session management |
| `references/security.md` | Helmet, CORS, rate limiting, injection prevention, audit |
| `references/database.md` | Prisma / Drizzle / Mongoose patterns, migrations, transactions |
| `references/error-handling.md` | Global error handlers, custom error classes, logging |
| `references/testing.md` | Unit tests, mocking, coverage targets |
| `references/deployment.md` | CI/CD, env config, health endpoints, graceful shutdown |
| `references/performance.md` | Clustering, caching, streaming, connection pooling |
| `references/commands.md` | npm / pnpm / node CLI reference |

---

## 1. Security Rules (NON-NEGOTIABLE)

These rules apply to **every** endpoint and service. No exceptions.

### Auth / JWT — Always

```ts
// ✅ Verify token on every protected route
const payload = jwt.verify(token, process.env.JWT_SECRET!, {
  algorithms: ["HS256"],
  issuer: "my-app",
  audience: "my-app-client",
});

// ✅ Short-lived access tokens + rotating refresh tokens
const accessToken  = jwt.sign(payload, secret, { expiresIn: "15m" });
const refreshToken = jwt.sign(payload, secret, { expiresIn: "7d" });

// ❌ NEVER trust client-supplied roles without DB verification
// ❌ NEVER store JWT in localStorage — use HttpOnly cookies
```

### Mandatory Checklist (Verify Before Every Commit)

- [ ] **Helmet** enabled on every Express/Fastify app
- [ ] **CORS** configured explicitly — no wildcard `*` in production
- [ ] **Rate limiting** on all auth and public endpoints
- [ ] **Zod (or equivalent)** validation on every request body, query, and param
- [ ] **JWT** verified server-side on every protected route — never trust payload blindly
- [ ] **Parameterized queries** everywhere — never string-interpolate SQL/NoSQL
- [ ] **Env vars** for all secrets — never hardcode, never commit `.env`
- [ ] **Error responses** never leak stack traces or internal details in production
- [ ] **Dependency audit** — `npm audit` / `pnpm audit` before deploy
- [ ] **Graceful shutdown** — drain connections on `SIGTERM`

### Critical Vulnerability Rules

| Vulnerability | Rule |
|---------------|------|
| **SQL / NoSQL injection** | Always use parameterized queries or ORM. Never interpolate user input. |
| **Auth bypass** | Verify JWT signature + expiry. Check `alg` — reject `"none"`. |
| **Broken auth** | Refresh token rotation + revocation list (Redis). |
| **Mass assignment** | Whitelist fields explicitly — never spread `req.body` into DB calls. |
| **Sensitive data exposure** | Strip passwords/secrets from all API responses and logs. |
| **Rate limiting abuse** | Apply per-IP and per-user limits on login, register, and reset endpoints. |
| **SSRF** | Validate and allowlist URLs before making server-side HTTP requests. |
| **Dependency vulnerabilities** | Pin versions, run `npm audit`, use Dependabot / Renovate. |

### Safe Patterns

```ts
// ✅ Parameterized SQL (Prisma)
const user = await prisma.user.findUnique({ where: { id: userId } });

// ✅ Parameterized SQL (raw)
await db.query("SELECT * FROM users WHERE id = $1", [userId]);

// ❌ NEVER interpolate
await db.query(`SELECT * FROM users WHERE id = '${userId}'`);

// ✅ Strip sensitive fields before response
const { password, refreshToken, ...safeUser } = user;
res.json(safeUser);

// ✅ Rate limiting (express-rate-limit)
app.use("/auth", rateLimit({ windowMs: 15 * 60 * 1000, max: 20 }));
```

---

## 2. Code Quality Standards (ALWAYS FOLLOW)

### Project Layout

```
src/
├── config/          # env parsing, constants
├── modules/         # feature modules (auth, users, orders…)
│   └── users/
│       ├── users.router.ts
│       ├── users.controller.ts
│       ├── users.service.ts
│       ├── users.schema.ts   # Zod schemas
│       └── users.test.ts
├── middleware/      # global middleware (auth, error, logging)
├── lib/             # shared utilities (db client, mailer, logger)
├── types/           # global TypeScript types/interfaces
└── app.ts           # app factory (no listen() here)
index.ts             # entry point — listen() + graceful shutdown
```

### Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Files | kebab-case | `user-profile.service.ts` |
| Classes | PascalCase | `UserService` |
| Interfaces / Types | PascalCase, `I` prefix for interfaces | `IUserService`, `UserDto` |
| Functions / methods | camelCase | `getUserById()` |
| Constants | UPPER_SNAKE_CASE | `MAX_LOGIN_ATTEMPTS` |
| Env vars | UPPER_SNAKE_CASE | `DATABASE_URL` |
| Zod schemas | camelCase + `Schema` suffix | `createUserSchema` |
| Routes | kebab-case, plural nouns | `/api/v1/user-profiles` |

### Import Rules

```ts
// ✅ Named imports — always
import { Router, Request, Response } from "express";
import { z } from "zod";

// ✅ Path aliases over deep relative paths
import { db } from "@/lib/db";

// ❌ Never
import express from "express"; // then use express.Router() — verbose
import { db } from "../../../../lib/db";
```

### Error Handling

```ts
// ✅ Custom typed error classes
class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "AppError";
  }
}

// ✅ Centralized error middleware (Express)
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ code: err.code, message: err.message });
  }
  // Never leak internals
  res.status(500).json({ code: "INTERNAL_ERROR", message: "Something went wrong" });
});

// ❌ Never throw raw strings or expose stack traces
res.status(500).json({ error: err.stack });
```

### Zod Validation (Every Request)

```ts
// ✅ Schema defined alongside route
const createUserSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8),
    role: z.enum(["user", "admin"]).default("user"),
  }),
});

// ✅ Validate in middleware — never in business logic
const validate = (schema: AnyZodObject) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await schema.safeParseAsync({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    if (!result.success) {
      return res.status(400).json({ errors: result.error.flatten() });
    }
    next();
  };
```

### JSDoc / TSDoc (Required on All Public Functions & Classes)

```ts
/**
 * Retrieves a user by their unique ID.
 * @param id - UUID of the user
 * @returns The user record, or null if not found
 * @throws {AppError} 404 if user does not exist
 */
async function getUserById(id: string): Promise<User | null> { ... }
```

---

## 3. API Design Standards

### REST

```ts
// ✅ Versioned, resource-oriented routes
GET    /api/v1/users          // list (paginated)
POST   /api/v1/users          // create
GET    /api/v1/users/:id      // get one
PATCH  /api/v1/users/:id      // partial update
DELETE /api/v1/users/:id      // delete

// ✅ Consistent response envelope
res.status(200).json({ data: user, meta: { requestId } });
res.status(201).json({ data: newUser });
res.status(400).json({ code: "VALIDATION_ERROR", errors: [...] });

// ✅ Pagination
GET /api/v1/users?page=2&limit=20
// Response: { data: [...], meta: { page, limit, total, totalPages } }
```

### GraphQL

```ts
// ✅ Schema-first — define SDL before resolvers
// ✅ Use DataLoader to batch & cache DB calls — prevent N+1
// ✅ Depth limiting + query complexity limits in production
// ✅ Never expose internal errors in GraphQL error extensions
```

> **Deep dive:** `references/graphql.md`

---

## 4. Testing Standards

### Required Coverage

- **Unit tests** for every service method (happy path + all error paths)
- **Integration tests** for every route (real HTTP via Supertest, test DB)
- **Validation tests** — assert Zod schemas reject bad input
- **Auth tests** — assert protected routes reject missing/invalid tokens
- **Target: >90% branch coverage**

### Test Naming

```
describe("UsersService", () => {
  it("getUserById — returns user when found")
  it("getUserById — throws 404 when not found")
  it("createUser — hashes password before saving")
  it("createUser — throws 409 when email already exists")
})

// Integration
describe("POST /api/v1/users", () => {
  it("201 — creates user with valid payload")
  it("400 — rejects missing email")
  it("409 — rejects duplicate email")
  it("401 — rejects unauthenticated request")
})
```

### Test Rules

1. **Isolate** — mock external services (DB, email, HTTP) in unit tests
2. **Real DB** — use a test database or in-memory DB for integration tests; never mock the ORM
3. **Seed & teardown** — reset state between tests; never share state across test files
4. **Assert response shape** — check status code, body structure, and headers
5. **Test unhappy paths** — invalid input, missing auth, DB errors, third-party failures

> **Templates:** `references/integration-testing/SKILL.md` and `references/testing.md`

---

## 5. Development Workflow

1. **Read relevant references** from the table above.
2. **Setup** — init project, configure `tsconfig.json`, install deps → `references/project-setup.md`
3. **Define schemas first** — Zod schemas and TypeScript types before implementation.
4. **Implement** — follow Section 2 layout and naming strictly.
5. **Write tests alongside code** — per route and per service method.
6. **Lint + format** after every file — `eslint --fix` + `prettier --write`.
7. **Build frequently** — `tsc --noEmit` to catch type errors immediately.
8. **Run tests** after each logical change — `vitest run` or `jest`.
9. **Security check** — walk Section 1 checklist before any PR.
10. **Docker** — verify `docker compose up` works before pushing → `references/docker-backend-patterns/SKILL.md`
11. **Deploy** — env config, health check, graceful shutdown → `references/deployment.md`

### Common Errors

| Error | Fix |
|-------|-----|
| `Cannot find module` | Check `tsconfig` paths + `moduleResolution`. Rebuild aliases. |
| JWT `invalid signature` | Ensure same secret signs and verifies. Check env var loading. |
| Zod parse errors in prod | Confirm middleware runs before route handler. Check schema shape. |
| CORS blocked | Set `origin` explicitly. Check preflight `OPTIONS` handler. |
| DB connection exhausted | Check pool size config. Ensure connections close on shutdown. |
| Docker networking issue | Use service names not `localhost` inside compose network. |

---

## 6. Framework-Specific Notes

### Express
- Always use `express-async-errors` or wrap async handlers — unhandled promise rejections crash the process.
- Mount global error handler **last**, after all routes.

### Fastify
- Use `fastify-plugin` for shared decorators and hooks.
- Prefer built-in schema validation (`ajv`) for raw speed; layer Zod on top for rich types.

### NestJS
- Use `ValidationPipe` globally with `whitelist: true, forbidNonWhitelisted: true`.
- Prefer `class-validator` + `class-transformer` (NestJS native) or bridge Zod via `nestjs-zod`.
- Guard > Interceptor > Pipe > Filter — understand the request lifecycle order.

---

## 7. Docker & Deployment Standards

```dockerfile
# ✅ Multi-stage build — keep production image minimal
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

- **Never** run as root in containers — add `USER node`
- **Health check** — expose `GET /health` returning `200 { status: "ok" }`
- **Graceful shutdown** — listen for `SIGTERM`, drain in-flight requests, close DB pool

> **Deep dive:** `references/docker-backend-patterns/SKILL.md`
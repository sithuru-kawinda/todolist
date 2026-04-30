---
name: todo-app-security
description: >
  Use this skill whenever a developer wants to add, implement, or improve security
  features in a React + TypeScript todo application. Trigger on any request involving:
  securing a todo app, adding login/signup flows, protecting routes or API endpoints,
  implementing role-based access control, encrypting data, or validating/sanitizing
  user input in a React/TypeScript frontend. Also trigger when the user asks to
  "lock down" their app, "add auth", "protect routes", or "make the app secure".
  Always use this skill even if the user only mentions one aspect of security —
  the full security checklist ensures nothing critical is missed.
---

# Todo App Security Skill

A comprehensive guide for implementing production-grade security in a **React + TypeScript** todo application. Covers authentication, authorization, data encryption, and input validation end-to-end.

---

## Security Architecture Overview

```
┌─────────────────────────────────────────────────┐
│                  React + TS Frontend             │
│  ┌─────────────┐  ┌──────────┐  ┌────────────┐  │
│  │  Auth Layer │  │ Protected│  │  Input     │  │
│  │  (JWT/OAuth)│  │  Routes  │  │  Sanitizer │  │
│  └─────────────┘  └──────────┘  └────────────┘  │
└───────────────────────┬─────────────────────────┘
                        │ HTTPS only
┌───────────────────────▼─────────────────────────┐
│                   API / Backend                  │
│  ┌──────────────┐  ┌──────────┐  ┌───────────┐  │
│  │  Auth Middle │  │  RBAC    │  │ Encrypted │  │
│  │  ware        │  │  Guards  │  │ Storage   │  │
│  └──────────────┘  └──────────┘  └───────────┘  │
└─────────────────────────────────────────────────┘
```

---

## 1. Authentication (Login / Signup)

### Recommended Approach
Use **JWT (JSON Web Tokens)** with short-lived access tokens + refresh token rotation.

### TypeScript Types
```typescript
// types/auth.ts
export interface User {
  id: string;
  email: string;
  role: 'admin' | 'member' | 'viewer';
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;   // short-lived: 15 min
  refreshToken: string;  // long-lived: 7 days, HttpOnly cookie
}

export interface LoginCredentials {
  email: string;
  password: string;
}
```

### Auth Context (React)
```typescript
// context/AuthContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginCredentials } from '../types/auth';
import { authApi } from '../api/authApi';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Validate existing session on app mount
    authApi.me()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (credentials: LoginCredentials) => {
    const { user } = await authApi.login(credentials);
    setUser(user);
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
```

### Security Rules for Auth
- ✅ Store `accessToken` in **memory only** (not localStorage)
- ✅ Store `refreshToken` in **HttpOnly, Secure, SameSite=Strict** cookie
- ✅ Never log tokens or passwords
- ✅ Hash passwords with **bcrypt** (cost factor ≥ 12) on the backend
- ✅ Implement rate limiting on `/login` (e.g., 5 attempts per 15 min)
- ❌ Never store sensitive data in `localStorage` or `sessionStorage`

---

## 2. Authorization — Role-Based Access Control (RBAC)

### Role Definitions
```typescript
// types/rbac.ts
export type Role = 'admin' | 'member' | 'viewer';

export const PERMISSIONS = {
  admin:  ['read', 'write', 'delete', 'manage_users'] as const,
  member: ['read', 'write'] as const,
  viewer: ['read'] as const,
} satisfies Record<Role, readonly string[]>;

export type Permission = typeof PERMISSIONS[Role][number];
```

### `usePermission` Hook
```typescript
// hooks/usePermission.ts
import { useAuth } from '../context/AuthContext';
import { PERMISSIONS, Permission } from '../types/rbac';

export const usePermission = (permission: Permission): boolean => {
  const { user } = useAuth();
  if (!user) return false;
  return (PERMISSIONS[user.role] as readonly string[]).includes(permission);
};
```

### Protected Route Component
```typescript
// components/ProtectedRoute.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePermission } from '../hooks/usePermission';
import { Permission } from '../types/rbac';

interface Props {
  requiredPermission?: Permission;
  redirectTo?: string;
}

export const ProtectedRoute = ({
  requiredPermission,
  redirectTo = '/login',
}: Props) => {
  const { isAuthenticated, isLoading } = useAuth();
  const hasPermission = usePermission(requiredPermission ?? 'read');

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <Navigate to={redirectTo} replace />;
  if (requiredPermission && !hasPermission) return <Navigate to="/unauthorized" replace />;

  return <Outlet />;
};
```

### Router Setup
```typescript
// App.tsx (route config)
<Routes>
  <Route path="/login" element={<LoginPage />} />
  
  {/* All authenticated routes */}
  <Route element={<ProtectedRoute />}>
    <Route path="/todos" element={<TodoList />} />
    
    {/* Admin-only routes */}
    <Route element={<ProtectedRoute requiredPermission="manage_users" />}>
      <Route path="/admin" element={<AdminPanel />} />
    </Route>

    {/* Write-access routes */}
    <Route element={<ProtectedRoute requiredPermission="write" />}>
      <Route path="/todos/new" element={<CreateTodo />} />
    </Route>
  </Route>
</Routes>
```

---

## 3. Data Encryption

### Encryption at Rest (Sensitive Fields)
Use the **Web Crypto API** for client-side encryption of sensitive todo content:

```typescript
// utils/encryption.ts
const ALGORITHM = { name: 'AES-GCM', length: 256 };

export const generateKey = async (): Promise<CryptoKey> => {
  return crypto.subtle.generateKey(ALGORITHM, true, ['encrypt', 'decrypt']);
};

export const encryptText = async (text: string, key: CryptoKey): Promise<string> => {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(text);
  const encrypted = await crypto.subtle.encrypt({ ...ALGORITHM, iv }, key, encoded);
  // Combine iv + ciphertext → base64
  const combined = new Uint8Array([...iv, ...new Uint8Array(encrypted)]);
  return btoa(String.fromCharCode(...combined));
};

export const decryptText = async (ciphertext: string, key: CryptoKey): Promise<string> => {
  const combined = Uint8Array.from(atob(ciphertext), c => c.charCodeAt(0));
  const iv = combined.slice(0, 12);
  const data = combined.slice(12);
  const decrypted = await crypto.subtle.decrypt({ ...ALGORITHM, iv }, key, data);
  return new TextDecoder().decode(decrypted);
};
```

### Encryption Rules
- ✅ Always use **HTTPS** (TLS 1.2+) for data in transit
- ✅ Encrypt sensitive todo fields (e.g., notes, attachments) before sending to the API
- ✅ Use a **per-user derived key** (never hardcode keys)
- ✅ Store encryption keys server-side or derive from user password using PBKDF2
- ❌ Never store raw encryption keys in localStorage

---

## 4. Input Validation & Sanitization

### Validation with Zod
```typescript
// schemas/todoSchema.ts
import { z } from 'zod';

export const todoSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title too long')
    .trim()
    .regex(/^[^<>{}]*$/, 'Invalid characters in title'),  // block XSS chars

  description: z
    .string()
    .max(2000)
    .trim()
    .optional(),

  dueDate: z
    .string()
    .datetime({ message: 'Invalid date format' })
    .optional(),

  priority: z.enum(['low', 'medium', 'high']),
});

export type TodoInput = z.infer<typeof todoSchema>;
```

### Sanitized Form Component
```typescript
// components/TodoForm.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { todoSchema, TodoInput } from '../schemas/todoSchema';
import DOMPurify from 'dompurify';

export const TodoForm = ({ onSubmit }: { onSubmit: (data: TodoInput) => void }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<TodoInput>({
    resolver: zodResolver(todoSchema),
  });

  const handleFormSubmit = (data: TodoInput) => {
    // Extra XSS sanitization before submission
    const sanitized: TodoInput = {
      ...data,
      title: DOMPurify.sanitize(data.title),
      description: data.description ? DOMPurify.sanitize(data.description) : undefined,
    };
    onSubmit(sanitized);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <input {...register('title')} placeholder="Todo title" />
      {errors.title && <span role="alert">{errors.title.message}</span>}

      <textarea {...register('description')} placeholder="Description (optional)" />
      {errors.description && <span role="alert">{errors.description.message}</span>}

      <button type="submit">Add Todo</button>
    </form>
  );
};
```

### Required Packages
```bash
npm install zod @hookform/resolvers react-hook-form dompurify
npm install -D @types/dompurify
```

---

## 5. Secure API Client

```typescript
// api/client.ts
import axios from 'axios';

let accessToken: string | null = null;

// Called after login to store token in memory
export const setAccessToken = (token: string) => { accessToken = token; };
export const clearAccessToken = () => { accessToken = null; };

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,  // send HttpOnly refresh token cookie
  headers: { 'Content-Type': 'application/json' },
});

// Attach access token to every request
apiClient.interceptors.request.use(config => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Auto-refresh token on 401
apiClient.interceptors.response.use(
  res => res,
  async error => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const { data } = await axios.post('/auth/refresh', {}, { withCredentials: true });
        setAccessToken(data.accessToken);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return apiClient(original);
      } catch {
        clearAccessToken();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
```

---

## 6. Security Checklist

Before shipping, verify all items below:

### Authentication
- [ ] Passwords hashed with bcrypt (≥12 rounds) on backend
- [ ] Access tokens stored in memory only (not localStorage)
- [ ] Refresh tokens in HttpOnly + Secure + SameSite=Strict cookies
- [ ] Token refresh logic implemented
- [ ] Rate limiting on login endpoint

### Authorization
- [ ] All routes wrapped in `<ProtectedRoute>`
- [ ] RBAC roles enforced both client-side AND server-side
- [ ] Users can only access their own todos (ownership check on API)

### Encryption
- [ ] HTTPS enforced (redirect HTTP → HTTPS)
- [ ] Sensitive fields encrypted before storage
- [ ] No hardcoded secrets in frontend code (use `.env` + `VITE_` prefix)

### Input Validation
- [ ] All forms validated with Zod schemas
- [ ] HTML sanitized with DOMPurify before rendering user content
- [ ] API responses validated before use (don't trust backend blindly)

### General
- [ ] `Content-Security-Policy` headers set on server
- [ ] Dependencies audited: `npm audit`
- [ ] No sensitive data in URL query params or console logs

---

## Common Pitfalls to Avoid

| Mistake | Fix |
|---|---|
| Storing JWT in `localStorage` | Store in memory; refresh token in HttpOnly cookie |
| Only checking auth on the frontend | Always verify token server-side on every API call |
| Rendering raw user input as HTML | Use DOMPurify or render as plain text |
| Exposing admin routes by URL guessing | Enforce permissions on API, not just UI |
| Using `Math.random()` for tokens | Use `crypto.getRandomValues()` or server-side UUID |

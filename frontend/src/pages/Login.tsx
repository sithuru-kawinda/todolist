import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { loginSchema } from '../schemas/auth.schema.js';
import { Input } from '../components/ui/Input.js';
import { Button } from '../components/ui/Button.js';

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setServerError(null);

    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors({ email: fieldErrors.email?.[0], password: fieldErrors.password?.[0] });
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/');
    } catch {
      setServerError('Invalid credentials. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4 dark:bg-black">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-2">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-600 text-2xl font-bold text-white">✓</div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">TodoApp</h1>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-zinc-900 sm:p-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Welcome back</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">Sign in to continue.</p>
          </div>

          <form onSubmit={onSubmit} noValidate className="space-y-4">
            <Input
              id="email"
              type="email"
              label="Email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              error={errors.email}
              required
            />
            <Input
              id="password"
              type="password"
              label="Password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              error={errors.password}
              required
            />

            {serverError && (
              <p role="alert" className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">
                {serverError}
              </p>
            )}

            <Button type="submit" loading={submitting} className="w-full mt-2">
              Sign in
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-gray-500 dark:text-zinc-400">
            No account?{' '}
            <Link to="/register" className="font-semibold text-red-600 hover:underline underline-offset-4">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

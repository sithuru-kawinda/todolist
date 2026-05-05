import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { loginSchema } from '../schemas/auth.schema.js';

function UserIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5zm0 2c-3.337 0-10 1.676-10 5v2h20v-2c0-3.324-6.663-5-10-5z" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18 8h-1V6c0-2.761-2.239-5-5-5S7 3.239 7 6v2H6c-1.105 0-2 .895-2 2v10c0 1.105.895 2 2 2h12c1.105 0 2-.895 2-2V10c0-1.105-.895-2-2-2zm-6 9c-1.105 0-2-.895-2-2s.895-2 2-2 2 .895 2 2-.895 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
    </svg>
  );
}

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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4" style={{ background: 'radial-gradient(ellipse at 60% 40%, #1a5a8a 0%, #113F67 40%, #0a2440 100%)' }}>
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full opacity-20 blur-3xl" style={{ backgroundColor: '#1a5a8a' }} />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full opacity-15 blur-3xl" style={{ backgroundColor: '#113F67' }} />
      <div className="relative z-10 w-full max-w-sm">
        {/* Avatar overlapping card top */}
        <div className="flex justify-center">
          <div className="relative z-10 mb-[-2.5rem] flex h-20 w-20 items-center justify-center rounded-full bg-red-600 border-4 border-black shadow-lg shadow-red-900/50">
            <span className="sr-only">User avatar</span>
            <svg className="h-10 w-10 text-white" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5zm0 2c-3.337 0-10 1.676-10 5v2h20v-2c0-3.324-6.663-5-10-5z" />
            </svg>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/10 bg-white/5 px-8 pb-8 pt-14 shadow-2xl backdrop-blur-md">
          <h2 className="mb-6 text-center text-2xl font-bold tracking-widest text-white uppercase">
            LOGIN
          </h2>

          <form onSubmit={onSubmit} noValidate className="space-y-4">
            {/* Email */}
            <div>
              <div className={`flex items-center overflow-hidden rounded-lg bg-white/10 ${errors.email ? 'ring-2 ring-red-500' : 'ring-1 ring-white/10'}`}>
                <span className="pl-3 text-red-500 shrink-0"><UserIcon /></span>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  autoComplete="email"
                  required
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                  className="flex-1 bg-transparent px-3 py-3 text-sm text-white placeholder:text-gray-400 focus:outline-none"
                />
              </div>
              {errors.email && (
                <p id="email-error" role="alert" className="mt-1 text-xs text-red-500">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className={`flex items-center overflow-hidden rounded-lg bg-white/10 ${errors.password ? 'ring-2 ring-red-500' : 'ring-1 ring-white/10'}`}>
                <span className="pl-3 text-red-500 shrink-0"><LockIcon /></span>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  autoComplete="current-password"
                  required
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? 'password-error' : undefined}
                  className="flex-1 bg-transparent px-3 py-3 text-sm text-white placeholder:text-gray-400 focus:outline-none"
                />
              </div>
              {errors.password && (
                <p id="password-error" role="alert" className="mt-1 text-xs text-red-500">{errors.password}</p>
              )}
            </div>

            {/* Remember me */}
            <div className="flex items-center gap-2">
              <input type="checkbox" id="remember" className="h-4 w-4 rounded accent-red-600" />
              <label htmlFor="remember" className="select-none text-sm text-gray-300">
                Remember me
              </label>
            </div>

            {serverError && (
              <p role="alert" className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">
                {serverError}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="mt-2 w-full rounded-full bg-red-600 py-3 text-sm font-bold tracking-widest text-white uppercase transition hover:bg-red-500 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? (
                <svg className="mx-auto h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              ) : 'LOGIN'}
            </button>
          </form>

          <p className="mt-4 text-center text-xs text-gray-400">
            Forgot Username / Password?
          </p>

          <p className="mt-4 text-center text-sm text-gray-400">
            No account?{' '}
            <Link to="/register" className="font-semibold text-red-600 hover:underline underline-offset-4">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

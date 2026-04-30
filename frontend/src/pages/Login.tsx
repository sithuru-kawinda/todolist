import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await login(email, password);
      navigate('/');
    } catch {
      setError('Invalid credentials. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-950 via-indigo-800 to-violet-700 p-4">
      {/* decorative blobs */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-indigo-500/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-violet-500/30 blur-3xl" />

      <div className="relative w-full max-w-sm">
        {/* logo */}
        <div className="mb-6 flex flex-col items-center gap-2">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-3xl shadow-lg backdrop-blur-sm">
            ✓
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">TodoApp</h1>
        </div>

        {/* card */}
        <div className="rounded-2xl bg-white/10 p-8 shadow-2xl backdrop-blur-md ring-1 ring-white/20">
          <div className="mb-6 space-y-1">
            <h2 className="text-xl font-semibold text-white">Welcome back</h2>
            <p className="text-sm text-indigo-200">Sign in to continue to your tasks.</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-sm font-medium text-indigo-100">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2.5 text-sm text-white placeholder:text-indigo-300 backdrop-blur-sm transition focus:border-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-sm font-medium text-indigo-100">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2.5 text-sm text-white placeholder:text-indigo-300 backdrop-blur-sm transition focus:border-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
                required
              />
            </div>

            {error && (
              <p
                role="alert"
                className="rounded-lg bg-red-500/20 px-3 py-2 text-sm text-red-200 ring-1 ring-red-400/30"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="mt-2 w-full rounded-lg bg-gradient-to-r from-indigo-400 to-violet-400 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:from-indigo-300 hover:to-violet-300 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-white/50"
            >
              {submitting ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-indigo-200">
            No account?{' '}
            <Link
              to="/register"
              className="font-semibold text-white underline-offset-4 hover:underline"
            >
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

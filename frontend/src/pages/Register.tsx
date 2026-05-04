import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { registerSchema } from '../schemas/auth.schema.js';

function UserIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5zm0 2c-3.337 0-10 1.676-10 5v2h20v-2c0-3.324-6.663-5-10-5z" />
    </svg>
  );
}

function EnvelopeIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20 4H4C2.9 4 2 4.9 2 6v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z" />
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

function passwordStrength(p: string): number {
  let s = 0;
  if (p.length >= 8) s++;
  if (/[A-Z]/.test(p)) s++;
  if (/[a-z]/.test(p)) s++;
  if (/[0-9]/.test(p)) s++;
  if (/[^A-Za-z0-9]/.test(p)) s++;
  return s;
}

const STRENGTH_COLOR = ['bg-gray-200 dark:bg-zinc-700', 'bg-red-500', 'bg-orange-500', 'bg-yellow-400', 'bg-lime-500', 'bg-green-500'];
const STRENGTH_LABEL = ['', 'Very weak', 'Weak', 'Fair', 'Strong', 'Very strong'];

export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [values, setValues] = useState({ username: '', email: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const strength = passwordStrength(values.password);

  function set(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement>) => setValues((v) => ({ ...v, [field]: e.target.value }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setServerError(null);

    const result = registerSchema.safeParse(values);
    if (!result.success) {
      const flat = result.error.flatten().fieldErrors;
      setErrors(Object.fromEntries(Object.entries(flat).map(([k, v]) => [k, v?.[0] ?? ''])));
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      await register(values.username, values.email, values.password);
      navigate('/');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: { message?: string } } } };
      setServerError(e.response?.data?.error?.message ?? 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4" style={{ background: 'radial-gradient(ellipse at 60% 40%, #1a5a8a 0%, #113F67 40%, #0a2440 100%)' }}>
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full opacity-20 blur-3xl" style={{ backgroundColor: '#1a5a8a' }} />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full opacity-15 blur-3xl" style={{ backgroundColor: '#113F67' }} />
      <div className="relative z-10 w-full max-w-sm">
        <div className="rounded-2xl border border-white/10 bg-white/5 px-8 py-8 shadow-2xl backdrop-blur-md">
          <h2 className="mb-6 text-center text-2xl font-bold tracking-widest text-white uppercase">
            SIGN UP
          </h2>

          <form onSubmit={onSubmit} noValidate className="space-y-4">
            {/* Username */}
            <div>
              <div className={`flex items-center overflow-hidden rounded-lg bg-white/10 ring-1 ring-white/10 ${errors['username'] ? 'ring-2 ring-red-500' : ''}`}>
                <span className="pl-3 text-red-500 shrink-0"><UserIcon /></span>
                <input
                  id="username"
                  value={values.username}
                  onChange={set('username')}
                  placeholder="Username"
                  autoComplete="username"
                  required
                  aria-invalid={!!errors['username']}
                  aria-describedby={errors['username'] ? 'username-error' : undefined}
                  className="flex-1 bg-transparent px-3 py-3 text-sm text-white placeholder:text-gray-400 focus:outline-none"
                />
              </div>
              {errors['username'] && (
                <p id="username-error" role="alert" className="mt-1 text-xs text-red-500">{errors['username']}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <div className={`flex items-center overflow-hidden rounded-lg bg-white/10 ring-1 ring-white/10 ${errors['email'] ? 'ring-2 ring-red-500' : ''}`}>
                <span className="pl-3 text-red-500 shrink-0"><EnvelopeIcon /></span>
                <input
                  id="email"
                  type="email"
                  value={values.email}
                  onChange={set('email')}
                  placeholder="E-mail"
                  autoComplete="email"
                  required
                  aria-invalid={!!errors['email']}
                  aria-describedby={errors['email'] ? 'email-error' : undefined}
                  className="flex-1 bg-transparent px-3 py-3 text-sm text-white placeholder:text-gray-400 focus:outline-none"
                />
              </div>
              {errors['email'] && (
                <p id="email-error" role="alert" className="mt-1 text-xs text-red-500">{errors['email']}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className={`flex items-center overflow-hidden rounded-lg bg-white/10 ring-1 ring-white/10 ${errors['password'] ? 'ring-2 ring-red-500' : ''}`}>
                <span className="pl-3 text-red-500 shrink-0"><LockIcon /></span>
                <input
                  id="password"
                  type="password"
                  value={values.password}
                  onChange={set('password')}
                  placeholder="Password"
                  autoComplete="new-password"
                  required
                  aria-invalid={!!errors['password']}
                  aria-describedby={errors['password'] ? 'password-error' : undefined}
                  className="flex-1 bg-transparent px-3 py-3 text-sm text-white placeholder:text-gray-400 focus:outline-none"
                />
              </div>
              {errors['password'] && (
                <p id="password-error" role="alert" className="mt-1 text-xs text-red-500">{errors['password']}</p>
              )}
              <div
                role="progressbar"
                aria-valuenow={strength}
                aria-valuemin={0}
                aria-valuemax={5}
                aria-label={`Password strength: ${STRENGTH_LABEL[strength] || 'empty'}`}
                className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/20"
              >
                <div
                  className={`h-full rounded-full transition-all ${STRENGTH_COLOR[strength]}`}
                  style={{ width: `${(strength / 5) * 100}%` }}
                />
              </div>
              {values.password && (
                <p className="mt-1 text-xs text-gray-300">{STRENGTH_LABEL[strength]}</p>
              )}
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
              ) : 'CREATE ACCOUNT'}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-gray-300">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-red-600 hover:underline underline-offset-4">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );

}

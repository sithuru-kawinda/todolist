import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { registerSchema } from '../schemas/auth.schema.js';
import { Input } from '../components/ui/Input.js';
import { Button } from '../components/ui/Button.js';

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
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4 dark:bg-black">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-2">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-600 text-2xl font-bold text-white">✓</div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">TodoApp</h1>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-zinc-900 sm:p-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Create account</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">Just a few details to get started.</p>
          </div>

          <form onSubmit={onSubmit} noValidate className="space-y-4">
            <Input id="username" label="Username" autoComplete="username" value={values.username} onChange={set('username')} placeholder="johndoe" error={errors['username']} required />
            <Input id="email" type="email" label="Email" autoComplete="email" value={values.email} onChange={set('email')} placeholder="you@example.com" error={errors['email']} required />

            <div>
              <Input id="password" type="password" label="Password" autoComplete="new-password" value={values.password} onChange={set('password')} placeholder="••••••••" error={errors['password']} required />
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-200 dark:bg-zinc-700">
                <div className={`h-full rounded-full transition-all ${STRENGTH_COLOR[strength]}`} style={{ width: `${(strength / 5) * 100}%` }} />
              </div>
              {values.password && (
                <p className="mt-1 text-xs text-gray-500 dark:text-zinc-400">{STRENGTH_LABEL[strength]}</p>
              )}
            </div>

            {serverError && (
              <p role="alert" className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">
                {serverError}
              </p>
            )}

            <Button type="submit" loading={submitting} className="w-full mt-2">
              Create account
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-gray-500 dark:text-zinc-400">
            Already have one?{' '}
            <Link to="/login" className="font-semibold text-red-600 hover:underline underline-offset-4">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

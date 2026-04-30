import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'ghost' | 'icon';
  loading?: boolean;
}

export function Button({ children, variant = 'primary', loading, disabled, className = '', ...rest }: ButtonProps) {
  const base = 'inline-flex items-center justify-center font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-0 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60';

  const variants = {
    primary: 'rounded-full bg-red-600 px-5 py-2.5 text-sm text-white hover:bg-red-500 focus:ring-red-400',
    ghost: 'rounded-lg border border-gray-300 dark:border-zinc-700 px-3 py-1.5 text-sm text-gray-600 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 focus:ring-gray-400',
    icon: 'h-11 w-11 rounded-full bg-red-600 text-xl text-white hover:bg-red-500 focus:ring-red-400',
  };

  return (
    <button
      {...rest}
      disabled={disabled ?? loading}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {loading ? (
        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      ) : children}
    </button>
  );
}

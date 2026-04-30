import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  id: string;
}

export function Input({ label, error, id, className = '', ...rest }: InputProps) {
  const errorId = error ? `${id}-error` : undefined;
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-zinc-300">
          {label}
        </label>
      )}
      <input
        {...rest}
        id={id}
        aria-describedby={errorId}
        aria-invalid={!!error}
        className={`w-full rounded-full bg-gray-100 px-5 py-3 text-base text-gray-900 placeholder:text-gray-400 transition focus:outline-none focus:ring-2 focus:ring-red-600 dark:bg-zinc-800 dark:text-white dark:placeholder:text-zinc-500 ${error ? 'ring-2 ring-red-500' : ''} ${className}`}
      />
      {error && (
        <p id={errorId} role="alert" className="text-xs text-red-500 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}

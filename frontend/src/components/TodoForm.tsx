import { useState, type FormEvent } from 'react';
import { Button } from './ui/Button.js';

interface TodoFormProps {
  onAdd: (title: string) => void;
}

export function TodoForm({ onAdd }: TodoFormProps) {
  const [title, setTitle] = useState('');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const t = title.trim();
    if (!t) return;
    setTitle('');
    onAdd(t);
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 sm:gap-3">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Add Task"
        aria-label="New task title"
        className="min-w-0 flex-1 rounded-full bg-gray-100 px-5 py-3 text-base text-gray-900 placeholder:text-gray-400 transition focus:outline-none focus:ring-2 focus:ring-red-600 dark:bg-zinc-900 dark:text-white dark:placeholder:text-zinc-500"
      />
      <Button type="submit" variant="icon" aria-label="Add task">+</Button>
    </form>
  );
}

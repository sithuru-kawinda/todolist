import { useState, useEffect, type FormEvent, type ChangeEvent } from 'react';
import { useParams, Link } from 'react-router-dom';
import { todosApi } from '../api/todos.api.js';
import { useToast } from '../context/ToastContext.js';
import { useTheme } from '../hooks/useTheme.js';
import { Button } from '../components/ui/Button.js';
import type { Todo } from '../types/models.js';

function BackIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path fillRule="evenodd" d="M11.03 3.97a.75.75 0 0 1 0 1.06l-6.22 6.22H21a.75.75 0 0 1 0 1.5H4.81l6.22 6.22a.75.75 0 1 1-1.06 1.06l-7.5-7.5a.75.75 0 0 1 0-1.06l7.5-7.5a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
      <path d="M12 2.25a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75ZM7.5 12a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM18.894 6.166a.75.75 0 0 0-1.06-1.06l-1.591 1.59a.75.75 0 1 0 1.06 1.061l1.591-1.59ZM21.75 12a.75.75 0 0 1-.75.75h-2.25a.75.75 0 0 1 0-1.5H21a.75.75 0 0 1 .75.75ZM17.834 18.894a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 1 0-1.061 1.06l1.59 1.591ZM12 18a.75.75 0 0 1 .75.75V21a.75.75 0 0 1-1.5 0v-2.25A.75.75 0 0 1 12 18ZM7.758 17.303a.75.75 0 0 0-1.061-1.06l-1.591 1.59a.75.75 0 0 0 1.06 1.061l1.592-1.59ZM6 12a.75.75 0 0 1-.75.75H3a.75.75 0 0 1 0-1.5h2.25A.75.75 0 0 1 6 12ZM6.697 7.757a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 0 0-1.061 1.06l1.59 1.592Z" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
      <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 0 1 .162.819A8.97 8.97 0 0 0 9 6a9 9 0 0 0 9 9 8.97 8.97 0 0 0 3.463-.69.75.75 0 0 1 .981.98 10.503 10.503 0 0 1-9.694 6.46c-5.799 0-10.5-4.7-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 0 1 .818.162Z" clipRule="evenodd" />
    </svg>
  );
}

type PageState = 'loading' | 'found' | 'error';

export function TodoDetail() {
  const { id } = useParams<{ id: string }>();
  const { addToast } = useToast();
  const { dark, toggle } = useTheme();

  const [todo, setTodo] = useState<Todo | null>(null);
  const [pageState, setPageState] = useState<PageState>('loading');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    todosApi.getOne(id)
      .then((t) => {
        setTodo(t);
        setTitle(t.title);
        setDescription(t.description ?? '');
        setPageState('found');
      })
      .catch(() => setPageState('error'));
  }, [id]);

  async function onSave(e: FormEvent) {
    e.preventDefault();
    if (!id || !title.trim()) return;
    setSaving(true);
    try {
      const updated = await todosApi.update(id, {
        title: title.trim(),
        description: description.trim() || null,
      });
      setTodo(updated);
      addToast('Changes saved', 'success');
    } catch {
      addToast('Failed to save changes', 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 dark:bg-black dark:text-white">
      <header className="flex items-center justify-between border-b border-gray-200 px-4 py-4 dark:border-zinc-800 sm:px-6">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-red-600 rounded"
        >
          <BackIcon /> All tasks
        </Link>
        <button
          onClick={toggle}
          aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
          className="flex h-9 w-9 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-100 dark:text-zinc-400 dark:hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-red-600"
        >
          {dark ? <SunIcon /> : <MoonIcon />}
        </button>
      </header>

      <main className="mx-auto w-full max-w-xl px-4 py-6 sm:px-6">
        {pageState === 'loading' && (
          <div className="space-y-4">
            <div className="h-8 w-48 animate-pulse rounded-xl bg-gray-200 dark:bg-zinc-900" />
            <div className="h-48 animate-pulse rounded-2xl bg-gray-200 dark:bg-zinc-900" />
          </div>
        )}

        {pageState === 'error' && (
          <div className="rounded-2xl border border-dashed border-gray-300 py-16 text-center dark:border-zinc-700">
            <p className="text-sm text-gray-400 dark:text-zinc-500">Task not found.</p>
          </div>
        )}

        {pageState === 'found' && todo && (
          <>
            <div className="mb-4 flex items-center gap-3">
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${todo.completed ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                {todo.completed ? 'Completed' : 'Active'}
              </span>
              <span className="text-xs text-gray-400 dark:text-zinc-500">
                Updated {new Date(todo.updatedAt).toLocaleDateString()}
              </span>
            </div>

            <form onSubmit={onSave} className="space-y-4 rounded-2xl bg-white p-6 shadow-sm dark:bg-zinc-900 sm:p-8">
              <div className="space-y-1.5">
                <label htmlFor="detail-title" className="block text-sm font-medium text-gray-700 dark:text-zinc-300">Title</label>
                <input
                  id="detail-title"
                  value={title}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
                  required
                  className="w-full rounded-full bg-gray-100 px-5 py-3 text-base text-gray-900 placeholder:text-gray-400 transition focus:outline-none focus:ring-2 focus:ring-red-600 dark:bg-zinc-800 dark:text-white"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="detail-description" className="block text-sm font-medium text-gray-700 dark:text-zinc-300">
                  Description <span className="font-normal text-gray-400 dark:text-zinc-500">(optional)</span>
                </label>
                <textarea
                  id="detail-description"
                  value={description}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Add more detail…"
                  className="w-full resize-none rounded-2xl bg-gray-100 px-5 py-3 text-base text-gray-900 placeholder:text-gray-400 transition focus:outline-none focus:ring-2 focus:ring-red-600 dark:bg-zinc-800 dark:text-white"
                />
              </div>
              <Button type="submit" loading={saving} className="w-full">Save changes</Button>
            </form>
          </>
        )}
      </main>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { todosApi } from '../api/todos.api';
import type { Todo, TodoStatus } from '../types/models';

const FILTERS: TodoStatus[] = ['all', 'active', 'completed'];

export function Dashboard() {
  const { user, logout } = useAuth();
  const [params, setParams] = useSearchParams();
  const status = (params.get('status') as TodoStatus) ?? 'all';
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');

  useEffect(() => {
    setLoading(true);
    todosApi.list(status).then((r) => {
      setTodos(r.items);
      setLoading(false);
    });
  }, [status]);

  async function add() {
    const t = title.trim();
    if (!t) return;
    setTitle('');
    const created = await todosApi.create(t);
    setTodos((prev) => [created, ...prev]);
  }

  async function toggle(todo: Todo) {
    setTodos((prev) => prev.map((x) => (x.id === todo.id ? { ...x, completed: !x.completed } : x)));
    try {
      await todosApi.update(todo.id, { completed: !todo.completed });
    } catch {
      setTodos((prev) => prev.map((x) => (x.id === todo.id ? { ...x, completed: todo.completed } : x)));
    }
  }

  async function remove(id: string) {
    const snapshot = todos;
    setTodos((prev) => prev.filter((x) => x.id !== id));
    try {
      await todosApi.remove(id);
    } catch {
      setTodos(snapshot);
    }
  }

  const remaining = todos.filter((t) => !t.completed).length;
  const completed = todos.filter((t) => t.completed).length;

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-indigo-950 via-indigo-800 to-violet-700">
      {/* decorative blobs */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-violet-500/20 blur-3xl" />

      <div className="relative mx-auto w-full max-w-2xl px-4 py-6 sm:px-6 sm:py-8">
        {/* header */}
        <header className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-xl backdrop-blur-sm">
              ✓
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">TodoApp</h1>
              <p className="text-xs text-indigo-300">
                {remaining} remaining · {completed} done
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-indigo-200 sm:inline">{user?.username}</span>
            <button
              onClick={logout}
              className="rounded-lg border border-white/20 px-3 py-1.5 text-sm font-medium text-indigo-100 backdrop-blur-sm transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/30"
            >
              Logout
            </button>
          </div>
        </header>

        {/* add todo */}
        <form
          onSubmit={(e) => { e.preventDefault(); add(); }}
          className="mb-6 flex gap-2"
        >
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What needs to be done?"
            className="flex-1 rounded-lg border border-white/20 bg-white/10 px-4 py-2.5 text-sm text-white placeholder:text-indigo-300 backdrop-blur-sm transition focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/20"
          />
          <button
            type="submit"
            className="rounded-lg bg-gradient-to-r from-indigo-400 to-violet-400 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:from-indigo-300 hover:to-violet-300 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-white/50"
          >
            Add
          </button>
        </form>

        {/* card */}
        <div className="rounded-2xl bg-white/10 shadow-2xl backdrop-blur-md ring-1 ring-white/20">
          {/* filter tabs */}
          <div className="flex gap-1 border-b border-white/10 px-4 pt-3 pb-2">
            {FILTERS.map((s) => {
              const active = status === s;
              return (
                <button
                  key={s}
                  onClick={() => setParams({ status: s })}
                  className={`rounded-md px-3 py-1 text-sm capitalize transition focus:outline-none focus:ring-2 focus:ring-white/30 ${
                    active
                      ? 'bg-white/20 text-white font-medium'
                      : 'text-indigo-200 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {s}
                </button>
              );
            })}
          </div>

          {/* list */}
          <div className="p-3">
            {loading ? (
              <ul className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <li key={i} className="h-14 animate-pulse rounded-lg bg-white/10" />
                ))}
              </ul>
            ) : todos.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-white/20 p-10 text-center">
                <p className="text-sm text-indigo-300">Nothing here yet. Add your first task above.</p>
              </div>
            ) : (
              <ul className="space-y-1.5">
                {todos.map((t) => (
                  <li
                    key={t.id}
                    className="group flex items-center gap-3 rounded-lg p-3 transition hover:bg-white/10"
                  >
                    <input
                      type="checkbox"
                      checked={t.completed}
                      onChange={() => toggle(t)}
                      className="h-4 w-4 rounded border-white/30 bg-white/10 text-indigo-400 focus:ring-indigo-400 focus:ring-offset-0"
                      aria-label={`Mark ${t.title} as ${t.completed ? 'active' : 'complete'}`}
                    />
                    <span
                      className={`flex-1 text-sm ${
                        t.completed
                          ? 'text-indigo-400 line-through'
                          : 'text-white'
                      }`}
                    >
                      {t.title}
                    </span>
                    <button
                      onClick={() => remove(t.id)}
                      className="rounded-md p-1.5 text-indigo-300 opacity-0 transition hover:bg-red-500/20 hover:text-red-300 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-red-400/50 group-hover:opacity-100"
                      aria-label={`Delete ${t.title}`}
                    >
                      <span aria-hidden="true">✕</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

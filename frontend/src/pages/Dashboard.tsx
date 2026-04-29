import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { todosApi } from '../api/todos.api';
import type { Todo, TodoStatus } from '../types/models';

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

  return (
    <div className="min-h-screen p-4 max-w-2xl mx-auto">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My todos</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm">{user?.username}</span>
          <button onClick={logout} className="text-sm underline">Logout</button>
        </div>
      </header>

      <div className="flex gap-2 mb-4">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && add()}
          placeholder="Add a todo and press Enter"
          className="flex-1 p-2 rounded border bg-transparent"
        />
        <button onClick={add} className="bg-indigo-600 text-white px-4 rounded-lg">Add</button>
      </div>

      <div className="flex gap-2 mb-4 text-sm">
        {(['all', 'active', 'completed'] as TodoStatus[]).map((s) => (
          <button
            key={s}
            onClick={() => setParams({ status: s })}
            className={`px-3 py-1 rounded-full ${status === s ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-700'}`}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          ))}
        </div>
      ) : todos.length === 0 ? (
        <p className="text-center text-slate-500 mt-12">Nothing here yet.</p>
      ) : (
        <ul className="space-y-2">
          {todos.map((t) => (
            <li
              key={t.id}
              className="flex items-center gap-3 bg-white dark:bg-slate-800 p-3 rounded-lg shadow-sm"
            >
              <input
                type="checkbox"
                checked={t.completed}
                onChange={() => toggle(t)}
                aria-label={`Mark ${t.title} as ${t.completed ? 'active' : 'complete'}`}
              />
              <span className={`flex-1 ${t.completed ? 'line-through text-slate-400' : ''}`}>
                {t.title}
              </span>
              <button onClick={() => remove(t.id)} className="text-red-500 text-sm">Delete</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

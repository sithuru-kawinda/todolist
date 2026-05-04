import { useSearchParams } from 'react-router-dom';
import { Navbar } from '../components/Navbar.js';
import { TodoForm } from '../components/TodoForm.js';
import { TodoItem } from '../components/TodoItem.js';
import { useTodos } from '../hooks/useTodos.js';
import type { TodoStatus } from '../types/models.js';

const FILTERS: { label: string; value: TodoStatus }[] = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Completed', value: 'completed' },
];

export function Dashboard() {
  const [params, setParams] = useSearchParams();
  const status = (params.get('status') as TodoStatus) ?? 'all';
  const { todos, loading, add, toggle, update, remove } = useTodos(status);
  const remaining = todos.filter((t) => !t.completed).length;

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 dark:bg-black dark:text-white">
      <Navbar remaining={remaining} />

      <main className="mx-auto w-full max-w-xl px-4 py-6 sm:px-6 sm:py-8">
        <TodoForm onAdd={add} />

        {/* filter tabs */}
        <div className="my-5 flex gap-1" role="tablist" aria-label="Filter todos">
          {FILTERS.map(({ label, value }) => {
            const active = status === value;
            return (
              <button
                key={value}
                role="tab"
                aria-selected={active}
                onClick={() => setParams({ status: value })}
                className={`rounded-full px-4 py-2.5 text-xs font-medium transition focus:outline-none focus:ring-2 focus:ring-red-600 ${
                  active
                    ? 'bg-red-600 text-white'
                    : 'text-gray-500 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-white'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* todo list */}
        <div className="space-y-2">
          {loading ? (
            <>
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 animate-pulse rounded-2xl bg-gray-200 dark:bg-zinc-900" />
              ))}
            </>
          ) : todos.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 py-10 text-center dark:border-zinc-700">
              <p className="text-sm text-gray-400 dark:text-zinc-500">
                {status === 'all' ? 'No tasks yet. Add one above.' : `No ${status} tasks.`}
              </p>
            </div>
          ) : (
            todos.map((t) => (
              <TodoItem
                key={t.id}
                todo={t}
                onToggle={toggle}
                onUpdate={update}
                onRemove={remove}
              />
            ))
          )}
        </div>
      </main>
    </div>
  );
}

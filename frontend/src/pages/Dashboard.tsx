import { Navbar } from '../components/Navbar.js';
import { TodoForm } from '../components/TodoForm.js';
import { KanbanColumn } from '../components/KanbanColumn.js';
import { useTodos } from '../hooks/useTodos.js';
import type { Todo, TodoColumnStatus } from '../types/models.js';

const NEXT_STATUS: Record<TodoColumnStatus, TodoColumnStatus> = {
  todo: 'in_progress',
  in_progress: 'done',
  done: 'todo',
};

const COLUMN_STATUS: Record<'todo' | 'active' | 'done', TodoColumnStatus> = {
  todo: 'todo',
  active: 'in_progress',
  done: 'done',
};

export function Dashboard() {
  const { todos, loading, add, update, remove, updateStatus } = useTodos('all');

  const remaining  = todos.filter((t) => !t.completed).length;
  const todoItems  = todos.filter((t) => t.status === 'todo');
  const activeItems = todos.filter((t) => t.status === 'in_progress');
  const doneItems  = todos.filter((t) => t.status === 'done');

  function handleToggle(todo: Todo) {
    void updateStatus(todo, NEXT_STATUS[todo.status]);
  }

  function handleDrop(todoId: string, column: 'todo' | 'active' | 'done') {
    const todo = todos.find((t) => t.id === todoId);
    if (!todo) return;
    const target = COLUMN_STATUS[column];
    if (todo.status === target) return;
    void updateStatus(todo, target);
  }

  return (
    <div className="min-h-screen text-gray-900 dark:text-white" style={{ background: 'var(--dash-bg)' }}>
      <Navbar remaining={remaining} />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <h1 className="mb-5 text-2xl font-bold text-gray-900 dark:text-white">Todo List</h1>
        <TodoForm onAdd={add} />

        {loading ? (
          <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 animate-pulse rounded-2xl" style={{ backgroundColor: '#0f3a5e' }} />
            ))}
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">
            <KanbanColumn
              title="To Do"
              dot="bg-gray-400"
              todos={todoItems}
              onToggle={handleToggle}
              onUpdate={update}
              onRemove={remove}
              onDrop={(id) => handleDrop(id, 'todo')}
            />
            <KanbanColumn
              title="In Progress"
              dot="bg-blue-500"
              todos={activeItems}
              onToggle={handleToggle}
              onUpdate={update}
              onRemove={remove}
              onDrop={(id) => handleDrop(id, 'active')}
            />
            <KanbanColumn
              title="Done"
              dot="bg-green-500"
              todos={doneItems}
              onToggle={handleToggle}
              onUpdate={update}
              onRemove={remove}
              onDrop={(id) => handleDrop(id, 'done')}
            />
          </div>
        )}
      </main>
    </div>
  );
}

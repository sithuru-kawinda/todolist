import { useEffect, useState } from 'react';
import { Navbar } from '../components/Navbar.js';
import { TodoForm } from '../components/TodoForm.js';
import { KanbanColumn } from '../components/KanbanColumn.js';
import { useTodos } from '../hooks/useTodos.js';
import type { Todo } from '../types/models.js';

export function Dashboard() {
  const { todos, loading, add, toggle, update, remove } = useTodos('all');

  const [inProgressIds, setInProgressIds] = useState<Set<string>>(() => {
    try {
      const s = localStorage.getItem('todoInProgress');
      return s ? new Set(JSON.parse(s) as string[]) : new Set<string>();
    } catch {
      return new Set<string>();
    } 
  });

  useEffect(() => {
    localStorage.setItem('todoInProgress', JSON.stringify([...inProgressIds]));
  }, [inProgressIds]);

  const remaining = todos.filter((t) => !t.completed).length;
  const todoItems = todos.filter((t) => !t.completed && !inProgressIds.has(t.id));
  const activeItems = todos.filter((t) => !t.completed && inProgressIds.has(t.id));
  const doneItems = todos.filter((t) => t.completed);

  function handleToggle(todo: Todo) {
    if (!todo.completed && !inProgressIds.has(todo.id)) {
      // To Do → In Progress
      setInProgressIds((prev) => new Set([...prev, todo.id]));
    } else if (!todo.completed && inProgressIds.has(todo.id)) {
      // In Progress → Done
      setInProgressIds((prev) => { const s = new Set(prev); s.delete(todo.id); return s; });
      toggle(todo);
    } else {
      // Done → To Do
      toggle(todo);
    }
  }

  function handleRemove(id: string) {
    setInProgressIds((prev) => { const s = new Set(prev); s.delete(id); return s; });
    remove(id);
  }

  function handleDrop(todoId: string, column: 'todo' | 'active' | 'done') {
    const todo = todos.find((t) => t.id === todoId);
    if (!todo) return;
    if (column === 'todo') {
      setInProgressIds((prev) => { const s = new Set(prev); s.delete(todoId); return s; });
      if (todo.completed) toggle(todo);
    } else if (column === 'active') {
      setInProgressIds((prev) => new Set([...prev, todoId]));
      if (todo.completed) toggle(todo);
    } else {
      setInProgressIds((prev) => { const s = new Set(prev); s.delete(todoId); return s; });
      if (!todo.completed) toggle(todo);
    }
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
              onRemove={handleRemove}
              onDrop={(id) => handleDrop(id, 'todo')}
            />
            <KanbanColumn
              title="In Progress"
              dot="bg-blue-500"
              todos={activeItems}
              onToggle={handleToggle}
              onUpdate={update}
              onRemove={handleRemove}
              onDrop={(id) => handleDrop(id, 'active')}
            />
            <KanbanColumn
              title="Done"
              dot="bg-green-500"
              todos={doneItems}
              onToggle={handleToggle}
              onUpdate={update}
              onRemove={handleRemove}
              onDrop={(id) => handleDrop(id, 'done')}
            />
          </div>
        )}
      </main>
    </div>
  );
}
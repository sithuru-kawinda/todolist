import { useCallback, useEffect, useState } from 'react';
import { todosApi } from '../api/todos.api.js';
import { useToast } from '../context/ToastContext.js';
import type { Todo, TodoStatus } from '../types/models.js';

export function useTodos(status: TodoStatus) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    todosApi.list(status).then((r) => {
      if (!cancelled) {
        setTodos(r.items);
        setLoading(false);
      }
    }).catch(() => {
      if (!cancelled) {
        addToast('Failed to load tasks', 'error');
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [status]); // eslint-disable-line react-hooks/exhaustive-deps

  const add = useCallback(async (title: string) => {
    try {
      const created = await todosApi.create(title);
      setTodos((prev) => [created, ...prev]);
    } catch {
      addToast('Failed to add task', 'error');
    }
  }, [addToast]);

  const toggle = useCallback(async (todo: Todo) => {
    setTodos((prev) => prev.map((x) => x.id === todo.id ? { ...x, completed: !x.completed } : x));
    try {
      await todosApi.update(todo.id, { completed: !todo.completed });
    } catch {
      setTodos((prev) => prev.map((x) => x.id === todo.id ? { ...x, completed: todo.completed } : x));
      addToast('Failed to update task', 'error');
    }
  }, [addToast]);

  const update = useCallback(async (id: string, title: string) => {
    const snapshot = todos;
    setTodos((prev) => prev.map((x) => x.id === id ? { ...x, title } : x));
    try {
      await todosApi.update(id, { title });
    } catch {
      setTodos(snapshot);
      addToast('Failed to save changes', 'error');
    }
  }, [todos, addToast]);

  const remove = useCallback(async (id: string) => {
    const snapshot = todos;
    setTodos((prev) => prev.filter((x) => x.id !== id));
    try {
      await todosApi.remove(id);
    } catch {
      setTodos(snapshot);
      addToast('Failed to delete task', 'error');
    }
  }, [todos, addToast]);

  return { todos, loading, add, toggle, update, remove };
}

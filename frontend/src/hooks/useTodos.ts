import { useCallback, useEffect, useRef, useState } from 'react';
import { todosApi } from '../api/todos.api.js';
import { useToast } from '../context/ToastContext.js';
import type { Todo, TodoColumnStatus, TodoStatus } from '../types/models.js';

const POLL_INTERVAL = 10_000; // 10 s

export function useTodos(status: TodoStatus) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  // Skip polls for 3 s after any local mutation to protect optimistic updates
  const lastMutatedAt = useRef(0);

  // Fetch helper (used for both initial load and polling)
  const fetchTodos = useCallback(
    (showLoading = false) => {
      if (showLoading) setLoading(true);
      todosApi
        .list(status)
        .then((r) => {
          setTodos(r.items);
          setLoading(false);
        })
        .catch(() => {
          addToast('Failed to load tasks', 'error');
          setLoading(false);
        });
    },
    [status], // eslint-disable-line react-hooks/exhaustive-deps
  );

  // Initial load whenever status filter changes
  useEffect(() => {
    fetchTodos(true);
  }, [fetchTodos]);

  // Tab-visibility-aware polling
  useEffect(() => {
    const silentPoll = () => {
      if (document.hidden) return;
      if (Date.now() - lastMutatedAt.current < 3_000) return;
      fetchTodos();
    };

    const intervalId = setInterval(silentPoll, POLL_INTERVAL);

    // Also refresh immediately when the tab becomes visible again
    const onVisible = () => { if (!document.hidden) fetchTodos(); };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [fetchTodos]);

  const add = useCallback(async (title: string) => {
    lastMutatedAt.current = Date.now();
    try {
      const created = await todosApi.create(title);
      setTodos((prev) => [created, ...prev]);
    } catch {
      addToast('Failed to add task', 'error');
    }
  }, [addToast]);

  const toggle = useCallback(async (todo: Todo) => {
    lastMutatedAt.current = Date.now();
    setTodos((prev) => prev.map((x) => x.id === todo.id ? { ...x, completed: !x.completed } : x));
    try {
      await todosApi.update(todo.id, { completed: !todo.completed });
    } catch {
      setTodos((prev) => prev.map((x) => x.id === todo.id ? { ...x, completed: todo.completed } : x));
      addToast('Failed to update task', 'error');
    }
  }, [addToast]);

  const update = useCallback(async (id: string, title: string) => {
    lastMutatedAt.current = Date.now();
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
    lastMutatedAt.current = Date.now();
    const snapshot = todos;
    setTodos((prev) => prev.filter((x) => x.id !== id));
    try {
      await todosApi.remove(id);
    } catch {
      setTodos(snapshot);
      addToast('Failed to delete task', 'error');
    }
  }, [todos, addToast]);

  const updateStatus = useCallback(async (todo: Todo, status: TodoColumnStatus) => {
    lastMutatedAt.current = Date.now();
    setTodos((prev) =>
      prev.map((t) =>
        t.id === todo.id ? { ...t, status, completed: status === 'done' } : t,
      ),
    );
    try {
      await todosApi.update(todo.id, { status });
    } catch {
      setTodos((prev) => prev.map((t) => (t.id === todo.id ? todo : t)));
      addToast('Failed to move task', 'error');
    }
  }, [addToast]);

  return { todos, loading, add, toggle, update, remove, updateStatus };
}

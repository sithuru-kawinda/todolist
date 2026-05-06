import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import * as todosApi from '../api/todos';
import type { Todo, TodoColumnStatus } from '../types/models';

const POLL_INTERVAL = 10_000; // 10 s

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Timestamp of the last local mutation — polls skip for 3 s after a write
  // so an optimistic update never gets overwritten by a stale response.
  const lastMutatedAt = useRef(0);

  const refresh = useCallback(async () => {
    setError(null);
    try {
      const items = await todosApi.listTodos();
      setTodos(items);
    } catch {
      setError('Failed to load todos. Check your connection.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => { void refresh(); }, [refresh]);

  // Background-aware polling: pause when app is not in the foreground
  useEffect(() => {
    const silentPoll = () => {
      if (AppState.currentState !== 'active') return;
      if (Date.now() - lastMutatedAt.current < 3_000) return;
      void refresh();
    };

    const intervalId = setInterval(silentPoll, POLL_INTERVAL);

    // Also refresh immediately when the app comes back to foreground
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') void refresh();
    });

    return () => {
      clearInterval(intervalId);
      sub.remove();
    };
  }, [refresh]);

  // Stable refs — all use functional setTodos so they never close over stale state
  const add = useCallback(async (title: string): Promise<void> => {
    lastMutatedAt.current = Date.now();
    const todo = await todosApi.createTodo(title);
    setTodos((prev) => [todo, ...prev]);
  }, []);

  const toggle = useCallback(async (todo: Todo): Promise<void> => {
    lastMutatedAt.current = Date.now();
    const optimistic = { ...todo, completed: !todo.completed };
    setTodos((prev) => prev.map((t) => (t.id === todo.id ? optimistic : t)));
    try {
      const updated = await todosApi.updateTodo(todo.id, { completed: !todo.completed });
      setTodos((prev) => prev.map((t) => (t.id === todo.id ? updated : t)));
    } catch {
      setTodos((prev) => prev.map((t) => (t.id === todo.id ? todo : t)));
    }
  }, []);

  const remove = useCallback(async (id: string): Promise<void> => {
    lastMutatedAt.current = Date.now();
    // Capture snapshot inside the updater so it runs synchronously before re-render
    let snapshot: Todo[] = [];
    setTodos((prev) => {
      snapshot = prev;
      return prev.filter((t) => t.id !== id);
    });
    try {
      await todosApi.deleteTodo(id);
    } catch {
      setTodos(snapshot);
    }
  }, []);

  const updateStatus = useCallback(async (todo: Todo, status: TodoColumnStatus): Promise<void> => {
    lastMutatedAt.current = Date.now();
    const optimistic = { ...todo, status, completed: status === 'done' };
    setTodos((prev) => prev.map((t) => (t.id === todo.id ? optimistic : t)));
    try {
      const updated = await todosApi.updateTodo(todo.id, { status });
      setTodos((prev) => prev.map((t) => (t.id === todo.id ? updated : t)));
    } catch {
      setTodos((prev) => prev.map((t) => (t.id === todo.id ? todo : t)));
    }
  }, []);

  return { todos, loading, error, add, toggle, remove, refresh, updateStatus };
}

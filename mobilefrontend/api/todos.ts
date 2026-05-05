import { api } from './client';
import type { Todo, TodoColumnStatus } from '../types/models';

interface ListResponse {
  items: Todo[];
  nextCursor: string | null;
}

export async function listTodos(): Promise<Todo[]> {
  const res = await api.get<{ data: ListResponse }>('/api/todos');
  return res.data.data.items;
}

export async function createTodo(title: string): Promise<Todo> {
  const res = await api.post<{ data: Todo }>('/api/todos', { title });
  return res.data.data;
}

export async function updateTodo(
  id: string,
  patch: Partial<Pick<Todo, 'title' | 'completed'>> & { status?: TodoColumnStatus },
): Promise<Todo> {
  const res = await api.patch<{ data: Todo }>(`/api/todos/${id}`, patch);
  return res.data.data;
}

export async function deleteTodo(id: string): Promise<void> {
  await api.delete(`/api/todos/${id}`);
}

import { api } from './axios';
import type { Todo, TodoStatus, TodoColumnStatus } from '../types/models';

export interface TodoListResponse {
  items: Todo[];
  nextCursor: string | null;
}

export const todosApi = {
  async list(status: TodoStatus = 'all', cursor?: string, limit = 20): Promise<TodoListResponse> {
    const { data } = await api.get('/todos', { params: { status, cursor, limit } });
    return data.data;
  },
  async create(title: string, description?: string): Promise<Todo> {
    const { data } = await api.post('/todos', { title, description });
    return data.data;
  },
  async update(
    id: string,
    patch: Partial<Pick<Todo, 'title' | 'description' | 'completed'>> & { status?: TodoColumnStatus },
  ): Promise<Todo> {
    const { data } = await api.patch(`/todos/${id}`, patch);
    return data.data;
  },
  async getOne(id: string): Promise<Todo> {
    const { data } = await api.get(`/todos/${id}`);
    return data.data;
  },
  async remove(id: string): Promise<void> {
    await api.delete(`/todos/${id}`);
  },
};

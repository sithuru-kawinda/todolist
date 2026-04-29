import type { Todo, TodoStatusFilter } from '../entities/Todo.js';

export interface CreateTodoInput {
  userId: string;
  title: string;
  description?: string | null;
}

export interface UpdateTodoPatch {
  title?: string;
  description?: string | null;
  completed?: boolean;
}

export interface ListTodosOptions {
  userId: string;
  limit: number;
  cursor?: string;
  status: TodoStatusFilter;
}

export interface ListTodosResult {
  items: Todo[];
  nextCursor: string | null;
}

export interface ITodoRepo {
  create(input: CreateTodoInput): Promise<Todo>;
  findById(id: string): Promise<Todo | null>;
  list(opts: ListTodosOptions): Promise<ListTodosResult>;
  update(id: string, patch: UpdateTodoPatch): Promise<Todo>;
  delete(id: string): Promise<void>;
}

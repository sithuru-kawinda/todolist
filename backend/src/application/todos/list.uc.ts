import type { TodoStatusFilter } from '../../domain/entities/Todo.js';
import type { ITodoRepo, ListTodosResult } from '../../domain/repositories/ITodoRepo.js';

export interface ListTodosCmd {
  limit: number;
  cursor?: string;
  status: TodoStatusFilter;
}

export class ListTodos {
  constructor(private readonly todos: ITodoRepo) {}

  async exec(userId: string, cmd: ListTodosCmd): Promise<ListTodosResult> {
    return this.todos.list({ userId, ...cmd });
  }
}

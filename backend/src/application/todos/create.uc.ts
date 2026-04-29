import type { Todo } from '../../domain/entities/Todo.js';
import type { ITodoRepo } from '../../domain/repositories/ITodoRepo.js';

export interface CreateTodoCmd {
  title: string;
  description?: string | null;
}

export class CreateTodo {
  constructor(private readonly todos: ITodoRepo) {}

  async exec(userId: string, input: CreateTodoCmd): Promise<Todo> {
    return this.todos.create({
      userId,
      title: input.title,
      description: input.description ?? null,
    });
  }
}

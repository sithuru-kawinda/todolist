import { NotFoundError } from '../../domain/errors/DomainError.js';
import type { ITodoRepo } from '../../domain/repositories/ITodoRepo.js';

export class DeleteTodo {
  constructor(private readonly todos: ITodoRepo) {}

  async exec(userId: string, todoId: string): Promise<void> {
    const todo = await this.todos.findById(todoId);
    if (!todo || todo.userId !== userId) throw new NotFoundError('Todo');
    await this.todos.delete(todoId);
  }
}

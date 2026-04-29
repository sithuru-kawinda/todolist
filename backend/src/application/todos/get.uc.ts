import { NotFoundError } from '../../domain/errors/DomainError.js';
import type { Todo } from '../../domain/entities/Todo.js';
import type { ITodoRepo } from '../../domain/repositories/ITodoRepo.js';

export class GetTodo {
  constructor(private readonly todos: ITodoRepo) {}

  async exec(userId: string, todoId: string): Promise<Todo> {
    const todo = await this.todos.findById(todoId);
    if (!todo || todo.userId !== userId) throw new NotFoundError('Todo');
    return todo;
  }
}

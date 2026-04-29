import type { NextFunction, Request, Response } from 'express';
import { container } from '../../composition.js';
import { todoToDto } from '../../domain/entities/Todo.js';
import { UnauthorizedError } from '../../domain/errors/DomainError.js';
import {
  createTodoSchema,
  listTodosQuerySchema,
  todoIdParamSchema,
  updateTodoSchema,
} from '../validators/todos.schema.js';

function userIdOrThrow(req: Request): string {
  if (!req.user) throw new UnauthorizedError();
  return req.user.id;
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = userIdOrThrow(req);
    const input = createTodoSchema.parse(req.body);
    const todo = await container.uc.createTodo.exec(userId, input);
    res.status(201).json({ data: todoToDto(todo) });
  } catch (err) {
    next(err);
  }
}

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = userIdOrThrow(req);
    const query = listTodosQuerySchema.parse(req.query);
    const result = await container.uc.listTodos.exec(userId, query);
    res.status(200).json({
      data: { items: result.items.map(todoToDto), nextCursor: result.nextCursor },
    });
  } catch (err) {
    next(err);
  }
}

export async function getOne(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = userIdOrThrow(req);
    const { id } = todoIdParamSchema.parse(req.params);
    const todo = await container.uc.getTodo.exec(userId, id);
    res.status(200).json({ data: todoToDto(todo) });
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = userIdOrThrow(req);
    const { id } = todoIdParamSchema.parse(req.params);
    const patch = updateTodoSchema.parse(req.body);
    const todo = await container.uc.updateTodo.exec(userId, id, patch);
    res.status(200).json({ data: todoToDto(todo) });
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = userIdOrThrow(req);
    const { id } = todoIdParamSchema.parse(req.params);
    await container.uc.deleteTodo.exec(userId, id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

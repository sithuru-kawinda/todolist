import { randomUUID } from 'node:crypto';
import type Database from 'better-sqlite3';
import { NotFoundError } from '../../domain/errors/DomainError.js';
import type {
  CreateTodoInput,
  ITodoRepo,
  ListTodosOptions,
  ListTodosResult,
  UpdateTodoPatch,
} from '../../domain/repositories/ITodoRepo.js';
import type { Todo } from '../../domain/entities/Todo.js';

interface TodoRow {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  completed: number;
  created_at: string;
  updated_at: string;
}

function rowToTodo(row: TodoRow): Todo {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    description: row.description,
    completed: row.completed === 1,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

export class SqliteTodoRepo implements ITodoRepo {
  private readonly insertStmt: Database.Statement<[string, string, string, string | null]>;
  private readonly byIdStmt: Database.Statement<[string]>;
  private readonly deleteStmt: Database.Statement<[string]>;

  constructor(private readonly db: Database.Database) {
    this.insertStmt = db.prepare(
      'INSERT INTO todos (id, user_id, title, description, completed) VALUES (?, ?, ?, ?, 0)',
    );
    this.byIdStmt = db.prepare('SELECT * FROM todos WHERE id = ?');
    this.deleteStmt = db.prepare('DELETE FROM todos WHERE id = ?');
  }

  async create(input: CreateTodoInput): Promise<Todo> {
    const id = randomUUID();
    this.insertStmt.run(id, input.userId, input.title, input.description ?? null);
    const row = this.byIdStmt.get(id) as TodoRow;
    return rowToTodo(row);
  }

  async findById(id: string): Promise<Todo | null> {
    const row = this.byIdStmt.get(id) as TodoRow | undefined;
    return row ? rowToTodo(row) : null;
  }

  async list(opts: ListTodosOptions): Promise<ListTodosResult> {
    const filters = ['user_id = @userId'];
    if (opts.status === 'active') filters.push('completed = 0');
    if (opts.status === 'completed') filters.push('completed = 1');
    if (opts.cursor) filters.push('created_at < (SELECT created_at FROM todos WHERE id = @cursor)');

    const sql = `
      SELECT * FROM todos
      WHERE ${filters.join(' AND ')}
      ORDER BY created_at DESC
      LIMIT @limit
    `;
    const rows = this.db
      .prepare(sql)
      .all({ userId: opts.userId, cursor: opts.cursor, limit: opts.limit + 1 }) as TodoRow[];

    const hasMore = rows.length > opts.limit;
    const sliced = hasMore ? rows.slice(0, opts.limit) : rows;
    const items = sliced.map(rowToTodo);
    const nextCursor = hasMore && items.length > 0 ? items[items.length - 1]!.id : null;
    return { items, nextCursor };
  }

  async update(id: string, patch: UpdateTodoPatch): Promise<Todo> {
    const sets: string[] = [];
    const params: Record<string, unknown> = { id };
    if (patch.title !== undefined) {
      sets.push('title = @title');
      params.title = patch.title;
    }
    if (patch.description !== undefined) {
      sets.push('description = @description');
      params.description = patch.description;
    }
    if (patch.completed !== undefined) {
      sets.push('completed = @completed');
      params.completed = patch.completed ? 1 : 0;
    }
    if (sets.length === 0) {
      const row = this.byIdStmt.get(id) as TodoRow | undefined;
      if (!row) throw new NotFoundError('Todo');
      return rowToTodo(row);
    }
    const sql = `UPDATE todos SET ${sets.join(', ')} WHERE id = @id`;
    const result = this.db.prepare(sql).run(params);
    if (result.changes === 0) throw new NotFoundError('Todo');
    const row = this.byIdStmt.get(id) as TodoRow;
    return rowToTodo(row);
  }

  async delete(id: string): Promise<void> {
    const result = this.deleteStmt.run(id);
    if (result.changes === 0) throw new NotFoundError('Todo');
  }
}

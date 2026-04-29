import { randomUUID } from 'node:crypto';
import type Database from 'better-sqlite3';
import type { CreateUserInput, IUserRepo } from '../../domain/repositories/IUserRepo.js';
import type { User } from '../../domain/entities/User.js';

interface UserRow {
  id: string;
  username: string;
  email: string;
  password_hash: string;
  created_at: string;
}

function rowToUser(row: UserRow): User {
  return {
    id: row.id,
    username: row.username,
    email: row.email,
    passwordHash: row.password_hash,
    createdAt: new Date(row.created_at),
  };
}

export class SqliteUserRepo implements IUserRepo {
  private readonly insertStmt;
  private readonly byIdStmt;
  private readonly byEmailStmt;
  private readonly byUsernameStmt;

  constructor(db: Database.Database) {
    this.insertStmt = db.prepare(
      'INSERT INTO users (id, username, email, password_hash) VALUES (?, ?, ?, ?)',
    );
    this.byIdStmt = db.prepare('SELECT * FROM users WHERE id = ?');
    this.byEmailStmt = db.prepare('SELECT * FROM users WHERE email = ?');
    this.byUsernameStmt = db.prepare('SELECT * FROM users WHERE username = ?');
  }

  async create(input: CreateUserInput): Promise<User> {
    const id = randomUUID();
    this.insertStmt.run(id, input.username, input.email, input.passwordHash);
    const row = this.byIdStmt.get(id) as UserRow;
    return rowToUser(row);
  }

  async findById(id: string): Promise<User | null> {
    const row = this.byIdStmt.get(id) as UserRow | undefined;
    return row ? rowToUser(row) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const row = this.byEmailStmt.get(email) as UserRow | undefined;
    return row ? rowToUser(row) : null;
  }

  async findByUsername(username: string): Promise<User | null> {
    const row = this.byUsernameStmt.get(username) as UserRow | undefined;
    return row ? rowToUser(row) : null;
  }
}

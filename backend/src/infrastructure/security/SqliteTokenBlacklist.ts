import type Database from 'better-sqlite3';
import type { ITokenBlacklist } from '../../domain/services/ITokenBlacklist.js';

export class SqliteTokenBlacklist implements ITokenBlacklist {
  private readonly insertStmt: Database.Statement<[string, string]>;
  private readonly selectStmt: Database.Statement<[string]>;
  private readonly sweepStmt: Database.Statement<[]>;

  constructor(db: Database.Database) {
    this.insertStmt = db.prepare('INSERT OR IGNORE INTO token_blacklist (jti, expires_at) VALUES (?, ?)');
    this.selectStmt = db.prepare('SELECT 1 FROM token_blacklist WHERE jti = ? AND expires_at > CURRENT_TIMESTAMP');
    this.sweepStmt = db.prepare('DELETE FROM token_blacklist WHERE expires_at <= CURRENT_TIMESTAMP');
  }

  async add(jti: string, expiresAt: Date): Promise<void> {
    this.insertStmt.run(jti, expiresAt.toISOString());
  }

  async has(jti: string): Promise<boolean> {
    return this.selectStmt.get(jti) !== undefined;
  }

  async sweepExpired(): Promise<number> {
    return this.sweepStmt.run().changes;
  }
}

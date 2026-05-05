/**
 * Sweep expired rows from the token_blacklist table.
 * Run daily: `npx tsx scripts/sweep-blacklist.ts`
 * Or add to cron: `0 3 * * * cd /app/backend && npx tsx scripts/sweep-blacklist.ts`
 */
import Database from 'better-sqlite3';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = process.env.DB_PATH ?? resolve(__dirname, '../data/todo.db');

const db = new Database(DB_PATH);
const { changes } = db
  .prepare("DELETE FROM token_blacklist WHERE expires_at < datetime('now')")
  .run();

console.log(`[sweep-blacklist] Removed ${changes} expired token(s). DB: ${DB_PATH}`);
db.close();

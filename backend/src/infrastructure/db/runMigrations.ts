import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { db } from './sqlite.js';

const here = dirname(fileURLToPath(import.meta.url));
const migrationsDir = join(here, 'migrations');

export function runMigrations(): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename TEXT PRIMARY KEY,
      applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const files = readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  const isApplied = db.prepare('SELECT 1 FROM schema_migrations WHERE filename = ?');
  const markApplied = db.prepare('INSERT INTO schema_migrations (filename) VALUES (?)');

  const applyAll = db.transaction((pending: string[]) => {
    for (const filename of pending) {
      const sql = readFileSync(join(migrationsDir, filename), 'utf8');
      db.exec(sql);
      markApplied.run(filename);
    }
  });

  const pending = files.filter((f) => !isApplied.get(f));
  if (pending.length === 0) return;
  applyAll(pending);
}

if (import.meta.url === `file://${process.argv[1]?.replace(/\\/g, '/')}`) {
  runMigrations();
  process.stdout.write('Migrations applied.\n');
}

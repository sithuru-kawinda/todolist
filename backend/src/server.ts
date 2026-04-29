import { createApp } from './app.js';
import { env } from './infrastructure/config/env.js';
import { logger } from './infrastructure/logging/logger.js';
import { runMigrations } from './infrastructure/db/runMigrations.js';

runMigrations();

const app = createApp();
app.listen(env.PORT, () => {
  logger.info({ port: env.PORT, env: env.NODE_ENV }, 'Server listening');
});

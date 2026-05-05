import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import pinoHttp from 'pino-http';
import { env } from './infrastructure/config/env.js';
import { logger } from './infrastructure/logging/logger.js';
import { authRouter } from './presentation/routes/auth.routes.js';
import { todosRouter } from './presentation/routes/todos.routes.js';
import { errorHandler } from './presentation/middleware/error.mw.js';
import { globalLimiter } from './presentation/middleware/rateLimit.mw.js';

export function createApp(): express.Express {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      // In development allow all origins (covers web, emulator, physical device, Expo Go).
      // In production lock down to the configured frontend URL.
      origin: env.NODE_ENV === 'development' ? true : env.CORS_ORIGIN,
      credentials: true,
      methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    }),
  );
  app.use(compression());
  app.use(cookieParser());
  app.use(express.json({ limit: '10kb' }));
  app.use(pinoHttp({ logger }));
  app.use(globalLimiter);

  app.get('/healthz', (_req, res) => {
    res.json({ ok: true });
  });

  app.use('/api/auth', authRouter);
  app.use('/api/todos', todosRouter);

  app.use(errorHandler);

  return app;
}

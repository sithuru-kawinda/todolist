import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { DomainError } from '../../domain/errors/DomainError.js';
import { container } from '../../composition.js';

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) {
    res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input',
        fields: err.flatten().fieldErrors,
      },
    });
    return;
  }
  if (err instanceof DomainError) {
    res.status(err.status).json({
      error: { code: err.code, message: err.message },
    });
    return;
  }
  container.logger.error({ err }, 'Unhandled error');
  res.status(500).json({
    error: { code: 'INTERNAL_ERROR', message: 'Something went wrong' },
  });
};

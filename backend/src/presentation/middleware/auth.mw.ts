import type { NextFunction, Request, Response } from 'express';
import { UnauthorizedError } from '../../domain/errors/DomainError.js';
import { container } from '../../composition.js';

declare module 'express-serve-static-core' {
  interface Request {
    user?: { id: string; jti: string; expiresAt: Date };
  }
}

export async function requireAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const cookieToken = req.cookies?.access as string | undefined;
    const authHeader = req.headers.authorization;
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
    const token = cookieToken ?? bearerToken;
    if (!token) throw new UnauthorizedError('Missing token');
    const payload = container.tokens.verify(token);
    if (await container.blacklist.has(payload.jti)) {
      throw new UnauthorizedError('Token revoked');
    }
    req.user = {
      id: payload.sub,
      jti: payload.jti,
      expiresAt: new Date(payload.exp * 1000),
    };
    next();
  } catch (err) {
    next(err);
  }
}

import type { CookieOptions, NextFunction, Request, Response } from 'express';
import { container } from '../../composition.js';
import { loginSchema, registerSchema } from '../validators/auth.schema.js';
import { UnauthorizedError } from '../../domain/errors/DomainError.js';

const cookieOptions: CookieOptions = {
  httpOnly: true,
  secure: container.env.COOKIE_SECURE,
  sameSite: 'strict',
  path: '/',
};

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = registerSchema.parse(req.body);
    const user = await container.uc.register.exec(input);
    res.status(201).json({ data: user });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = loginSchema.parse(req.body);
    const { user, token } = await container.uc.login.exec(input);
    res.cookie('access', token.token, {
      ...cookieOptions,
      expires: token.expiresAt,
    });
    res.status(200).json({ data: { user } });
  } catch (err) {
    next(err);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError();
    await container.uc.logout.exec(req.user.jti, req.user.expiresAt);
    res.clearCookie('access', cookieOptions);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

export async function me(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError();
    const user = await container.uc.me.exec(req.user.id);
    res.status(200).json({ data: { user } });
  } catch (err) {
    next(err);
  }
}

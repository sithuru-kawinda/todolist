import { randomUUID } from 'node:crypto';
import jwt from 'jsonwebtoken';
import type { ITokenService, SignedToken, TokenPayload } from '../../domain/services/ITokenService.js';
import { UnauthorizedError } from '../../domain/errors/DomainError.js';

export class JwtTokenService implements ITokenService {
  constructor(
    private readonly secret: string,
    private readonly accessTtl: string,
  ) {}

  sign(userId: string): SignedToken {
    const jti = randomUUID();
    const token = jwt.sign({ sub: userId, jti }, this.secret, {
      algorithm: 'HS256',
      expiresIn: this.accessTtl as jwt.SignOptions['expiresIn'],
    });
    const decoded = jwt.decode(token) as TokenPayload;
    return { token, jti, expiresAt: new Date(decoded.exp * 1000) };
  }

  verify(token: string): TokenPayload {
    try {
      return jwt.verify(token, this.secret, { algorithms: ['HS256'], clockTolerance: 5 }) as TokenPayload;
    } catch {
      throw new UnauthorizedError('Invalid or expired token');
    }
  }
}

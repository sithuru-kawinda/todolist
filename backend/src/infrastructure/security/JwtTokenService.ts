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
      expiresIn: this.accessTtl as jwt.SignOptions['expiresIn'], // branded StringValue, not plain string
    });
    const decoded = jwt.decode(token);
    if (typeof decoded !== 'object' || decoded === null) {
      throw new Error('Token decode failed unexpectedly');
    }
    // We signed this token above with sub/jti/exp — shape is guaranteed.
    const payload = decoded as TokenPayload;
    return { token, jti, expiresAt: new Date(payload.exp * 1000) };
  }

  verify(token: string): TokenPayload {
    try {
      const payload = jwt.verify(token, this.secret, { algorithms: ['HS256'], clockTolerance: 5 });
      if (typeof payload === 'string') throw new UnauthorizedError('Invalid token format');
      // jwt.verify with HS256 returns our signed payload shape.
      return payload as TokenPayload;
    } catch (err) {
      if (err instanceof UnauthorizedError) throw err;
      throw new UnauthorizedError('Invalid or expired token');
    }
  }
}

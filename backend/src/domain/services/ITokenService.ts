export interface SignedToken {
  token: string;
  jti: string;
  expiresAt: Date;
}

export interface TokenPayload {
  sub: string;
  jti: string;
  iat: number;
  exp: number;
}

export interface ITokenService {
  sign(userId: string): SignedToken;
  verify(token: string): TokenPayload;
}

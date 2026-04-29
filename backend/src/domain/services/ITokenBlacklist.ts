export interface ITokenBlacklist {
  add(jti: string, expiresAt: Date): Promise<void>;
  has(jti: string): Promise<boolean>;
  sweepExpired(): Promise<number>;
}

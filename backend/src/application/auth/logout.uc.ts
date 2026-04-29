import type { ITokenBlacklist } from '../../domain/services/ITokenBlacklist.js';

export class LogoutUser {
  constructor(private readonly blacklist: ITokenBlacklist) {}

  async exec(jti: string, expiresAt: Date): Promise<void> {
    await this.blacklist.add(jti, expiresAt);
  }
}

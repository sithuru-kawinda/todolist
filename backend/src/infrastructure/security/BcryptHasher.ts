import bcrypt from 'bcrypt';
import type { IPasswordHasher } from '../../domain/services/IPasswordHasher.js';

export class BcryptHasher implements IPasswordHasher {
  constructor(private readonly rounds: number) {}

  async hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, this.rounds);
  }

  async compare(plain: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plain, hashed);
  }
}

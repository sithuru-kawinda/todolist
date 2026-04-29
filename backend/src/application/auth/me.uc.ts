import { UnauthorizedError } from '../../domain/errors/DomainError.js';
import { toPublicUser, type PublicUser } from '../../domain/entities/User.js';
import type { IUserRepo } from '../../domain/repositories/IUserRepo.js';

export class GetMe {
  constructor(private readonly users: IUserRepo) {}

  async exec(userId: string): Promise<PublicUser> {
    const user = await this.users.findById(userId);
    if (!user) throw new UnauthorizedError('Invalid credentials');
    return toPublicUser(user);
  }
}

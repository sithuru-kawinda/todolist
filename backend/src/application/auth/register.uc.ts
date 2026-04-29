import { ConflictError } from '../../domain/errors/DomainError.js';
import { toPublicUser, type PublicUser } from '../../domain/entities/User.js';
import type { IPasswordHasher } from '../../domain/services/IPasswordHasher.js';
import type { IUserRepo } from '../../domain/repositories/IUserRepo.js';

export interface RegisterInput {
  username: string;
  email: string;
  password: string;
}

export class RegisterUser {
  constructor(
    private readonly users: IUserRepo,
    private readonly hasher: IPasswordHasher,
  ) {}

  async exec(input: RegisterInput): Promise<PublicUser> {
    if (await this.users.findByEmail(input.email)) {
      throw new ConflictError('Email already registered');
    }
    if (await this.users.findByUsername(input.username)) {
      throw new ConflictError('Username already taken');
    }
    const passwordHash = await this.hasher.hash(input.password);
    const user = await this.users.create({
      username: input.username,
      email: input.email,
      passwordHash,
    });
    return toPublicUser(user);
  }
}

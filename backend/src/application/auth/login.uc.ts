import { UnauthorizedError } from '../../domain/errors/DomainError.js';
import { toPublicUser, type PublicUser } from '../../domain/entities/User.js';
import type { IPasswordHasher } from '../../domain/services/IPasswordHasher.js';
import type { ITokenService, SignedToken } from '../../domain/services/ITokenService.js';
import type { IUserRepo } from '../../domain/repositories/IUserRepo.js';

const DUMMY_HASH = '$2b$12$abcdefghijklmnopqrstuuMQXJZw5SWg7yL5PnAZW7T1EDhEa.zYi';

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginResult {
  user: PublicUser;
  token: SignedToken;
}

export class LoginUser {
  constructor(
    private readonly users: IUserRepo,
    private readonly hasher: IPasswordHasher,
    private readonly tokens: ITokenService,
  ) {}

  async exec(input: LoginInput): Promise<LoginResult> {
    const user = await this.users.findByEmail(input.email);
    const hashToCompare = user?.passwordHash ?? DUMMY_HASH;
    const ok = await this.hasher.compare(input.password, hashToCompare);
    if (!user || !ok) throw new UnauthorizedError('Invalid credentials');
    return { user: toPublicUser(user), token: this.tokens.sign(user.id) };
  }
}

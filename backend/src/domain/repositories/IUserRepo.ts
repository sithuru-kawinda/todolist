import type { User } from '../entities/User.js';

export interface CreateUserInput {
  username: string;
  email: string;
  passwordHash: string;
}

export interface IUserRepo {
  create(input: CreateUserInput): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
}

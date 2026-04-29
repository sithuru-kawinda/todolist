import { db } from './infrastructure/db/sqlite.js';
import { env } from './infrastructure/config/env.js';
import { logger } from './infrastructure/logging/logger.js';
import { BcryptHasher } from './infrastructure/security/BcryptHasher.js';
import { JwtTokenService } from './infrastructure/security/JwtTokenService.js';
import { SqliteTokenBlacklist } from './infrastructure/security/SqliteTokenBlacklist.js';
import { SqliteUserRepo } from './infrastructure/repositories/SqliteUserRepo.js';
import { SqliteTodoRepo } from './infrastructure/repositories/SqliteTodoRepo.js';
import { RegisterUser } from './application/auth/register.uc.js';
import { LoginUser } from './application/auth/login.uc.js';
import { LogoutUser } from './application/auth/logout.uc.js';
import { GetMe } from './application/auth/me.uc.js';
import { CreateTodo } from './application/todos/create.uc.js';
import { ListTodos } from './application/todos/list.uc.js';
import { GetTodo } from './application/todos/get.uc.js';
import { UpdateTodo } from './application/todos/update.uc.js';
import { DeleteTodo } from './application/todos/delete.uc.js';

const users = new SqliteUserRepo(db);
const todos = new SqliteTodoRepo(db);
const hasher = new BcryptHasher(env.BCRYPT_ROUNDS);
const tokens = new JwtTokenService(env.JWT_SECRET, env.JWT_ACCESS_TTL);
const blacklist = new SqliteTokenBlacklist(db);

export const container = {
  env,
  logger,
  users,
  todos,
  hasher,
  tokens,
  blacklist,
  uc: {
    register: new RegisterUser(users, hasher),
    login: new LoginUser(users, hasher, tokens),
    logout: new LogoutUser(blacklist),
    me: new GetMe(users),
    createTodo: new CreateTodo(todos),
    listTodos: new ListTodos(todos),
    getTodo: new GetTodo(todos),
    updateTodo: new UpdateTodo(todos),
    deleteTodo: new DeleteTodo(todos),
  },
};

export type Container = typeof container;

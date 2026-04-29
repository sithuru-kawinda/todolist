export interface User {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
}

export type PublicUser = Pick<User, 'id' | 'username' | 'email'>;

export function toPublicUser(u: User): PublicUser {
  return { id: u.id, username: u.username, email: u.email };
}

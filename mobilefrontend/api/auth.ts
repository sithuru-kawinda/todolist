import { api, saveToken, clearToken } from './client';
import type { User } from '../types/models';

interface LoginData {
  user: User;
  token: string;
}

export async function login(email: string, password: string): Promise<User> {
  const res = await api.post<{ data: LoginData }>('/api/auth/login', { email, password });
  const { user, token } = res.data.data;
  if (!token) throw new Error('Server did not return a token. Restart the backend with the latest code.');
  await saveToken(token);
  return user;
}

export async function register(username: string, email: string, password: string): Promise<User> {
  const res = await api.post<{ data: User }>('/api/auth/register', { username, email, password });
  return res.data.data;
}

export async function me(): Promise<User> {
  const res = await api.get<{ data: { user: User } }>('/api/auth/me');
  return res.data.data.user;
}

export async function logout(): Promise<void> {
  try {
    await api.post('/api/auth/logout');
  } finally {
    await clearToken();
  }
}

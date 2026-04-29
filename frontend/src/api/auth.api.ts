import { api } from './axios';
import type { User } from '../types/models';

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
}

export const authApi = {
  async register(payload: RegisterPayload): Promise<User> {
    const { data } = await api.post('/auth/register', payload);
    return data.data;
  },
  async login(email: string, password: string): Promise<User> {
    const { data } = await api.post('/auth/login', { email, password });
    return data.data.user;
  },
  async logout(): Promise<void> {
    await api.post('/auth/logout');
  },
  async me(): Promise<User | null> {
    try {
      const { data } = await api.get('/auth/me');
      return data.data.user;
    } catch {
      return null;
    }
  },
};

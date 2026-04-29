export interface User {
  id: string;
  username: string;
  email: string;
}

export interface Todo {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export type TodoStatus = 'all' | 'active' | 'completed';

export interface ApiError {
  code: string;
  message: string;
  fields?: Record<string, string[]>;
}

export interface User {
  id: string;
  username: string;
  email: string;
}

export type TodoColumnStatus = 'todo' | 'in_progress' | 'done';

export interface Todo {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  status: TodoColumnStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ApiError {
  code: string;
  message: string;
  fields?: Record<string, string[]>;
}

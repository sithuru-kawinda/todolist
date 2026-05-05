export type TodoColumnStatus = 'todo' | 'in_progress' | 'done';
export type TodoStatusFilter = 'all' | 'active' | 'completed';

export interface Todo {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  completed: boolean;
  status: TodoColumnStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface TodoDto {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  status: TodoColumnStatus;
  createdAt: string;
  updatedAt: string;
}

export function todoToDto(t: Todo): TodoDto {
  return {
    id: t.id,
    title: t.title,
    description: t.description,
    completed: t.completed,
    status: t.status,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
  };
}

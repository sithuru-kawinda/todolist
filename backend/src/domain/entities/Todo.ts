export interface Todo {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type TodoStatusFilter = 'all' | 'active' | 'completed';

export interface TodoDto {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export function todoToDto(t: Todo): TodoDto {
  return {
    id: t.id,
    title: t.title,
    description: t.description,
    completed: t.completed,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
  };
}

import { z } from 'zod';

const titleSchema = z.string().trim().min(1, 'Title is required').max(120, 'Title too long');
const descriptionSchema = z
  .string()
  .max(1000, 'Description too long')
  .nullable()
  .or(z.literal('').transform(() => null));

export const createTodoSchema = z.object({
  title: titleSchema,
  description: descriptionSchema.optional(),
});

export const updateTodoSchema = z
  .object({
    title: titleSchema.optional(),
    description: descriptionSchema.optional(),
    completed: z.boolean().optional(),
  })
  .refine((v) => v.title !== undefined || v.description !== undefined || v.completed !== undefined, {
    message: 'At least one field must be provided',
  });

export const listTodosQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  cursor: z.string().uuid().optional(),
  status: z.enum(['all', 'active', 'completed']).default('all'),
});

export const todoIdParamSchema = z.object({
  id: z.string().uuid('Invalid id'),
});

export type CreateTodoDTO = z.infer<typeof createTodoSchema>;
export type UpdateTodoDTO = z.infer<typeof updateTodoSchema>;
export type ListTodosQueryDTO = z.infer<typeof listTodosQuerySchema>;

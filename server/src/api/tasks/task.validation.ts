import { z } from 'zod';
import { Types } from 'mongoose';

// Helper to check for a valid MongoDB ObjectId
const objectIdSchema = z.string().refine((val) => Types.ObjectId.isValid(val), {
  message: 'Invalid ObjectId',
});

// Schema for creating a new task
export const createTaskSchema = z.object({
  body: z.object({
    title: z.string({
      required_error: 'Task title is required',
    }).min(1, 'Task title cannot be empty'),
    description: z.string().optional(),
    priority: z.enum(['low', 'medium', 'high']).default('medium'),
    projectId: objectIdSchema,
    columnId: objectIdSchema,
  }),
});

// Schema for updating an existing task
export const updateTaskSchema = z.object({
  body: z.object({
    // All fields are optional for updates
    title: z.string().min(1, 'Task title cannot be empty').optional(),
    description: z.string().optional(),
    priority: z.enum(['low', 'medium', 'high']).optional(),
  }),
  params: z.object({
    taskId: objectIdSchema,
  }),
});

// Schema for updating task status (moving between columns)
export const updateTaskStatusSchema = z.object({
  body: z.object({
    status: z.enum(['todo', 'in-progress', 'completed']),
  }),
  params: z.object({
    taskId: objectIdSchema,
  }),
});

// TypeScript types inferred from the schemas
export type CreateTaskInput = z.infer<typeof createTaskSchema>['body'];
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type UpdateTaskStatusInput = z.infer<typeof updateTaskStatusSchema>;

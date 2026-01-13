import { z } from 'zod';
import { Types } from 'mongoose';

// Helper to check for a valid MongoDB ObjectId
const objectIdSchema = z.string().refine((val) => Types.ObjectId.isValid(val), {
  message: 'Invalid ObjectId',
});

// Schema for creating a new project
export const createProjectSchema = z.object({
  body: z.object({
    name: z.string({
      required_error: 'Project name is required',
    }).min(3, 'Project name must be at least 3 characters long'),
    description: z.string().optional(),
    status: z.enum(['active', 'completed', 'on-hold']).default('active'),
    dueDate: z.string().transform((str) => str ? new Date(str) : undefined).optional(),
  }),
});

// Schema for updating an existing project
export const updateProjectSchema = z.object({
  body: z.object({
    name: z.string().min(3, 'Project name must be at least 3 characters long').optional(),
    description: z.string().optional(),
    status: z.enum(['active', 'completed', 'on-hold']).optional(),
    dueDate: z.string().transform((str) => str ? new Date(str) : undefined).optional(),
  }),
  params: z.object({
    projectId: objectIdSchema,
  }),
});

// Schema for deleting a project
export const deleteProjectSchema = z.object({
  params: z.object({
    projectId: objectIdSchema,
  }),
});

// TypeScript types inferred from the schemas
export type CreateProjectInput = z.infer<typeof createProjectSchema>['body'];
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type DeleteProjectInput = z.infer<typeof deleteProjectSchema>;

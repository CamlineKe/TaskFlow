import { z } from 'zod';
import { Types } from 'mongoose';

// Helper to check for a valid MongoDB ObjectId
const objectIdSchema = z.string().refine((val) => Types.ObjectId.isValid(val), {
  message: 'Invalid ObjectId',
});

// Schema for the move task operation
export const moveTaskSchema = z.object({
  body: z.object({
    taskId: objectIdSchema,
    sourceColumnId: objectIdSchema,
    destinationColumnId: objectIdSchema,
    destinationIndex: z.number().min(0, 'Destination index must be a non-negative number'),
  }),
});

// TypeScript type inferred from the schema
export type MoveTaskInput = z.infer<typeof moveTaskSchema>['body'];

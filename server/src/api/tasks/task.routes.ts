import { Router } from 'express';
import {
  getAllTasksController,
  getTaskController,
  createTaskController,
  updateTaskController,
  updateTaskStatusController,
  deleteTaskController,
} from './task.controller';
import { validate } from '../../middleware/validation.middleware';
import { createTaskSchema, updateTaskSchema, updateTaskStatusSchema } from './task.validation';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();

// All task routes are protected
router.use(authMiddleware);

// GET /api/tasks - Get all tasks for the logged-in user
router.get('/', getAllTasksController);

// GET /api/tasks/:taskId - Get a single task
router.get('/:taskId', getTaskController);

// POST /api/tasks - Create a new task
router.post('/', validate(createTaskSchema), createTaskController);

// PUT /api/tasks/:taskId - Update a task
router.put('/:taskId', validate(updateTaskSchema), updateTaskController);

// PUT /api/tasks/:taskId/status - Update task status (move between columns)
router.put('/:taskId/status', validate(updateTaskStatusSchema), updateTaskStatusController);

// DELETE /api/tasks/:taskId - Delete a task
router.delete('/:taskId', deleteTaskController);

export default router;

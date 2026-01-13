import { Router } from 'express';
import { moveTaskController } from './column.controller';
import { validate } from '../../middleware/validation.middleware';
import { authMiddleware } from '../../middleware/auth.middleware';
import { moveTaskSchema } from './column.validation';

const router = Router();

// All column routes are protected
router.use(authMiddleware);

// PUT /api/columns/move-task - The endpoint for all drag-and-drop actions
router.put('/move-task', validate(moveTaskSchema), moveTaskController);

export default router;

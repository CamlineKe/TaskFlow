import { Router } from 'express';
import {
  getAllProjectsController,
  createProjectController,
  getProjectController,
  getProjectBoardController,
  updateProjectController,
  deleteProjectController,
} from './project.controller';
import { validate } from '../../middleware/validation.middleware';
import { authMiddleware } from '../../middleware/auth.middleware';
import { createProjectSchema, updateProjectSchema, deleteProjectSchema } from './project.validation';

const router = Router();

// All project routes are protected
router.use(authMiddleware);

// GET /api/projects - Get all projects for the logged-in user
router.get('/', getAllProjectsController);

// POST /api/projects - Create a new project
router.post('/', validate(createProjectSchema), createProjectController);

// GET /api/projects/:projectId - Get a single project with task details
router.get('/:projectId', getProjectController);

// PUT /api/projects/:projectId - Update an existing project
router.put('/:projectId', validate(updateProjectSchema), updateProjectController);

// DELETE /api/projects/:projectId - Delete a project
router.delete('/:projectId', validate(deleteProjectSchema), deleteProjectController);

// GET /api/projects/:projectId/board - Get a single project with full board data
router.get('/:projectId/board', getProjectBoardController);

export default router;

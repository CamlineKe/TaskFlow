import { Router } from 'express';
import authRouter from './auth/auth.routes';
import projectRouter from './projects/project.routes';
import taskRouter from './tasks/task.routes';
import columnRouter from './columns/column.routes';
import userRouter from './users/user.routes';

const router = Router();

router.use('/auth', authRouter);
router.use('/projects', projectRouter);
router.use('/tasks', taskRouter);
router.use('/columns', columnRouter);
router.use('/users', userRouter);

export default router;

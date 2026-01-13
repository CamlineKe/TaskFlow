import { Router } from 'express';
import authRouter from './auth/auth.routes';
import projectRouter from './projects/project.routes';
import taskRouter from './tasks/task.routes';
import columnRouter from './columns/column.routes';
import userRouter from './users/user.routes';

const router = Router();

// ========== DEBUG ENDPOINT ==========
router.get('/cors-test', (req, res) => {
  res.json({
    success: true,
    message: 'CORS is working from routes!',
    origin: req.headers.origin,
    timestamp: new Date().toISOString(),
    corsHeaders: {
      'allow-origin': res.getHeader('Access-Control-Allow-Origin'),
      'allow-credentials': res.getHeader('Access-Control-Allow-Credentials')
    }
  });
});

// ========== YOUR ROUTES ==========
router.use('/auth', authRouter);
router.use('/projects', projectRouter);
router.use('/tasks', taskRouter);
router.use('/columns', columnRouter);
router.use('/users', userRouter);

export default router;
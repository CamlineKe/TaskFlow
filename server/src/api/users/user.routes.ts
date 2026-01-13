import { Router } from 'express';
import {
  getUserProfileController,
  updateUserProfileController,
  changePasswordController,
  getUserStatsController,
  updateNotificationsController,
} from './user.controller';
import { validate } from '../../middleware/validation.middleware';
import { authMiddleware } from '../../middleware/auth.middleware';
import { updateProfileSchema, changePasswordSchema, updateNotificationsSchema } from './user.validation';

const router = Router();

// All user routes are protected
router.use(authMiddleware);

// GET /api/users/profile - Get user profile
router.get('/profile', getUserProfileController);

// GET /api/users/stats - Get user statistics
router.get('/stats', getUserStatsController);

// PUT /api/users/profile - Update user profile
router.put('/profile', validate(updateProfileSchema), updateUserProfileController);

// PUT /api/users/change-password - Change user password
router.put('/change-password', validate(changePasswordSchema), changePasswordController);

// PUT /api/users/notifications - Update notification preferences
router.put('/notifications', validate(updateNotificationsSchema), updateNotificationsController);

export default router;
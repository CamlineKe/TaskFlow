import { z } from 'zod';

// Schema for updating user profile
export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required').max(100, 'Name cannot exceed 100 characters'),
    bio: z.string().max(500, 'Bio cannot exceed 500 characters').optional(),
    location: z.string().max(100, 'Location cannot exceed 100 characters').optional(),
    website: z.string().max(200, 'Website URL cannot exceed 200 characters').optional(),
    avatar: z.string().url('Avatar must be a valid URL').optional().or(z.literal('')),
  }),
});

// Schema for updating notification preferences
export const updateNotificationsSchema = z.object({
  body: z.object({
    emailNotifications: z.boolean(),
    pushNotifications: z.boolean(),
    taskReminders: z.boolean(),
  }),
});

// Schema for changing password
export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters long'),
  }),
});

// TypeScript types inferred from the schemas
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>['body'];
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>['body'];
export type UpdateNotificationsInput = z.infer<typeof updateNotificationsSchema>['body'];
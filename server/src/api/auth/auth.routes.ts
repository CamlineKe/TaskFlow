import { Router } from 'express';
// --- 1. IMPORT the new controller ---
import {
  registerController,
  loginController,
  getMeController,
  requestResetController,
  verifyResetCodeController,
  resetPasswordController,
  initiateRegistrationController,
  verifyRegistrationEmailController,
  completeRegistrationController,
} from './auth.controller';
import { validate } from '../../middleware/validation.middleware';
// --- 2. IMPORT the auth middleware ---
import { authMiddleware } from '../../middleware/auth.middleware';
import { 
  registerSchema, 
  loginSchema,
  requestResetSchema,
  verifyResetCodeSchema,
  resetPasswordSchema,
  initiateRegistrationSchema,
  verifyRegistrationEmailSchema,
  completeRegistrationSchema
} from './auth.validation';

const router = Router();

// --- Public Routes ---

// --- Email Verification Routes ---

// Route to initiate registration (send verification email)
// POST /api/auth/initiate-registration
router.post(
  '/initiate-registration', 
  validate(initiateRegistrationSchema), 
  initiateRegistrationController
);

// Route to verify email during registration
// POST /api/auth/verify-registration-email
router.post(
  '/verify-registration-email',
  validate(verifyRegistrationEmailSchema),
  verifyRegistrationEmailController
);

// Route to complete registration
// POST /api/auth/complete-registration
router.post(
  '/complete-registration',
  validate(completeRegistrationSchema),
  completeRegistrationController
);

// Alternative routes for different frontend implementations
// Route to initiate registration (send verification email)
// POST /api/auth/register/initiate
router.post(
  '/register/initiate', 
  validate(initiateRegistrationSchema), 
  initiateRegistrationController
);

// Route to verify email during registration
// POST /api/auth/register/verify-email
router.post(
  '/register/verify-email',
  validate(verifyRegistrationEmailSchema),
  verifyRegistrationEmailController
);

// Route to complete registration
// POST /api/auth/register/complete
router.post(
  '/register/complete',
  validate(completeRegistrationSchema),
  completeRegistrationController
);

// Route for user registration (keep for backward compatibility)
// POST /api/auth/register
router.post('/register', validate(registerSchema), registerController);

// Route for user login
// POST /api/auth/login
router.post('/login', validate(loginSchema), loginController);

// --- Password Reset Routes ---

// Route to request a password reset (send verification code)
// POST /api/auth/password-reset/request
router.post(
  '/password-reset/request', 
  validate(requestResetSchema), 
  requestResetController
);

// Route to verify the reset code
// POST /api/auth/password-reset/verify
router.post(
  '/password-reset/verify',
  validate(verifyResetCodeSchema),
  verifyResetCodeController
);

// Route to complete the password reset
// POST /api/auth/password-reset/reset
router.post(
  '/password-reset/reset',
  validate(resetPasswordSchema),
  resetPasswordController
);

// --- Protected Route ---

// Route to get the currently authenticated user
// This route is protected by the authMiddleware.
// --- 3. ADD the new route ---
router.get('/me', authMiddleware, getMeController);

export default router;

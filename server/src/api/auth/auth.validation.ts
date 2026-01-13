import { z } from 'zod';

// Zod schema for user registration
export const registerSchema = z.object({
  body: z.object({
    name: z.string({
      required_error: 'Name is required',
    }).min(2, 'Name must be at least 2 characters long'),
    
    email: z.string({
      required_error: 'Email is required',
    }).email('Not a valid email address'),

    password: z.string({
      required_error: 'Password is required',
    }).min(6, 'Password must be at least 6 characters long'),
  }),
});

// Zod schema for user login
export const loginSchema = z.object({
  body: z.object({
    email: z.string({
      required_error: 'Email is required',
    }).email('Not a valid email address'),

    password: z.string({
      required_error: 'Password is required',
    }),
  }),
});

// Zod schema for requesting password reset
export const requestResetSchema = z.object({
  body: z.object({
    email: z.string({
      required_error: 'Email is required',
    }).email('Not a valid email address'),
  }),
});

// Zod schema for verifying reset code
export const verifyResetCodeSchema = z.object({
  body: z.object({
    email: z.string({
      required_error: 'Email is required',
    }).email('Not a valid email address'),
    code: z.string({
      required_error: 'Verification code is required',
    }).length(6, 'Verification code must be 6 digits'),
  }),
});

// Zod schema for completing password reset
export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string({
      required_error: 'Reset token is required',
    }),
    code: z.string({
      required_error: 'Verification code is required',
    }).length(6, 'Verification code must be 6 digits'),
    newPassword: z.string({
      required_error: 'New password is required',
    }).min(6, 'New password must be at least 6 characters long'),
  }),
});

// Zod schema for initiating registration (sending verification email)
export const initiateRegistrationSchema = z.object({
  body: z.object({
    name: z.string({
      required_error: 'Name is required',
    }).min(2, 'Name must be at least 2 characters long'),
    
    email: z.string({
      required_error: 'Email is required',
    }).email('Not a valid email address'),

    password: z.string({
      required_error: 'Password is required',
    }).min(6, 'Password must be at least 6 characters long'),
  }),
});

// Zod schema for verifying email during registration
export const verifyRegistrationEmailSchema = z.object({
  body: z.object({
    email: z.string({
      required_error: 'Email is required',
    }).email('Not a valid email address'),
    code: z.string({
      required_error: 'Verification code is required',
    }).length(6, 'Verification code must be 6 digits'),
  }),
});

// Zod schema for completing registration
export const completeRegistrationSchema = z.object({
  body: z.object({
    token: z.string({
      required_error: 'Verification token is required',
    }),
    code: z.string({
      required_error: 'Verification code is required',
    }).length(6, 'Verification code must be 6 digits'),
  }),
});

// We can infer the TypeScript types from the Zod schemas
// This is useful for type safety in our controllers
export type RegisterInput = z.infer<typeof registerSchema>['body'];
export type LoginInput = z.infer<typeof loginSchema>['body'];
export type RequestResetInput = z.infer<typeof requestResetSchema>['body'];
export type VerifyResetCodeInput = z.infer<typeof verifyResetCodeSchema>['body'];
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>['body'];
export type InitiateRegistrationInput = z.infer<typeof initiateRegistrationSchema>['body'];
export type VerifyRegistrationEmailInput = z.infer<typeof verifyRegistrationEmailSchema>['body'];
export type CompleteRegistrationInput = z.infer<typeof completeRegistrationSchema>['body'];

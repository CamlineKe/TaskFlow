'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Box, Typography, Stack, Alert } from '@mui/material';
import {
  Lock as LockIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import apiClient from '@/lib/axios';
import { AuthBackButton } from '@/components/auth/AuthBackButton';
import { AuthCard } from '@/components/auth/AuthCard';
import { AuthTextField } from '@/components/auth/AuthTextField';
import { AuthButton } from '@/components/auth/AuthButton';

// Define the Zod schema for validation
const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  code: z.string().length(6, 'Verification code must be 6 digits'),
  newPassword: z.string()
    .min(6, 'Password must be at least 6 characters long'),
  confirmPassword: z.string()
    .min(1, 'Confirm your password'),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

// Infer the TypeScript type from the schema
type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

function ResetPasswordContent() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [resetComplete, setResetComplete] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token: '',
      code: '',
      newPassword: '',
      confirmPassword: '',
    }
  });

  useEffect(() => {
    const storedToken = sessionStorage.getItem('passwordResetToken');
    const storedCode = sessionStorage.getItem('passwordResetCode');

    if (!storedToken || !storedCode) {
      toast.error('Please verify your reset code first.');
      router.replace('/reset-password/verify');
      return;
    }

    setValue('token', storedToken);
    setValue('code', storedCode);
  }, [router, setValue]);

  const onSubmit = async (data: ResetPasswordFormValues) => {
    setServerError(null);
    try {
      await apiClient.post('/auth/password-reset/reset', {
        token: data.token,
        code: data.code,
        newPassword: data.newPassword,
      });

      sessionStorage.removeItem('passwordResetToken');
      sessionStorage.removeItem('passwordResetCode');
      setResetComplete(true);
      toast.success('Password reset successfully');

    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'An unexpected error occurred.';
      setServerError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleLogin = () => {
    router.push('/login');
  };

  return (
    <>
      <AuthBackButton href="/reset-password/verify" label="Back to verification" />
      <AuthCard
        title={resetComplete ? 'Success!' : 'Reset Password'}
        subtitle={
          resetComplete
            ? 'Your password has been reset successfully'
            : 'Create a new password for your account'
        }
        footer={
          resetComplete
            ? undefined
            : { text: 'Remember your password?', linkText: 'Log In', href: '/login' }
        }
      >
        {resetComplete ? (
          <Box sx={{ textAlign: 'center' }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                mb: 3,
              }}
            >
              <Box
                sx={{
                  bgcolor: 'rgba(46, 204, 113, 0.2)',
                  borderRadius: '50%',
                  p: 2,
                  display: 'inline-flex',
                }}
              >
                <CheckCircleIcon sx={{ fontSize: 40, color: '#2ecc71' }} />
              </Box>
            </Box>

            <Typography
              variant="body1"
              sx={{ color: 'rgba(255, 255, 255, 0.9)', mb: 3 }}
            >
              Your password has been reset successfully. You can now log in with your new password.
            </Typography>

            <AuthButton onClick={handleLogin} sx={{ mt: 2 }}>
              Log In
            </AuthButton>
          </Box>
        ) : (
          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <Stack spacing={3}>
              {serverError && (
                <Alert
                  severity="error"
                  sx={{
                    backgroundColor: 'rgba(244, 67, 54, 0.1)',
                    border: '1px solid rgba(244, 67, 54, 0.3)',
                    color: '#FF6B6B',
                  }}
                >
                  {serverError}
                </Alert>
              )}

              <input type="hidden" {...register('token')} />

              <AuthTextField
                label="Verification Code"
                required
                codeInput
                inputProps={{ readOnly: true }}
                {...register('code')}
                error={!!errors.code}
                helperText={errors.code?.message}
              />

              <AuthTextField
                label="New Password"
                required
                startIcon={<LockIcon />}
                passwordToggle
                {...register('newPassword')}
                error={!!errors.newPassword}
                helperText={errors.newPassword?.message}
              />

              <AuthTextField
                label="Confirm New Password"
                required
                startIcon={<LockIcon />}
                passwordToggle
                {...register('confirmPassword')}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword?.message}
              />

              <AuthButton type="submit" loading={isSubmitting} loadingText="Resetting...">
                Reset Password
              </AuthButton>
            </Stack>
          </Box>
        )}
      </AuthCard>
    </>
  );
}

export default function ResetPasswordPage() {
  return <ResetPasswordContent />;
}

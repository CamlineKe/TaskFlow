'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Box, Button, Typography, Stack, Alert, useTheme } from '@mui/material';
import { Email as EmailIcon } from '@mui/icons-material';
import Link from 'next/link';
import { toast } from 'sonner';

import apiClient from '@/lib/axios';
import { AuthBackButton } from '@/components/auth/AuthBackButton';
import { AuthCard } from '@/components/auth/AuthCard';
import { AuthTextField } from '@/components/auth/AuthTextField';
import { AuthButton } from '@/components/auth/AuthButton';

// Define the Zod schema for validation
const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

// Infer the TypeScript type from the schema
type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const theme = useTheme();
  const [serverError, setServerError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [userEmail, setUserEmail] = useState<string>(''); // Store the user's email
  const [emailPreview, setEmailPreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setServerError(null);
    try {
      const response = await apiClient.post('/auth/password-reset/request', data);

      setEmailSent(true);
      setUserEmail(data.email); // Store the email for navigation
      toast.success('Password reset instructions sent to your email.');

      // Development-only email preview URL
      if (response.data.previewUrl && process.env.NODE_ENV === 'development') {
        setEmailPreview(response.data.previewUrl);
      }

    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'An unexpected error occurred.';
      setServerError(errorMessage);
      toast.error(errorMessage);
    }
  };

  return (
    <>
      <AuthBackButton href="/login" label="Back to login" />
      <AuthCard
        title="Forgot Password"
        subtitle={
          emailSent
            ? 'Check your email for the verification code'
            : 'Enter your email to receive a password reset code'
        }
        footer={{ text: 'Remember your password?', linkText: 'Back to Login', href: '/login' }}
      >
        {emailSent ? (
          <Box sx={{ textAlign: 'center' }}>
            <Typography
              variant="body1"
              sx={{ color: 'rgba(255, 255, 255, 0.9)', mb: 2 }}
            >
              We&apos;ve sent a verification code to your email address. Please check your inbox and follow the instructions to reset your password.
            </Typography>

            <AuthButton
              component={Link}
              href={`/reset-password/verify?email=${encodeURIComponent(userEmail)}`}
              sx={{ mt: 2 }}
            >
              Continue to Verification
            </AuthButton>

            {emailPreview && (
              <Box sx={{ mt: 4, p: 2, bgcolor: 'rgba(255, 255, 255, 0.05)', borderRadius: 2 }}>
                <Typography variant="subtitle2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1 }}>
                  Development Preview:
                </Typography>
                <Link href={emailPreview} target="_blank" passHref>
                  <Button
                    variant="outlined"
                    size="small"
                    sx={{
                      color: theme.palette.primary.main,
                      borderColor: theme.palette.primary.main,
                    }}
                  >
                    View Email Preview
                  </Button>
                </Link>
              </Box>
            )}
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

              <AuthTextField
                label="Email"
                type="email"
                required
                startIcon={<EmailIcon />}
                {...register('email')}
                error={!!errors.email}
                helperText={errors.email?.message}
              />

              <AuthButton type="submit" loading={isSubmitting} loadingText="Sending...">
                Send Reset Instructions
              </AuthButton>
            </Stack>
          </Box>
        )}
      </AuthCard>
    </>
  );
}

'use client';

import { Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Box, Button, Typography, Stack, Alert, useTheme } from '@mui/material';
import { Email as EmailIcon } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

import apiClient from '@/lib/axios';
import { AuthBackButton } from '@/components/auth/AuthBackButton';
import { AuthCard } from '@/components/auth/AuthCard';
import { AuthTextField } from '@/components/auth/AuthTextField';
import { AuthButton } from '@/components/auth/AuthButton';

// Define the Zod schema for validation
const verifyEmailSchema = z.object({
  code: z.string()
    .length(6, 'Verification code must be 6 digits')
    .regex(/^\d{6}$/, 'Verification code must contain only numbers'),
});

// Infer the TypeScript type from the schema
type VerifyEmailFormValues = z.infer<typeof verifyEmailSchema>;

// Inner component
function VerifyEmailContent() {
  const router = useRouter();
  const theme = useTheme();

  const [serverError, setServerError] = useState<string | null>(null);
  const [email, setEmail] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  // Get email and token from sessionStorage
  useEffect(() => {
    const storedToken = sessionStorage.getItem('registrationToken');
    const storedEmail = sessionStorage.getItem('registrationEmail');

    if (!storedToken || !storedEmail) {
      toast.error('Registration session expired. Please start again.');
      router.push('/register');
      return;
    }

    setEmail(storedEmail);
    setIsLoading(false);
  }, [router]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<VerifyEmailFormValues>({
    resolver: zodResolver(verifyEmailSchema),
  });

  // Watch the code input for auto-formatting
  const codeValue = watch('code', '');

  const onSubmit = async (data: VerifyEmailFormValues) => {
    setServerError(null);
    try {
      const response = await apiClient.post('/auth/verify-registration-email', {
        email: email,
        code: data.code,
      });

      const { token: verificationToken } = response.data;

      // Store the verification token and code for the next step
      sessionStorage.setItem('verificationToken', verificationToken);
      sessionStorage.setItem('verificationCode', data.code);

      // Clear the initial registration data
      sessionStorage.removeItem('registrationToken');

      // Show success toast
      toast.success('Email verified successfully!');

      // Redirect to complete registration step without URL parameters
      router.push('/register/complete');

    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'An unexpected error occurred.';
      setServerError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleResendCode = async () => {
    try {
      // In a real implementation, you would call an API to resend the code
      toast.info('Please restart the registration process.');
      router.push('/register');
    } catch (error: any) {
      toast.error('Failed to resend verification code.');
    }
  };

  if (isLoading) {
    return (
      <Typography sx={{ color: 'white' }}>Loading verification details...</Typography>
    );
  }

  return (
    <>
      <AuthBackButton href="/register" label="Back to registration" />
      <AuthCard
        title="Verify Your Email"
        icon={
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <EmailIcon sx={{ fontSize: 32, color: 'white' }} />
          </Box>
        }
        subtitle={
          <>
            We&apos;ve sent a 6-digit verification code to
            <Typography
              variant="body1"
              sx={{ color: theme.palette.primary.main, fontWeight: 600, mt: 0.5 }}
            >
              {email}
            </Typography>
          </>
        }
      >
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
              label="Verification Code"
              required
              codeInput
              {...register('code')}
              error={!!errors.code}
              helperText={errors.code?.message || 'Enter the 6-digit code from your email'}
            />

            <AuthButton
              type="submit"
              disabled={codeValue.length !== 6}
              loading={isSubmitting}
              loadingText="Verifying..."
            >
              Verify Email
            </AuthButton>

            <Box sx={{ textAlign: 'center' }}>
              <Typography
                variant="body2"
                sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1 }}
              >
                Didn&apos;t receive the code?
              </Typography>

              <Button
                variant="text"
                onClick={handleResendCode}
                sx={{
                  color: theme.palette.primary.main,
                  fontWeight: 600,
                  '&:hover': {
                    backgroundColor: 'rgba(129, 140, 248, 0.1)',
                  },
                }}
              >
                Resend Code
              </Button>
            </Box>
          </Stack>
        </Box>
      </AuthCard>
    </>
  );
}

// Main page component with Suspense wrapper
export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <Typography sx={{ color: 'white' }}>Loading verification details...</Typography>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}

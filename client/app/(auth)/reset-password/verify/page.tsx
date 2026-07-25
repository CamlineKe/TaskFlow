'use client';

import { Suspense } from 'react';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Box, Typography, Stack, Alert } from '@mui/material';
import {
  Email as EmailIcon,
  LockOpen as LockOpenIcon,
} from '@mui/icons-material';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

import apiClient from '@/lib/axios';
import { AuthBackButton } from '@/components/auth/AuthBackButton';
import { AuthCard } from '@/components/auth/AuthCard';
import { AuthTextField } from '@/components/auth/AuthTextField';
import { AuthButton } from '@/components/auth/AuthButton';

// Define the Zod schema for validation
const verifyCodeSchema = z.object({
  email: z.string().email('Invalid email address'),
  code: z.string().length(6, 'Verification code must be 6 digits'),
});

// Infer the TypeScript type from the schema
type VerifyCodeFormValues = z.infer<typeof verifyCodeSchema>;

// Inner component that uses useSearchParams
function VerifyResetCodeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [serverError, setServerError] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState<string>(''); // Store the verification code

  // Get the email from URL params if available
  const emailParam = searchParams?.get('email');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<VerifyCodeFormValues>({
    resolver: zodResolver(verifyCodeSchema),
    defaultValues: {
      email: '',
      code: '',
    }
  });

  // Set the email from URL params if available
  useEffect(() => {
    if (emailParam) {
      setValue('email', emailParam);
    }
  }, [emailParam, setValue]);

  const onSubmit = async (data: VerifyCodeFormValues) => {
    setServerError(null);
    try {
      const response = await apiClient.post('/auth/password-reset/verify', data);

      setVerified(true);
      setResetToken(response.data.token);
      setVerificationCode(data.code); // Store the code for the next step
      toast.success('Code verified successfully');

    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'An unexpected error occurred.';
      setServerError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleContinue = () => {
    if (resetToken && verificationCode) {
      sessionStorage.setItem('passwordResetToken', resetToken);
      sessionStorage.setItem('passwordResetCode', verificationCode);
      router.push('/reset-password/reset');
    }
  };

  return (
    <>
      <AuthBackButton href="/forgot-password" label="Back to forgot password" />
      <AuthCard
        title="Verify Code"
        subtitle={
          verified
            ? 'Code verified successfully'
            : 'Enter the verification code sent to your email'
        }
        footer={{ text: "Didn't receive a code?", linkText: 'Try Again', href: '/forgot-password' }}
      >
        {verified ? (
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
                <LockOpenIcon sx={{ fontSize: 40, color: '#2ecc71' }} />
              </Box>
            </Box>

            <Typography
              variant="body1"
              sx={{ color: 'rgba(255, 255, 255, 0.9)', mb: 3 }}
            >
              Your verification code has been confirmed. You can now set a new password for your account.
            </Typography>

            <AuthButton onClick={handleContinue} sx={{ mt: 2 }}>
              Continue to Reset Password
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

              <AuthTextField
                label="Email"
                type="email"
                required
                startIcon={<EmailIcon />}
                {...register('email')}
                error={!!errors.email}
                helperText={errors.email?.message}
              />

              <AuthTextField
                label="Verification Code"
                required
                codeInput
                {...register('code')}
                error={!!errors.code}
                helperText={errors.code?.message}
              />

              <AuthButton type="submit" loading={isSubmitting} loadingText="Verifying...">
                Verify Code
              </AuthButton>
            </Stack>
          </Box>
        )}
      </AuthCard>
    </>
  );
}

// Main page component with Suspense wrapper
export default function VerifyResetCodePage() {
  return (
    <Suspense
      fallback={
        <Typography sx={{ color: 'white' }}>Loading verification...</Typography>
      }
    >
      <VerifyResetCodeContent />
    </Suspense>
  );
}

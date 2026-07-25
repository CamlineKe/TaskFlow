'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Box, Stack, Alert } from '@mui/material';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import apiClient from '@/lib/axios';
import { AuthBackButton } from '@/components/auth/AuthBackButton';
import { AuthCard } from '@/components/auth/AuthCard';
import { AuthTextField } from '@/components/auth/AuthTextField';
import { AuthButton } from '@/components/auth/AuthButton';

const registerSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setServerError(null);
    try {
      const response = await apiClient.post('/auth/initiate-registration', data);
      const { token, previewUrl } = response.data;

      // Show success toast
      toast.success('Verification code sent to your email. Please check your inbox.');

      // Log preview URL in development for testing
      if (previewUrl && process.env.NODE_ENV === 'development') {
        console.log('Email preview URL (development only):', previewUrl);
      }

      // Store token and email in sessionStorage instead of URL parameters
      sessionStorage.setItem('registrationToken', token);
      sessionStorage.setItem('registrationEmail', data.email);

      // Redirect to verification page without sensitive data in URL
      router.push('/register/verify');

    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'An unexpected error occurred.';
      setServerError(errorMessage);
      toast.error(errorMessage);
    }
  };

  return (
    <>
      <AuthBackButton href="/" label="Back to home" />
      <AuthCard
        title="Create Account"
        subtitle="Join TaskFlow and start organizing your tasks"
        footer={{ text: 'Already have an account?', linkText: 'Sign In', href: '/login' }}
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
              label="Full Name"
              required
              startIcon={<PersonIcon />}
              {...register('name')}
              error={!!errors.name}
              helperText={errors.name?.message}
            />

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
              label="Password"
              required
              startIcon={<LockIcon />}
              passwordToggle
              {...register('password')}
              error={!!errors.password}
              helperText={errors.password?.message}
            />

            <AuthButton type="submit" loading={isSubmitting} loadingText="Creating Account...">
              Create Account
            </AuthButton>
          </Stack>
        </Box>
      </AuthCard>
    </>
  );
}

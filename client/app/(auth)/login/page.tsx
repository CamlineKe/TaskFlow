'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Box, Stack, Alert, Typography } from '@mui/material';
import { Email as EmailIcon, Lock as LockIcon } from '@mui/icons-material';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import { useAuthStore } from '@/store/auth.store';
import apiClient from '@/lib/axios';
import { AuthBackButton } from '@/components/auth/AuthBackButton';
import { AuthCard } from '@/components/auth/AuthCard';
import { AuthTextField } from '@/components/auth/AuthTextField';
import { AuthButton } from '@/components/auth/AuthButton';

// Define the Zod schema for validation
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Infer the TypeScript type from the schema
type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setServerError(null);
    try {
      const response = await apiClient.post('/auth/login', data);
      const { user, token } = response.data;

      // Set user state globally
      setUser(user, token);

      // Show success toast
      toast.success('Welcome back! Logged in successfully!');

      // Redirect to the dashboard page
      router.push('/app');

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
        title="Welcome Back"
        subtitle="Sign in to continue to TaskFlow"
        footer={{ text: "Don't have an account?", linkText: 'Create Account', href: '/register' }}
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

            <AuthButton type="submit" loading={isSubmitting} loadingText="Signing In...">
              Sign In
            </AuthButton>

            <Typography
              variant="body2"
              align="right"
              component={Link}
              href="/forgot-password"
              sx={{
                mt: 1,
                color: 'primary.main',
                textDecoration: 'none',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              Forgot password?
            </Typography>
          </Stack>
        </Box>
      </AuthCard>
    </>
  );
}

'use client';

import { Box, Typography, Stack, Alert, CircularProgress } from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Login as LoginIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

import apiClient from '@/lib/axios';
import { AuthBackButton } from '@/components/auth/AuthBackButton';
import { AuthCard } from '@/components/auth/AuthCard';
import { AuthButton } from '@/components/auth/AuthButton';

const bounceIn = {
  hidden: { opacity: 0, scale: 0.3 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 20,
      delay: 0.3,
    },
  },
};

export default function CompleteRegistrationPage() {
  const router = useRouter();

  const [serverError, setServerError] = useState<string | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasAttempted, setHasAttempted] = useState(false);

  // Get token and code from sessionStorage
  useEffect(() => {
    const verificationToken = sessionStorage.getItem('verificationToken');
    const verificationCode = sessionStorage.getItem('verificationCode');

    if (!verificationToken || !verificationCode) {
      toast.error('Registration session expired. Please start again.');
      router.push('/register');
      return;
    }

    setIsLoading(false);

    // Only attempt completion once
    if (!hasAttempted) {
      setHasAttempted(true);
      completeRegistration(verificationToken, verificationCode);
    }
  }, [router, hasAttempted]);

  const completeRegistration = async (token: string, code: string) => {
    setIsCompleting(true);
    setServerError(null);

    try {
      await apiClient.post('/auth/complete-registration', {
        token: token,
        code: code,
      });

      // Clear session storage after successful completion
      sessionStorage.removeItem('verificationToken');
      sessionStorage.removeItem('verificationCode');
      sessionStorage.removeItem('registrationEmail');

      // Show success toast
      toast.success('Registration completed successfully! You can now log in.');
      setIsCompleted(true);

    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'An unexpected error occurred during registration completion.';
      setServerError(errorMessage);
      toast.error(errorMessage);
      setIsCompleted(false);
    } finally {
      setIsCompleting(false);
    }
  };

  const handleGoToLogin = () => {
    router.push('/login');
  };

  const handleStartOver = () => {
    // Clear any remaining session data
    sessionStorage.removeItem('verificationToken');
    sessionStorage.removeItem('verificationCode');
    sessionStorage.removeItem('registrationToken');
    sessionStorage.removeItem('registrationEmail');
    router.push('/register');
  };

  if (isLoading) {
    return (
      <Typography sx={{ color: 'white' }}>Loading registration details...</Typography>
    );
  }

  return (
    <>
      <AuthBackButton href="/register" label="Back to registration" />
      <AuthCard
        title={
          isCompleting ? 'Completing Registration...' :
          isCompleted ? 'Registration Complete!' :
          'Finalizing Account'
        }
        titleColor={isCompleted ? 'success.main' : 'white'}
        icon={
          <motion.div initial="hidden" animate="visible" variants={bounceIn}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: isCompleted ? 'success.main' : 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CheckCircleIcon sx={{ fontSize: 40, color: 'white' }} />
            </Box>
          </motion.div>
        }
        subtitle={
          isCompleting ? 'Please wait while we create your account...' :
          isCompleted ? 'Welcome to TaskFlow! Your account has been successfully created.' :
          'Something went wrong during registration.'
        }
      >
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

          {isCompleting && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
              <CircularProgress sx={{ color: 'white' }} />
            </Box>
          )}

          {isCompleted && (
            <AuthButton onClick={handleGoToLogin} startIcon={<LoginIcon />}>
              Continue to Login
            </AuthButton>
          )}

          {serverError && !isCompleting && (
            <AuthButton variant="outlined" onClick={handleStartOver}>
              Start Registration Again
            </AuthButton>
          )}
        </Stack>
      </AuthCard>
    </>
  );
}

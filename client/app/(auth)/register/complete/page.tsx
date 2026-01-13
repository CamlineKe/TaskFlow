'use client';

import { Suspense } from 'react'; // Add this import
import {
  Box,
  Button,
  Typography,
  Paper,
  Stack,
  Alert,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  Login as LoginIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

import apiClient from '@/lib/axios';

// Animation variants
const slideUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.8, delay: 0.2 } },
};

const bounceIn = {
  hidden: { opacity: 0, scale: 0.3 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    transition: { 
      type: "spring",
      stiffness: 300,
      damping: 20,
      delay: 0.3 
    } 
  },
};

// Inner component that uses useSearchParams
function CompleteRegistrationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [serverError, setServerError] = useState<string | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [token, setToken] = useState<string>('');
  const [code, setCode] = useState<string>('');
  const [hasAttempted, setHasAttempted] = useState(false); // Prevent duplicate calls

  // Extract token and code from URL parameters
  useEffect(() => {
    const tokenParam = searchParams.get('token');
    const codeParam = searchParams.get('code');
    
    if (!tokenParam || !codeParam) {
      toast.error('Invalid completion link. Please start registration again.');
      router.push('/register');
      return;
    }
    
    setToken(tokenParam);
    setCode(codeParam);
    
    // Only attempt completion once
    if (!hasAttempted) {
      setHasAttempted(true);
      completeRegistration(tokenParam, codeParam);
    }
  }, [searchParams, router]); // Removed hasAttempted to prevent dependency loop

  const completeRegistration = async (tokenParam: string, codeParam: string) => {
    setIsCompleting(true);
    setServerError(null);
    
    try {
      const response = await apiClient.post('/auth/complete-registration', {
        token: tokenParam,
        code: codeParam,
      });

      // Only show success and set completed if API call succeeds
      toast.success('Registration completed successfully! You can now log in.');
      setIsCompleted(true);

    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'An unexpected error occurred during registration completion.';
      setServerError(errorMessage);
      toast.error(errorMessage);
      setIsCompleted(false); // Make sure completion flag is false on error
    } finally {
      setIsCompleting(false);
    }
  };

  const handleGoToLogin = () => {
    router.push('/login');
  };

  const handleStartOver = () => {
    router.push('/register');
  };

  if (!token || !code) {
    return null; // Will redirect in useEffect
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #334155 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: { xs: 2, md: 3 },
        position: 'relative',
      }}
    >
      {/* Back Button */}
      <IconButton
        onClick={() => router.back()}
        sx={{
          position: 'absolute',
          top: { xs: 16, md: 24 },
          left: { xs: 16, md: 24 },
          color: 'white',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
          },
        }}
      >
        <ArrowBackIcon />
      </IconButton>

      <motion.div initial="hidden" animate="visible" variants={slideUp}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 5 },
            width: { xs: '100%', sm: 400 },
            maxWidth: '100%',
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 4,
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <motion.div initial="hidden" animate="visible" variants={bounceIn}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  mb: 3,
                }}
              >
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    background: isCompleted 
                      ? 'linear-gradient(45deg, #10B981 30%, #059669 90%)'
                      : 'linear-gradient(45deg, #818CF8 30%, #EC4899 90%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <CheckCircleIcon sx={{ fontSize: 40, color: 'white' }} />
                </Box>
              </Box>
            </motion.div>
            
            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              sx={{
                fontWeight: 700,
                background: isCompleted 
                  ? 'linear-gradient(45deg, #10B981 30%, #059669 90%)'
                  : 'linear-gradient(45deg, #818CF8 30%, #EC4899 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1,
              }}
            >
              {isCompleting ? 'Completing Registration...' : 
               isCompleted ? 'Registration Complete!' : 
               'Finalizing Account'}
            </Typography>
            
            <Typography
              variant="body1"
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
                mb: 3,
              }}
            >
              {isCompleting ? 'Please wait while we create your account...' :
               isCompleted ? 'Welcome to TaskFlow! Your account has been successfully created.' :
               'Something went wrong during registration.'}
            </Typography>
          </Box>

          <motion.div initial="hidden" animate="visible" variants={fadeIn}>
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
                <Box sx={{ textAlign: 'center', py: 2 }}>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      border: '3px solid rgba(129, 140, 248, 0.3)',
                      borderTop: '3px solid #818CF8',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                      margin: '0 auto',
                      '@keyframes spin': {
                        '0%': { transform: 'rotate(0deg)' },
                        '100%': { transform: 'rotate(360deg)' },
                      },
                    }}
                  />
                </Box>
              )}

              {isCompleted && (
                <Button
                  onClick={handleGoToLogin}
                  fullWidth
                  variant="contained"
                  color="primary"
                  size="large"
                  startIcon={<LoginIcon />}
                  sx={{
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    borderRadius: 2,
                    boxShadow: '0 8px 32px rgba(129, 140, 248, 0.3)',
                    '&:hover': {
                      boxShadow: '0 12px 48px rgba(129, 140, 248, 0.4)',
                    },
                  }}
                >
                  Continue to Login
                </Button>
              )}

              {serverError && !isCompleting && (
                <Button
                  onClick={handleStartOver}
                  fullWidth
                  variant="outlined"
                  size="large"
                  sx={{
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    borderRadius: 2,
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                    color: 'white',
                    '&:hover': {
                      borderColor: 'rgba(255, 255, 255, 0.5)',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    },
                  }}
                >
                  Start Registration Again
                </Button>
              )}
            </Stack>
          </motion.div>
        </Paper>
      </motion.div>
    </Box>
  );
}

// Main page component with Suspense wrapper
export default function CompleteRegistrationPage() {
  return (
    <Suspense fallback={
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #334155 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: 2, md: 3 },
          color: 'white'
        }}
      >
        <Typography>Loading registration details...</Typography>
      </Box>
    }>
      <CompleteRegistrationContent />
    </Suspense>
  );
}
'use client';

import { Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Box,
  Button,
  TextField,
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
  Email as EmailIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

import apiClient from '@/lib/axios';

// Define the Zod schema for validation
const verifyEmailSchema = z.object({
  code: z.string()
    .length(6, 'Verification code must be 6 digits')
    .regex(/^\d{6}$/, 'Verification code must contain only numbers'),
});

// Infer the TypeScript type from the schema
type VerifyEmailFormValues = z.infer<typeof verifyEmailSchema>;

// Animation variants
const slideUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.8, delay: 0.2 } },
};

// Inner component
function VerifyEmailContent() {
  const router = useRouter();
  const theme = useTheme();
  
  const [serverError, setServerError] = useState<string | null>(null);
  const [email, setEmail] = useState<string>('');
  const [token, setToken] = useState<string>('');
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
    
    setToken(storedToken);
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
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #334155 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white'
        }}
      >
        <Typography>Loading verification details...</Typography>
      </Box>
    );
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
        onClick={() => router.push('/register')}
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
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                mb: 2,
              }}
            >
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  background: 'linear-gradient(45deg, #818CF8 30%, #EC4899 90%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <EmailIcon sx={{ fontSize: 32, color: 'white' }} />
              </Box>
            </Box>
            
            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              sx={{
                fontWeight: 700,
                background: 'linear-gradient(45deg, #818CF8 30%, #EC4899 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1,
              }}
            >
              Verify Your Email
            </Typography>
            
            <Typography
              variant="body1"
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
                mb: 1,
              }}
            >
              We've sent a 6-digit verification code to
            </Typography>
            
            <Typography
              variant="body1"
              sx={{
                color: theme.palette.primary.main,
                fontWeight: 600,
                mb: 3,
              }}
            >
              {email}
            </Typography>
          </Box>

          <motion.div initial="hidden" animate="visible" variants={fadeIn}>
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
                
                <TextField
                  label="Verification Code"
                  fullWidth
                  required
                  {...register('code')}
                  error={!!errors.code}
                  helperText={errors.code?.message || 'Enter the 6-digit code from your email'}
                  inputProps={{
                    maxLength: 6,
                    style: { 
                      textAlign: 'center', 
                      fontSize: '1.5rem', 
                      letterSpacing: '0.5rem',
                      fontWeight: 600,
                    },
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      '& fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: theme.palette.primary.main,
                      },
                      color: 'white',
                    },
                  }}
                  InputLabelProps={{
                    sx: { color: 'rgba(255, 255, 255, 0.7)' },
                  }}
                  FormHelperTextProps={{
                    sx: { 
                      color: errors.code ? '#FF6B6B' : 'rgba(255, 255, 255, 0.5)',
                      textAlign: 'center',
                    },
                  }}
                />
                
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  disabled={isSubmitting || codeValue.length !== 6}
                  size="large"
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
                    '&:disabled': {
                      backgroundColor: 'rgba(129, 140, 248, 0.3)',
                    },
                  }}
                >
                  {isSubmitting ? 'Verifying...' : 'Verify Email'}
                </Button>

                <Box sx={{ textAlign: 'center' }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: 'rgba(255, 255, 255, 0.7)',
                      mb: 1,
                    }}
                  >
                    Didn't receive the code?
                  </Typography>
                  
                  <Button
                    variant="text"
                    onClick={handleResendCode}
                    sx={{
                      color: theme.palette.primary.main,
                      textTransform: 'none',
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
          </motion.div>
        </Paper>
      </motion.div>
    </Box>
  );
}

// Main page component with Suspense wrapper
export default function VerifyEmailPage() {
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
        <Typography>Loading verification details...</Typography>
      </Box>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
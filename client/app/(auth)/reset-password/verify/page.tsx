'use client';

import { Suspense } from 'react'; // Add this import
import { useState, useEffect } from 'react';
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
  InputAdornment,
  useTheme,
  Divider,
  CircularProgress,
} from '@mui/material';
import {
  Email as EmailIcon,
  ArrowBack as ArrowBackIcon,
  LockOpen as LockOpenIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

import apiClient from '@/lib/axios';

// Define the Zod schema for validation
const verifyCodeSchema = z.object({
  email: z.string().email('Invalid email address'),
  code: z.string().length(6, 'Verification code must be 6 digits'),
});

// Infer the TypeScript type from the schema
type VerifyCodeFormValues = z.infer<typeof verifyCodeSchema>;

// Animation variants
const slideUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.8, delay: 0.2 } },
};

// Inner component that uses useSearchParams
function VerifyResetCodeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const theme = useTheme();
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
      router.push(`/reset-password/reset?token=${resetToken}&code=${verificationCode}`);
    }
  };

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
        component={Link}
        href="/forgot-password"
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
              Verify Code
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
                mb: 3,
              }}
            >
              {verified 
                ? 'Code verified successfully' 
                : 'Enter the verification code sent to your email'}
            </Typography>
          </Box>

          <motion.div initial="hidden" animate="visible" variants={fadeIn}>
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
                
                <Button
                  onClick={handleContinue}
                  variant="contained"
                  fullWidth
                  sx={{
                    mt: 2,
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    borderRadius: 2,
                  }}
                >
                  Continue to Reset Password
                </Button>
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
                  
                  <TextField
                    label="Email"
                    type="email"
                    fullWidth
                    required
                    {...register('email')}
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon sx={{ color: 'rgba(255, 255, 255, 0.5)' }} />
                        </InputAdornment>
                      ),
                      sx: {
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(255, 255, 255, 0.2)',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(255, 255, 255, 0.3)',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: theme.palette.primary.main,
                        },
                        color: 'white',
                      },
                    }}
                    InputLabelProps={{
                      sx: { color: 'rgba(255, 255, 255, 0.7)' },
                    }}
                    FormHelperTextProps={{
                      sx: { color: '#FF6B6B' },
                    }}
                  />
                  
                  <TextField
                    label="Verification Code"
                    type="text"
                    fullWidth
                    required
                    {...register('code')}
                    error={!!errors.code}
                    helperText={errors.code?.message}
                    inputProps={{
                      maxLength: 6,
                      inputMode: 'numeric',
                    }}
                    InputProps={{
                      sx: {
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(255, 255, 255, 0.2)',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(255, 255, 255, 0.3)',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: theme.palette.primary.main,
                        },
                        color: 'white',
                        letterSpacing: '0.5em',
                        fontSize: '1.2rem',
                        textAlign: 'center',
                      },
                    }}
                    InputLabelProps={{
                      sx: { color: 'rgba(255, 255, 255, 0.7)' },
                    }}
                    FormHelperTextProps={{
                      sx: { color: '#FF6B6B' },
                    }}
                  />
                  
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="primary"
                    disabled={isSubmitting}
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
                    {isSubmitting ? (
                      <>
                        <CircularProgress size={24} sx={{ color: 'white', mr: 1 }} />
                        Verifying...
                      </>
                    ) : (
                      'Verify Code'
                    )}
                  </Button>
                </Stack>
              </Box>
            )}
          </motion.div>

          <Divider sx={{ my: 3, borderColor: 'rgba(255, 255, 255, 0.1)' }} />
          
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Didn't receive a code?{' '}
              <Link href="/forgot-password" style={{ textDecoration: 'none' }}>
                <Typography 
                  component="span" 
                  sx={{ 
                    color: theme.palette.primary.main,
                    fontWeight: 600,
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                >
                  Try Again
                </Typography>
              </Link>
            </Typography>
          </Box>
        </Paper>
      </motion.div>
    </Box>
  );
}

// Main page component with Suspense wrapper
export default function VerifyResetCodePage() {
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
        <Typography>Loading verification...</Typography>
      </Box>
    }>
      <VerifyResetCodeContent />
    </Suspense>
  );
}
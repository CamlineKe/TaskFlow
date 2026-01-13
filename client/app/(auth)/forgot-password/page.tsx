'use client';

import { useState } from 'react';
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
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { toast } from 'sonner';

import apiClient from '@/lib/axios';

// Define the Zod schema for validation
const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

// Infer the TypeScript type from the schema
type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

// Animation variants
const slideUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.8, delay: 0.2 } },
};

export default function ForgotPasswordPage() {
  const theme = useTheme();
  const [serverError, setServerError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [userEmail, setUserEmail] = useState<string>(''); // Store the user's email
  const [verificationToken, setVerificationToken] = useState<string | null>(null);
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
      
      // For development environment, we might receive a token and preview URL
      if (response.data.token) {
        setVerificationToken(response.data.token);
      }
      
      if (response.data.previewUrl) {
        setEmailPreview(response.data.previewUrl);
      }

    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'An unexpected error occurred.';
      setServerError(errorMessage);
      toast.error(errorMessage);
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
      {/* Back to Login Button */}
      <IconButton
        component={Link}
        href="/login"
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
              Forgot Password
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
                mb: 3,
              }}
            >
              {emailSent 
                ? 'Check your email for the verification code' 
                : 'Enter your email to receive a password reset code'}
            </Typography>
          </Box>

          <motion.div initial="hidden" animate="visible" variants={fadeIn}>
            {emailSent ? (
              <Box sx={{ textAlign: 'center' }}>
                <Typography
                  variant="body1"
                  sx={{ color: 'rgba(255, 255, 255, 0.9)', mb: 2 }}
                >
                  We've sent a verification code to your email address. Please check your inbox and follow the instructions to reset your password.
                </Typography>
                
                <Button
                  component={Link}
                  href={`/reset-password/verify?email=${encodeURIComponent(userEmail)}`}
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
                  Continue to Verification
                </Button>
                
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
                        Sending...
                      </>
                    ) : (
                      'Send Reset Instructions'
                    )}
                  </Button>
                </Stack>
              </Box>
            )}
          </motion.div>

          <Divider sx={{ my: 3, borderColor: 'rgba(255, 255, 255, 0.1)' }} />
          
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Remember your password?{' '}
              <Link href="/login" style={{ textDecoration: 'none' }}>
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
                  Back to Login
                </Typography>
              </Link>
            </Typography>
          </Box>
        </Paper>
      </motion.div>
    </Box>
  );
}
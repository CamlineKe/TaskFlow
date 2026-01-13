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
  Lock as LockIcon,
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

import apiClient from '@/lib/axios';

// Define the Zod schema for validation
const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  code: z.string().length(6, 'Verification code must be 6 digits'),
  newPassword: z.string()
    .min(6, 'Password must be at least 6 characters long'),
  confirmPassword: z.string()
    .min(1, 'Confirm your password'),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

// Infer the TypeScript type from the schema
type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

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
function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const theme = useTheme();
  const [serverError, setServerError] = useState<string | null>(null);
  const [resetComplete, setResetComplete] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Get the token from URL params
  const tokenParam = searchParams?.get('token');
  const codeParam = searchParams?.get('code');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token: '',
      code: '',
      newPassword: '',
      confirmPassword: '',
    }
  });

  // Set the token from URL params if available
  useEffect(() => {
    if (tokenParam) {
      setValue('token', tokenParam);
    }
    if (codeParam) {
      setValue('code', codeParam);
    }
  }, [tokenParam, codeParam, setValue]);

  const onSubmit = async (data: ResetPasswordFormValues) => {
    setServerError(null);
    try {
      await apiClient.post('/auth/password-reset/reset', {
        token: data.token,
        code: data.code,
        newPassword: data.newPassword,
      });
      
      setResetComplete(true);
      toast.success('Password reset successfully');

    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'An unexpected error occurred.';
      setServerError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleLogin = () => {
    router.push('/login');
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
        href="/reset-password/verify"
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
              {resetComplete ? 'Success!' : 'Reset Password'}
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
                mb: 3,
              }}
            >
              {resetComplete 
                ? 'Your password has been reset successfully' 
                : 'Create a new password for your account'}
            </Typography>
          </Box>

          <motion.div initial="hidden" animate="visible" variants={fadeIn}>
            {resetComplete ? (
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
                    <CheckCircleIcon sx={{ fontSize: 40, color: '#2ecc71' }} />
                  </Box>
                </Box>
                
                <Typography
                  variant="body1"
                  sx={{ color: 'rgba(255, 255, 255, 0.9)', mb: 3 }}
                >
                  Your password has been reset successfully. You can now log in with your new password.
                </Typography>
                
                <Button
                  onClick={handleLogin}
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
                  Log In
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
                    type="hidden"
                    {...register('token')}
                    sx={{ display: 'none' }}
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
                      readOnly: true,
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
                  
                  <TextField
                    label="New Password"
                    type={showPassword ? 'text' : 'password'}
                    fullWidth
                    required
                    {...register('newPassword')}
                    error={!!errors.newPassword}
                    helperText={errors.newPassword?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon sx={{ color: 'rgba(255, 255, 255, 0.5)' }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            sx={{ color: 'rgba(255, 255, 255, 0.5)' }}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
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
                    label="Confirm New Password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    fullWidth
                    required
                    {...register('confirmPassword')}
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon sx={{ color: 'rgba(255, 255, 255, 0.5)' }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            edge="end"
                            sx={{ color: 'rgba(255, 255, 255, 0.5)' }}
                          >
                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
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
                        Resetting...
                      </>
                    ) : (
                      'Reset Password'
                    )}
                  </Button>
                </Stack>
              </Box>
            )}
          </motion.div>

          {!resetComplete && (
            <>
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
                      Log In
                    </Typography>
                  </Link>
                </Typography>
              </Box>
            </>
          )}
        </Paper>
      </motion.div>
    </Box>
  );
}

// Main page component with Suspense wrapper
export default function ResetPasswordPage() {
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
        <Typography>Loading password reset...</Typography>
      </Box>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
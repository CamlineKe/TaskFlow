'use client';

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
  useMediaQuery,
  Divider,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email as EmailIcon,
  Lock as LockIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import { useAuthStore } from '@/store/auth.store';
import apiClient from '@/lib/axios';

// Define the Zod schema for validation
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Infer the TypeScript type from the schema
type LoginFormValues = z.infer<typeof loginSchema>;

// Animation variants
const slideUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.8, delay: 0.2 } },
};

export default function LoginPage() {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { setUser } = useAuthStore();
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

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
      {/* Back to Home Button */}
      <IconButton
        component={Link}
        href="/"
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
              Welcome Back
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
                mb: 3,
              }}
            >
              Sign in to continue to TaskFlow
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
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  fullWidth
                  required
                  {...register('password')}
                  error={!!errors.password}
                  helperText={errors.password?.message}
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
                  {isSubmitting ? 'Signing In...' : 'Sign In'}
                </Button>
                                  
                <Typography 
                  variant="body2" 
                  align="right" 
                  sx={{ 
                    mt: 1,
                    color: theme.palette.primary.main,
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                    cursor: 'pointer'
                  }}
                  component={Link}
                  href="/forgot-password"
                >
                  Forgot password?
                </Typography>
              </Stack>
            </Box>
          </motion.div>

          <Divider sx={{ my: 3, borderColor: 'rgba(255, 255, 255, 0.1)' }} />
          
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Don't have an account?{' '}
              <Link href="/register" style={{ textDecoration: 'none' }}>
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
                  Create Account
                </Typography>
              </Link>
            </Typography>
          </Box>
        </Paper>
      </motion.div>
    </Box>
  );
}

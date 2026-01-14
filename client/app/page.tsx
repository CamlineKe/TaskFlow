'use client';

import {
  Box,
  Button,
  Container,
  Typography,
  Stack,
  Grid,
  Card,
  CardContent,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  GroupWork as GroupWorkIcon,
  Speed as SpeedIcon,
  Security as SecurityIcon,
  PhoneAndroid as MobileIcon,
  CheckCircle as CheckCircleIcon,
  Menu as MenuIcon,
  Brightness4 as Brightness4Icon,
  Brightness7 as Brightness7Icon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';
import { useThemeContext } from '@/context/ThemeContext';

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
};

const slideUp = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.2 } },
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const staggerChild = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function LandingPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { mode, toggleColorMode, mounted } = useThemeContext();

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  const features = [
    {
      icon: <DashboardIcon sx={{ fontSize: 48, color: 'primary.main' }} />,
      title: 'Intuitive Dashboard',
      description: 'Get a bird\'s eye view of all your projects and tasks in one beautiful dashboard.',
    },
    {
      icon: <GroupWorkIcon sx={{ fontSize: 48, color: 'primary.main' }} />,
      title: 'Team Collaboration',
      description: 'Work together seamlessly with real-time updates and shared project spaces.',
    },
    {
      icon: <SpeedIcon sx={{ fontSize: 48, color: 'primary.main' }} />,
      title: 'Lightning Fast',
      description: 'Built for speed with modern technology stack for instant responsiveness.',
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 48, color: 'primary.main' }} />,
      title: 'Secure & Private',
      description: 'Your data is protected with enterprise-grade security and privacy.',
    },
    {
      icon: <MobileIcon sx={{ fontSize: 48, color: 'primary.main' }} />,
      title: 'Mobile First',
      description: 'Optimized for mobile devices so you can manage tasks anywhere, anytime.',
    },
    {
      icon: <CheckCircleIcon sx={{ fontSize: 48, color: 'primary.main' }} />,
      title: 'Smart Organization',
      description: 'Intelligent task organization with drag-and-drop functionality.',
    },
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: mode === 'dark' 
          ? 'linear-gradient(180deg, #0F172A 0%, #1E293B 50%, #334155 100%)'
          : 'linear-gradient(180deg, #F8FAFC 0%, #E2E8F0 50%, #CBD5E1 100%)',
        color: mode === 'dark' ? 'white' : 'text.primary',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box
        component="header"
        sx={{
          p: { xs: 2, md: 3 },
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'relative',
          zIndex: 10,
        }}
      >
        <Typography
          variant="h5"
          component="div"
          sx={{
            fontWeight: 700,
            background: 'linear-gradient(45deg, #818CF8 30%, #EC4899 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          TaskFlow
        </Typography>
        
        {isMobile ? (
          <IconButton
            color="inherit"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <MenuIcon />
          </IconButton>
        ) : (
          <Stack direction="row" spacing={2} alignItems="center">
            <IconButton 
              color="inherit" 
              onClick={toggleColorMode}
              sx={{
                bgcolor: mode === 'dark'
                  ? 'rgba(255, 255, 255, 0.1)'
                  : 'rgba(0, 0, 0, 0.1)',
                '&:hover': {
                  bgcolor: mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.2)'
                    : 'rgba(0, 0, 0, 0.2)',
                },
              }}
            >
              {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
            <Button component={Link} href="/login" color="inherit" size="large">
              Log In
            </Button>
            <Button 
              component={Link} 
              href="/register" 
              variant="contained" 
              color="primary"
              size="large"
              sx={{ px: 3 }}
            >
              Get Started
            </Button>
          </Stack>
        )}

        {/* Mobile Menu */}
        {isMobile && mobileMenuOpen && (
          <Box
            sx={{
              position: 'absolute',
              top: '100%',
              right: 0,
              background: mode === 'dark' 
                ? 'rgba(15, 23, 42, 0.95)'
                : 'rgba(248, 250, 252, 0.95)',
              backdropFilter: 'blur(10px)',
              border: mode === 'dark'
                ? '1px solid rgba(255, 255, 255, 0.1)'
                : '1px solid rgba(0, 0, 0, 0.1)',
              borderRadius: 2,
              p: 2,
              minWidth: 200,
            }}
          >
            <Stack spacing={1}>
              <IconButton 
                color="inherit" 
                onClick={toggleColorMode}
                sx={{
                  bgcolor: mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.1)'
                    : 'rgba(0, 0, 0, 0.1)',
                  '&:hover': {
                    bgcolor: mode === 'dark'
                      ? 'rgba(255, 255, 255, 0.2)'
                      : 'rgba(0, 0, 0, 0.2)',
                  },
                  mb: 1,
                  alignSelf: 'center',
                }}
              >
                {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>
              <Button component={Link} href="/login" color="inherit" fullWidth>
                Log In
              </Button>
              <Button 
                component={Link} 
                href="/register" 
                variant="contained" 
                color="primary"
                fullWidth
              >
                Get Started
              </Button>
            </Stack>
          </Box>
        )}
      </Box>

      {/* Hero Section */}
      <Container maxWidth="lg" sx={{ px: { xs: 2, md: 3 } }}>
        <Box
          sx={{
            textAlign: 'center',
            py: { xs: 6, md: 12 },
            position: 'relative',
          }}
        >
          <motion.div initial="hidden" animate="visible" variants={fadeIn}>
            <Typography
              variant={isMobile ? 'h3' : 'h1'}
              component="h1"
              gutterBottom
              sx={{
                fontWeight: 800,
                background: 'linear-gradient(45deg, #818CF8 30%, #EC4899 70%, #F59E0B 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 3,
                lineHeight: 1.2,
              }}
            >
              Bring Clarity to Your Chaos
            </Typography>
            <Typography 
              variant={isMobile ? 'h6' : 'h4'} 
              component="p" 
              color={mode === 'dark' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.7)'}
              sx={{ 
                mb: 4,
                maxWidth: '600px',
                mx: 'auto',
                lineHeight: 1.6,
              }}
            >
              A beautifully simple, blazingly fast, and delightfully fluid way to
              manage your tasks and projects.
            </Typography>
            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              spacing={2} 
              sx={{ justifyContent: 'center', alignItems: 'center' }}
            >
              <Button
                component={Link}
                href="/register"
                variant="contained"
                color="primary"
                size="large"
                sx={{
                  py: 2,
                  px: 4,
                  fontSize: '1.1rem',
                  textTransform: 'none',
                  borderRadius: 3,
                  boxShadow: '0 8px 32px rgba(129, 140, 248, 0.3)',
                  '&:hover': {
                    boxShadow: '0 12px 48px rgba(129, 140, 248, 0.4)',
                  },
                }}
              >
                Get Started - It's Free
              </Button>
              <Button
                component={Link}
                href="/login"
                variant="outlined"
                color="inherit"
                size="large"
                sx={{
                  py: 2,
                  px: 4,
                  fontSize: '1.1rem',
                  textTransform: 'none',
                  borderRadius: 3,
                  borderColor: mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.3)'
                    : 'rgba(0, 0, 0, 0.3)',
                  '&:hover': {
                    borderColor: mode === 'dark'
                      ? 'rgba(255, 255, 255, 0.5)'
                      : 'rgba(0, 0, 0, 0.5)',
                    background: mode === 'dark'
                      ? 'rgba(255, 255, 255, 0.05)'
                      : 'rgba(0, 0, 0, 0.05)',
                  },
                }}
              >
                Sign In
              </Button>
            </Stack>
          </motion.div>
        </Box>

        {/* Features Section */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={slideUp}
        >
          <Box sx={{ py: { xs: 6, md: 10 } }}>
            <Typography
              variant={isMobile ? 'h4' : 'h3'}
              component="h2"
              align="center"
              gutterBottom
              sx={{
                fontWeight: 700,
                mb: { xs: 4, md: 6 },
                color: mode === 'dark' ? 'white' : 'text.primary',
              }}
            >
              Why Choose TaskFlow?
            </Typography>
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              <Grid container spacing={{ xs: 2, md: 3 }}>
                {features.map((feature, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <motion.div variants={staggerChild}>
                      <Card
                        sx={{
                          height: '100%',
                          background: mode === 'dark'
                            ? 'rgba(255, 255, 255, 0.05)'
                            : 'rgba(255, 255, 255, 0.8)',
                          backdropFilter: 'blur(10px)',
                          border: mode === 'dark'
                            ? '1px solid rgba(255, 255, 255, 0.1)'
                            : '1px solid rgba(0, 0, 0, 0.1)',
                          borderRadius: 3,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: mode === 'dark'
                              ? '0 20px 40px rgba(0, 0, 0, 0.3)'
                              : '0 20px 40px rgba(0, 0, 0, 0.1)',
                            border: '1px solid rgba(129, 140, 248, 0.3)',
                          },
                        }}
                      >
                        <CardContent sx={{ p: { xs: 2, md: 3 }, textAlign: 'center' }}>
                          <Box sx={{ mb: 2 }}>
                            {feature.icon}
                          </Box>
                          <Typography
                            variant="h6"
                            component="h3"
                            gutterBottom
                            sx={{ 
                              fontWeight: 600, 
                              color: mode === 'dark' ? 'white' : 'text.primary'
                            }}
                          >
                            {feature.title}
                          </Typography>
                          <Typography
                            variant="body2"
                            color={mode === 'dark' 
                              ? 'rgba(255, 255, 255, 0.7)'
                              : 'rgba(0, 0, 0, 0.7)'
                            }
                            sx={{ lineHeight: 1.6 }}
                          >
                            {feature.description}
                          </Typography>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
            </motion.div>
          </Box>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={slideUp}
        >
          <Box
            sx={{
              textAlign: 'center',
              py: { xs: 6, md: 10 },
              background: mode === 'dark'
                ? 'linear-gradient(135deg, rgba(129, 140, 248, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%)'
                : 'linear-gradient(135deg, rgba(129, 140, 248, 0.2) 0%, rgba(236, 72, 153, 0.2) 100%)',
              borderRadius: 4,
              border: mode === 'dark'
                ? '1px solid rgba(255, 255, 255, 0.1)'
                : '1px solid rgba(0, 0, 0, 0.1)',
              mb: 4,
            }}
          >
            <Typography
              variant={isMobile ? 'h4' : 'h3'}
              component="h2"
              gutterBottom
              sx={{
                fontWeight: 700,
                color: mode === 'dark' ? 'white' : 'text.primary',
                mb: 2,
              }}
            >
              Ready to Transform Your Workflow?
            </Typography>
            <Typography
              variant="h6"
              color={mode === 'dark' 
                ? 'rgba(255, 255, 255, 0.8)' 
                : 'rgba(0, 0, 0, 0.7)'
              }
              sx={{ mb: 4, maxWidth: '500px', mx: 'auto' }}
            >
              Join thousands of teams already using TaskFlow to streamline their projects.
            </Typography>
            <Button
              component={Link}
              href="/register"
              variant="contained"
              color="primary"
              size="large"
              sx={{
                py: 2,
                px: 6,
                fontSize: '1.2rem',
                textTransform: 'none',
                borderRadius: 3,
                boxShadow: '0 8px 32px rgba(129, 140, 248, 0.3)',
                '&:hover': {
                  boxShadow: '0 12px 48px rgba(129, 140, 248, 0.4)',
                },
              }}
            >
              Start Your Free Journey
            </Button>
          </Box>
        </motion.div>
      </Container>

      {/* Footer */}
      <Box 
        component="footer" 
        sx={{ 
          p: { xs: 2, md: 3 }, 
          textAlign: 'center',
          borderTop: mode === 'dark'
            ? '1px solid rgba(255, 255, 255, 0.1)'
            : '1px solid rgba(0, 0, 0, 0.1)',
          mt: 4,
        }}
      >
        <Typography 
          variant="body2" 
          color={mode === 'dark' 
            ? 'rgba(255, 255, 255, 0.6)'
            : 'rgba(0, 0, 0, 0.6)'
          }
        >
          © {new Date().getFullYear()} TaskFlow. All rights reserved. Made with ❤️ for productivity.
        </Typography>
      </Box>
    </Box>
  );
}

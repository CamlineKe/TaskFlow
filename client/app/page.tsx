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
  Avatar,
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
  Star as StarIcon,
  FormatQuote as QuoteIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';
import { useThemeContext } from '@/context/ThemeContext';
import Image from 'next/image';

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

  // Unsplash real images
  const dashboardImage = mode === 'dark' 
    ? 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=1000&q=80'
    : 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1000&q=80';

  const features = [
    {
      title: 'Intuitive Dashboard',
      description: 'Get a bird\'s eye view of all your projects and tasks in one beautiful dashboard.',
      image: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=400&q=80',
    },
    {
      title: 'Team Collaboration',
      description: 'Work together seamlessly with real-time updates and shared project spaces.',
      image: 'https://placehold.co/400x300/334155/ffffff?text=Collaboration&font=roboto',
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
      title: 'Mobile First',
      description: 'Optimized for mobile devices so you can manage tasks anywhere, anytime.',
      image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&q=80',
    },
    {
      icon: <CheckCircleIcon sx={{ fontSize: 48, color: 'primary.main' }} />,
      title: 'Smart Organization',
      description: 'Intelligent task organization with drag-and-drop functionality.',
    },
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Product Manager at TechCorp',
      content: 'TaskFlow transformed how our team manages projects. The intuitive interface saved us hours every week.',
      avatar: 'https://i.pravatar.cc/150?u=sarah@taskflow.com',
    },
    {
      name: 'Marcus Johnson',
      role: 'Founder at StartupXYZ',
      content: 'Finally a task manager that doesn\'t feel like work. Beautiful design and lightning fast performance.',
      avatar: 'https://i.pravatar.cc/150?u=marcus@taskflow.com',
    },
    {
      name: 'Emily Rodriguez',
      role: 'Design Lead at CreativeStudio',
      content: 'The dark mode is gorgeous and the mobile app keeps me productive on the go. Absolutely love it.',
      avatar: 'https://i.pravatar.cc/150?u=emily@taskflow.com',
    },
  ];

  const trustedCompanies = [
    { name: 'Vercel', logo: 'https://cdn.simpleicons.org/vercel/gray' },
    { name: 'Stripe', logo: 'https://cdn.simpleicons.org/stripe/gray' },
    { name: 'Notion', logo: 'https://cdn.simpleicons.org/notion/gray' },
    { name: 'Figma', logo: 'https://cdn.simpleicons.org/figma/gray' },
    { name: 'Slack', logo: 'https://cdn.simpleicons.org/slack/gray' },
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: mode === 'dark' 
          ? '#0F172A'
          : '#F8FAFC',
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
            color: 'primary.main',
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
      <Container maxWidth="lg" sx={{ px: { xs: 2, md: 3 }, position: 'relative', zIndex: 1 }}>
        <Box
          sx={{
            textAlign: 'center',
            py: { xs: 6, md: 8 },
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
                color: 'text.primary',
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
              sx={{ justifyContent: 'center', alignItems: 'center', mb: 6 }}
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
                  boxShadow: mode === 'dark'
                    ? '0 8px 32px rgba(0, 0, 0, 0.4)'
                    : '0 8px 32px rgba(0, 0, 0, 0.15)',
                  '&:hover': {
                    boxShadow: mode === 'dark'
                      ? '0 12px 48px rgba(0, 0, 0, 0.5)'
                      : '0 12px 48px rgba(0, 0, 0, 0.2)',
                  },
                }}
              >
                Get Started - It&apos;s Free
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

          {/* Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <Box
              sx={{
                position: 'relative',
                maxWidth: '1000px',
                mx: 'auto',
                transform: isMobile ? 'none' : 'perspective(1000px) rotateX(5deg)',
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: isMobile ? 'none' : 'perspective(1000px) rotateX(0deg) scale(1.02)',
                },
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  inset: -1,
                  background: mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.03)'
                    : 'rgba(0, 0, 0, 0.03)',
                  borderRadius: 4,
                  filter: 'blur(8px)',
                }}
              />
              <Box
                sx={{
                  position: 'relative',
                  borderRadius: 3,
                  overflow: 'hidden',
                  border: mode === 'dark'
                    ? '1px solid rgba(255, 255, 255, 0.2)'
                    : '1px solid rgba(0, 0, 0, 0.1)',
                  boxShadow: mode === 'dark'
                    ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                    : '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                }}
              >
                <Image
                  src={dashboardImage}
                  alt="TaskFlow Dashboard Preview"
                  width={1000}
                  height={600}
                  style={{
                    width: '100%',
                    height: 'auto',
                    display: 'block',
                  }}
                  priority
                  unoptimized
                />
              </Box>
            </Box>
          </motion.div>
        </Box>

        {/* Social Proof Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Box
            sx={{
              py: 4,
              textAlign: 'center',
              borderTop: mode === 'dark'
                ? '1px solid rgba(255, 255, 255, 0.1)'
                : '1px solid rgba(0, 0, 0, 0.1)',
              borderBottom: mode === 'dark'
                ? '1px solid rgba(255, 255, 255, 0.1)'
                : '1px solid rgba(0, 0, 0, 0.1)',
              mb: 6,
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: mode === 'dark' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
                mb: 3,
                textTransform: 'uppercase',
                letterSpacing: 1,
                fontWeight: 500,
              }}
            >
              Trusted by innovative teams worldwide
            </Typography>
            <Stack
              direction="row"
              spacing={4}
              justifyContent="center"
              alignItems="center"
              flexWrap="wrap"
              sx={{ gap: 2 }}
            >
              {trustedCompanies.map((company) => (
                <Box
                  key={company.name}
                  sx={{
                    opacity: 0.6,
                    filter: mode === 'dark' ? 'grayscale(100%) brightness(2)' : 'grayscale(100%)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      opacity: 1,
                      filter: 'none',
                    },
                  }}
                >
                  <Image
                    src={company.logo}
                    alt={company.name}
                    width={100}
                    height={30}
                    loading="lazy"
                    style={{ objectFit: 'contain' }}
                    unoptimized
                  />
                </Box>
              ))}
            </Stack>
          </Box>
        </motion.div>

        {/* Features Section - Horizontal Layout */}
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
                mb: { xs: 2, md: 3 },
                color: mode === 'dark' ? 'white' : 'text.primary',
              }}
            >
              Why Choose TaskFlow?
            </Typography>
            <Typography
              variant="body1"
              align="center"
              sx={{
                color: mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary',
                mb: { xs: 4, md: 6 },
                maxWidth: '600px',
                mx: 'auto',
              }}
            >
              Everything you need to manage projects efficiently and collaborate seamlessly with your team.
            </Typography>
            
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              <Grid container spacing={3}>
                {features.map((feature, index) => (
                  <Grid item xs={12} md={6} lg={4} key={index}>
                    <motion.div variants={staggerChild}>
                      <Card
                        sx={{
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'row',
                          background: mode === 'dark'
                            ? 'rgba(255, 255, 255, 0.05)'
                            : 'rgba(255, 255, 255, 0.8)',
                          backdropFilter: 'blur(10px)',
                          border: mode === 'dark'
                            ? '1px solid rgba(255, 255, 255, 0.1)'
                            : '1px solid rgba(0, 0, 0, 0.1)',
                          borderRadius: 3,
                          overflow: 'hidden',
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
                        {/* Image Section - Left Side */}
                        {feature.image ? (
                          <Box
                            sx={{
                              position: 'relative',
                              width: { xs: '120px', sm: '140px' },
                              minWidth: { xs: '120px', sm: '140px' },
                              background: mode === 'dark' ? '#1e293b' : '#f1f5f9',
                            }}
                          >
                            <Image
                              src={feature.image}
                              alt={feature.title}
                              fill
                              sizes="140px"
                              loading="lazy"
                              style={{
                                objectFit: 'cover',
                              }}
                              unoptimized
                            />
                          </Box>
                        ) : (
                          /* Icon Placeholder when no image */
                          <Box
                            sx={{
                              width: { xs: '120px', sm: '140px' },
                              minWidth: { xs: '120px', sm: '140px' },
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              background: mode === 'dark'
                                ? 'rgba(255, 255, 255, 0.05)'
                                : 'rgba(0, 0, 0, 0.03)',
                            }}
                          >
                            <Box sx={{ transform: 'scale(1.5)' }}>
                              {feature.icon}
                            </Box>
                          </Box>
                        )}
                        
                        {/* Content Section - Right Side */}
                        <CardContent 
                          sx={{ 
                            flex: 1,
                            p: 3,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            '&:last-child': { pb: 3 },
                          }}
                        >
                          <Typography
                            variant="h6"
                            component="h3"
                            gutterBottom
                            sx={{ 
                              fontWeight: 600, 
                              color: mode === 'dark' ? 'white' : 'text.primary',
                              mb: 1,
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
                            sx={{ 
                              lineHeight: 1.6,
                              fontSize: '0.9rem',
                            }}
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

        {/* Testimonials Section */}
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
              Loved by Thousands
            </Typography>
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              <Grid container spacing={{ xs: 2, md: 3 }}>
                {testimonials.map((testimonial, index) => (
                  <Grid item xs={12} md={4} key={index}>
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
                          position: 'relative',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: mode === 'dark'
                              ? '0 20px 40px rgba(0, 0, 0, 0.3)'
                              : '0 20px 40px rgba(0, 0, 0, 0.1)',
                          },
                        }}
                      >
                        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                          <QuoteIcon 
                            sx={{ 
                              fontSize: 40, 
                              color: 'primary.main',
                              opacity: 0.3,
                              mb: 2,
                            }} 
                          />
                          <Typography
                            variant="body1"
                            sx={{
                              mb: 3,
                              lineHeight: 1.7,
                              color: mode === 'dark' ? 'rgba(255, 255, 255, 0.9)' : 'text.primary',
                              fontStyle: 'italic',
                            }}
                          >
                            &ldquo;{testimonial.content}&rdquo;
                          </Typography>
                          <Stack direction="row" spacing={2} alignItems="center">
                            <Avatar
                              src={testimonial.avatar}
                              alt={testimonial.name}
                              sx={{ width: 48, height: 48 }}
                            />
                            <Box>
                              <Typography
                                variant="subtitle2"
                                sx={{
                                  fontWeight: 600,
                                  color: mode === 'dark' ? 'white' : 'text.primary',
                                }}
                              >
                                {testimonial.name}
                              </Typography>
                              <Typography
                                variant="caption"
                                color={mode === 'dark' ? 'rgba(255, 255, 255, 0.6)' : 'text.secondary'}
                              >
                                {testimonial.role}
                              </Typography>
                            </Box>
                          </Stack>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
            </motion.div>
          </Box>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <Box
            sx={{
              py: { xs: 4, md: 6 },
              px: { xs: 2, md: 4 },
              background: mode === 'dark'
                ? 'rgba(129, 140, 248, 0.1)'
                : 'rgba(129, 140, 248, 0.05)',
              borderRadius: 4,
              border: mode === 'dark'
                ? '1px solid rgba(129, 140, 248, 0.2)'
                : '1px solid rgba(129, 140, 248, 0.1)',
              mb: 6,
            }}
          >
            <Grid container spacing={4} justifyContent="center">
              {[
                { value: '50K+', label: 'Active Users' },
                { value: '1M+', label: 'Tasks Completed' },
                { value: '99.9%', label: 'Uptime' },
              ].map((stat, index) => (
                <Grid item xs={12} sm={4} key={index}>
                  <Box textAlign="center">
                    <Typography
                      variant="h3"
                      sx={{
                        fontWeight: 800,
                        color: 'primary.main',
                      }}
                    >
                      {stat.value}
                    </Typography>
                    <Typography
                      variant="body1"
                      color={mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary'}
                    >
                      {stat.label}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
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
                ? 'rgba(255, 255, 255, 0.03)'
                : 'rgba(0, 0, 0, 0.02)',
              borderRadius: 4,
              border: mode === 'dark'
                ? '1px solid rgba(255, 255, 255, 0.1)'
                : '1px solid rgba(0, 0, 0, 0.1)',
              mb: 4,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Decorative stars */}
            {[...Array(3)].map((_, i) => (
              <Box
                key={i}
                sx={{
                  position: 'absolute',
                  top: `${20 + i * 30}%`,
                  left: i % 2 === 0 ? '10%' : 'auto',
                  right: i % 2 !== 0 ? '10%' : 'auto',
                  color: 'primary.main',
                  opacity: 0.2,
                }}
              >
                <StarIcon sx={{ fontSize: 24 + i * 8 }} />
              </Box>
            ))}
            
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
          position: 'relative',
          zIndex: 1,
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
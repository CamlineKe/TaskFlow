'use client';

import { Box, Paper, Typography, Divider } from '@mui/material';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { slideUp, fadeIn } from '@/lib/motion';

interface AuthCardFooter {
  text: string;
  linkText: string;
  href: string;
}

interface AuthCardProps {
  title: string;
  subtitle?: React.ReactNode;
  /** Optional element rendered as a centered badge above the title. */
  icon?: React.ReactNode;
  titleColor?: string;
  footer?: AuthCardFooter;
  children: React.ReactNode;
}

/**
 * Shared glassmorphism card for all auth pages. Provides the entrance
 * animation, centered header, and optional footer link.
 */
export function AuthCard({
  title,
  subtitle,
  icon,
  titleColor = 'white',
  footer,
  children,
}: AuthCardProps) {
  return (
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
          {icon && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              {icon}
            </Box>
          )}
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{ fontWeight: 700, color: titleColor, mb: 1 }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography
              variant="body1"
              component="div"
              sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 3 }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>

        <motion.div initial="hidden" animate="visible" variants={fadeIn}>
          {children}
        </motion.div>

        {footer && (
          <>
            <Divider sx={{ my: 3, borderColor: 'rgba(255, 255, 255, 0.1)' }} />
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                {footer.text}{' '}
                <Typography
                  component={Link}
                  href={footer.href}
                  sx={{
                    color: 'primary.main',
                    fontWeight: 600,
                    textDecoration: 'none',
                    display: 'inline',
                    '&:hover': { textDecoration: 'underline' },
                  }}
                >
                  {footer.linkText}
                </Typography>
              </Typography>
            </Box>
          </>
        )}
      </Paper>
    </motion.div>
  );
}

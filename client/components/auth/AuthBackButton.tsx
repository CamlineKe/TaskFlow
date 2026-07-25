'use client';

import { IconButton } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import Link from 'next/link';

interface AuthBackButtonProps {
  href: string;
  label?: string;
}

/**
 * Glass-styled back button rendered at the top-left of the auth scaffold.
 * Positioned absolutely against the (auth) layout container.
 */
export function AuthBackButton({ href, label = 'Back' }: AuthBackButtonProps) {
  return (
    <IconButton
      component={Link}
      href={href}
      aria-label={label}
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
  );
}

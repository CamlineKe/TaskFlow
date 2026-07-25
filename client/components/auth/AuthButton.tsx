'use client';

import { Button, CircularProgress } from '@mui/material';
import type { ButtonProps } from '@mui/material';

export type AuthButtonProps = ButtonProps & {
  /** Shows a spinner and disables the button. */
  loading?: boolean;
  loadingText?: string;
  /** Allows rendering as a link (e.g. component={Link} href="..."). */
  component?: React.ElementType;
  href?: string;
};

/**
 * Primary action button for auth forms with a consistent
 * spinner-based pending state.
 */
export function AuthButton({
  loading = false,
  loadingText,
  children,
  disabled,
  variant = 'contained',
  startIcon,
  sx,
  ...rest
}: AuthButtonProps) {
  return (
    <Button
      fullWidth
      variant={variant}
      color="primary"
      disabled={disabled || loading}
      size="large"
      startIcon={
        loading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : startIcon
      }
      sx={{
        py: 1.5,
        fontSize: '1.1rem',
        fontWeight: 600,
        borderRadius: 2,
        ...(variant === 'contained'
          ? {
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
              '&:hover': { boxShadow: '0 12px 48px rgba(0, 0, 0, 0.5)' },
              '&:disabled': { backgroundColor: 'rgba(255, 255, 255, 0.12)' },
            }
          : {
              borderColor: 'rgba(255, 255, 255, 0.3)',
              color: 'white',
              '&:hover': {
                borderColor: 'rgba(255, 255, 255, 0.5)',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
              },
            }),
        ...sx,
      }}
      {...rest}
    >
      {loading ? loadingText ?? children : children}
    </Button>
  );
}

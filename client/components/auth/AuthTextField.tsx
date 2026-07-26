'use client';

import { forwardRef, useState } from 'react';
import {
  TextField,
  InputAdornment,
  IconButton,
  useTheme,
} from '@mui/material';
import type { TextFieldProps } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

export type AuthTextFieldProps = TextFieldProps & {
  /** Icon rendered at the start of the input. */
  startIcon?: React.ReactNode;
  /** Enables password masking with a visibility toggle button. */
  passwordToggle?: boolean;
  /** Applies centered, wide-tracked styling for 6-digit codes. */
  codeInput?: boolean;
};

/**
 * TextField pre-styled for the dark auth scaffold. Removes the
 * per-page copy-pasted glass input styling.
 */
export const AuthTextField = forwardRef<HTMLInputElement, AuthTextFieldProps>(function AuthTextField({
  startIcon,
  passwordToggle = false,
  codeInput = false,
  type,
  error,
  inputProps,
  sx,
  ...rest
}, ref) {
  const theme = useTheme();
  const [showPassword, setShowPassword] = useState(false);

  const resolvedType = passwordToggle ? (showPassword ? 'text' : 'password') : type;

  return (
    <TextField
      inputRef={ref}
      fullWidth
      type={resolvedType}
      error={error}
      inputProps={{
        ...(codeInput
          ? { maxLength: 6, inputMode: 'numeric' as const }
          : {}),
        ...inputProps,
        style: {
          ...(codeInput
            ? {
                textAlign: 'center' as const,
                fontSize: '1.5rem',
                letterSpacing: '0.5rem',
                fontWeight: 600,
              }
            : {}),
          ...inputProps?.style,
        },
      }}
      InputProps={{
        startAdornment: startIcon ? (
          <InputAdornment position="start">
            <IconColor>{startIcon}</IconColor>
          </InputAdornment>
        ) : undefined,
        endAdornment: passwordToggle ? (
          <InputAdornment position="end">
            <IconButton
              onClick={() => setShowPassword((prev) => !prev)}
              edge="end"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              sx={{ color: 'rgba(255, 255, 255, 0.5)' }}
            >
              {showPassword ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          </InputAdornment>
        ) : undefined,
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
        sx: { color: error ? '#FF6B6B' : 'rgba(255, 255, 255, 0.5)' },
      }}
      sx={sx}
      {...rest}
    />
  );
});

function IconColor({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ color: 'rgba(255, 255, 255, 0.5)', display: 'flex' }}>
      {children}
    </span>
  );
}

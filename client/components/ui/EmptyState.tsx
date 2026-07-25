'use client';

import { Box, Typography, Button } from '@mui/material';

interface EmptyStateProps {
  /** Icon element; rendered large and muted above the title. */
  icon?: React.ReactNode;
  title: string;
  description?: string;
  /** When provided with onAction, renders a call-to-action button. */
  actionLabel?: string;
  onAction?: () => void;
  actionIcon?: React.ReactNode;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  actionIcon,
}: EmptyStateProps) {
  return (
    <Box sx={{ textAlign: 'center', py: 8, px: 2 }}>
      {icon && (
        <Box
          sx={{
            mb: 2,
            color: 'text.disabled',
            '& .MuiSvgIcon-root': { fontSize: 64 },
          }}
        >
          {icon}
        </Box>
      )}
      <Typography variant="h6" gutterBottom color="text.secondary">
        {title}
      </Typography>
      {description && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: actionLabel && onAction ? 3 : 0 }}
        >
          {description}
        </Typography>
      )}
      {actionLabel && onAction && (
        <Button
          variant="contained"
          startIcon={actionIcon}
          onClick={onAction}
          size="large"
        >
          {actionLabel}
        </Button>
      )}
    </Box>
  );
}

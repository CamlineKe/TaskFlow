'use client';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
} from '@mui/material';
import {
  InfoOutlined as InfoIcon,
  WarningAmberOutlined as WarningIcon,
  ErrorOutlineOutlined as ErrorIcon,
  CheckCircleOutline as SuccessIcon,
} from '@mui/icons-material';

export type ConfirmationSeverity = 'info' | 'success' | 'warning' | 'error';

interface ConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  severity?: ConfirmationSeverity;
  loading?: boolean;
}

const SEVERITY_CONFIG: Record<
  ConfirmationSeverity,
  { color: 'info' | 'success' | 'warning' | 'error'; Icon: typeof InfoIcon }
> = {
  info: { color: 'info', Icon: InfoIcon },
  success: { color: 'success', Icon: SuccessIcon },
  warning: { color: 'warning', Icon: WarningIcon },
  error: { color: 'error', Icon: ErrorIcon },
};

export function ConfirmationModal({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  severity = 'warning',
  loading = false,
}: ConfirmationModalProps) {
  const { color, Icon } = SEVERITY_CONFIG[severity];
  // Destructive confirmations must not default focus to the confirm button,
  // so pressing Enter cannot trigger the destructive action.
  const isDestructive = severity === 'warning' || severity === 'error';

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby="confirmation-modal-title"
    >
      <DialogTitle sx={{ fontWeight: 600 }}>
        <Box
          id="confirmation-modal-title"
          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
        >
          <Icon color={color} />
          {title}
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1" color="text.secondary" component="div">
          {description}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} variant="outlined" disabled={loading} autoFocus={isDestructive}>
          {cancelText}
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color={color}
          disabled={loading}
          autoFocus={!isDestructive}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : undefined}
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

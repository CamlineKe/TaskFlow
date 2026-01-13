'use client';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Button,
  Box,
  Typography,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';

interface TaskCompletionConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  taskTitle: string;
  isCompleting: boolean; // true if marking as complete, false if marking as incomplete
}

export function TaskCompletionConfirmModal({ 
  open, 
  onClose, 
  onConfirm, 
  taskTitle,
  isCompleting
}: TaskCompletionConfirmModalProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {isCompleting ? (
            <CheckCircleIcon color="success" />
          ) : (
            <WarningIcon color="warning" />
          )}
          <Typography variant="h6">
            {isCompleting ? 'Complete Task' : 'Reopen Task'}
          </Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <DialogContentText>
          {isCompleting ? (
            <>
              Are you sure you want to mark the task <strong>"{taskTitle}"</strong> as completed?
              <br />
              <br />
              <Typography variant="body2" color="warning.main">
                ⚠️ This action will move the task to the completed section.
              </Typography>
            </>
          ) : (
            <>
              Are you sure you want to reopen the task <strong>"{taskTitle}"</strong>?
              <br />
              <br />
              This will move the task back to the active tasks list.
            </>
          )}
        </DialogContentText>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button 
          onClick={onConfirm} 
          variant="contained"
          color={isCompleting ? "success" : "primary"}
          autoFocus
        >
          {isCompleting ? 'Mark Complete' : 'Reopen Task'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
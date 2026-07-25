'use client';

import { ConfirmationModal } from '@/components/ui/ConfirmationModal';

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
    <ConfirmationModal
      open={open}
      onClose={onClose}
      onConfirm={onConfirm}
      title={isCompleting ? 'Complete Task' : 'Reopen Task'}
      description={
        isCompleting ? (
          <>
            Are you sure you want to mark <strong>&quot;{taskTitle}&quot;</strong> as completed?
            It will move to the completed section.
          </>
        ) : (
          <>
            Are you sure you want to reopen <strong>&quot;{taskTitle}&quot;</strong>?
            It will move back to the active tasks list.
          </>
        )
      }
      confirmText={isCompleting ? 'Mark Complete' : 'Reopen Task'}
      severity={isCompleting ? 'success' : 'info'}
    />
  );
}

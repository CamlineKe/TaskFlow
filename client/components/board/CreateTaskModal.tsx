'use client';

import { CreateTaskModal as SharedCreateTaskModal } from '@/components/tasks/CreateTaskModal';

interface CreateTaskModalProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
  columnId: string;
}

export function CreateTaskModal({
  open,
  onClose,
  projectId,
  columnId,
}: CreateTaskModalProps) {
  return (
    <SharedCreateTaskModal
      open={open}
      onClose={onClose}
      projectId={projectId}
      columnId={columnId}
    />
  );
}

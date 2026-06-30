'use client';

import { CreateTaskModal } from '@/components/tasks/CreateTaskModal';

interface CreateTaskModalForProjectProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
}

export function CreateTaskModalForProject({
  open,
  onClose,
  projectId,
}: CreateTaskModalForProjectProps) {
  return (
    <CreateTaskModal
      open={open}
      onClose={onClose}
      projectId={projectId}
    />
  );
}

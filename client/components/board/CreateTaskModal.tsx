'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, TextField, Stack } from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Modal } from '@/components/ui/Modal';
import apiClient from '@/lib/axios';

// Zod schema for the form
const createTaskSchema = z.object({
  title: z.string().min(1, 'Task title is required'),
});

type CreateTaskFormValues = z.infer<typeof createTaskSchema>;

interface CreateTaskModalProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
  columnId: string;
}

// The function that sends data to the backend
const createTask = async (data: CreateTaskFormValues & { projectId: string; columnId: string }) => {
  const response = await apiClient.post('/tasks', data);
  return response.data;
};

export function CreateTaskModal({ open, onClose, projectId, columnId }: CreateTaskModalProps) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateTaskFormValues>({
    resolver: zodResolver(createTaskSchema),
  });

  const mutation = useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      toast.success('Task created successfully!');
      queryClient.invalidateQueries({ queryKey: ['projectBoard', projectId] });
      reset();
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create task.');
    },
  });

  const onSubmit = (data: CreateTaskFormValues) => {
    mutation.mutate({ ...data, projectId, columnId });
  };

  return (
    <Modal open={open} onClose={onClose} title="Create New Task">
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Stack spacing={2}>
          <TextField
            label="Task Title"
            fullWidth
            required
            autoFocus
            {...register('title')}
            error={!!errors.title}
            // --- THIS IS THE FIX ---
            helperText={errors.title?.message} 
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            disabled={isSubmitting || mutation.isPending}
            sx={{ mt: 2, py: 1.5 }}
          >
            {mutation.isPending ? 'Creating...' : 'Create Task'}
          </Button>
        </Stack>
      </form>
    </Modal>
  );
}

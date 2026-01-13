// client/components/board/TaskDetailModal.tsx
'use client';

import { useEffect, useState } from 'react'; // Import useState
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  CircularProgress,
  Alert,
  IconButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { toast } from 'sonner';

import { Modal } from '@/components/ui/Modal';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal'; // Import ConfirmationModal
import apiClient from '@/lib/axios';
import { Task } from './TaskCard';

const editTaskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
});

type EditTaskFormValues = z.infer<typeof editTaskSchema>;

// API functions
const fetchTaskDetails = async (taskId: string): Promise<Task> => {
  const { data } = await apiClient.get(`/tasks/${taskId}`);
  return data;
};

const updateTask = async ({ taskId, data }: { taskId: string; data: EditTaskFormValues }) => {
  const response = await apiClient.put(`/tasks/${taskId}`, data);
  return response.data;
};

const deleteTask = async (taskId: string) => {
  const response = await apiClient.delete(`/tasks/${taskId}`);
  return response.data;
};

interface TaskDetailModalProps {
  taskId: string | null;
  onClose: () => void;
  projectId: string;
}

export function TaskDetailModal({ taskId, onClose, projectId }: TaskDetailModalProps) {
  const queryClient = useQueryClient();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false); // State for confirmation modal

  const { data: task, isLoading, isError, error } = useQuery<Task>({
    queryKey: ['task', taskId],
    queryFn: () => fetchTaskDetails(taskId!),
    enabled: !!taskId,
    retry: (failureCount, error: any) => {
      // Don't retry on 404 errors (task not found/deleted)
      if (error?.response?.status === 404) {
        return false;
      }
      return failureCount < 3;
    },
  });

  // Handle 404 errors by closing the modal
  useEffect(() => {
    if (isError && error && 'response' in error && (error as any).response?.status === 404) {
      toast.error('Task not found. It may have been deleted.');
      onClose();
    }
  }, [isError, error, onClose]);

  const { register, handleSubmit, reset, formState: { isSubmitting, errors } } = useForm<EditTaskFormValues>({
    resolver: zodResolver(editTaskSchema),
  });

  useEffect(() => {
    if (task) {
      reset({ title: task.title, description: task.description || '' });
    }
  }, [task, reset]);

  const updateMutation = useMutation({
    mutationFn: updateTask,
    onSuccess: () => {
      toast.success('Task updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
      queryClient.invalidateQueries({ queryKey: ['projectBoard', projectId] });
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update task.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      toast.success('Task deleted successfully!');
      queryClient.invalidateQueries({ queryKey: ['projectBoard', projectId] });
      onClose(); // Close the main detail modal as well
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete task.');
    },
  });

  const onSubmit = (data: EditTaskFormValues) => {
    if (!taskId) return;
    updateMutation.mutate({ taskId, data });
  };

  const handleDelete = () => {
    if (!taskId) return;
    deleteMutation.mutate(taskId);
  };

  return (
    <>
      <ConfirmationModal
        open={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Task?"
        description="Are you sure you want to delete this task? This action cannot be undone."
      />
      <Modal open={!!taskId} onClose={onClose} title="Task Details">
        {isLoading && <CircularProgress />}
        {isError && (
          // If it's a 404 error, we'll close the modal (handled in useEffect above)
          error && 'response' in error && (error as any).response?.status === 404 ? (
            <CircularProgress />
          ) : (
            <Alert severity="error">
              {error instanceof Error ? error.message : 'Failed to load task'}
            </Alert>
          )
        )}
        {task && (
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <Stack spacing={2}>
              <TextField
                label="Task Title"
                fullWidth
                required
                {...register('title')}
                error={!!errors.title}
                helperText={errors.title?.message}
                defaultValue={task.title}
              />
              <TextField
                label="Description"
                fullWidth
                multiline
                rows={4}
                {...register('description')}
                defaultValue={task.description || ''}
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                <IconButton 
                  onClick={() => setIsConfirmOpen(true)} 
                  color="error"
                  title="Delete Task"
                  disabled={deleteMutation.isPending}
                >
                  <DeleteIcon />
                </IconButton>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isSubmitting || updateMutation.isPending}
                >
                  {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </Box>
            </Stack>
          </form>
        )}
      </Modal>
    </>
  );
}

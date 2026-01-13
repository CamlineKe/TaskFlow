'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Button,
  TextField,
  Stack,
  Box,
  FormControl,
  FormLabel,
  Chip,
} from '@mui/material';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Modal } from '@/components/ui/Modal';
import apiClient from '@/lib/axios';

// Zod schema for task creation
const createTaskSchema = z.object({
  title: z.string().min(1, 'Task title is required').max(200, 'Title cannot exceed 200 characters'),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
});

type CreateTaskFormValues = z.infer<typeof createTaskSchema>;

interface CreateTaskModalForProjectProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
}

// Create task function - will create in the first column (To Do) by default
const createTask = async (data: CreateTaskFormValues & { projectId: string; columnId: string }) => {
  const response = await apiClient.post('/tasks', data);
  return response.data;
};

// Fetch project board to get columns
const fetchProjectBoard = async (projectId: string) => {
  const { data } = await apiClient.get(`/projects/${projectId}/board`);
  return data;
};

const priorityOptions = [
  { value: 'low', label: 'Low', color: 'info' as const },
  { value: 'medium', label: 'Medium', color: 'warning' as const },
  { value: 'high', label: 'High', color: 'error' as const },
];

export function CreateTaskModalForProject({ open, onClose, projectId }: CreateTaskModalForProjectProps) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateTaskFormValues>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      priority: 'medium',
    },
  });

  const watchedPriority = watch('priority');

  // Fetch project board to get columns
  const { data: projectBoard } = useQuery({
    queryKey: ['project-board', projectId],
    queryFn: () => fetchProjectBoard(projectId),
    enabled: open && !!projectId,
  });

  // Create task mutation
  const mutation = useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      toast.success('Task created successfully!');
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project-board', projectId] });
      reset();
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create task.');
    },
  });

  const onSubmit = (data: CreateTaskFormValues) => {
    // Get the first column (usually "To Do")
    const firstColumn = projectBoard?.columns?.[0];
    if (!firstColumn) {
      toast.error('No columns found in this project');
      return;
    }

    mutation.mutate({
      ...data,
      projectId,
      columnId: firstColumn._id,
    });
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose} title="Create New Task" maxWidth="sm">
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Stack spacing={3}>
          <TextField
            label="Task Title"
            fullWidth
            required
            autoFocus
            placeholder="Enter task title..."
            {...register('title')}
            error={!!errors.title}
            helperText={errors.title?.message}
          />
          
          <TextField
            label="Description"
            fullWidth
            multiline
            rows={3}
            placeholder="Describe the task..."
            {...register('description')}
            error={!!errors.description}
            helperText={errors.description?.message || 'Optional task description'}
          />
          
          <FormControl>
            <FormLabel sx={{ mb: 1, fontWeight: 500 }}>Priority</FormLabel>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {priorityOptions.map((option) => (
                <Chip
                  key={option.value}
                  label={option.label}
                  color={watchedPriority === option.value ? option.color : 'default'}
                  variant={watchedPriority === option.value ? 'filled' : 'outlined'}
                  onClick={() => setValue('priority', option.value as any)}
                  sx={{
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: watchedPriority === option.value ? undefined : 'action.hover',
                    },
                  }}
                />
              ))}
            </Box>
          </FormControl>
          
          <Box sx={{ display: 'flex', gap: 2, pt: 2 }}>
            <Button
              variant="outlined"
              onClick={handleClose}
              sx={{ flex: 1 }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting || mutation.isPending}
              sx={{ 
                flex: 1,
                py: 1.5,
                background: 'linear-gradient(45deg, #818CF8 30%, #EC4899 90%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #6366F1 30%, #DB2777 90%)',
                },
              }}
            >
              {mutation.isPending ? 'Creating...' : 'Create Task'}
            </Button>
          </Box>
        </Stack>
      </form>
    </Modal>
  );
}
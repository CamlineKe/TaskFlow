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
  MenuItem,
  Select,
  InputLabel,
} from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Modal } from '@/components/ui/Modal';
import apiClient from '@/lib/axios';
import { invalidateTaskViews, queryKeys } from '@/lib/queryKeys';

const createTaskSchema = z.object({
  title: z.string().min(1, 'Task title is required').max(200, 'Title cannot exceed 200 characters'),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  projectId: z.string().optional(),
});

type CreateTaskFormValues = z.infer<typeof createTaskSchema>;

interface ProjectOption {
  _id: string;
  name: string;
}

interface BoardColumn {
  _id: string;
}

interface CreateTaskModalProps {
  open: boolean;
  onClose: () => void;
  projectId?: string;
  columnId?: string;
  title?: string;
}

const priorityOptions = [
  { value: 'low', label: 'Low', color: 'info' as const },
  { value: 'medium', label: 'Medium', color: 'warning' as const },
  { value: 'high', label: 'High', color: 'error' as const },
] as const;

const fetchProjects = async (): Promise<ProjectOption[]> => {
  const { data } = await apiClient.get('/projects');
  return data;
};

const fetchFirstColumnId = async (projectId: string) => {
  const { data } = await apiClient.get(`/projects/${projectId}/board`);
  const firstColumn = data.columns?.[0] as BoardColumn | undefined;

  if (!firstColumn) {
    throw new Error('No columns found in project');
  }

  return firstColumn._id;
};

const createTask = async (
  data: CreateTaskFormValues & { projectId: string; columnId?: string }
) => {
  const columnId = data.columnId || await fetchFirstColumnId(data.projectId);
  const response = await apiClient.post('/tasks', {
    title: data.title,
    description: data.description,
    priority: data.priority,
    projectId: data.projectId,
    columnId,
  });

  return response.data;
};

export function CreateTaskModal({
  open,
  onClose,
  projectId,
  columnId,
  title = 'Create New Task',
}: CreateTaskModalProps) {
  const queryClient = useQueryClient();
  const shouldSelectProject = !projectId;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateTaskFormValues>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: '',
      description: '',
      priority: 'medium',
      projectId: '',
    },
  });

  const watchedPriority = watch('priority');

  const { data: projects = [] } = useQuery({
    queryKey: queryKeys.projects,
    queryFn: fetchProjects,
    enabled: open && shouldSelectProject,
  });

  const mutation = useMutation({
    mutationFn: createTask,
    onSuccess: (_, variables) => {
      toast.success('Task created successfully!');
      invalidateTaskViews(queryClient, { projectId: variables.projectId });
      reset({
        title: '',
        description: '',
        priority: 'medium',
        projectId: '',
      });
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message || 'Failed to create task.');
    },
  });

  const onSubmit = (data: CreateTaskFormValues) => {
    const resolvedProjectId = projectId || data.projectId;

    if (!resolvedProjectId) {
      setError('projectId', { message: 'Project is required' });
      return;
    }

    mutation.mutate({
      ...data,
      projectId: resolvedProjectId,
      columnId,
    });
  };

  const handleClose = () => {
    reset({
      title: '',
      description: '',
      priority: 'medium',
      projectId: '',
    });
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose} title={title} maxWidth="sm">
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

          {shouldSelectProject && (
            <FormControl fullWidth required error={!!errors.projectId}>
              <InputLabel>Project</InputLabel>
              <Select
                label="Project"
                defaultValue=""
                {...register('projectId')}
              >
                {projects.map((project) => (
                  <MenuItem key={project._id} value={project._id}>
                    {project.name}
                  </MenuItem>
                ))}
              </Select>
              {errors.projectId && (
                <Box sx={{ color: 'error.main', fontSize: '0.75rem', mt: 0.5 }}>
                  {errors.projectId.message}
                </Box>
              )}
            </FormControl>
          )}

          <FormControl>
            <FormLabel sx={{ mb: 1, fontWeight: 500 }}>Priority</FormLabel>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {priorityOptions.map((option) => (
                <Chip
                  key={option.value}
                  label={option.label}
                  color={watchedPriority === option.value ? option.color : 'default'}
                  variant={watchedPriority === option.value ? 'filled' : 'outlined'}
                  onClick={() => setValue('priority', option.value)}
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
              color="primary"
              disabled={isSubmitting || mutation.isPending}
              sx={{
                flex: 1,
                py: 1.5,
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

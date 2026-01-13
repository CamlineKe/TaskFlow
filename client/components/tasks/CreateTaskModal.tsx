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
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Modal } from '@/components/ui/Modal';
import apiClient from '@/lib/axios';

// Zod schema for task creation
const createTaskSchema = z.object({
  title: z.string().min(1, 'Task title is required').max(200, 'Title cannot exceed 200 characters'),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  projectId: z.string().min(1, 'Project is required'),
});

type CreateTaskFormValues = z.infer<typeof createTaskSchema>;

interface CreateTaskModalProps {
  open: boolean;
  onClose: () => void;
}

// Fetch user's projects
const fetchProjects = async () => {
  const { data } = await apiClient.get('/projects');
  return data;
};

// Create task function - will create in the first column (To Do) by default
const createTask = async (data: CreateTaskFormValues) => {
  // First get the project's board to find the first column
  const boardResponse = await apiClient.get(`/projects/${data.projectId}/board`);
  const columns = boardResponse.data.columns;
  
  if (!columns || columns.length === 0) {
    throw new Error('No columns found in project');
  }
  
  // Use the first column (typically "To Do")
  const firstColumn = columns[0];
  
  const taskData = {
    ...data,
    columnId: firstColumn._id,
  };
  
  const response = await apiClient.post('/tasks', taskData);
  return response.data;
};

const priorityOptions = [
  { value: 'low', label: 'Low', color: 'info' as const },
  { value: 'medium', label: 'Medium', color: 'warning' as const },
  { value: 'high', label: 'High', color: 'error' as const },
];

export function CreateTaskModal({ open, onClose }: CreateTaskModalProps) {
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

  // Fetch projects
  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: fetchProjects,
  });

  // Create task mutation
  const mutation = useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      toast.success('Task created successfully!');
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      reset();
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create task.');
    },
  });

  const onSubmit = (data: CreateTaskFormValues) => {
    mutation.mutate(data);
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
          
          <FormControl fullWidth required error={!!errors.projectId}>
            <InputLabel>Project</InputLabel>
            <Select
              label="Project"
              {...register('projectId')}
              defaultValue=""
            >
              {projects.map((project: any) => (
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
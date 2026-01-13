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
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Modal } from '@/components/ui/Modal';
import apiClient from '@/lib/axios';
import { Project } from './ProjectCard';

// Zod schema for project editing
const editProjectSchema = z.object({
  name: z.string().min(3, 'Project name must be at least 3 characters').max(100, 'Project name cannot exceed 100 characters'),
  description: z.string().optional(),
  status: z.enum(['active', 'completed', 'on-hold']),
  dueDate: z.string().optional(),
});

type EditProjectFormValues = z.infer<typeof editProjectSchema>;

interface EditProjectModalProps {
  open: boolean;
  onClose: () => void;
  project: Project;
}

// The function that sends data to the backend
const updateProject = async (projectId: string, data: EditProjectFormValues) => {
  // Convert date string to Date object if provided
  const payload = {
    ...data,
    dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : undefined,
  };
  const response = await apiClient.put(`/projects/${projectId}`, payload);
  return response.data;
};

const statusOptions = [
  { value: 'active', label: 'Active', color: 'primary' as const },
  { value: 'completed', label: 'Completed', color: 'success' as const },
  { value: 'on-hold', label: 'On Hold', color: 'warning' as const },
];

export function EditProjectModal({ open, onClose, project }: EditProjectModalProps) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<EditProjectFormValues>({
    resolver: zodResolver(editProjectSchema),
    defaultValues: {
      name: project.name,
      description: project.description || '',
      status: project.status,
      dueDate: project.dueDate ? new Date(project.dueDate).toISOString().split('T')[0] : '',
    },
  });

  const watchedStatus = watch('status');

  const mutation = useMutation({
    mutationFn: (data: EditProjectFormValues) => updateProject(project._id, data),
    onSuccess: () => {
      toast.success('Project updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', project._id] });
      reset();
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update project.');
    },
  });

  const onSubmit = (data: EditProjectFormValues) => {
    mutation.mutate(data);
  };

  const handleClose = () => {
    reset({
      name: project.name,
      description: project.description || '',
      status: project.status,
      dueDate: project.dueDate ? new Date(project.dueDate).toISOString().split('T')[0] : '',
    });
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose} title="Edit Project" maxWidth="sm">
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Stack spacing={3}>
          <TextField
            label="Project Name"
            fullWidth
            required
            autoFocus
            placeholder="Enter project name..."
            {...register('name')}
            error={!!errors.name}
            helperText={errors.name?.message}
          />
          
          <TextField
            label="Description"
            fullWidth
            multiline
            rows={3}
            placeholder="Describe your project..."
            {...register('description')}
            error={!!errors.description}
            helperText={errors.description?.message || 'Optional project description'}
          />
          
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              label="Status"
              value={watchedStatus}
              {...register('status')}
            >
              {statusOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <TextField
            label="Due Date"
            type="date"
            fullWidth
            InputLabelProps={{
              shrink: true,
            }}
            {...register('dueDate')}
            error={!!errors.dueDate}
            helperText={errors.dueDate?.message || 'Optional due date'}
          />
          
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
              {mutation.isPending ? 'Updating...' : 'Update Project'}
            </Button>
          </Box>
        </Stack>
      </form>
    </Modal>
  );
}
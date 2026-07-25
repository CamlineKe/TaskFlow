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
} from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Modal } from '@/components/ui/Modal';
import { OptionChips } from '@/components/ui/OptionChips';
import apiClient from '@/lib/axios';
import { queryKeys } from '@/lib/queryKeys';
import type { ChipColor } from '@/lib/display';

// Zod schema for the form
const createProjectSchema = z.object({
  name: z.string().min(3, 'Project name must be at least 3 characters').max(100, 'Project name cannot exceed 100 characters'),
  description: z.string().optional(),
  dueDate: z.string().optional(),
  status: z.enum(['active', 'completed', 'on-hold']).default('active'),
});

type CreateProjectFormValues = z.infer<typeof createProjectSchema>;

interface CreateProjectModalProps {
  open: boolean;
  onClose: () => void;
}

// The function that sends data to the backend
const createProject = async (data: CreateProjectFormValues) => {
  // Convert date string to Date object if provided
  const payload = {
    ...data,
    dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
  };
  const response = await apiClient.post('/projects', payload);
  return response.data;
};

const statusOptions: { value: CreateProjectFormValues['status']; label: string; color: ChipColor }[] = [
  { value: 'active', label: 'Active', color: 'success' },
  { value: 'on-hold', label: 'On Hold', color: 'warning' },
  { value: 'completed', label: 'Completed', color: 'info' },
];
export function CreateProjectModal({ open, onClose }: CreateProjectModalProps) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateProjectFormValues>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      status: 'active',
    },
  });

  const watchedStatus = watch('status');

  // TanStack Mutation for handling the API call
  const mutation = useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      toast.success('Project created successfully!');
      queryClient.invalidateQueries({ queryKey: queryKeys.projects });
      reset();
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create project.');
    },
  });

  const onSubmit = (data: CreateProjectFormValues) => {
    mutation.mutate(data);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose} title="Create New Project" maxWidth="sm">
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
          
          <FormControl>
            <FormLabel sx={{ mb: 1, fontWeight: 500 }}>Project Status</FormLabel>
            <OptionChips
              aria-label="Project status"
              options={statusOptions}
              value={watchedStatus}
              onChange={(value) => setValue('status', value)}
            />
          </FormControl>
          
          <TextField
            label="Due Date (Optional)"
            type="date"
            fullWidth
            {...register('dueDate')}
            error={!!errors.dueDate}
            helperText="Set a target completion date"
            InputLabelProps={{
              shrink: true,
            }}
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
              color="primary"
              disabled={isSubmitting || mutation.isPending}
              sx={{ flex: 1 }}
            >
              {mutation.isPending ? 'Creating...' : 'Create Project'}
            </Button>
          </Box>
        </Stack>
      </form>
    </Modal>
  );
}

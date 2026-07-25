'use client';

import {
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  CardActions,
  Button,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Schedule as ScheduleIcon,
  Folder as FolderIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import apiClient from '@/lib/axios';
import { queryKeys } from '@/lib/queryKeys';
import {
  formatDate,
  getProjectStatusColor,
  getProjectStatusLabel,
  isOverdue as isDateOverdue,
} from '@/lib/display';
import type { Project } from '@/types/domain';

export type { Project };

const EditProjectModal = dynamic(
  () => import('./EditProjectModal').then((mod) => mod.EditProjectModal)
);

const ConfirmationModal = dynamic(
  () => import('@/components/ui/ConfirmationModal').then((mod) => mod.ConfirmationModal)
);

interface ProjectCardProps {
  project: Project;
  viewMode?: 'grid' | 'list';
}

export function ProjectCard({ project, viewMode = 'grid' }: ProjectCardProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  // Mutation to delete project
  const deleteProjectMutation = useMutation({
    mutationFn: async (projectId: string) => {
      const response = await apiClient.delete(`/projects/${projectId}`);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Project deleted successfully!');
      queryClient.invalidateQueries({ queryKey: queryKeys.projects });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete project');
    },
  });

  // Mutation to update project status
  const updateProjectMutation = useMutation({
    mutationFn: async (data: { projectId: string; status: string }) => {
      const response = await apiClient.put(`/projects/${data.projectId}`, { status: data.status });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Project status updated successfully!');
      queryClient.invalidateQueries({ queryKey: queryKeys.projects });
      queryClient.invalidateQueries({ queryKey: queryKeys.project(project._id) });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update project status');
    },
  });

  const handleCardClick = () => {
    router.push(`/app/projects/${project._id}`);
  };

  const handleCardKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleCardClick();
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = (event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation();
    }
    setMenuAnchor(null);
  };

  const handleEditProject = (event?: React.MouseEvent) => {
    if (event) event.stopPropagation();
    setEditModalOpen(true);
    handleMenuClose();
  };

  const handleMarkComplete = (event?: React.MouseEvent) => {
    if (event) event.stopPropagation();
    const newStatus = project.status === 'completed' ? 'active' : 'completed';
    updateProjectMutation.mutate({ projectId: project._id, status: newStatus });
    handleMenuClose();
  };

  const handleDeleteProject = (event?: React.MouseEvent) => {
    if (event) event.stopPropagation();
    setDeleteConfirmOpen(true);
    handleMenuClose();
  };

  const handleConfirmDelete = () => {
    deleteProjectMutation.mutate(project._id);
    setDeleteConfirmOpen(false);
  };

  const getProgress = () => {
    if (!project.totalTasks || project.totalTasks === 0) return 0;
    return Math.round(((project.completedTasks || 0) / project.totalTasks) * 100);
  };

  const isOverdue =
    !!project.dueDate && isDateOverdue(project.dueDate) && project.status !== 'completed';

  // Shared chrome for both views: context menu and modals. Rendered outside
  // the Card so the menu/modals work identically in grid and list modes.
  const sharedChrome = (
    <>
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => handleMenuClose()}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        MenuListProps={{
          sx: { py: 0.5 },
          onClick: (e) => e.stopPropagation(),
        }}
        onClick={(e) => e.stopPropagation()}
        sx={{
          '& .MuiPopover-paper': {
            minWidth: 180,
            maxWidth: 250,
            mt: 1,
            boxShadow: 3,
            border: '1px solid',
            borderColor: 'divider',
          },
        }}
      >
        <MenuItem onClick={(e) => handleEditProject(e)} sx={{ px: 2, py: 1 }}>
          <EditIcon sx={{ mr: 1, fontSize: 20 }} />
          Edit Project
        </MenuItem>
        <MenuItem onClick={(e) => handleMarkComplete(e)} sx={{ px: 2, py: 1 }}>
          <CheckCircleIcon sx={{ mr: 1, fontSize: 20 }} />
          {project.status === 'completed' ? 'Mark as Active' : 'Mark as Complete'}
        </MenuItem>
        <MenuItem onClick={(e) => handleDeleteProject(e)} sx={{ px: 2, py: 1, color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1, fontSize: 20 }} />
          Delete Project
        </MenuItem>
      </Menu>

      <EditProjectModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        project={project}
      />

      <ConfirmationModal
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Project"
        description={`Are you sure you want to delete the project "${project.name}"? This action cannot be undone and will delete all associated tasks.`}
        confirmText="Delete Project"
        severity="error"
      />
    </>
  );

  const cardInteractionProps = {
    onClick: handleCardClick,
    onKeyDown: handleCardKeyDown,
    role: 'button',
    tabIndex: 0,
  } as const;

  if (viewMode === 'list') {
    return (
      <>
        <Card
          {...cardInteractionProps}
          sx={{
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            '&:hover': {
              boxShadow: 4,
              transform: 'translateY(-2px)',
            },
            border: '1px solid',
            borderColor: isOverdue ? 'error.main' : 'transparent',
          }}
        >
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.main', mt: 0.5 }}>
                <FolderIcon />
              </Avatar>

              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Typography variant="h6" component="h3" noWrap sx={{ flexGrow: 1 }}>
                    {project.name}
                  </Typography>
                  <Chip
                    label={getProjectStatusLabel(project.status)}
                    size="small"
                    color={getProjectStatusColor(project.status)}
                  />
                  {isOverdue && (
                    <Chip label="Overdue" size="small" color="error" />
                  )}
                </Box>

                {project.description && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2, lineHeight: 1.5 }}
                  >
                    {project.description}
                  </Typography>
                )}

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      Progress: {getProgress()}%
                    </Typography>
                    <Box sx={{ width: 100 }}>
                      <LinearProgress
                        variant="determinate"
                        value={getProgress()}
                        sx={{ height: 6, borderRadius: 3 }}
                      />
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {project.completedTasks || 0}/{project.totalTasks || 0}
                    </Typography>
                  </Box>

                  {project.dueDate && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <ScheduleIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="caption" color={isOverdue ? 'error.main' : 'text.secondary'}>
                        Due {formatDate(project.dueDate)}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>

              <IconButton onClick={handleMenuOpen} size="small" aria-label="Project options">
                <MoreVertIcon />
              </IconButton>
            </Box>
          </CardContent>
        </Card>
        {sharedChrome}
      </>
    );
  }

  // Grid view (default)
  return (
    <>
      <Card
        {...cardInteractionProps}
        sx={{
          cursor: 'pointer',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          transition: 'all 0.2s ease',
          '&:hover': {
            boxShadow: 6,
            transform: 'translateY(-4px)',
          },
          border: '1px solid',
          borderColor: isOverdue ? 'error.main' : 'transparent',
        }}
      >
        <CardContent sx={{ flexGrow: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              <FolderIcon />
            </Avatar>
            <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
              <Chip
                label={getProjectStatusLabel(project.status)}
                size="small"
                color={getProjectStatusColor(project.status)}
              />
              <IconButton onClick={handleMenuOpen} size="small" aria-label="Project options">
                <MoreVertIcon />
              </IconButton>
            </Box>
          </Box>

          <Typography variant="h6" component="h3" gutterBottom noWrap>
            {project.name}
          </Typography>

          {project.description && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mb: 2,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                lineHeight: 1.5,
              }}
            >
              {project.description}
            </Typography>
          )}

          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Progress
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {project.completedTasks || 0}/{project.totalTasks || 0} tasks
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={getProgress()}
              sx={{ height: 8, borderRadius: 4 }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              {getProgress()}% complete
            </Typography>
          </Box>

          {project.dueDate && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <ScheduleIcon sx={{ fontSize: 16, color: isOverdue ? 'error.main' : 'text.secondary' }} />
              <Typography variant="caption" color={isOverdue ? 'error.main' : 'text.secondary'}>
                Due {formatDate(project.dueDate)}
              </Typography>
              {isOverdue && (
                <Chip label="Overdue" size="small" color="error" sx={{ ml: 1 }} />
              )}
            </Box>
          )}
        </CardContent>

        <CardActions sx={{ px: 2, pb: 2 }}>
          <Button size="small" onClick={(e) => { e.stopPropagation(); handleCardClick(); }}>
            View Project
          </Button>
        </CardActions>
      </Card>
      {sharedChrome}
    </>
  );
}

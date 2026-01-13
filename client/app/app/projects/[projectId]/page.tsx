'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
  Chip,
  Avatar,
  LinearProgress,
  IconButton,
  Button,
  Divider,
  Stack,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Edit as EditIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { toast } from 'sonner';

import apiClient from '@/lib/axios';
import { CreateTaskModalForProject } from '@/components/projects/CreateTaskModalForProject';
import { TaskCompletionConfirmModal } from '@/components/tasks/TaskCompletionConfirmModal';
import { EditProjectModal } from '@/components/projects/EditProjectModal';

interface Task {
  _id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  assignee?: {
    _id: string;
    name: string;
    email: string;
  };
}

interface ProjectDetail {
  _id: string;
  name: string;
  description?: string;
  status: 'active' | 'completed' | 'on-hold';
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  owner: {
    _id: string;
    name: string;
    email: string;
  };
  tasks: Task[];
  team?: Array<{
    _id: string;
    name: string;
    email: string;
  }>;
}

const fetchProjectDetail = async (projectId: string): Promise<ProjectDetail> => {
  const { data } = await apiClient.get(`/projects/${projectId}`);
  return data;
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'success';
    case 'completed':
      return 'info';
    case 'on-hold':
      return 'warning';
    default:
      return 'default';
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'error';
    case 'medium':
      return 'warning';
    case 'low':
      return 'info';
    default:
      return 'default';
  }
};

interface ProjectDetailPageProps {
  params: {
    projectId: string;
  };
}

export default function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { projectId } = params;
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [createTaskModalOpen, setCreateTaskModalOpen] = useState(false);
  const [completionModalOpen, setCompletionModalOpen] = useState(false);
  const [editProjectModalOpen, setEditProjectModalOpen] = useState(false);
  const [taskToComplete, setTaskToComplete] = useState<{ id: string; title: string; isCompleting: boolean } | null>(null);
  const queryClient = useQueryClient();

  const { data: project, isLoading, isError, error } = useQuery<ProjectDetail>({
    queryKey: ['project', projectId],
    queryFn: () => fetchProjectDetail(projectId),
    retry: (failureCount, error: any) => {
      // Don't retry on 404 errors (project not found/deleted)
      if (error?.response?.status === 404) {
        return false;
      }
      return failureCount < 3;
    },
  });

  // Handle 404 errors by redirecting to projects page
  useEffect(() => {
    if (isError && error && 'response' in error && (error as any).response?.status === 404) {
      toast.error('Project not found. It may have been deleted.');
      router.push('/app/projects');
    }
  }, [isError, error, router]);

  // Mutation to update task status
  const updateTaskStatusMutation = useMutation({
    mutationFn: async ({ taskId, status }: { taskId: string; status: string }) => {
      const response = await apiClient.put(`/tasks/${taskId}/status`, { status });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Task status updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update task status');
    },
  });

  const handleTaskCompletionClick = (task: Task, event: React.MouseEvent) => {
    event.stopPropagation();
    const isCompleting = task.status !== 'completed';
    setTaskToComplete({
      id: task._id,
      title: task.title,
      isCompleting,
    });
    setCompletionModalOpen(true);
  };

  const handleConfirmTaskCompletion = () => {
    if (taskToComplete) {
      const newStatus = taskToComplete.isCompleting ? 'completed' : 'todo';
      updateTaskStatusMutation.mutate({
        taskId: taskToComplete.id,
        status: newStatus,
      });
    }
    setCompletionModalOpen(false);
    setTaskToComplete(null);
  };

  const handleCancelTaskCompletion = () => {
    setCompletionModalOpen(false);
    setTaskToComplete(null);
  };

  const handleEditProject = () => {
    setEditProjectModalOpen(true);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress size={48} />
      </Box>
    );
  }

  if (isError) {
    // If it's a 404 error, we'll redirect (handled in useEffect above)
    if (error && 'response' in error && (error as any).response?.status === 404) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress size={48} />
        </Box>
      );
    }
    
    // For other errors, show error message
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        Error: {error instanceof Error ? error.message : 'Failed to load project'}
      </Alert>
    );
  }

  if (!project) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        Project not found
      </Alert>
    );
  }

  const completedTasks = project.tasks?.filter(task => task.status === 'completed').length || 0;
  const totalTasks = project.tasks?.length || 0;
  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Box sx={{ mb: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <IconButton onClick={() => router.back()} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600, flex: 1 }}>
            {project.name}
          </Typography>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={handleEditProject}
            sx={{ ml: 2 }}
          >
            Edit Project
          </Button>
        </Box>

        {/* Project Info Cards */}
        <Grid container spacing={3}>
          {/* Project Overview */}
          <Grid item xs={12} md={8}>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Project Overview
                </Typography>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body1" color="text.secondary" paragraph>
                    {project.description || 'No description provided.'}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center', mb: 3 }}>
                  <Chip
                    label={project.status}
                    color={getStatusColor(project.status) as any}
                    variant="filled"
                    sx={{ textTransform: 'capitalize' }}
                  />
                  {project.dueDate && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <ScheduleIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        Due: {format(new Date(project.dueDate), 'MMM dd, yyyy')}
                      </Typography>
                    </Box>
                  )}
                </Box>

                {/* Progress */}
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" fontWeight={500}>
                      Progress
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {completedTasks}/{totalTasks} tasks completed
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={progressPercentage}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: 'grey.200',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 4,
                        background: 'linear-gradient(45deg, #818CF8 30%, #EC4899 90%)',
                      },
                    }}
                  />
                </Box>
              </CardContent>
            </Card>

            {/* Tasks */}
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Tasks ({totalTasks})
                  </Typography>
                  <Button 
                    variant="outlined" 
                    size="small"
                    onClick={() => setCreateTaskModalOpen(true)}
                  >
                    Add Task
                  </Button>
                </Box>
                
                {project.tasks && project.tasks.length > 0 ? (
                  <List sx={{ p: 0 }}>
                    {project.tasks.map((task, index) => (
                      <ListItem
                        key={task._id}
                        sx={{
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 1,
                          mb: 1,
                          '&:last-child': { mb: 0 },
                        }}
                      >
                        <ListItemIcon>
                          {task.status === 'completed' ? (
                            <CheckCircleIcon 
                              color="success" 
                              sx={{ cursor: 'pointer' }}
                              onClick={(e) => handleTaskCompletionClick(task, e)}
                            />
                          ) : (
                            <RadioButtonUncheckedIcon 
                              color="action" 
                              sx={{ cursor: 'pointer' }}
                              onClick={(e) => handleTaskCompletionClick(task, e)}
                            />
                          )}
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography
                                variant="body1"
                                sx={{
                                  textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                                  opacity: task.status === 'completed' ? 0.7 : 1,
                                }}
                              >
                                {task.title}
                              </Typography>
                              <Chip
                                label={task.priority}
                                size="small"
                                color={getPriorityColor(task.priority) as any}
                                variant="outlined"
                              />
                            </Box>
                          }
                          secondary={
                            <Box sx={{ mt: 0.5 }}>
                              {task.description && (
                                <Typography variant="body2" color="text.secondary">
                                  {task.description}
                                </Typography>
                              )}
                              {task.assignee && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                                  <PersonIcon fontSize="small" color="action" />
                                  <Typography variant="caption" color="text.secondary">
                                    {task.assignee.name}
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <AssignmentIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                    <Typography variant="body1" color="text.secondary">
                      No tasks found
                    </Typography>
                    <Typography variant="body2" color="text.disabled">
                      Create your first task to get started
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} md={4}>
            {/* Project Details */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Project Details
                </Typography>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Owner
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 24, height: 24, fontSize: '0.875rem' }}>
                        {project.owner.name.charAt(0)}
                      </Avatar>
                      <Typography variant="body2">{project.owner.name}</Typography>
                    </Box>
                  </Box>
                  
                  <Divider />
                  
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Created
                    </Typography>
                    <Typography variant="body2">
                      {format(new Date(project.createdAt), 'MMM dd, yyyy')}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Last Updated
                    </Typography>
                    <Typography variant="body2">
                      {format(new Date(project.updatedAt), 'MMM dd, yyyy')}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            {/* Team Members */}
            {project.team && project.team.length > 0 && (
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    Team Members ({project.team.length})
                  </Typography>
                  <Stack spacing={1}>
                    {project.team.map((member) => (
                      <Box key={member._id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 32, height: 32 }}>
                          {member.name.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {member.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {member.email}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            )}
          </Grid>
        </Grid>
      </Box>

      {/* Create Task Modal */}
      <CreateTaskModalForProject
        open={createTaskModalOpen}
        onClose={() => setCreateTaskModalOpen(false)}
        projectId={projectId}
      />

      {/* Task Completion Confirmation Modal */}
      <TaskCompletionConfirmModal
        open={completionModalOpen}
        onClose={handleCancelTaskCompletion}
        onConfirm={handleConfirmTaskCompletion}
        taskTitle={taskToComplete?.title || ''}
        isCompleting={taskToComplete?.isCompleting || false}
      />

      {/* Edit Project Modal */}
      {project && (
        <EditProjectModal
          open={editProjectModalOpen}
          onClose={() => setEditProjectModalOpen(false)}
          project={{
            _id: project._id,
            name: project.name,
            description: project.description,
            status: project.status,
            dueDate: project.dueDate ? new Date(project.dueDate) : undefined,
            createdAt: new Date(project.createdAt),
            updatedAt: new Date(project.updatedAt),
            owner: project.owner,
            totalTasks: project.tasks?.length || 0,
            completedTasks: project.tasks?.filter(task => task.status === 'completed').length || 0,
          }}
        />
      )}
    </motion.div>
  );
}

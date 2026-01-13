'use client';

import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  useTheme,
  useMediaQuery,
  LinearProgress,
  Avatar,
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  PendingActions as PendingActionsIcon,
  Add as AddIcon,
  ArrowForward as ArrowForwardIcon,
  Today as TodayIcon,
  AccessTime as AccessTimeIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/axios';

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const staggerChild = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

// API fetch functions
const fetchDashboardStats = async () => {
  const [projectsRes, tasksRes] = await Promise.all([
    apiClient.get('/projects'),
    apiClient.get('/tasks')
  ]);
  
  const projects = projectsRes.data;
  const tasks = tasksRes.data;
  
  return {
    totalTasks: tasks.length,
    completedTasks: tasks.filter((t: any) => t.status === 'completed').length,
    inProgressTasks: tasks.filter((t: any) => t.status === 'in-progress').length,
    pendingTasks: tasks.filter((t: any) => t.status === 'todo').length,
    overdueTasks: tasks.filter((t: any) => {
      return new Date(t.dueDate) < new Date() && t.status !== 'completed';
    }).length,
    activeProjects: projects.filter((p: any) => p.status === 'active').length,
    recentTasks: tasks.slice(0, 4),
    recentProjects: projects.slice(0, 3).map((p: any) => {
      const projectTasks = tasks.filter((t: any) => t.project?._id === p._id);
      const completedProjectTasks = projectTasks.filter((t: any) => t.status === 'completed');
      return {
        ...p,
        completedTasks: completedProjectTasks.length,
        totalTasks: projectTasks.length,
        progress: projectTasks.length > 0 ? Math.round((completedProjectTasks.length / projectTasks.length) * 100) : 0
      };
    })
  };
};

export default function DashboardPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user } = useAuthStore();
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Fetch dashboard data
  const { data: dashboardData, isLoading, isError } = useQuery({
    queryKey: ['dashboard'],
    queryFn: fetchDashboardStats,
  });

  // Fallback to empty data if loading or error
  const stats = dashboardData || {
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    pendingTasks: 0,
    overdueTasks: 0,
    activeProjects: 0,
    recentTasks: [],
    recentProjects: []
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in-progress': return 'warning';
      case 'pending': return 'info';
      default: return 'default';
    }
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
      <Box sx={{ maxWidth: '1200px', mx: 'auto' }}>
        {/* Header Section */}
        <motion.div variants={staggerChild}>
          <Box sx={{ mb: 4 }}>
            <Typography
              variant={isMobile ? 'h4' : 'h3'}
              component="h1"
              gutterBottom
              sx={{ fontWeight: 700, color: 'text.primary' }}
            >
              {getGreeting()}, {user?.name}! 👋
            </Typography>
            <Typography
              variant="subtitle1"
              color="text.secondary"
              sx={{ mb: 2 }}
            >
              Here's what's happening with your projects today
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
              <TodayIcon fontSize="small" />
              <Typography variant="body2">
                {currentTime.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </Typography>
            </Box>
          </Box>
        </motion.div>

        {/* Stats Cards */}
        <motion.div variants={staggerChild}>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={6} md={3}>
              <Card sx={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                transition: 'transform 0.2s ease',
                '&:hover': { transform: 'translateY(-4px)' }
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="h4" component="div" sx={{ fontWeight: 700 }}>
                        {isLoading ? '...' : stats.totalTasks}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Total Tasks
                      </Typography>
                    </Box>
                    <AssignmentIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={6} md={3}>
              <Card sx={{ 
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                color: 'white',
                transition: 'transform 0.2s ease',
                '&:hover': { transform: 'translateY(-4px)' }
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="h4" component="div" sx={{ fontWeight: 700 }}>
                        {isLoading ? '...' : stats.completedTasks}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Completed
                      </Typography>
                    </Box>
                    <CheckCircleIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={6} md={3}>
              <Card sx={{ 
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                color: 'white',
                transition: 'transform 0.2s ease',
                '&:hover': { transform: 'translateY(-4px)' }
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="h4" component="div" sx={{ fontWeight: 700 }}>
                        {isLoading ? '...' : stats.inProgressTasks}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        In Progress
                      </Typography>
                    </Box>
                    <PendingActionsIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={6} md={3}>
              <Card sx={{ 
                background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                color: 'white',
                transition: 'transform 0.2s ease',
                '&:hover': { transform: 'translateY(-4px)' }
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="h4" component="div" sx={{ fontWeight: 700 }}>
                        {isLoading ? '...' : stats.pendingTasks}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Pending
                      </Typography>
                    </Box>
                    <ScheduleIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </motion.div>

        {/* Main Content Grid */}
        <Grid container spacing={3}>
          {/* Recent Tasks */}
          <Grid item xs={12} md={8}>
            <motion.div variants={staggerChild}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
                      Recent Tasks
                    </Typography>
                    <Button
                      component={Link}
                      href="/app/tasks"
                      endIcon={<ArrowForwardIcon />}
                      size="small"
                    >
                      View All
                    </Button>
                  </Box>
                  
                  <List sx={{ py: 0 }}>
                    {isLoading ? (
                      Array.from(new Array(3)).map((_, index) => (
                        <ListItem key={index} sx={{ px: 0 }}>
                          <ListItemIcon>
                            <Avatar sx={{ width: 32, height: 32, bgcolor: 'grey.300' }}>...</Avatar>
                          </ListItemIcon>
                          <ListItemText primary="Loading..." secondary="Loading..." />
                        </ListItem>
                      ))
                    ) : stats.recentTasks.length === 0 ? (
                      <ListItem sx={{ px: 0 }}>
                        <ListItemText 
                          primary="No recent tasks" 
                          secondary="Create your first task to see it here"
                        />
                      </ListItem>
                    ) : (
                      stats.recentTasks.map((task: any, index: number) => (
                        <ListItem 
                          key={task._id || index} 
                          sx={{ 
                            px: 0,
                            borderBottom: index < stats.recentTasks.length - 1 ? '1px solid' : 'none',
                            borderColor: 'divider',
                          }}
                        >
                          <ListItemIcon>
                            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                              {task.title?.charAt(0) || 'T'}
                            </Avatar>
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
                                {task.title || 'Untitled Task'}
                              </Typography>
                            }
                            secondary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                <Typography variant="caption" color="text.secondary">
                                  {task.project?.name || 'No Project'}
                                </Typography>
                                <Chip 
                                  label={task.status || 'pending'} 
                                  size="small" 
                                  color={getStatusColor(task.status) as any}
                                  sx={{ height: 20, fontSize: '0.7rem' }}
                                />
                                {task.dueDate && (
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <AccessTimeIcon sx={{ fontSize: 12, color: 'text.secondary' }} />
                                    <Typography variant="caption" color="text.secondary">
                                      {new Date(task.dueDate).toLocaleDateString()}
                                    </Typography>
                                  </Box>
                                )}
                              </Box>
                            }
                          />
                        </ListItem>
                      ))
                    )}
                  </List>
                </CardContent>
                <CardActions>
                  <Button
                    component={Link}
                    href="/app/tasks"
                    startIcon={<AddIcon />}
                    variant="contained"
                    fullWidth
                    sx={{ m: 2, mt: 0 }}
                  >
                    Create New Task
                  </Button>
                </CardActions>
              </Card>
            </motion.div>
          </Grid>

          {/* Project Progress */}
          <Grid item xs={12} md={4}>
            <motion.div variants={staggerChild}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
                      Project Progress
                    </Typography>
                    <Button
                      component={Link}
                      href="/app/projects"
                      size="small"
                      endIcon={<ArrowForwardIcon />}
                    >
                      View All
                    </Button>
                  </Box>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {isLoading ? (
                      Array.from(new Array(3)).map((_, index) => (
                        <Box key={index}>
                          <Typography variant="subtitle2">Loading...</Typography>
                          <LinearProgress sx={{ height: 8, borderRadius: 4, mt: 1 }} />
                        </Box>
                      ))
                    ) : stats.recentProjects.length === 0 ? (
                      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                        No projects found. Create your first project!
                      </Typography>
                    ) : (
                      stats.recentProjects.map((project: any) => (
                        <Box key={project._id}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
                              {project.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {project.progress || 0}%
                            </Typography>
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={project.progress || 0} 
                            sx={{ 
                              height: 8, 
                              borderRadius: 4,
                              backgroundColor: 'rgba(0, 0, 0, 0.1)',
                            }}
                          />
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                            {project.completedTasks || 0} of {project.totalTasks || 0} tasks completed
                          </Typography>
                        </Box>
                      ))
                    )}
                  </Box>
                </CardContent>
                <CardActions>
                  <Button
                    component={Link}
                    href="/app/projects"
                    startIcon={<AddIcon />}
                    variant="outlined"
                    fullWidth
                    sx={{ m: 2, mt: 0 }}
                  >
                    Create Project
                  </Button>
                </CardActions>
              </Card>
            </motion.div>
          </Grid>
        </Grid>

        {/* Quick Actions */}
        <motion.div variants={staggerChild}>
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" component="h2" sx={{ fontWeight: 600, mb: 2 }}>
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <Button
                  component={Link}
                  href="/app/projects"
                  variant="outlined"
                  fullWidth
                  startIcon={<AddIcon />}
                  sx={{ py: 1.5 }}
                >
                  New Project
                </Button>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Button
                  component={Link}
                  href="/app/tasks"
                  variant="outlined"
                  fullWidth
                  startIcon={<AssignmentIcon />}
                  sx={{ py: 1.5 }}
                >
                  Add Task
                </Button>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Button
                  component={Link}
                  href="/app/tasks"
                  variant="outlined"
                  fullWidth
                  startIcon={<ScheduleIcon />}
                  sx={{ py: 1.5 }}
                >
                  View Schedule
                </Button>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Button
                  component={Link}
                  href="/app/settings"
                  variant="outlined"
                  fullWidth
                  startIcon={<TrendingUpIcon />}
                  sx={{ py: 1.5 }}
                >
                  Analytics
                </Button>
              </Grid>
            </Grid>
          </Box>
        </motion.div>
      </Box>
    </motion.div>
  );
}
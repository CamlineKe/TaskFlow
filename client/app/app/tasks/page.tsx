'use client';

import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  useTheme,
  useMediaQuery,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Avatar,
  Checkbox,
  Menu,
  MenuItem,
  Fab,
  Popover,
  FormControl,
  FormGroup,
  FormControlLabel,
  Divider,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Flag as FlagIcon,
  AccessTime as AccessTimeIcon,
  Assignment as AssignmentIcon,
  Edit as EditIcon,
  Check as CheckIcon,
  PriorityHigh as PriorityHighIcon,
  FolderShared as FolderSharedIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/axios';
import { CreateTaskModal } from '@/components/tasks/CreateTaskModal';
import { TaskDetailModal } from '@/components/board/TaskDetailModal';
import { TaskCompletionConfirmModal } from '@/components/tasks/TaskCompletionConfirmModal';
import { toast } from 'sonner';

// Task interface
interface Task {
  id: string;
  _id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  completed?: boolean;
  project?: {
    _id: string;
    name: string;
  };
  assignee?: {
    _id: string;
    name: string;
    email: string;
  };
}

// API fetch function
const fetchTasks = async (): Promise<Task[]> => {
  const { data } = await apiClient.get('/tasks');
  return data;
};
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

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

export default function TasksPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [taskDetailId, setTaskDetailId] = useState<string | null>(null);
  const [completionModalOpen, setCompletionModalOpen] = useState(false);
  const [taskToComplete, setTaskToComplete] = useState<{ id: string; title: string; isCompleting: boolean } | null>(null);
  
  // Filter states
  const [filterAnchorEl, setFilterAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [filters, setFilters] = useState({
    priority: {
      high: false,
      medium: false,
      low: false,
    },
    status: {
      todo: false,
      'in-progress': false,
      completed: false,
    },
    hasProject: false,
    hasDueDate: false,
  });
  
  const queryClient = useQueryClient();

  // Fetch tasks from API
  const { data: tasks, isLoading, isError } = useQuery<Task[]>({
    queryKey: ['tasks'],
    queryFn: fetchTasks,
  });

  // Use empty array as fallback
  const taskList = tasks || [];

  // Mutation to update task status
  const updateTaskStatusMutation = useMutation({
    mutationFn: async ({ taskId, status }: { taskId: string; status: string }) => {
      const response = await apiClient.put(`/tasks/${taskId}/status`, { status });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Task status updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['project'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update task status');
    },
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, taskId: string) => {
    // Use client coordinates for positioning
    const rect = event.currentTarget.getBoundingClientRect();
    setMenuPosition({
      left: rect.left,
      top: rect.bottom,
    });
    setSelectedTaskId(taskId);
    event.stopPropagation();
    event.preventDefault();
  };

  const handleMenuClose = () => {
    setMenuPosition(null);
    setSelectedTaskId(null);
  };

  const handleTaskClick = (taskId: string) => {
    setTaskDetailId(taskId);
  };

  const handleCreateTask = () => {
    setIsCreateModalOpen(true);
  };

  const handleFilterClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleFilterChange = (category: string, key: string, checked: boolean) => {
    setFilters(prev => {
      if (category === 'priority') {
        return {
          ...prev,
          priority: {
            ...prev.priority,
            [key]: checked,
          },
        };
      } else if (category === 'status') {
        return {
          ...prev,
          status: {
            ...prev.status,
            [key]: checked,
          },
        };
      }
      return prev;
    });
  };

  const clearAllFilters = () => {
    setFilters({
      priority: { high: false, medium: false, low: false },
      status: { todo: false, 'in-progress': false, completed: false },
      hasProject: false,
      hasDueDate: false,
    });
  };

  const handleTaskCompletionClick = (task: Task, event: React.MouseEvent | React.ChangeEvent) => {
    event.stopPropagation();
    const isCompleting = task.status !== 'completed';
    setTaskToComplete({
      id: task._id || task.id,
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in-progress': return 'warning';
      case 'pending': return 'info';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'default';
    }
  };

  const filterTasks = (status?: string): Task[] => {
    let filtered = taskList;
    
    if (status === 'completed') {
      filtered = filtered.filter((task: Task) => task.status === 'completed');
    } else if (status === 'active') {
      filtered = filtered.filter((task: Task) => task.status !== 'completed');
    }
    
    if (searchQuery) {
      filtered = filtered.filter((task: Task) => 
        task.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.project?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply priority filters
    const priorityFilters = Object.entries(filters.priority).filter(([_, checked]) => checked).map(([priority]) => priority);
    if (priorityFilters.length > 0) {
      filtered = filtered.filter((task: Task) => priorityFilters.includes(task.priority));
    }

    // Apply status filters
    const statusFilters = Object.entries(filters.status).filter(([_, checked]) => checked).map(([status]) => status);
    if (statusFilters.length > 0) {
      filtered = filtered.filter((task: Task) => statusFilters.includes(task.status));
    }

    // Apply project filter
    if (filters.hasProject) {
      filtered = filtered.filter((task: Task) => task.project);
    }

    // Apply due date filter
    if (filters.hasDueDate) {
      filtered = filtered.filter((task: Task) => task.dueDate);
    }
    
    return filtered;
  };

  const TaskCard = ({ task }: { task: Task }) => (
    <motion.div variants={staggerChild}>
      <Card 
        onClick={() => handleTaskClick(task._id || task.id)}
        sx={{ 
          mb: 2,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          '&:hover': { 
            transform: 'translateY(-2px)',
            boxShadow: theme.shadows[4],
          },
          opacity: task.completed ? 0.7 : 1,
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
            <Checkbox
              checked={task.completed || task.status === 'completed'}
              onChange={(e) => handleTaskCompletionClick(task, e)}
              onClick={(e) => e.stopPropagation()}
              sx={{ mt: -1 }}
              color="success"
            />
            
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography
                  variant="h6"
                  component="h3"
                  sx={{
                    fontWeight: 600,
                    textDecoration: task.completed ? 'line-through' : 'none',
                    color: task.completed ? 'text.secondary' : 'text.primary',
                  }}
                >
                  {task.title}
                </Typography>
                <Chip
                  label={task.priority}
                  size="small"
                  color={getPriorityColor(task.priority) as any}
                  sx={{ height: 20, fontSize: '0.7rem' }}
                />
              </Box>
              
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 2, lineHeight: 1.5 }}
              >
                {task.description}
              </Typography>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
                <Chip
                  label={task.project?.name || 'No Project'}
                  size="small"
                  variant="outlined"
                  sx={{ height: 24 }}
                />
                <Chip
                  label={task.status}
                  size="small"
                  color={getStatusColor(task.status) as any}
                  sx={{ height: 24 }}
                />
                {task.dueDate && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <AccessTimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="caption" color="text.secondary">
                      Due {new Date(task.dueDate).toLocaleDateString()}
                    </Typography>
                  </Box>
                )}
                {task.assignee && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Avatar sx={{ width: 20, height: 20, fontSize: '0.7rem' }}>
                      {task.assignee.name.split(' ').map((n: string) => n[0]).join('')}
                    </Avatar>
                    <Typography variant="caption" color="text.secondary">
                      {task.assignee.name}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
            
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleMenuOpen(e, task._id || task.id);
              }}
            >
              <MoreVertIcon />
            </IconButton>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <>
      {/* Modals */}
      <CreateTaskModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
      <TaskDetailModal
        taskId={taskDetailId}
        onClose={() => setTaskDetailId(null)}
        projectId={taskDetailId ? (taskList.find(t => (t._id || t.id) === taskDetailId)?.project?._id || '') : ''}
      />
      <TaskCompletionConfirmModal
        open={completionModalOpen}
        onClose={handleCancelTaskCompletion}
        onConfirm={handleConfirmTaskCompletion}
        taskTitle={taskToComplete?.title || ''}
        isCompleting={taskToComplete?.isCompleting || false}
      />
      
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
      <Box sx={{ maxWidth: '1200px', mx: 'auto' }}>
        {/* Header */}
        <motion.div variants={staggerChild}>
          <Box sx={{ mb: 4 }}>
            <Typography
              variant={isMobile ? 'h4' : 'h3'}
              component="h1"
              gutterBottom
              sx={{ fontWeight: 700, color: 'text.primary' }}
            >
              My Tasks
            </Typography>
            <Typography
              variant="subtitle1"
              color="text.secondary"
              sx={{ mb: 3 }}
            >
              Manage and track all your tasks across projects
            </Typography>
            
            {/* Search and Filter */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexDirection: { xs: 'column', sm: 'row' } }}>
              <TextField
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ flexGrow: 1 }}
              />
              <Button
                variant="outlined"
                startIcon={<FilterListIcon />}
                onClick={handleFilterClick}
                sx={{ minWidth: { xs: 'auto', sm: 120 } }}
              >
                Filter
              </Button>
            </Box>
          </Box>
        </motion.div>

        {/* Tabs */}
        <motion.div variants={staggerChild}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="task tabs">
              <Tab 
                label={`All Tasks (${filterTasks().length})`} 
                icon={<AssignmentIcon />}
                iconPosition="start"
              />
              <Tab 
                label={`Active (${filterTasks('active').length})`} 
                icon={<ScheduleIcon />}
                iconPosition="start"
              />
              <Tab 
                label={`Completed (${filterTasks('completed').length})`} 
                icon={<CheckCircleIcon />}
                iconPosition="start"
              />
            </Tabs>
          </Box>
        </motion.div>

        {/* Task Lists */}
        <TabPanel value={tabValue} index={0}>
          <motion.div variants={staggerContainer}>
            {filterTasks().map((task: Task) => (
              <TaskCard key={task._id || task.id} task={task} />
            ))}
          </motion.div>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <motion.div variants={staggerContainer}>
            {filterTasks('active').map((task: Task) => (
              <TaskCard key={task._id || task.id} task={task} />
            ))}
          </motion.div>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <motion.div variants={staggerContainer}>
            {filterTasks('completed').map((task: Task) => (
              <TaskCard key={task._id || task.id} task={task} />
            ))}
          </motion.div>
        </TabPanel>

        {/* Empty State */}
        {filterTasks().length === 0 && (
          <motion.div variants={staggerChild}>
            <Box
              sx={{
                textAlign: 'center',
                py: 8,
                px: 2,
              }}
            >
              <AssignmentIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom color="text.secondary">
                No tasks found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {searchQuery ? 'Try adjusting your search query' : 'Create your first task to get started'}
              </Typography>
              <Button variant="contained" startIcon={<AddIcon />} size="large" onClick={handleCreateTask}>
                Create New Task
              </Button>
            </Box>
          </motion.div>
        )}

        {/* Floating Action Button */}
        <Fab
          color="primary"
          aria-label="add task"
          onClick={handleCreateTask}
          sx={{
            position: 'fixed',
            bottom: { xs: 80, md: 32 },
            right: { xs: 16, md: 32 },
          }}
        >
          <AddIcon />
        </Fab>

        {/* Context Menu */}
        <Menu
          id="task-context-menu"
          open={Boolean(menuPosition)}
          onClose={handleMenuClose}
          anchorReference="anchorPosition"
          anchorPosition={menuPosition ? { top: menuPosition.top, left: menuPosition.left } : undefined}
          PaperProps={{
            style: {
              minWidth: 180,
              maxWidth: 250,
              boxShadow: '0px 2px 10px rgba(0,0,0,0.2)',
              border: '1px solid #e0e0e0',
            },
          }}
        >
          <MenuItem onClick={(e) => {
            e.stopPropagation();
            if (selectedTaskId) {
              setTaskDetailId(selectedTaskId);
            }
            handleMenuClose();
          }} sx={{ px: 2, py: 1 }}>
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            Edit Task
          </MenuItem>
          <MenuItem onClick={(e) => {
            e.stopPropagation();
            if (selectedTaskId) {
              const task = taskList.find(t => (t._id || t.id) === selectedTaskId);
              if (task) {
                handleTaskCompletionClick(task, { stopPropagation: () => {} } as any);
              }
            }
            handleMenuClose();
          }} sx={{ px: 2, py: 1 }}>
            <ListItemIcon>
              <CheckIcon fontSize="small" />
            </ListItemIcon>
            Mark as Complete
          </MenuItem>
          <MenuItem onClick={(e) => {
            e.stopPropagation();
            handleMenuClose();
          }} sx={{ px: 2, py: 1 }}>
            <ListItemIcon>
              <PriorityHighIcon fontSize="small" />
            </ListItemIcon>
            Change Priority
          </MenuItem>
          <MenuItem onClick={(e) => {
            e.stopPropagation();
            handleMenuClose();
          }} sx={{ px: 2, py: 1 }}>
            <ListItemIcon>
              <FolderSharedIcon fontSize="small" />
            </ListItemIcon>
            Assign to Project
          </MenuItem>
          <MenuItem onClick={(e) => {
            e.stopPropagation();
            handleMenuClose();
          }} sx={{ px: 2, py: 1, color: 'error.main' }}>
            <ListItemIcon>
              <DeleteIcon fontSize="small" sx={{ color: 'error.main' }} />
            </ListItemIcon>
            Delete Task
          </MenuItem>
        </Menu>

        {/* Filter Popover */}
        <Popover
          open={Boolean(filterAnchorEl)}
          anchorEl={filterAnchorEl}
          onClose={handleFilterClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
        >
          <Box sx={{ p: 3, minWidth: 250 }}>
            <Typography variant="h6" gutterBottom>
              Filter Tasks
            </Typography>
            
            <FormControl component="fieldset" sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Priority
              </Typography>
              <FormGroup>
                {Object.entries(filters.priority).map(([priority, checked]) => (
                  <FormControlLabel
                    key={priority}
                    control={
                      <Checkbox
                        checked={checked}
                        onChange={(e) => handleFilterChange('priority', priority, e.target.checked)}
                        size="small"
                      />
                    }
                    label={priority.charAt(0).toUpperCase() + priority.slice(1)}
                  />
                ))}
              </FormGroup>
            </FormControl>

            <Divider sx={{ my: 2 }} />

            <FormControl component="fieldset" sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Status
              </Typography>
              <FormGroup>
                {Object.entries(filters.status).map(([status, checked]) => (
                  <FormControlLabel
                    key={status}
                    control={
                      <Checkbox
                        checked={checked}
                        onChange={(e) => handleFilterChange('status', status, e.target.checked)}
                        size="small"
                      />
                    }
                    label={status === 'in-progress' ? 'In Progress' : status.charAt(0).toUpperCase() + status.slice(1)}
                  />
                ))}
              </FormGroup>
            </FormControl>

            <Divider sx={{ my: 2 }} />

            <FormControl component="fieldset" sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Other Filters
              </Typography>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={filters.hasProject}
                      onChange={(e) => setFilters(prev => ({ ...prev, hasProject: e.target.checked }))}
                      size="small"
                    />
                  }
                  label="Has Project"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={filters.hasDueDate}
                      onChange={(e) => setFilters(prev => ({ ...prev, hasDueDate: e.target.checked }))}
                      size="small"
                    />
                  }
                  label="Has Due Date"
                />
              </FormGroup>
            </FormControl>

            <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
              <Button
                onClick={clearAllFilters}
                variant="outlined"
                size="small"
                fullWidth
              >
                Clear All
              </Button>
              <Button
                onClick={handleFilterClose}
                variant="contained"
                size="small"
                fullWidth
              >
                Apply
              </Button>
            </Box>
          </Box>
        </Popover>
      </Box>
    </motion.div>
    </>
  );
}
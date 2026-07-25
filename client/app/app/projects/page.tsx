'use client';

import { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Alert,
  Grid,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  useTheme,
  useMediaQuery,
  Fab,
  Menu,
  MenuItem,
  IconButton,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  ViewModule as ViewModuleIcon,
  ViewList as ViewListIcon,
  Folder as FolderIcon,
} from '@mui/icons-material';
import dynamic from 'next/dynamic';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';

import apiClient from '@/lib/axios';
import { ProjectCard, Project } from '@/components/projects/ProjectCard';
import { ProjectCardSkeleton } from '@/components/projects/ProjectCardSkeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { queryKeys } from '@/lib/queryKeys';
import { fadeIn, staggerContainer, staggerChild } from '@/lib/motion';

const CreateProjectModal = dynamic(
  () => import('@/components/projects/CreateProjectModal').then((mod) => mod.CreateProjectModal)
);

const fetchProjects = async (): Promise<Project[]> => {
  const { data } = await apiClient.get('/projects');
  return data;
};

type SortKey = 'name' | 'dueDate' | 'progress';

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
      id={`projects-tabpanel-${index}`}
      aria-labelledby={`projects-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

export default function ProjectsPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [sortBy, setSortBy] = useState<SortKey | null>(null);

  const { data: projects, isLoading, isError, error } = useQuery<Project[]>({
    queryKey: queryKeys.projects,
    queryFn: fetchProjects,
  });

  // Use empty array as fallback if no projects
  const projectList = projects || [];

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleSortSelect = (key: SortKey) => {
    setSortBy((current) => (current === key ? null : key));
    setMenuAnchor(null);
  };

  const getProgress = (project: Project) => {
    if (!project.totalTasks || project.totalTasks === 0) return 0;
    return Math.round(((project.completedTasks || 0) / project.totalTasks) * 100);
  };

  const filterProjects = (status?: string) => {
    let filtered = projectList;

    if (status === 'active') {
      filtered = filtered.filter(project => project.status === 'active');
    } else if (status === 'completed') {
      filtered = filtered.filter(project => project.status === 'completed');
    }

    if (searchQuery) {
      filtered = filtered.filter(project =>
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (project.description?.toLowerCase().includes(searchQuery.toLowerCase()) || false)
      );
    }

    if (sortBy) {
      const sorted = [...filtered];
      switch (sortBy) {
        case 'name':
          sorted.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case 'dueDate':
          sorted.sort((a, b) => {
            if (!a.dueDate && !b.dueDate) return 0;
            if (!a.dueDate) return 1;
            if (!b.dueDate) return -1;
            return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
          });
          break;
        case 'progress':
          sorted.sort((a, b) => getProgress(b) - getProgress(a));
          break;
      }
      return sorted;
    }

    return filtered;
  };

  const getProjectStats = () => {
    // Proper status filtering now that backend returns correct status values
    const active = projectList.filter(p => p.status === 'active').length;
    const completed = projectList.filter(p => p.status === 'completed').length;
    const total = projectList.length;
    
    return { active, completed, total };
  };

  const stats = getProjectStats();

  const renderProjects = (projects: Project[], emptyTitle: string, emptyDescription: string, showCreateAction = false) => {
    if (isLoading) {
      return (
        <Grid container spacing={3}>
          {Array.from(new Array(6)).map((_, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <ProjectCardSkeleton />
            </Grid>
          ))}
        </Grid>
      );
    }

    if (projects.length === 0) {
      return (
        <EmptyState
          icon={<FolderIcon />}
          title={emptyTitle}
          description={emptyDescription}
          actionLabel={showCreateAction ? 'Create New Project' : undefined}
          onAction={showCreateAction ? () => setIsModalOpen(true) : undefined}
          actionIcon={<AddIcon />}
        />
      );
    }

    return (
      <motion.div variants={staggerContainer} initial="hidden" animate="visible">
        <Grid container spacing={3}>
          {projects.map((project) => (
            <Grid item xs={12} sm={6} md={viewMode === 'list' ? 12 : 4} key={project._id}>
              <motion.div variants={staggerChild}>
                <ProjectCard project={project} viewMode={viewMode} />
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </motion.div>
    );
  };

  return (
    <>
      <CreateProjectModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
      
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: { xs: 'flex-start', sm: 'center' },
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2,
            mb: 3
          }}>
            <Box>
              <Typography 
                variant={isMobile ? 'h4' : 'h3'} 
                component="h1" 
                sx={{ fontWeight: 700, mb: 1 }}
              >
                Projects
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                Manage and track your project portfolio
              </Typography>
            </Box>
            {!isMobile && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setIsModalOpen(true)}
                size="large"
                sx={{ px: 3 }}
              >
                New Project
              </Button>
            )}
          </Box>

          {/* Stats Cards */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={4} sm={4}>
              <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'background.paper', borderRadius: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  {stats.total}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Total Projects
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={4} sm={4}>
              <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'background.paper', borderRadius: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'warning.main' }}>
                  {stats.active}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Active
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={4} sm={4}>
              <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'background.paper', borderRadius: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
                  {stats.completed}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Completed
                </Typography>
              </Box>
            </Grid>
          </Grid>

          {/* Search and Controls */}
          <Box sx={{ 
            display: 'flex', 
            gap: 2, 
            mb: 3,
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'stretch', sm: 'center' }
          }}>
            <TextField
              placeholder="Search projects..."
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
            {!isMobile && (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton
                  onClick={() => setViewMode('grid')}
                  color={viewMode === 'grid' ? 'primary' : 'default'}
                  aria-label="Grid view"
                >
                  <ViewModuleIcon />
                </IconButton>
                <IconButton
                  onClick={() => setViewMode('list')}
                  color={viewMode === 'list' ? 'primary' : 'default'}
                  aria-label="List view"
                >
                  <ViewListIcon />
                </IconButton>
                <IconButton onClick={handleMenuOpen} aria-label="Sort projects">
                  <FilterListIcon />
                </IconButton>
              </Box>
            )}
          </Box>
        </Box>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="project tabs">
            <Tab label={`All Projects (${filterProjects().length})`} />
            <Tab label={`Active (${filterProjects('active').length})`} />
            <Tab label={`Completed (${filterProjects('completed').length})`} />
          </Tabs>
        </Box>

        {/* Error State */}
        {isError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            Error: {error instanceof Error ? error.message : 'Failed to load projects'}
          </Alert>
        )}

        {/* Project Lists */}
        <TabPanel value={tabValue} index={0}>
          {renderProjects(
            filterProjects(),
            searchQuery ? 'No projects found' : 'No projects yet',
            searchQuery ? 'Try adjusting your search query' : 'Create your first project to get started',
            !searchQuery
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {renderProjects(
            filterProjects('active'),
            searchQuery ? 'No active projects found' : 'No active projects',
            searchQuery ? 'Try adjusting your search query' : 'Projects marked as active will appear here'
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          {renderProjects(
            filterProjects('completed'),
            searchQuery ? 'No completed projects found' : 'No completed projects',
            searchQuery ? 'Try adjusting your search query' : 'Completed projects will appear here'
          )}
        </TabPanel>

        {/* Mobile FAB */}
        {isMobile && (
          <Fab
            color="primary"
            aria-label="add project"
            onClick={() => setIsModalOpen(true)}
            sx={{
              position: 'fixed',
              bottom: 80,
              right: 16,
            }}
          >
            <AddIcon />
          </Fab>
        )}

        {/* Context Menu */}
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={handleMenuClose}
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
          }}
          sx={{
            '& .MuiPopover-paper': {
              minWidth: 150,
              maxWidth: 200,
              mt: 1,
              boxShadow: 3,
              border: '1px solid',
              borderColor: 'divider',
            },
          }}
        >
          <MenuItem onClick={() => handleSortSelect('name')} selected={sortBy === 'name'} sx={{ px: 2, py: 1 }}>
            Sort by Name
          </MenuItem>
          <MenuItem onClick={() => handleSortSelect('dueDate')} selected={sortBy === 'dueDate'} sx={{ px: 2, py: 1 }}>
            Sort by Due Date
          </MenuItem>
          <MenuItem onClick={() => handleSortSelect('progress')} selected={sortBy === 'progress'} sx={{ px: 2, py: 1 }}>
            Sort by Progress
          </MenuItem>
        </Menu>
      </motion.div>
    </>
  );
}

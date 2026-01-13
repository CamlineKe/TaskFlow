'use client';

import { useState, useEffect } from 'react';
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Button,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Avatar,
  Divider,
  Badge,
  Breadcrumbs,
  Link,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Assignment as AssignmentIcon,
  Folder as FolderIcon,
  Settings as SettingsIcon,
  Brightness4 as Brightness4Icon,
  Brightness7 as Brightness7Icon,
  Notifications as NotificationsIcon,
  Home as HomeIcon,
} from '@mui/icons-material';
import { useAuthStore } from '@/store/auth.store';
import { useRouter, usePathname } from 'next/navigation';
import { toast } from 'sonner';
import { useThemeContext } from '@/context/ThemeContext';
import { SessionLoader } from '@/components/layout/SessionLoader';
import NextLink from 'next/link';

const DRAWER_WIDTH = 280;

// Navigation items
const navigationItems = [
  {
    text: 'Dashboard',
    icon: <DashboardIcon />,
    path: '/app',
    exact: true,
  },
  {
    text: 'Projects',
    icon: <FolderIcon />,
    path: '/app/projects',
  },
  {
    text: 'My Tasks',
    icon: <AssignmentIcon />,
    path: '/app/tasks',
  },
  {
    text: 'Settings',
    icon: <SettingsIcon />,
    path: '/app/settings',
  },
];

// Breadcrumb mapping
const breadcrumbMap: { [key: string]: string } = {
  '/app': 'Dashboard',
  '/app/projects': 'Projects',
  '/app/tasks': 'My Tasks',
  '/app/settings': 'Settings',
};

function DrawerContent({ mode, toggleColorMode }: { mode: 'light' | 'dark'; toggleColorMode: () => void }) {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    logout();
    toast.success('You have been logged out.');
    router.push('/login');
  };

  const isActiveRoute = (path: string, exact = false) => {
    if (exact) {
      return pathname === path;
    }
    return pathname.startsWith(path);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            background: 'linear-gradient(45deg, #818CF8 30%, #EC4899 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 2,
          }}
        >
          TaskFlow
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            sx={{ width: 40, height: 40, bgcolor: 'primary.main' }}
          >
            {user?.name?.charAt(0) || 'U'}
          </Avatar>
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography variant="subtitle1" noWrap sx={{ fontWeight: 500 }}>
              {user?.name}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {user?.email}
            </Typography>
          </Box>
        </Box>
        
        {/* Theme Toggle */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <IconButton 
            onClick={toggleColorMode} 
            sx={{
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              '&:hover': {
                bgcolor: 'action.hover',
              },
            }}
          >
            {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
        </Box>
      </Box>
      
      {/* Navigation */}
      <List sx={{ flexGrow: 1, py: 2 }}>
        {navigationItems.map((item) => (
          <ListItem key={item.path} disablePadding sx={{ px: 2 }}>
            <ListItemButton
              component={NextLink}
              href={item.path}
              selected={isActiveRoute(item.path, item.exact)}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                '&.Mui-selected': {
                  backgroundColor: 'primary.main',
                  color: 'primary.contrastText',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'primary.contrastText',
                  },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text} 
                primaryTypographyProps={{ fontWeight: 500 }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      {/* Footer */}
      <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Button 
          onClick={handleLogout} 
          variant="outlined" 
          fullWidth 
          color="error"
          sx={{ textTransform: 'none' }}
        >
          Sign Out
        </Button>
      </Box>
    </Box>
  );
}

// Redirect component
function RedirectToLogin() {
  const router = useRouter();
  useEffect(() => {
    router.push('/login');
  }, [router]);

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <CircularProgress />
    </Box>
  );
}

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated } = useAuthStore.getState();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { mode, toggleColorMode } = useThemeContext();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Generate breadcrumbs
  const getBreadcrumbs = () => {
    const pathSegments = pathname.split('/').filter(Boolean);
    const breadcrumbs = [];
    
    // Always add home
    breadcrumbs.push({
      label: 'Home',
      path: '/app',
      current: pathname === '/app'
    });
    
    // Add current page if not home
    if (pathname !== '/app' && breadcrumbMap[pathname]) {
      breadcrumbs.push({
        label: breadcrumbMap[pathname],
        path: pathname,
        current: true
      });
    }
    
    return breadcrumbs;
  };

  return (
    <SessionLoader>
      {isAuthenticated ? (
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
          {/* Mobile App Bar */}
          {isMobile && (
            <AppBar
              position="fixed"
              sx={{
                width: '100%',
                zIndex: theme.zIndex.drawer + 1,
                backgroundColor: 'background.paper',
                color: 'text.primary',
                boxShadow: 1,
              }}
            >
              <Toolbar>
                <IconButton
                  color="inherit"
                  aria-label="open drawer"
                  edge="start"
                  onClick={handleDrawerToggle}
                  sx={{ mr: 2 }}
                >
                  <MenuIcon />
                </IconButton>
                <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
                  TaskFlow
                </Typography>
                <IconButton 
                  color="inherit" 
                  onClick={toggleColorMode}
                  sx={{ mr: 1 }}
                >
                  {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
                </IconButton>
                <IconButton color="inherit">
                  <Badge badgeContent={3} color="error">
                    <NotificationsIcon />
                  </Badge>
                </IconButton>
              </Toolbar>
            </AppBar>
          )}

          {/* Sidebar */}
          <Box
            component="nav"
            sx={{ width: { lg: DRAWER_WIDTH }, flexShrink: { lg: 0 } }}
          >
            {/* Mobile Drawer */}
            <Drawer
              variant="temporary"
              open={mobileOpen}
              onClose={handleDrawerToggle}
              ModalProps={{ keepMounted: true }}
              sx={{
                display: { xs: 'block', lg: 'none' },
                '& .MuiDrawer-paper': { 
                  boxSizing: 'border-box', 
                  width: DRAWER_WIDTH,
                  border: 'none',
                },
              }}
            >
              <DrawerContent mode={mode} toggleColorMode={toggleColorMode} />
            </Drawer>
            
            {/* Desktop Drawer */}
            <Drawer
              variant="permanent"
              sx={{
                display: { xs: 'none', lg: 'block' },
                '& .MuiDrawer-paper': { 
                  boxSizing: 'border-box', 
                  width: DRAWER_WIDTH,
                  border: 'none',
                  borderRight: '1px solid',
                  borderColor: 'divider',
                },
              }}
              open
            >
              <DrawerContent mode={mode} toggleColorMode={toggleColorMode} />
            </Drawer>
          </Box>

          {/* Main Content */}
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              width: { lg: `calc(100% - ${DRAWER_WIDTH}px)` },
              minHeight: '100vh',
              backgroundColor: 'background.default',
            }}
          >
            {/* Mobile toolbar spacer */}
            {isMobile && <Toolbar />}
            
            {/* Breadcrumbs and Content */}
            <Box sx={{ 
              p: { xs: 2, md: 3 },
            }}>
              {/* Breadcrumbs */}
              {!isMobile && (
                <Box sx={{ mb: 3 }}>
                  <Breadcrumbs aria-label="breadcrumb">
                    {getBreadcrumbs().map((crumb, index) => (
                      crumb.current ? (
                        <Typography 
                          key={crumb.path} 
                          color="text.primary" 
                          sx={{ fontWeight: 500 }}
                        >
                          {crumb.label}
                        </Typography>
                      ) : (
                        <Link
                          key={crumb.path}
                          component={NextLink}
                          href={crumb.path}
                          color="inherit"
                          underline="hover"
                        >
                          {crumb.label}
                        </Link>
                      )
                    ))}
                  </Breadcrumbs>
                </Box>
              )}
              
              {/* Page Content */}
              {children}
            </Box>
          </Box>
        </Box>
      ) : (
        <RedirectToLogin />
      )}
    </SessionLoader>
  );
}

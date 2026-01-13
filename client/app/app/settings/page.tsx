'use client';

import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  Switch,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from '@mui/material';
import {
  Person as PersonIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Logout as LogoutIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Brightness4 as Brightness4Icon,
  Brightness7 as Brightness7Icon,
  Lock as LockIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/store/auth.store';
import { useThemeContext } from '@/context/ThemeContext';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/axios';

// Form validation schemas
const profileSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name cannot exceed 100 characters'),
  bio: z.string().max(500, 'Bio cannot exceed 500 characters').optional(),
  location: z.string().max(100, 'Location cannot exceed 100 characters').optional(),
  website: z.string().max(200, 'Website URL cannot exceed 200 characters').optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters long'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

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

export default function SettingsPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, logout, updateUser } = useAuthStore();
  const { mode, toggleColorMode } = useThemeContext();
  const router = useRouter();
  const queryClient = useQueryClient();
  
  const [isEditing, setIsEditing] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    taskReminders: true,
  });

  // Profile form
  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      bio: '',
      location: '',
      website: '',
    },
  });

  // Password form
  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  // Query to get user profile
  const { data: userProfile, isLoading: profileLoading } = useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const response = await apiClient.get('/users/profile');
      return response.data;
    },
  });

  // Query to get user statistics
  const { data: userStats, isLoading: statsLoading } = useQuery({
    queryKey: ['user-stats'],
    queryFn: async () => {
      const response = await apiClient.get('/users/stats');
      return response.data;
    },
  });

  // Mutation to update notification preferences
  const updateNotificationsMutation = useMutation({
    mutationFn: async (data: {
      emailNotifications: boolean;
      pushNotifications: boolean;
      taskReminders: boolean;
    }) => {
      const response = await apiClient.put('/users/notifications', data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Notification preferences updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update notification preferences');
    },
  });

  // Mutation to update profile
  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      const response = await apiClient.put('/users/profile', data);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success('Profile updated successfully!');
      updateUser(data);
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    },
  });

  // Mutation to change password
  const changePasswordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      const response = await apiClient.put('/users/change-password', data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Password changed successfully!');
      setPasswordDialogOpen(false);
      passwordForm.reset();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to change password');
    },
  });

  const handleProfileSave = (data: ProfileFormData) => {
    updateProfileMutation.mutate(data);
  };

  const handlePasswordChange = (data: PasswordFormData) => {
    changePasswordMutation.mutate({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    });
  };

  const handleNotificationChange = (key: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.checked;
    
    // Update local state first for immediate UI feedback
    setNotifications(prev => ({
      ...prev,
      [key]: newValue
    }));
    
    // Then send the update to the server
    updateNotificationsMutation.mutate({
      ...notifications,
      [key]: newValue
    });
  };

  const handleLogout = () => {
    logout();
    toast.success('You have been logged out.');
    router.push('/login');
  };

  useEffect(() => {
    if (userProfile) {
      profileForm.reset({
        name: userProfile.name || '',
        bio: userProfile.bio || '',
        location: userProfile.location || '',
        website: userProfile.website || '',
      });
      
      // Initialize notification preferences from user profile if available
      if (userProfile.notificationPreferences) {
        setNotifications({
          emailNotifications: userProfile.notificationPreferences.emailNotifications,
          pushNotifications: userProfile.notificationPreferences.pushNotifications,
          taskReminders: userProfile.notificationPreferences.taskReminders,
        });
      }
    }
  }, [userProfile, profileForm]);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
      <Box sx={{ maxWidth: '1000px', mx: 'auto' }}>
        {/* Header */}
        <motion.div variants={staggerChild}>
          <Box sx={{ mb: 4 }}>
            <Typography
              variant={isMobile ? 'h4' : 'h3'}
              component="h1"
              gutterBottom
              sx={{ fontWeight: 700, color: 'text.primary' }}
            >
              Settings
            </Typography>
            <Typography
              variant="subtitle1"
              color="text.secondary"
            >
              Manage your account settings and preferences
            </Typography>
          </Box>
        </motion.div>

        <Grid container spacing={3}>
          {/* Profile Settings */}
          <Grid item xs={12} md={8}>
            <motion.div variants={staggerChild}>
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  {profileLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                      <CircularProgress />
                    </Box>
                  ) : (
                    <>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          Profile Information
                        </Typography>
                        {!isEditing ? (
                          <Button
                            startIcon={<EditIcon />}
                            onClick={() => setIsEditing(true)}
                          >
                            Edit
                          </Button>
                        ) : (
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                              onClick={() => {
                                setIsEditing(false);
                                profileForm.reset();
                              }}
                            >
                              Cancel
                            </Button>
                            <Button
                              startIcon={<SaveIcon />}
                              variant="contained"
                              onClick={profileForm.handleSubmit(handleProfileSave)}
                              disabled={updateProfileMutation.isPending}
                            >
                              {updateProfileMutation.isPending ? 'Saving...' : 'Save'}
                            </Button>
                          </Box>
                        )}
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
                        <Avatar
                          sx={{ 
                            width: 80, 
                            height: 80, 
                            fontSize: '2rem',
                            bgcolor: 'primary.main'
                          }}
                          src={userProfile?.avatar}
                        >
                          {userProfile?.name?.charAt(0) || user?.name?.charAt(0) || 'U'}
                        </Avatar>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {userProfile?.name || user?.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {userProfile?.email || user?.email}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <form onSubmit={profileForm.handleSubmit(handleProfileSave)}>
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              label="Full Name"
                              {...profileForm.register('name')}
                              error={!!profileForm.formState.errors.name}
                              helperText={profileForm.formState.errors.name?.message}
                              fullWidth
                              disabled={!isEditing}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              label="Email"
                              value={userProfile?.email || user?.email || ''}
                              fullWidth
                              disabled
                              helperText="Email cannot be changed"
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              label="Location"
                              {...profileForm.register('location')}
                              error={!!profileForm.formState.errors.location}
                              helperText={profileForm.formState.errors.location?.message}
                              fullWidth
                              disabled={!isEditing}
                              placeholder="e.g., New York, USA"
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              label="Website"
                              {...profileForm.register('website')}
                              error={!!profileForm.formState.errors.website}
                              helperText={profileForm.formState.errors.website?.message}
                              fullWidth
                              disabled={!isEditing}
                              placeholder="e.g., https://yourwebsite.com"
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <TextField
                              label="Bio"
                              {...profileForm.register('bio')}
                              error={!!profileForm.formState.errors.bio}
                              helperText={profileForm.formState.errors.bio?.message}
                              fullWidth
                              multiline
                              rows={3}
                              disabled={!isEditing}
                              placeholder="Tell us about yourself..."
                            />
                          </Grid>
                        </Grid>
                      </form>
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Notification Settings */}
            <motion.div variants={staggerChild}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                    Notification Preferences
                  </Typography>
                  
                  {profileLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                      <CircularProgress size={24} />
                    </Box>
                  ) : (
                    <List>
                      <ListItem>
                        <ListItemIcon>
                          <NotificationsIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary="Email Notifications"
                          secondary="Receive notifications via email"
                        />
                        <ListItemSecondaryAction>
                          <Switch
                            checked={notifications.emailNotifications}
                            onChange={handleNotificationChange('emailNotifications')}
                            disabled={updateNotificationsMutation.isPending}
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                      
                      <ListItem>
                        <ListItemIcon>
                          <NotificationsIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary="Push Notifications"
                          secondary="Receive push notifications in browser"
                        />
                        <ListItemSecondaryAction>
                          <Switch
                            checked={notifications.pushNotifications}
                            onChange={handleNotificationChange('pushNotifications')}
                            disabled={updateNotificationsMutation.isPending}
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                      
                      <ListItem>
                        <ListItemIcon>
                          <NotificationsIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary="Task Reminders"
                          secondary="Get reminded about upcoming task deadlines"
                        />
                        <ListItemSecondaryAction>
                          <Switch
                            checked={notifications.taskReminders}
                            onChange={handleNotificationChange('taskReminders')}
                            disabled={updateNotificationsMutation.isPending}
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                    </List>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          {/* Quick Settings Sidebar */}
          <Grid item xs={12} md={4}>
            <motion.div variants={staggerChild}>
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Quick Settings
                  </Typography>
                  
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
                      </ListItemIcon>
                      <ListItemText
                        primary="Dark Mode"
                        secondary={mode === 'dark' ? 'Enabled' : 'Disabled'}
                      />
                      <ListItemSecondaryAction>
                        <Switch
                          checked={mode === 'dark'}
                          onChange={toggleColorMode}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </motion.div>

            {/* Account Actions */}
            <motion.div variants={staggerChild}>
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Account
                  </Typography>
                  
                  <List>
                    <ListItem button onClick={() => setPasswordDialogOpen(true)}>
                      <ListItemIcon>
                        <SecurityIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary="Change Password"
                        secondary="Update your password"
                      />
                    </ListItem>
                    
                    <ListItem button onClick={handleLogout}>
                      <ListItemIcon>
                        <LogoutIcon sx={{ color: 'error.main' }} />
                      </ListItemIcon>
                      <ListItemText
                        primary="Logout"
                        secondary="Sign out of your account"
                        primaryTypographyProps={{ color: 'error.main' }}
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </motion.div>

            {/* Usage Stats */}
            <motion.div variants={staggerChild}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Usage Statistics
                  </Typography>
                  
                  {statsLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                      <CircularProgress size={24} />
                    </Box>
                  ) : (
                    <Box>
                      {/* Tasks Completed */}
                      <Box sx={{ textAlign: 'center', mb: 3 }}>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                          {userStats?.personalCompletedTasks || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Tasks Completed
                        </Typography>
                      </Box>
                      
                      {/* Additional Stats Grid */}
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, color: 'success.main' }}>
                              {userStats?.totalProjects || 0}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Projects
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, color: 'info.main' }}>
                              {userStats?.personalTasks || 0}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              My Tasks
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, color: 'warning.main' }}>
                              {userStats?.inProgressTasks || 0}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              In Progress
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, color: 'secondary.main' }}>
                              {userStats?.pendingTasks || 0}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Pending
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                      
                      {/* This Month Stats */}
                      <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                        <Typography variant="body2" color="text.secondary" align="center">
                          This Month: {userStats?.tasksCompletedThisMonth || 0} completed, {userStats?.tasksCreatedThisMonth || 0} created
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        </Grid>
      </Box>

      {/* Password Change Dialog */}
      <Dialog
        open={passwordDialogOpen}
        onClose={() => setPasswordDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LockIcon />
            Change Password
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <form onSubmit={passwordForm.handleSubmit(handlePasswordChange)}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label="Current Password"
                    type="password"
                    {...passwordForm.register('currentPassword')}
                    error={!!passwordForm.formState.errors.currentPassword}
                    helperText={passwordForm.formState.errors.currentPassword?.message}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="New Password"
                    type="password"
                    {...passwordForm.register('newPassword')}
                    error={!!passwordForm.formState.errors.newPassword}
                    helperText={passwordForm.formState.errors.newPassword?.message}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Confirm New Password"
                    type="password"
                    {...passwordForm.register('confirmPassword')}
                    error={!!passwordForm.formState.errors.confirmPassword}
                    helperText={passwordForm.formState.errors.confirmPassword?.message}
                    fullWidth
                  />
                </Grid>
              </Grid>
            </form>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setPasswordDialogOpen(false);
              passwordForm.reset();
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={passwordForm.handleSubmit(handlePasswordChange)}
            disabled={changePasswordMutation.isPending}
          >
            {changePasswordMutation.isPending ? 'Changing...' : 'Change Password'}
          </Button>
        </DialogActions>
      </Dialog>
    </motion.div>
  );
}
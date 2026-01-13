import { Request, Response } from 'express';
import User from '../../models/User.model';
import Task from '../../models/task.model';
import Project from '../../models/project.model';
import { UpdateNotificationsInput } from './user.validation';

// --- Controller to get user profile ---
export const getUserProfileController = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json(user);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error getting user profile.', error: error.message });
  }
};

// --- Controller to update user profile ---
export const updateUserProfileController = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { name, bio, location, website, avatar } = req.body;
    
    // Validate input
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ message: 'Name is required' });
    }
    
    const updateData: any = {
      name: name.trim(),
    };
    
    // Add optional fields if provided
    if (bio !== undefined) updateData.bio = bio.trim();
    if (location !== undefined) updateData.location = location.trim();
    if (website !== undefined) updateData.website = website.trim();
    if (avatar !== undefined) updateData.avatar = avatar.trim();
    
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json(updatedUser);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error updating user profile.', error: error.message });
  }
};

// --- Controller to change password ---
export const changePasswordController = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { currentPassword, newPassword } = req.body;
    
    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long' });
    }
    
    // Get user with password field
    const user = await User.findById(userId).select('+password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    
    // Update password (will be automatically hashed by the pre-save middleware)
    user.password = newPassword;
    await user.save();
    
    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error changing password.', error: error.message });
  }
};

// --- Controller to update notification preferences ---
export const updateNotificationsController = async (
  req: Request<{}, {}, UpdateNotificationsInput>,
  res: Response
) => {
  try {
    const userId = (req as any).user.id;
    const { emailNotifications, pushNotifications, taskReminders } = req.body;
    
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { 
        'notificationPreferences.emailNotifications': emailNotifications,
        'notificationPreferences.pushNotifications': pushNotifications,
        'notificationPreferences.taskReminders': taskReminders,
      },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json({
      message: 'Notification preferences updated successfully',
      notificationPreferences: updatedUser.notificationPreferences
    });
  } catch (error: any) {
    res.status(500).json({ 
      message: 'Server error updating notification preferences.', 
      error: error.message 
    });
  }
};

// --- Controller to get user statistics ---
export const getUserStatsController = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    
    // Find all projects where the user is owner or member
    const userProjects = await Project.find({
      $or: [{ owner: userId }, { members: userId }],
    }).select('_id');
    
    const projectIds = userProjects.map(project => project._id);
    
    // Get all tasks in those projects with populated column data
    const allTasks = await Task.find({
      project: { $in: projectIds },
    });
    
    // Get tasks assigned to the user specifically
    const userTasks = await Task.find({
      assignee: userId,
    });
    
    // Calculate task status counts
    const completedTasks = allTasks.filter(task => task.status === 'completed');
    const inProgressTasks = allTasks.filter(task => task.status === 'in-progress');
    const pendingTasks = allTasks.filter(task => task.status === 'todo');
    
    // Personal task statistics
    const personalCompletedTasks = userTasks.filter(task => task.status === 'completed');
    
    // Calculate statistics
    const stats = {
      // Project statistics
      totalProjects: userProjects.length,
      activeProjects: await Project.countDocuments({
        $or: [{ owner: userId }, { members: userId }],
        status: 'active',
      }),
      completedProjects: await Project.countDocuments({
        $or: [{ owner: userId }, { members: userId }],
        status: 'completed',
      }),
      
      // Task statistics (all tasks in user's projects)
      totalTasks: allTasks.length,
      completedTasks: completedTasks.length,
      pendingTasks: pendingTasks.length,
      inProgressTasks: inProgressTasks.length,
      
      // Personal task statistics (tasks assigned to user)
      personalTasks: userTasks.length,
      personalCompletedTasks: personalCompletedTasks.length,
      
      // Priority breakdown for user's tasks
      highPriorityTasks: userTasks.filter(task => task.priority === 'high').length,
      mediumPriorityTasks: userTasks.filter(task => task.priority === 'medium').length,
      lowPriorityTasks: userTasks.filter(task => task.priority === 'low').length,
      
      // Time-based statistics
      tasksCreatedThisMonth: allTasks.filter(task => {
        const now = new Date();
        const taskDate = new Date(task.createdAt);
        return taskDate.getMonth() === now.getMonth() && taskDate.getFullYear() === now.getFullYear();
      }).length,
      
      tasksCompletedThisMonth: completedTasks.filter(task => {
        const now = new Date();
        const taskDate = new Date(task.updatedAt);
        return taskDate.getMonth() === now.getMonth() && taskDate.getFullYear() === now.getFullYear();
      }).length,
      
      // Account information
      memberSince: await User.findById(userId).select('createdAt').then(user => user?.createdAt),
      
      // Recent activity (last 5 completed tasks by user)
      recentCompletedTasks: await Task.find({
        assignee: userId,
        status: 'completed'
      })
      .populate('project', 'name')
      .sort({ updatedAt: -1 })
      .limit(5)
      .then(tasks => 
        tasks.map(task => ({
          _id: task._id,
          title: task.title,
          project: task.project,
          updatedAt: task.updatedAt,
        }))
      ),
    };
    
    res.status(200).json(stats);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error getting user statistics.', error: error.message });
  }
};
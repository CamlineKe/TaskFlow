import { Request, Response } from 'express';
import Task from '../../models/task.model';
import Column from '../../models/column.model';
import Project from '../../models/project.model';
import { CreateTaskInput, UpdateTaskInput, UpdateTaskStatusInput } from './task.validation';

// --- Controller to get a single task ---
export const getTaskController = async (req: Request, res: Response) => {
  try {
    const { taskId } = req.params;
    const userId = (req as any).user.id;
    
    // Find the task and populate related data
    const task = await Task.findById(taskId).populate([
      {
        path: 'project',
        select: 'name owner members',
      },
      {
        path: 'assignee',
        select: 'name email',
      },
      {
        path: 'column',
        select: 'title',
      },
    ]);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Check if user has access to this task (via project ownership/membership)
    const project = task.project as any;
    if (project && !project.owner.equals(userId) && !project.members.includes(userId)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    res.status(200).json(task);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error getting task.', error: error.message });
  }
};
export const getAllTasksController = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    
    // Find all projects where the user is owner or member
    const userProjects = await Project.find({
      $or: [{ owner: userId }, { members: userId }],
    }).select('_id');
    
    const projectIds = userProjects.map(project => project._id);
    
    // Find all tasks in those projects and populate necessary fields
    const tasks = await Task.find({
      project: { $in: projectIds },
    }).populate([
      {
        path: 'project',
        select: 'name',
      },
      {
        path: 'assignee',
        select: 'name email',
      },
      {
        path: 'column',
        select: 'title',
      },
    ]);
    
    // Transform tasks to include status based on column
    const tasksWithStatus = await Promise.all(tasks.map(async task => {
      const column = task.column as any;
      let status = 'todo';
      
      if (column?.title) {
        switch (column.title.toLowerCase()) {
          case 'done':
          case 'completed':
            status = 'completed';
            break;
          case 'in progress':
          case 'doing':
            status = 'in-progress';
            break;
          default:
            status = 'todo';
        }
      }
      
      // Update the task document with the status field
      await Task.findByIdAndUpdate(task._id, { status });
      
      return {
        ...task.toObject(),
        status,
        completed: status === 'completed',
      };
    }));
    
    res.status(200).json(tasksWithStatus);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error getting tasks.', error: error.message });
  }
};

// --- Controller to create a new task ---
export const createTaskController = async (
  req: Request<{}, {}, CreateTaskInput>,
  res: Response
) => {
  try {
    const { title, description, priority, projectId, columnId } = req.body;

    // 1. Create the new task document
    const newTask = await Task.create({
      title,
      description,
      priority: priority || 'medium',
      project: projectId,
      column: columnId,
    });

    // 2. Add the new task's ID to the corresponding column's tasks array
    await Column.findByIdAndUpdate(columnId, {
      $push: { tasks: newTask._id },
    });

    res.status(201).json(newTask);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error creating task.', error: error.message });
  }
};

// --- Controller to update a task ---
export const updateTaskController = async (
  req: Request<UpdateTaskInput['params'], {}, UpdateTaskInput['body']>,
  res: Response
) => {
  try {
    const { taskId } = req.params;
    const updateData = req.body;

    const updatedTask = await Task.findByIdAndUpdate(taskId, updateData, {
      new: true, // Return the updated document
    });

    if (!updatedTask) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.status(200).json(updatedTask);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error updating task.', error: error.message });
  }
};

// --- Controller to update task status ---
export const updateTaskStatusController = async (
  req: Request<UpdateTaskStatusInput['params'], {}, UpdateTaskStatusInput['body']>,
  res: Response
) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;
    const userId = (req as any).user.id;

    // Find the current task
    const task = await Task.findById(taskId).populate('project');
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if user has access to this task
    const project = task.project as any;
    if (!project.owner.equals(userId) && !project.members.includes(userId)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get the project's board and columns
    const projectBoard = await Project.findById(project._id).populate({
      path: 'board',
      populate: {
        path: 'columns',
        model: 'Column',
      },
    });

    if (!projectBoard || !projectBoard.board) {
      return res.status(404).json({ message: 'Project board not found' });
    }

    const board = projectBoard.board as any;
    const columns = board.columns;

    // Find the target column based on status
    let targetColumn;
    switch (status) {
      case 'completed':
        targetColumn = columns.find((col: any) => 
          col.title.toLowerCase().includes('done') || 
          col.title.toLowerCase().includes('complete')
        );
        break;
      case 'in-progress':
        targetColumn = columns.find((col: any) => 
          col.title.toLowerCase().includes('progress') || 
          col.title.toLowerCase().includes('doing')
        );
        break;
      case 'todo':
      default:
        targetColumn = columns.find((col: any) => 
          col.title.toLowerCase().includes('to do') || 
          col.title.toLowerCase().includes('todo') ||
          col.title.toLowerCase().includes('backlog')
        ) || columns[0]; // Default to first column if no "To Do" found
        break;
    }

    if (!targetColumn) {
      return res.status(404).json({ message: 'Target column not found' });
    }

    // If task is already in the target column, no need to move
    if (task.column.toString() === targetColumn._id.toString()) {
      return res.status(200).json({
        message: 'Task is already in the target status',
        task: {
          ...task.toObject(),
          status,
        },
      });
    }

    // Remove task from current column
    await Column.findByIdAndUpdate(task.column, {
      $pull: { tasks: taskId },
    });

    // Add task to target column
    await Column.findByIdAndUpdate(targetColumn._id, {
      $push: { tasks: taskId },
    });

    // Update task's column reference and status field
    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      { 
        column: targetColumn._id,
        status: status // Set the status field directly
      },
      { new: true }
    ).populate([
      {
        path: 'project',
        select: 'name',
      },
      {
        path: 'assignee',
        select: 'name email',
      },
      {
        path: 'column',
        select: 'title',
      },
    ]);

    res.status(200).json({
      message: 'Task status updated successfully',
      task: {
        ...updatedTask?.toObject(),
        status,
        completed: status === 'completed',
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error updating task status.', error: error.message });
  }
};

// --- Controller to delete a task ---
export const deleteTaskController = async (req: Request, res: Response) => {
  try {
    const { taskId } = req.params;

    // 1. Find and delete the task
    const deletedTask = await Task.findByIdAndDelete(taskId);

    if (!deletedTask) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // 2. Remove the task's ID from its parent column's tasks array
    await Column.findByIdAndUpdate(deletedTask.column, {
      $pull: { tasks: deletedTask._id },
    });

    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error deleting task.', error: error.message });
  }
};

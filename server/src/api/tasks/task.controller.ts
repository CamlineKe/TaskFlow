import { Request, Response } from 'express';
import { Types } from 'mongoose';
import Task from '../../models/task.model';
import Column from '../../models/column.model';
import { CreateTaskInput, UpdateTaskInput, UpdateTaskStatusInput } from './task.validation';
import { invalidateProjectCaches } from '../../config/redis';

// --- Controller to get a single task ---
export const getTaskController = async (req: Request, res: Response) => {
  try {
    const { taskId } = req.params;
    const userId = (req as any).user.id;

    // Optimized: Single query with population and permission check
    const task = await Task.findById(taskId)
      .populate([
        {
          path: 'project',
          select: 'name owner members', // Keep minimal project fields
        },
        {
          path: 'assignee',
          select: 'name email', // Keep minimal user fields
        },
        {
          path: 'column',
          select: 'title', // Only need column title for status
        },
      ])
      .lean(); // Use lean() for better performance

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if user has access to this task
    const project = task.project as any;
    if (project && !project.owner.equals(userId) && !project.members.includes(userId)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Transform task to include status based on column
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

    // Return only necessary fields
    const taskWithStatus = {
      _id: task._id,
      title: task.title,
      description: task.description,
      priority: task.priority,
      status,
      completed: status === 'completed',
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      project: task.project ? { _id: (task.project as any)._id, name: (task.project as any).name } : undefined,
      assignee: task.assignee,
      column: task.column ? { _id: (task.column as any)._id, title: (task.column as any).title } : undefined,
    };

    res.status(200).json(taskWithStatus);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error getting task.', error: error.message });
  }
};

export const getAllTasksController = async (req: Request, res: Response) => {
  try {
    const rawUserId = (req as any).user.id;
    const userId = new Types.ObjectId(rawUserId);

    // Optimized: Single aggregation pipeline with field selection
    const tasks = await Task.aggregate([
      // First, get all projects the user has access to
      {
        $lookup: {
          from: 'projects',
          localField: 'project',
          foreignField: '_id',
          as: 'projectInfo',
        },
      },
      {
        $unwind: '$projectInfo',
      },
      // Filter tasks based on user access
      {
        $match: {
          $or: [
            { 'projectInfo.owner': userId },
            { 'projectInfo.members': userId },
          ],
        },
      },
      // Look up column information
      {
        $lookup: {
          from: 'columns',
          localField: 'column',
          foreignField: '_id',
          as: 'columnInfo',
        },
      },
      {
        $unwind: '$columnInfo',
      },
      // Look up assignee information
      {
        $lookup: {
          from: 'users',
          localField: 'assignee',
          foreignField: '_id',
          as: 'assigneeInfo',
        },
      },
      {
        $unwind: {
          path: '$assigneeInfo',
          preserveNullAndEmptyArrays: true,
        },
      },
      // Project only the fields we need (minimal)
      {
        $project: {
          _id: 1,
          title: 1,
          description: 1,
          priority: 1,
          createdAt: 1,
          updatedAt: 1,
          'project': {
            _id: '$projectInfo._id',
            name: '$projectInfo.name',
          },
          'column': {
            _id: '$columnInfo._id',
            title: '$columnInfo.title',
          },
          'assignee': {
            $cond: {
              if: { $ifNull: ['$assigneeInfo._id', false] },
              then: {
                _id: '$assigneeInfo._id',
                name: '$assigneeInfo.name',
                email: '$assigneeInfo.email',
              },
              else: '$$REMOVE',
            },
          },
        },
      },
      // Add computed status based on column title
      {
        $addFields: {
          status: {
            $switch: {
              branches: [
                {
                  case: {
                    $in: [
                      { $toLower: '$column.title' },
                      ['done', 'completed']
                    ]
                  },
                  then: 'completed'
                },
                {
                  case: {
                    $in: [
                      { $toLower: '$column.title' },
                      ['in progress', 'doing']
                    ]
                  },
                  then: 'in-progress'
                }
              ],
              default: 'todo'
            }
          }
        }
      },
      {
        $addFields: {
          completed: { $eq: ['$status', 'completed'] }
        }
      },
      // Sort by creation date (newest first)
      {
        $sort: { createdAt: -1 }
      }
    ]);

    res.status(200).json(tasks);
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

    // Optimized: Use Promise.all for parallel operations
    const [column, newTask] = await Promise.all([
      Column.findById(columnId).select('title').lean(),
      Task.create({
        title,
        description,
        priority: priority || 'medium',
        project: projectId,
        column: columnId,
      }),
    ]);

    // Determine status based on column title
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

    // Update task with status and add to column in parallel
    await Promise.all([
      Task.findByIdAndUpdate(newTask._id, { status }),
      Column.findByIdAndUpdate(columnId, {
        $push: { tasks: newTask._id },
      }),
    ]);

    // Invalidate project caches to show the new task
    await invalidateProjectCaches(projectId, (req as any).user.id);

    // Return minimal task data
    res.status(201).json({
      _id: newTask._id,
      title: newTask.title,
      description: newTask.description,
      priority: newTask.priority,
      status,
      project: { _id: projectId },
      column: { _id: columnId, title: column?.title },
      createdAt: newTask.createdAt,
      updatedAt: newTask.updatedAt,
    });
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
      new: true,
      runValidators: true,
    })
      .select('title description priority project column assignee createdAt updatedAt')
      .populate([
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
      ])
      .lean();

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
    const rawUserId = (req as any).user.id;
    const userId = new Types.ObjectId(rawUserId);
    const taskObjectId = new Types.ObjectId(taskId);

    // Optimized: Single aggregation with field selection
    const taskWithInfo = await Task.aggregate([
      { $match: { _id: taskObjectId } },
      {
        $lookup: {
          from: 'projects',
          localField: 'project',
          foreignField: '_id',
          as: 'projectInfo',
          pipeline: [
            { $project: { owner: 1, members: 1, board: 1 } }
          ],
        },
      },
      { $unwind: '$projectInfo' },
      {
        $lookup: {
          from: 'boards',
          localField: 'projectInfo.board',
          foreignField: '_id',
          as: 'boardInfo',
          pipeline: [
            { $project: { columns: 1 } }
          ],
        },
      },
      { $unwind: '$boardInfo' },
      {
        $lookup: {
          from: 'columns',
          localField: 'boardInfo.columns',
          foreignField: '_id',
          as: 'columnsInfo',
          pipeline: [
            { $project: { title: 1 } }
          ],
        },
      },
      { $project: { column: 1, 'projectInfo.owner': 1, 'projectInfo.members': 1, columnsInfo: 1 } }
    ]);

    if (!taskWithInfo.length) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const task = taskWithInfo[0];
    const project = task.projectInfo;

    // Check if user has access to this task
    if (!project.owner.equals(userId) && !project.members.includes(userId)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const columns = task.columnsInfo;

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
        ) || columns[0];
        break;
    }

    if (!targetColumn) {
      return res.status(404).json({ message: 'Target column not found' });
    }

    // If task is already in the target column, no need to move
    if (task.column.toString() === targetColumn._id.toString()) {
      return res.status(200).json({
        message: 'Task is already in the target status',
        task: { _id: taskId, status, completed: status === 'completed' },
      });
    }

    // Optimized: Use Promise.all for parallel updates
    await Promise.all([
      Column.findByIdAndUpdate(task.column, {
        $pull: { tasks: taskId },
      }),
      Column.findByIdAndUpdate(targetColumn._id, {
        $push: { tasks: taskId },
      }),
      Task.findByIdAndUpdate(taskId, {
        column: targetColumn._id,
        status: status,
      }),
    ]);

    // Invalidate project caches
    const taskDetails = await Task.findById(taskId).select('project').lean();
    if (taskDetails) {
      await invalidateProjectCaches((taskDetails.project as any).toString(), rawUserId);
    }

    // Return minimal success response
    res.status(200).json({
      message: 'Task status updated successfully',
      task: { _id: taskId, status, completed: status === 'completed' },
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error updating task status.', error: error.message });
  }
};

// --- Controller to delete a task ---
export const deleteTaskController = async (req: Request, res: Response) => {
  try {
    const { taskId } = req.params;

    // Optimized: Find and delete in one operation
    const deletedTask = await Task.findByIdAndDelete(taskId).select('column').lean();

    if (!deletedTask) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Remove task from column (fire and forget)
    Column.findByIdAndUpdate(deletedTask.column, {
      $pull: { tasks: deletedTask._id },
    }).exec();

    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error deleting task.', error: error.message });
  }
};
import { Request, Response } from 'express';
import Task from '../../models/task.model';
import Column from '../../models/column.model';
import { CreateTaskInput, UpdateTaskInput, UpdateTaskStatusInput } from './task.validation';

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
      ])
      .lean(); // Use lean() for better performance when no mongoose document methods needed
    
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
    
    const taskWithStatus = {
      ...task,
      status,
      completed: status === 'completed',
    };
    
    res.status(200).json(taskWithStatus);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error getting task.', error: error.message });
  }
};

export const getAllTasksController = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    
    // Optimized: Single aggregation pipeline instead of multiple queries
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
      // Project only the fields we need
      {
        $project: {
          _id: 1,
          title: 1,
          description: 1,
          priority: 1,
          status: 1,
          createdAt: 1,
          updatedAt: 1,
          'project._id': '$projectInfo._id',
          'project.name': '$projectInfo.name',
          'column._id': '$columnInfo._id',
          'column.title': '$columnInfo.title',
          'assignee._id': '$assigneeInfo._id',
          'assignee.name': '$assigneeInfo.name',
          'assignee.email': '$assigneeInfo.email',
        },
      },
      // Add computed status based on column title
      {
        $addFields: {
          computedStatus: {
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
          completed: { $eq: ['$computedStatus', 'completed'] }
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

    // Fetch the complete task with populated fields
    const completeTask = await Task.findById(newTask._id)
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

    res.status(201).json(completeTask);
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
      runValidators: true,
    })
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
    const userId = (req as any).user.id;

    // Optimized: Single aggregation to get task with project and board info
    const taskWithInfo = await Task.aggregate([
      { $match: { _id: taskId } },
      {
        $lookup: {
          from: 'projects',
          localField: 'project',
          foreignField: '_id',
          as: 'projectInfo',
        },
      },
      { $unwind: '$projectInfo' },
      {
        $lookup: {
          from: 'boards',
          localField: 'projectInfo.board',
          foreignField: '_id',
          as: 'boardInfo',
        },
      },
      { $unwind: '$boardInfo' },
      {
        $lookup: {
          from: 'columns',
          localField: 'boardInfo.columns',
          foreignField: '_id',
          as: 'columnsInfo',
        },
      },
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
        task: {
          ...task,
          status,
          completed: status === 'completed',
        },
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

    // Fetch updated task
    const updatedTask = await Task.findById(taskId)
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

    res.status(200).json({
      message: 'Task status updated successfully',
      task: {
        ...updatedTask,
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

    // Optimized: Find and delete in one operation, then update column
    const deletedTask = await Task.findByIdAndDelete(taskId);

    if (!deletedTask) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Remove task from column (don't await to speed up response)
    Column.findByIdAndUpdate(deletedTask.column, {
      $pull: { tasks: deletedTask._id },
    }).exec();

    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error deleting task.', error: error.message });
  }
};
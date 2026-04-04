import { Request, Response } from 'express';
import { Schema, isValidObjectId, Types } from 'mongoose';
import Project from '../../models/project.model';
import Task from '../../models/task.model';
import Board, { IBoard } from '../../models/board.model';
import Column from '../../models/column.model';
import { CreateProjectInput, UpdateProjectInput, DeleteProjectInput } from './project.validation';
import { cacheKeys, CACHE_TTL, getCachedData, setCachedData, invalidateProjectCaches } from '../../config/redis';

// --- Controller to get dashboard stats (optimized single endpoint) ---
export const getDashboardStatsController = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const cacheKey = `dashboard:stats:${userId}`;

    // Try to get from cache first
    const cachedStats = await getCachedData<any>(cacheKey);
    if (cachedStats) {
      console.log('✅ Serving dashboard stats from cache for user:', userId);
      return res.status(200).json(cachedStats);
    }

    // Optimized: Use aggregation pipeline for efficient stats calculation
    const userObjectId = new Types.ObjectId(userId);

    // Get all task stats in a single aggregation
    const taskStats = await Task.aggregate([
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
        $match: {
          $or: [
            { 'projectInfo.owner': userObjectId },
            { 'projectInfo.members': userObjectId },
          ],
        },
      },
      {
        $group: {
          _id: null,
          totalTasks: { $sum: 1 },
          completedTasks: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
          },
          inProgressTasks: {
            $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] },
          },
          pendingTasks: {
            $sum: { $cond: [{ $eq: ['$status', 'todo'] }, 1, 0] },
          },
          overdueTasks: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $ifNull: ['$dueDate', false] },
                    { $lt: ['$dueDate', new Date()] },
                    { $ne: ['$status', 'completed'] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

    // Get project count
    const activeProjects = await Project.countDocuments({
      $or: [{ owner: userId }, { members: userId }],
      status: 'active',
    });

    // Get recent tasks (last 4)
    const recentTasks = await Task.aggregate([
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
        $match: {
          $or: [
            { 'projectInfo.owner': userObjectId },
            { 'projectInfo.members': userObjectId },
          ],
        },
      },
      {
        $lookup: {
          from: 'columns',
          localField: 'column',
          foreignField: '_id',
          as: 'columnInfo',
        },
      },
      { $unwind: '$columnInfo' },
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
      {
        $project: {
          _id: 1,
          title: 1,
          description: 1,
          priority: 1,
          status: 1,
          dueDate: 1,
          createdAt: 1,
          project: {
            _id: '$projectInfo._id',
            name: '$projectInfo.name',
          },
          assignee: {
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
      { $sort: { createdAt: -1 } },
      { $limit: 4 },
    ]);

    // Get recent projects with task counts (last 3)
    const recentProjects = await Project.find({
      $or: [{ owner: userId }, { members: userId }],
    })
      .select('name status createdAt')
      .sort({ createdAt: -1 })
      .limit(3)
      .lean();

    // Calculate project progress
    const projectsWithProgress = await Promise.all(
      recentProjects.map(async (project) => {
        const taskCounts = await Task.aggregate([
          { $match: { project: project._id } },
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              completed: {
                $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
              },
            },
          },
        ]);

        const totalTasks = taskCounts[0]?.total || 0;
        const completedTasks = taskCounts[0]?.completed || 0;
        const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        return {
          _id: project._id,
          name: project.name,
          totalTasks,
          completedTasks,
          progress,
        };
      })
    );

    const stats = {
      totalTasks: taskStats[0]?.totalTasks || 0,
      completedTasks: taskStats[0]?.completedTasks || 0,
      inProgressTasks: taskStats[0]?.inProgressTasks || 0,
      pendingTasks: taskStats[0]?.pendingTasks || 0,
      overdueTasks: taskStats[0]?.overdueTasks || 0,
      activeProjects,
      recentTasks,
      recentProjects: projectsWithProgress,
    };

    // Cache for 2 minutes (shorter than other data since dashboard needs fresh stats)
    await setCachedData(cacheKey, stats, 120);

    res.status(200).json(stats);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error getting dashboard stats.', error: error.message });
  }
};
export const getAllProjectsController = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const cacheKey = cacheKeys.userProjects(userId);

    // Try to get from cache first
    const cachedProjects = await getCachedData<any[]>(cacheKey);
    if (cachedProjects) {
      console.log('✅ Serving projects from cache for user:', userId);
      return res.status(200).json(cachedProjects);
    }

    console.log('📦 Cache miss - fetching projects from DB for user:', userId);
    
    // Optimized: Select only needed fields from Project
    const projects = await Project.find({
      $or: [{ owner: userId }, { members: userId }],
    })
    .select('name description status dueDate createdAt updatedAt owner board')
    .populate('owner', 'name email')
    .populate({
      path: 'board',
      select: 'columns',
      populate: {
        path: 'columns',
        select: 'title tasks',
        populate: {
          path: 'tasks',
          model: 'Task',
          select: '_id', // Only need task IDs for counting
        },
      },
    })
    .lean();

    // Calculate task statistics for each project
    const projectsWithStats = projects.map(project => {
      const board = project.board as any;
      let totalTasks = 0;
      let completedTasks = 0;

      if (board && board.columns) {
        board.columns.forEach((column: any) => {
          if (column.tasks) {
            totalTasks += column.tasks.length;
            // Count tasks in 'Done' column as completed
            if (column.title === 'Done') {
              completedTasks += column.tasks.length;
            }
          }
        });
      }

      return {
        _id: project._id,
        name: project.name,
        description: project.description,
        status: project.status,
        dueDate: project.dueDate,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
        owner: project.owner,
        totalTasks,
        completedTasks,
      };
    });

    // Store in cache
    await setCachedData(cacheKey, projectsWithStats, CACHE_TTL.PROJECT_LIST);

    res.status(200).json(projectsWithStats);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error getting projects.', error: error.message });
  }
};

// --- Controller to get a single project with task details ---
export const getProjectController = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const userId = (req as any).user.id;
    const cacheKey = cacheKeys.projectDetail(projectId);

    if (!isValidObjectId(projectId)) {
      return res.status(400).json({ message: 'Invalid Project ID' });
    }

    // Try to get from cache first
    const cachedProject = await getCachedData<any>(cacheKey);
    if (cachedProject) {
      console.log('✅ Serving project detail from cache:', projectId);
      return res.status(200).json(cachedProject);
    }

    console.log('📦 Cache miss - fetching project detail from DB:', projectId);

    // Optimized: Select only needed fields at each level
    const project = await Project.findOne({
      _id: projectId,
      $or: [{ owner: userId }, { members: userId }],
    })
    .select('name description status dueDate createdAt updatedAt owner members board')
    .populate('owner', 'name email')
    .populate('members', 'name email')
    .populate({
      path: 'board',
      select: 'columns',
      populate: {
        path: 'columns',
        select: 'title tasks',
        populate: {
          path: 'tasks',
          model: 'Task',
          select: 'title description priority assignee',
          populate: {
            path: 'assignee',
            select: 'name email',
          },
        },
      },
    })
    .lean();

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const board = project.board as any;
    const tasks: any[] = [];
    let totalTasks = 0;
    let completedTasks = 0;

    if (board && board.columns) {
      board.columns.forEach((column: any) => {
        if (column.tasks) {
          totalTasks += column.tasks.length;
          column.tasks.forEach((task: any) => {
            tasks.push({
              ...task,
              status: column.title === 'Done' ? 'completed' : 
                     column.title === 'In Progress' ? 'in-progress' : 'todo',
            });
            if (column.title === 'Done') {
              completedTasks++;
            }
          });
        }
      });
    }

    const projectWithDetails = {
      _id: project._id,
      name: project.name,
      description: project.description,
      status: project.status,
      dueDate: project.dueDate,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      owner: project.owner,
      team: project.members,
      tasks,
      totalTasks,
      completedTasks,
    };

    // Store in cache
    await setCachedData(cacheKey, projectWithDetails, CACHE_TTL.PROJECT_DETAIL);

    res.status(200).json(projectWithDetails);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error getting project.', error: error.message });
  }
};

// --- Controller to get a single project with fully populated board data ---
export const getProjectBoardController = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const cacheKey = cacheKeys.projectBoard(projectId);

    if (!isValidObjectId(projectId)) {
      return res.status(400).json({ message: 'Invalid Project ID' });
    }

    // Try to get from cache first
    const cachedBoard = await getCachedData<any>(cacheKey);
    if (cachedBoard) {
      console.log('✅ Serving board from cache for project:', projectId);
      return res.status(200).json(cachedBoard);
    }

    console.log('📦 Cache miss - fetching board from DB for project:', projectId);

    // Optimized: Select only needed fields for board view
    const project = await Project.findById(projectId)
      .select('name board')
      .populate({
        path: 'board',
        select: 'columns',
        populate: {
          path: 'columns',
          select: 'title tasks',
          populate: {
            path: 'tasks',
            model: 'Task',
            select: 'title description priority assignee',
            populate: {
              path: 'assignee',
              select: 'name email',
            },
          },
        },
      })
      .lean();

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const populatedBoard = project.board as IBoard;

    if (!populatedBoard || !(populatedBoard as any).columns) {
        return res.status(500).json({ message: 'Server error: Board or columns could not be populated.' });
    }

    const boardData = {
      _id: project._id,
      name: project.name,
      columns: (populatedBoard as any).columns,
    };

    // Store in cache
    await setCachedData(cacheKey, boardData, CACHE_TTL.BOARD);

    res.status(200).json(boardData);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error getting project board.', error: error.message });
  }
};

// --- Controller to create a new project ---
export const createProjectController = async (
  req: Request<{}, {}, CreateProjectInput>,
  res: Response
) => {
  try {
    const { name, description, status, dueDate } = req.body;
    const ownerId = (req as any).user.id;

    const newProject = new Project({
      name,
      description,
      status: status || 'active',
      dueDate,
      owner: ownerId,
      members: [ownerId],
    });

    const newBoard = new Board({
      project: newProject._id,
    });

    const defaultColumns = [
      { title: 'To Do', board: newBoard._id, tasks: [] },
      { title: 'In Progress', board: newBoard._id, tasks: [] },
      { title: 'Done', board: newBoard._id, tasks: [] },
    ];
    const createdColumns = await Column.insertMany(defaultColumns);
    const columnIds = createdColumns.map(col => col._id as Schema.Types.ObjectId);

    newBoard.columns = columnIds;
    newProject.board = newBoard._id as Schema.Types.ObjectId;

    await Promise.all([
      newProject.save(),
      newBoard.save(),
    ]);

    // Convert ObjectId to string for cache invalidation
    const projectId = (newProject._id as Schema.Types.ObjectId).toString();
    
    // Invalidate user's projects cache
    await invalidateProjectCaches(projectId, ownerId);

    // Return only necessary project data with _id as string
    res.status(201).json({
      _id: projectId,
      name: newProject.name,
      description: newProject.description,
      status: newProject.status,
      dueDate: newProject.dueDate,
      createdAt: newProject.createdAt,
      updatedAt: newProject.updatedAt,
      owner: newProject.owner,
      board: newProject.board,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error creating project.', error: error.message });
  }
};

// --- Controller to update an existing project ---
export const updateProjectController = async (
  req: Request<UpdateProjectInput['params'], {}, UpdateProjectInput['body']>,
  res: Response
) => {
  try {
    const { projectId } = req.params;
    const updateData = req.body;
    const userId = (req as any).user.id;

    // Check if the project exists and user has permission to update it
    const project = await Project.findById(projectId).select('owner').lean();
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Only project owner can update the project
    if (project.owner.toString() !== userId) {
      return res.status(403).json({ message: 'Only project owner can update the project' });
    }

    // Update the project and return only necessary fields
    const updatedProject = await Project.findByIdAndUpdate(
      projectId,
      updateData,
      { new: true, runValidators: true }
    )
    .select('name description status dueDate updatedAt owner')
    .populate('owner', 'name email')
    .lean();

    // Invalidate caches
    await invalidateProjectCaches(projectId, userId);

    res.status(200).json(updatedProject);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error updating project.', error: error.message });
  }
};

// --- Controller to delete a project ---
export const deleteProjectController = async (
  req: Request<DeleteProjectInput['params']>,
  res: Response
) => {
  try {
    const { projectId } = req.params;
    const userId = (req as any).user.id;

    // Check if the project exists and user has permission to delete it
    const project = await Project.findById(projectId).select('owner board').lean();
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Only project owner can delete the project
    if (project.owner.toString() !== userId) {
      return res.status(403).json({ message: 'Only project owner can delete the project' });
    }

    // Delete associated board and columns
    if (project.board) {
      const board = await Board.findById(project.board).select('columns').lean();
      if (board && board.columns) {
        // Delete all columns and their tasks
        await Column.deleteMany({ _id: { $in: board.columns } });
      }
      // Delete the board
      await Board.findByIdAndDelete(project.board);
    }

    // Delete the project
    await Project.findByIdAndDelete(projectId);

    // Invalidate caches
    await invalidateProjectCaches(projectId, userId);

    res.status(200).json({ message: 'Project deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error deleting project.', error: error.message });
  }
};
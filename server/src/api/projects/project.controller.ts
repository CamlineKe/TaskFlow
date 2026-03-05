import { Request, Response } from 'express';
import { Schema, isValidObjectId } from 'mongoose';
import Project from '../../models/project.model';
import Board, { IBoard } from '../../models/board.model';
import Column from '../../models/column.model';
import { CreateProjectInput, UpdateProjectInput, DeleteProjectInput } from './project.validation';

// --- Controller to get all projects for the authenticated user ---
export const getAllProjectsController = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    
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
    .lean(); // Use lean() for better performance

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

    if (!isValidObjectId(projectId)) {
      return res.status(400).json({ message: 'Invalid Project ID' });
    }

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
          select: 'title description priority assignee', // Select only needed task fields
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

    res.status(200).json(projectWithDetails);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error getting project.', error: error.message });
  }
};

// --- Controller to get a single project with fully populated board data ---
export const getProjectBoardController = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;

    if (!isValidObjectId(projectId)) {
      return res.status(400).json({ message: 'Invalid Project ID' });
    }

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
            select: 'title description priority assignee', // Select only needed task fields
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

    // Return only necessary project data
    res.status(201).json({
      _id: newProject._id,
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

    res.status(200).json({ message: 'Project deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error deleting project.', error: error.message });
  }
};
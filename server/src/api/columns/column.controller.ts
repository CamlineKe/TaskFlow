import { Request, Response } from 'express';
import Column from '../../models/column.model';
import Task from '../../models/task.model';
import { MoveTaskInput } from './column.validation';
import { invalidateProjectCaches } from '../../config/redis';
import {
  getProjectParticipantIds,
  objectIdToString,
  userCanAccessProject,
} from '../../utils/access.util';

const getStatusFromColumnTitle = (title: string) => {
  const normalizedTitle = title.toLowerCase();

  if (normalizedTitle.includes('done') || normalizedTitle.includes('complete')) {
    return 'completed';
  }

  if (normalizedTitle.includes('progress') || normalizedTitle.includes('doing')) {
    return 'in-progress';
  }

  return 'todo';
};

export const moveTaskController = async (
  req: Request<{}, {}, MoveTaskInput>,
  res: Response
) => {
  try {
    const { taskId, sourceColumnId, destinationColumnId, destinationIndex } = req.body;
    const userId = (req as any).user.id;

    const task = await Task.findById(taskId)
      .select('project column')
      .populate({
        path: 'project',
        select: 'owner members board',
      })
      .lean();

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const project = task.project as any;
    if (!userCanAccessProject(project, userId)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (objectIdToString(task.column) !== sourceColumnId) {
      return res.status(400).json({ message: 'Source column does not match the task current column' });
    }

    const requestedColumnIds = [...new Set([sourceColumnId, destinationColumnId])];
    const columns = await Column.find({
      _id: { $in: requestedColumnIds },
      board: project.board,
    });

    if (columns.length !== requestedColumnIds.length) {
      return res.status(400).json({ message: 'Source and destination columns must belong to this project' });
    }

    const sourceColumn = columns.find((column) => objectIdToString(column._id) === sourceColumnId);
    const destinationColumn = columns.find((column) => objectIdToString(column._id) === destinationColumnId);

    if (!sourceColumn || !destinationColumn) {
      return res.status(400).json({ message: 'Invalid source or destination column' });
    }

    // Case 1: Moving within the same column (reordering)
    if (sourceColumnId === destinationColumnId) {
      // --- FIX: Convert ObjectIDs to strings for comparison ---
      const taskIndex = sourceColumn.tasks.findIndex(id => id.toString() === taskId);

      // Handle case where task is not found in the column
      if (taskIndex === -1) {
        return res.status(404).json({ message: 'Task not found in source column' });
      }

      // Remove the task from its original position
      const [movedTask] = sourceColumn.tasks.splice(taskIndex, 1);

      // Insert the task into its new position
      sourceColumn.tasks.splice(destinationIndex, 0, movedTask);

      await sourceColumn.save();
    }
    // Case 2: Moving to a different column
    else {
      // Remove task ID from the source column's tasks array
      const sourceUpdate = Column.findByIdAndUpdate(sourceColumnId, {
        $pull: { tasks: taskId },
      });

      // Add task ID to the destination column's tasks array at the correct index
      const destinationUpdate = Column.findByIdAndUpdate(destinationColumnId, {
        $push: {
          tasks: {
            $each: [taskId],
            $position: destinationIndex,
          },
        },
      });

      // Update the task's own 'column' field to point to the new column
      const taskUpdate = Task.findByIdAndUpdate(taskId, {
        column: destinationColumnId,
        status: getStatusFromColumnTitle(destinationColumn.title),
      });

      // Run all database updates in parallel for efficiency
      await Promise.all([sourceUpdate, destinationUpdate, taskUpdate]);
    }

    await invalidateProjectCaches(objectIdToString(project._id), getProjectParticipantIds(project));

    res.status(200).json({ message: 'Task moved successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error moving task.', error: error.message });
  }
};

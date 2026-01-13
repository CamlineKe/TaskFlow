import { Request, Response } from 'express';
import Column from '../../models/column.model';
import Task from '../../models/task.model';
import { MoveTaskInput } from './column.validation';

export const moveTaskController = async (
  req: Request<{}, {}, MoveTaskInput>,
  res: Response
) => {
  try {
    const { taskId, sourceColumnId, destinationColumnId, destinationIndex } = req.body;

    // Case 1: Moving within the same column (reordering)
    if (sourceColumnId === destinationColumnId) {
      const column = await Column.findById(sourceColumnId);
      if (!column) {
        return res.status(404).json({ message: 'Column not found' });
      }

      // --- FIX: Convert ObjectIDs to strings for comparison ---
      const taskIndex = column.tasks.findIndex(id => id.toString() === taskId);

      // Handle case where task is not found in the column
      if (taskIndex === -1) {
        return res.status(404).json({ message: 'Task not found in source column' });
      }

      // Remove the task from its original position
      const [movedTask] = column.tasks.splice(taskIndex, 1);

      // Insert the task into its new position
      column.tasks.splice(destinationIndex, 0, movedTask);

      await column.save();
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
      });

      // Run all database updates in parallel for efficiency
      await Promise.all([sourceUpdate, destinationUpdate, taskUpdate]);
    }

    res.status(200).json({ message: 'Task moved successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error moving task.', error: error.message });
  }
};

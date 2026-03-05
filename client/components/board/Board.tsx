'use client';

import { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { Box, CircularProgress, Alert, Typography } from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { BoardColumn } from './Column';
import { TaskCard, Task } from './TaskCard';
import { TaskDetailModal } from './TaskDetailModal';
import apiClient from '@/lib/axios';

interface Column {
  _id: string;
  title: string;
  tasks: Task[];
}

interface BoardData {
  _id: string;
  name: string;
  columns: Column[];
}

interface BoardProps {
  projectId: string;
}

const fetchBoardData = async (projectId: string): Promise<BoardData> => {
  const { data } = await apiClient.get(`/projects/${projectId}/board`);
  return data;
};

export function Board({ projectId }: BoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const { data: board, isLoading, isError } = useQuery<BoardData>({
    queryKey: ['board', projectId],
    queryFn: () => fetchBoardData(projectId),
  });

  const moveTaskMutation = useMutation({
    mutationFn: async ({
      taskId,
      sourceColumnId,
      targetColumnId,
    }: {
      taskId: string;
      sourceColumnId: string;
      targetColumnId: string;
    }) => {
      const response = await apiClient.put(`/tasks/${taskId}/move`, {
        sourceColumnId,
        targetColumnId,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to move task');
    },
  });

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = board?.columns
      .flatMap(col => col.tasks)
      .find(t => t._id === active.id);
    
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    // Optional: Add visual feedback during drag over
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);

    const { active, over } = event;

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find source and target columns
    let sourceColumn: Column | undefined;
    let targetColumn: Column | undefined;
    let activeTask: Task | undefined;

    board?.columns.forEach(column => {
      const task = column.tasks.find(t => t._id === activeId);
      if (task) {
        sourceColumn = column;
        activeTask = task;
      }
      if (column._id === overId) {
        targetColumn = column;
      }
    });

    // If dropping over a task, find its column
    if (!targetColumn) {
      board?.columns.forEach(column => {
        const task = column.tasks.find(t => t._id === overId);
        if (task) {
          targetColumn = column;
        }
      });
    }

    // If source and target are different, move the task
    if (sourceColumn && targetColumn && sourceColumn._id !== targetColumn._id && activeTask) {
      moveTaskMutation.mutate({
        taskId: activeId,
        sourceColumnId: sourceColumn._id,
        targetColumnId: targetColumn._id,
      });
    }
  };

  const handleTaskClick = (taskId: string) => {
    setSelectedTaskId(taskId);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        Failed to load board data
      </Alert>
    );
  }

  if (!board || board.columns.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', p: 4 }}>
        <Typography color="text.secondary">
          No columns found for this board.
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <Box
          sx={{
            display: 'flex',
            overflowX: 'auto',
            pb: 2,
            gap: 2,
            minHeight: 'calc(100vh - 200px)',
          }}
        >
          {board.columns.map((column) => (
            <BoardColumn
              key={column._id}
              column={column}
              projectId={projectId}
            >
              {column.tasks.map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  onClick={() => handleTaskClick(task._id)}
                />
              ))}
            </BoardColumn>
          ))}
        </Box>

        <DragOverlay>
          {activeTask && (
            <Box sx={{ opacity: 0.8, transform: 'rotate(2deg)' }}>
              <TaskCard task={activeTask} onClick={() => {}} />
            </Box>
          )}
        </DragOverlay>
      </DndContext>

      <TaskDetailModal
        taskId={selectedTaskId}
        onClose={() => setSelectedTaskId(null)}
        projectId={projectId}
      />
    </>
  );
}
'use client';

import { useState } from 'react';
import { Box, Typography, Paper, IconButton, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useDroppable } from '@dnd-kit/core';

import { Task as ITask } from './TaskCard'; // We only need the Task interface here
import { CreateTaskModal } from './CreateTaskModal';

export interface Column {
  _id: string;
  title: string;
  tasks: ITask[];
}

// --- FIX 1: Add 'children' to the props ---
interface ColumnProps {
  column: Column;
  projectId: string;
  children: React.ReactNode; 
}

export function BoardColumn({ column, projectId, children }: ColumnProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { setNodeRef, isOver } = useDroppable({
    id: column._id,
  });

  return (
    <>
      <CreateTaskModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        projectId={projectId}
        columnId={column._id}
      />
      <Paper
        ref={setNodeRef}
        sx={{
          width: 300,
          flexShrink: 0,
          mx: 1,
          height: 'fit-content',
          maxHeight: 'calc(100vh - 120px)',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: isOver ? 'action.selected' : 'grey.100',
          transition: 'background-color 0.2s ease-in-out',
        }}
      >
        {/* Column Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 2,
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <Typography variant="h6">{column.title}</Typography>
          <IconButton size="small" onClick={() => setIsModalOpen(true)} title="Add new task">
            <AddIcon />
          </IconButton>
        </Box>
        
        {/* --- FIX 2: Render 'children' instead of mapping over tasks --- */}
        <Box sx={{ p: 1, overflowY: 'auto', flexGrow: 1, minHeight: 50 }}>
          {children}
        </Box>

        {/* Column Footer */}
        <Box sx={{ p: 1, mt: 'auto' }}>
          <Button 
            fullWidth 
            startIcon={<AddIcon />} 
            onClick={() => setIsModalOpen(true)}
            sx={{ justifyContent: 'flex-start', textTransform: 'none', color: 'text.secondary' }}
          >
            Add a card
          </Button>
        </Box>
      </Paper>
    </>
  );
}

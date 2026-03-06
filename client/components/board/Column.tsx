'use client';

import { useState } from 'react';
import { Box, Typography, Paper, IconButton, Button, useTheme } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useDroppable } from '@dnd-kit/core';

import { Task as ITask } from './TaskCard';
import { CreateTaskModal } from './CreateTaskModal';

export interface Column {
  _id: string;
  title: string;
  tasks: ITask[];
}

interface ColumnProps {
  column: Column;
  projectId: string;
  children: React.ReactNode; 
}

export function BoardColumn({ column, projectId, children }: ColumnProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const theme = useTheme();
  
  const { setNodeRef, isOver } = useDroppable({
    id: column._id,
  });

  // Determine background color based on theme mode
  const columnBgColor = theme.palette.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.05)' // Subtle white overlay for dark mode
    : 'grey.100'; // Light gray for light mode

  const hoverBgColor = theme.palette.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.1)'
    : 'action.selected';

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
          backgroundColor: isOver ? hoverBgColor : columnBgColor,
          transition: 'background-color 0.2s ease-in-out',
          // Add subtle border for better definition
          border: '1px solid',
          borderColor: 'divider',
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
            // Make header slightly darker for contrast
            backgroundColor: theme.palette.mode === 'dark' 
              ? 'rgba(0, 0, 0, 0.2)' 
              : 'rgba(0, 0, 0, 0.02)',
          }}
        >
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 600,
              color: 'text.primary',
            }}
          >
            {column.title}
          </Typography>
          <IconButton 
            size="small" 
            onClick={() => setIsModalOpen(true)} 
            title="Add new task"
            sx={{
              backgroundColor: theme.palette.mode === 'dark' 
                ? 'rgba(255, 255, 255, 0.1)' 
                : 'rgba(0, 0, 0, 0.04)',
              '&:hover': {
                backgroundColor: theme.palette.mode === 'dark' 
                  ? 'rgba(255, 255, 255, 0.2)' 
                  : 'rgba(0, 0, 0, 0.08)',
              },
            }}
          >
            <AddIcon />
          </IconButton>
        </Box>
        
        {/* Tasks Container */}
        <Box sx={{ 
          p: 1, 
          overflowY: 'auto', 
          flexGrow: 1, 
          minHeight: 50,
          // Custom scrollbar for better UX
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            background: theme.palette.mode === 'dark' 
              ? 'rgba(255, 255, 255, 0.2)' 
              : 'rgba(0, 0, 0, 0.2)',
            borderRadius: '3px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: theme.palette.mode === 'dark' 
              ? 'rgba(255, 255, 255, 0.3)' 
              : 'rgba(0, 0, 0, 0.3)',
          },
        }}>
          {children}
        </Box>

        {/* Column Footer */}
        <Box sx={{ p: 1, mt: 'auto' }}>
          <Button 
            fullWidth 
            startIcon={<AddIcon />} 
            onClick={() => setIsModalOpen(true)}
            sx={{ 
              justifyContent: 'flex-start', 
              textTransform: 'none',
              color: 'text.secondary',
              borderRadius: 1,
              py: 1,
              '&:hover': {
                backgroundColor: theme.palette.mode === 'dark' 
                  ? 'rgba(255, 255, 255, 0.1)' 
                  : 'rgba(0, 0, 0, 0.04)',
                color: 'text.primary',
              },
            }}
          >
            Add a card
          </Button>
        </Box>
      </Paper>
    </>
  );
}
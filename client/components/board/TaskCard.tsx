// client/components/board/TaskCard.tsx
import { Paper, Typography, Box, Chip, Avatar } from '@mui/material';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import {
  AccessTime as AccessTimeIcon,
  Person as PersonIcon,
  Flag as FlagIcon,
} from '@mui/icons-material';
import { getPriorityColor, getPriorityLabel, isOverdue } from '@/lib/display';
import type { Task } from '@/types/domain';

export type { Task };

interface TaskCardProps {
  task: Task;
  onClick: () => void;
}

const formatDueDate = (dateString?: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (date.toDateString() === tomorrow.toDateString()) {
    return 'Tomorrow';
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
};

export function TaskCard({ task, onClick }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task._id,
    data: { task },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  const taskPriority = task.priority || 'medium';
  const taskDueDate = task.dueDate;
  const taskOverdue = !!taskDueDate && isOverdue(taskDueDate) && task.status !== 'completed';

  return (
    <Paper
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={onClick}
      elevation={isDragging ? 8 : 1}
      sx={{
        p: 2,
        mb: 1.5,
        backgroundColor: 'background.paper',
        cursor: 'grab',
        transition: 'all 0.2s ease',
        border: taskOverdue ? '1px solid' : 'none',
        borderColor: 'error.main',
        '&:hover': {
          backgroundColor: 'action.hover',
          boxShadow: 4,
          transform: 'translateY(-2px)',
        },
        ...(isDragging && {
          boxShadow: 8,
          transform: 'rotate(2deg) scale(1.02)',
        }),
      }}
    >
      {/* Priority Chip */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Chip
          label={getPriorityLabel(taskPriority)}
          size="small"
          color={getPriorityColor(taskPriority)}
          sx={{ height: 20, fontSize: '0.65rem' }}
          icon={<FlagIcon sx={{ fontSize: '0.75rem !important' }} />}
        />
        {taskDueDate && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <AccessTimeIcon sx={{ fontSize: 14, color: taskOverdue ? 'error.main' : 'text.secondary' }} />
            <Typography 
              variant="caption" 
              sx={{ 
                color: taskOverdue ? 'error.main' : 'text.secondary',
                fontWeight: taskOverdue ? 600 : 400,
              }}
            >
              {formatDueDate(taskDueDate)}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Task Title */}
      <Typography 
        variant="body1" 
        sx={{ 
          fontWeight: 600, 
          mb: 0.5,
          wordBreak: 'break-word',
        }}
      >
        {task.title}
      </Typography>

      {/* Task Description (truncated) */}
      {task.description && (
        <Typography 
          variant="caption" 
          color="text.secondary"
          sx={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            mb: 1.5,
          }}
        >
          {task.description}
        </Typography>
      )}

      {/* Assignee and Project */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
        {task.assignee ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Avatar sx={{ width: 20, height: 20, fontSize: '0.7rem' }}>
              {task.assignee.name.charAt(0)}
            </Avatar>
            <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 100 }}>
              {task.assignee.name.split(' ')[0]}
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <PersonIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
            <Typography variant="caption" color="text.disabled">
              Unassigned
            </Typography>
          </Box>
        )}

        {task.project && (
          <Chip
            label={task.project.name}
            size="small"
            variant="outlined"
            sx={{ height: 20, fontSize: '0.65rem', maxWidth: 100 }}
          />
        )}
      </Box>
    </Paper>
  );
}

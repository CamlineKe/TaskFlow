// client/components/board/TaskCard.tsx
import { Paper, Typography } from '@mui/material';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

export interface Task {
  _id: string;
  title: string;
  description?: string;
}

interface TaskCardProps {
  task: Task;
  onClick: () => void; // Add onClick prop
}

export function TaskCard({ task, onClick }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: task._id,
    data: { task },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  return (
    <Paper
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={onClick} // Call onClick when the card is clicked
      elevation={1}
      sx={{
        p: 2,
        mb: 1,
        backgroundColor: 'background.default',
        cursor: 'grab',
        '&:hover': {
          backgroundColor: 'action.hover',
        },
      }}
    >
      <Typography>{task.title}</Typography>
    </Paper>
  );
}

import type { ChipProps } from '@mui/material/Chip';

/**
 * Shared display helpers for status/priority colors and labels, dates,
 * and overdue checks. Single source of truth so every surface renders
 * the same meaning with the same color.
 */

export type ChipColor = NonNullable<ChipProps['color']>;

// ---------------------------------------------------------------------------
// Task status
// ---------------------------------------------------------------------------

export type TaskStatus = 'todo' | 'in-progress' | 'completed';

const TASK_STATUS_COLORS: Record<TaskStatus, ChipColor> = {
  todo: 'info',
  'in-progress': 'warning',
  completed: 'success',
};

const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  todo: 'To Do',
  'in-progress': 'In Progress',
  completed: 'Completed',
};

export function getTaskStatusColor(status: string): ChipColor {
  return TASK_STATUS_COLORS[status as TaskStatus] ?? 'default';
}

export function getTaskStatusLabel(status: string): string {
  return TASK_STATUS_LABELS[status as TaskStatus] ?? status;
}

// ---------------------------------------------------------------------------
// Project status
// ---------------------------------------------------------------------------

export type ProjectStatus = 'active' | 'on-hold' | 'completed';

const PROJECT_STATUS_COLORS: Record<ProjectStatus, ChipColor> = {
  active: 'success',
  'on-hold': 'warning',
  completed: 'info',
};

export function getProjectStatusColor(status: string): ChipColor {
  return PROJECT_STATUS_COLORS[status as ProjectStatus] ?? 'default';
}

export function getProjectStatusLabel(status: string): string {
  if (!status) return status;
  return status
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

// ---------------------------------------------------------------------------
// Priority
// ---------------------------------------------------------------------------

export type Priority = 'low' | 'medium' | 'high';

const PRIORITY_COLORS: Record<Priority, ChipColor> = {
  low: 'info',
  medium: 'warning',
  high: 'error',
};

export function getPriorityColor(priority: string): ChipColor {
  return PRIORITY_COLORS[priority as Priority] ?? 'default';
}

export function getPriorityLabel(priority: string): string {
  if (!priority) return priority;
  return priority.charAt(0).toUpperCase() + priority.slice(1);
}

// ---------------------------------------------------------------------------
// Dates
// ---------------------------------------------------------------------------

/** Formats a date-ish value as a short, locale-stable date (e.g. "Jan 5, 2026"). */
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Date-only overdue check: a task due today is not overdue.
 * Avoids the timestamp comparison that marks today's tasks as overdue.
 */
export function isOverdue(dueDate: string | Date): boolean {
  const due = new Date(dueDate);
  const today = new Date();
  due.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return due < today;
}

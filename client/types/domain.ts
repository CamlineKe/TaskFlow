export type TaskStatus = 'todo' | 'in-progress' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high';
export type ProjectStatus = 'active' | 'completed' | 'on-hold';

export interface UserSummary {
  _id: string;
  name: string;
  email: string;
}

export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  assignee?: UserSummary;
  project?: {
    _id: string;
    name: string;
  };
}

export interface BoardColumnData {
  _id: string;
  title: string;
  tasks: Task[];
}

export interface BoardData {
  _id: string;
  name: string;
  columns: BoardColumnData[];
}

export interface Project {
  _id: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  tasks?: string[];
  completedTasks?: number;
  totalTasks?: number;
  owner?: UserSummary;
}

export interface ProjectDetail {
  _id: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  owner: UserSummary;
  tasks: Task[];
  team?: UserSummary[];
}

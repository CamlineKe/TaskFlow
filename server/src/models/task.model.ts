import { Schema, model, Document } from 'mongoose';

// 1. Create an interface for the Task document.
export interface ITask extends Document {
  title: string;
  description?: string; // Description is optional
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in-progress' | 'completed';
  project: Schema.Types.ObjectId; // Reference to the project it belongs to
  column: Schema.Types.ObjectId; // Reference to the column it is in
  assignee?: Schema.Types.ObjectId; // Optional reference to a user (renamed for consistency)
  createdAt: Date;
  updatedAt: Date;
}

// 2. Create the Mongoose Schema.
const taskSchema = new Schema<ITask>({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
  status: {
    type: String,
    enum: ['todo', 'in-progress', 'completed'],
    default: 'todo',
  },
  project: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  column: {
    type: Schema.Types.ObjectId,
    ref: 'Column',
    required: true,
  },
  assignee: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt
});

// ========== INDEXES FOR PERFORMANCE ==========
// Compound index for finding tasks by project and status (used in getAllTasksController)
taskSchema.index({ project: 1, status: 1 });

// Index for finding tasks by column (used when moving tasks)
taskSchema.index({ column: 1 });

// Index for finding tasks by assignee
taskSchema.index({ assignee: 1 });

// Index for sorting by creation date
taskSchema.index({ createdAt: -1 });

// Index for finding overdue tasks
taskSchema.index({ dueDate: 1, status: 1 });

// 3. Create and export the Mongoose model.
const Task = model<ITask>('Task', taskSchema);

export default Task;
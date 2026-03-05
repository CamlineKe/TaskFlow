import { Schema, model, Document } from 'mongoose';
import { IBoard } from './board.model';

// 1. Create an interface for the Project document.
export interface IProject extends Document {
  name: string;
  description?: string;
  status: 'active' | 'completed' | 'on-hold';
  dueDate?: Date;
  owner: Schema.Types.ObjectId; // The user who created the project
  members: Schema.Types.ObjectId[]; // Other users who have access
  board: Schema.Types.ObjectId | IBoard;
  createdAt: Date;
  updatedAt: Date;
}

// 2. Create the Mongoose Schema.
const projectSchema = new Schema<IProject>({
  name: {
    type: String,
    required: [true, 'Project name is required'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'on-hold'],
    default: 'active',
  },
  dueDate: {
    type: Date,
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  members: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  board: {
    type: Schema.Types.ObjectId,
    ref: 'Board',
    required: true,
  },
}, {
  timestamps: true,
});

// ========== INDEXES FOR PERFORMANCE ==========
// Compound index for finding projects by owner or members (used in getAllProjectsController)
projectSchema.index({ owner: 1, members: 1 });

// Index for finding a specific project by ID with owner/members check
projectSchema.index({ _id: 1, owner: 1, members: 1 });

// Index for filtering projects by status
projectSchema.index({ status: 1 });

// Index for sorting by due date
projectSchema.index({ dueDate: 1 });

// Index for sorting by creation date (newest first)
projectSchema.index({ createdAt: -1 });

// Compound index for searching projects by name and description
projectSchema.index({ name: 'text', description: 'text' });

// 3. Create and export the Mongoose model.
const Project = model<IProject>('Project', projectSchema);

export default Project;
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

// 3. Create and export the Mongoose model.
const Project = model<IProject>('Project', projectSchema);

export default Project;

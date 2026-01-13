import { Schema, model, Document } from 'mongoose';

// 1. Create an interface for the Column document.
export interface IColumn extends Document {
  title: string;
  board: Schema.Types.ObjectId; // Reference to the board it belongs to
  tasks: Schema.Types.ObjectId[]; // An array of references to tasks
}

// 2. Create the Mongoose Schema.
const columnSchema = new Schema<IColumn>({
  title: {
    type: String,
    required: [true, 'Column title is required'],
    trim: true,
  },
  board: {
    type: Schema.Types.ObjectId,
    ref: 'Board',
    required: true,
  },
  // This array holds the IDs of the tasks within this column.
  // The order of IDs in this array is critical, as it dictates the
  // vertical order of tasks displayed on the frontend.
  tasks: [{
    type: Schema.Types.ObjectId,
    ref: 'Task',
  }],
}, {
  timestamps: true,
});

// 3. Create and export the Mongoose model.
const Column = model<IColumn>('Column', columnSchema);

export default Column;

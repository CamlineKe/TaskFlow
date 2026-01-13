import { Schema, model, Document } from 'mongoose';

// 1. Create an interface for the Board document.
export interface IBoard extends Document {
  project: Schema.Types.ObjectId; // Reference to the project it belongs to
  columns: Schema.Types.ObjectId[]; // An array of references to its columns
}

// 2. Create the Mongoose Schema.
const boardSchema = new Schema<IBoard>({
  project: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
    unique: true, // A project can only have one board
  },
  // This array holds the IDs of the columns within this board.
  // The order of IDs in this array dictates the horizontal order
  // of the columns displayed on the frontend.
  columns: [{
    type: Schema.Types.ObjectId,
    ref: 'Column',
  }],
}, {
  timestamps: true,
});

// 3. Create and export the Mongoose model.
const Board = model<IBoard>('Board', boardSchema);

export default Board;

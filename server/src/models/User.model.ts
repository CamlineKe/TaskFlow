import { Schema, model, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

// 1. Create an interface representing a User document.
// This provides strong typing for our model.
export interface IUser extends Document {
  name: string;
  email: string;
  password?: string; // The '?' makes it optional, useful because we won't always have it.
  bio?: string; // User description
  location?: string; // User location
  website?: string; // User website
  avatar?: string; // User avatar URL
  projects: Schema.Types.ObjectId[];
  notificationPreferences: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    taskReminders: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
  // We will add a custom method to the user documents to compare passwords.
  comparePassword(password: string): Promise<boolean>;
}

// 2. Create a Mongoose Schema corresponding to the document interface.
const userSchema = new Schema<IUser>({
  name: {
    type: String,
    required: [true, 'User name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'User email is required'],
    unique: true, // Ensures no two users can have the same email.
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false, // A crucial security feature. Prevents the password from being returned in queries by default.
  },
  bio: {
    type: String,
    trim: true,
    maxlength: [500, 'Bio cannot exceed 500 characters'],
  },
  location: {
    type: String,
    trim: true,
    maxlength: [100, 'Location cannot exceed 100 characters'],
  },
  website: {
    type: String,
    trim: true,
    maxlength: [200, 'Website URL cannot exceed 200 characters'],
  },
  avatar: {
    type: String,
    trim: true,
  },
  notificationPreferences: {
    emailNotifications: {
      type: Boolean,
      default: true,
    },
    pushNotifications: {
      type: Boolean,
      default: true,
    },
    taskReminders: {
      type: Boolean,
      default: true,
    },
  },
  projects: [{
    type: Schema.Types.ObjectId,
    ref: 'Project', // This creates a reference to the 'Project' model.
  }],
}, {
  timestamps: true, // Automatically adds `createdAt` and `updatedAt` fields.
});

// 3. Add a "pre-save" middleware hook to hash the password before saving.
// This function will run automatically every time a new user is saved.
userSchema.pre<IUser>('save', async function (next) {
  // Only hash the password if it has been modified (or is new).
  if (!this.isModified('password') || !this.password) {
    return next();
  }

  // Check if password is already hashed (bcrypt hashes start with $2a$ or $2b$)
  if (this.password.startsWith('$2a$') || this.password.startsWith('$2b$')) {
    return next();
  }

  try {
    // Generate a "salt" to add randomness to the hash.
    const salt = await bcrypt.genSalt(12);
    // Hash the password using the generated salt.
    this.password = await bcrypt.hash(this.password, salt);
    // Proceed to the next step in the save process.
    next();
  } catch (error: any) {
    // If an error occurs, pass it to the next middleware.
    next(error);
  }
});

// 4. Add a custom method to the schema for comparing passwords during login.
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  // 'this.password' refers to the hashed password of the specific user document.
  // bcrypt.compare will safely hash the candidate password and compare it to the stored hash.
  return bcrypt.compare(candidatePassword, this.password);
};


// 5. Create and export the Mongoose model.
// The model is what we use to interact with the 'users' collection in the database.
const User = model<IUser>('User', userSchema);

export default User;

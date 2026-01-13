import { Schema, model, Document } from 'mongoose';
import crypto from 'crypto';
import config from '../config/config';

// Interface for Reset Token document
export interface IResetToken extends Document {
  userId: Schema.Types.ObjectId;
  token: string;
  code: string;
  createdAt: Date;
  expiresAt: Date;
  isValid: boolean;
}

// Schema for Reset Token
const resetTokenSchema = new Schema<IResetToken>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  token: {
    type: String,
    required: true,
    unique: true,
  },
  code: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 }, // This will remove documents after they expire
  },
  isValid: {
    type: Boolean,
    default: true,
  },
});

// Methods to generate a unique token and verification code
export const generateResetToken = () => {
  // Generate a random token
  return crypto.randomBytes(32).toString('hex');
};

export const generateVerificationCode = () => {
  // Generate a 6-digit verification code
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const createResetToken = (userId: Schema.Types.ObjectId) => {
  const token = generateResetToken();
  const code = generateVerificationCode();
  const expiresAt = new Date(Date.now() + config.resetToken.expireTime);
  
  return {
    userId,
    token,
    code,
    expiresAt,
    isValid: true,
  };
};

// Export the model
const ResetToken = model<IResetToken>('ResetToken', resetTokenSchema);
export default ResetToken;
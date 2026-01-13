import { Schema, model, Document } from 'mongoose';
import crypto from 'crypto';
import config from '../config/config';

// Interface for Email Verification document
export interface IEmailVerification extends Document {
  email: string;
  name: string;
  password: string; // This will be hashed
  verificationCode: string;
  token: string;
  createdAt: Date;
  expiresAt: Date;
  isVerified: boolean;
}

// Schema for Email Verification
const emailVerificationSchema = new Schema<IEmailVerification>({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  verificationCode: {
    type: String,
    required: true,
  },
  token: {
    type: String,
    required: true,
    unique: true,
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
  isVerified: {
    type: Boolean,
    default: false,
  },
});

// Methods to generate verification data
export const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

export const generateEmailVerificationCode = () => {
  // Generate a 6-digit verification code
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const createEmailVerification = (email: string, name: string, password: string) => {
  const token = generateVerificationToken();
  const verificationCode = generateEmailVerificationCode();
  const expiresAt = new Date(Date.now() + config.resetToken.expireTime); // 15 minutes
  
  return {
    email,
    name,
    password, // Will be hashed before saving
    verificationCode,
    token,
    expiresAt,
    isVerified: false,
  };
};

// Export the model
const EmailVerification = model<IEmailVerification>('EmailVerification', emailVerificationSchema);
export default EmailVerification;
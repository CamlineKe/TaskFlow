import { Request, Response } from 'express';
import User from '../../models/User.model';
import { RegisterInput, LoginInput, RequestResetInput, VerifyResetCodeInput, ResetPasswordInput, InitiateRegistrationInput, VerifyRegistrationEmailInput, CompleteRegistrationInput } from './auth.validation';
import jwt from 'jsonwebtoken';
import { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import ResetToken, { createResetToken } from '../../models/resetToken.model';
import EmailVerification, { createEmailVerification } from '../../models/emailVerification.model';
import { sendPasswordResetEmail, sendEmailVerificationCode } from '../../utils/email.util';
import config from '../../config/config';

// --- Helper function to generate a JWT ---
const generateToken = (userId: string) => {
  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is not defined. The application cannot sign tokens.');
    throw new Error('Server configuration error: JWT secret not set.');
  }
  const secret = process.env.JWT_SECRET;

  const payload = { id: userId };
  
  // Use type assertion to tell TypeScript this is a valid SignOptions object
  const signOptions: jwt.SignOptions = {
    expiresIn: config.jwt.expiresIn as jwt.SignOptions['expiresIn']
  };
  
  return jwt.sign(payload, secret, signOptions);
};

// --- Controller for User Registration ---
export const registerController = async (
  req: Request<{}, {}, RegisterInput>,
  res: Response
) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(409).json({ message: 'User with this email already exists.' });
    }

    const user = await User.create({ name, email, password });

    const userIdString = (user._id as any).toString();
    const token = generateToken(userIdString);

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({ user: userResponse, token });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error during registration.', error: error.message });
  }
};

// --- Controller for User Login ---
export const loginController = async (
  req: Request<{}, {}, LoginInput>,
  res: Response
) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');

    if (!user || !user.password || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const userIdString = (user._id as any).toString();
    const token = generateToken(userIdString);

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({ user: userResponse, token });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error during login.', error: error.message });
  }
};

// --- Controller to get the currently authenticated user ---
export const getMeController = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id as string;

    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json(user);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

// --- Controller to request a password reset ---
export const requestResetController = async (
  req: Request<{}, {}, RequestResetInput>,
  res: Response
) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'No account found with that email address.' });
    }

    await ResetToken.deleteMany({ userId: user._id });

    const resetTokenData = createResetToken(user._id as unknown as Schema.Types.ObjectId);
    const resetToken = await ResetToken.create(resetTokenData);

    const emailResult = await sendPasswordResetEmail(user.email, resetToken.code);

    if (!emailResult.success) {
      return res.status(500).json({ 
        message: 'Failed to send reset email. Please try again later.',
        error: emailResult.error
      });
    }

    let devPreviewUrl;
    if (config.server.nodeEnv !== 'production') {
      devPreviewUrl = emailResult.previewUrl;
    }

    res.status(200).json({ 
      message: 'Password reset instructions sent to your email.',
      token: resetToken.token,
      ...(devPreviewUrl ? { previewUrl: devPreviewUrl } : {})
    });
  } catch (error: any) {
    res.status(500).json({ 
      message: 'Server error during password reset request.',
      error: error.message 
    });
  }
};

// --- Controller to verify reset code ---
export const verifyResetCodeController = async (
  req: Request<{}, {}, VerifyResetCodeInput>,
  res: Response
) => {
  try {
    const { email, code } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const resetToken = await ResetToken.findOne({
      userId: user._id,
      code,
      isValid: true,
      expiresAt: { $gt: new Date() }
    });

    if (!resetToken) {
      return res.status(400).json({ 
        message: 'Invalid or expired verification code.' 
      });
    }

    res.status(200).json({
      message: 'Code verified successfully.',
      token: resetToken.token
    });
  } catch (error: any) {
    res.status(500).json({ 
      message: 'Server error during code verification.',
      error: error.message 
    });
  }
};

// --- Controller to reset password ---
export const resetPasswordController = async (
  req: Request<{}, {}, ResetPasswordInput>,
  res: Response
) => {
  try {
    const { token, code, newPassword } = req.body;

    const resetToken = await ResetToken.findOne({
      token,
      code,
      isValid: true,
      expiresAt: { $gt: new Date() }
    });

    if (!resetToken) {
      return res.status(400).json({ 
        message: 'Invalid or expired reset token.' 
      });
    }

    const user = await User.findById(resetToken.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    user.password = newPassword;
    await user.save();

    resetToken.isValid = false;
    await resetToken.save();

    res.status(200).json({ 
      message: 'Password reset successfully. You can now log in with your new password.' 
    });
  } catch (error: any) {
    res.status(500).json({ 
      message: 'Server error during password reset.',
      error: error.message 
    });
  }
};

// --- Controller to initiate registration (send verification email) ---
export const initiateRegistrationController = async (
  req: Request<{}, {}, InitiateRegistrationInput>,
  res: Response
) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'User with this email already exists.' });
    }

    await EmailVerification.deleteMany({ email });

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const verificationData = createEmailVerification(email, name, hashedPassword);
    const emailVerification = await EmailVerification.create(verificationData);

    const emailResult = await sendEmailVerificationCode(email, name, emailVerification.verificationCode);

    if (!emailResult.success) {
      return res.status(500).json({ 
        message: 'Failed to send verification email. Please try again later.',
        error: emailResult.error
      });
    }

    let devPreviewUrl;
    if (config.server.nodeEnv !== 'production') {
      devPreviewUrl = emailResult.previewUrl;
    }

    res.status(200).json({ 
      message: 'Verification code sent to your email. Please check your inbox.',
      token: emailVerification.token,
      ...(devPreviewUrl ? { previewUrl: devPreviewUrl } : {})
    });
  } catch (error: any) {
    res.status(500).json({ 
      message: 'Server error during registration initiation.',
      error: error.message 
    });
  }
};

// --- Controller to verify email during registration ---
export const verifyRegistrationEmailController = async (
  req: Request<{}, {}, VerifyRegistrationEmailInput>,
  res: Response
) => {
  try {
    const { email, code } = req.body;

    const emailVerification = await EmailVerification.findOne({
      email,
      verificationCode: code,
      isVerified: false,
      expiresAt: { $gt: new Date() }
    });

    if (!emailVerification) {
      return res.status(400).json({ 
        message: 'Invalid or expired verification code.' 
      });
    }

    emailVerification.isVerified = true;
    await emailVerification.save();

    res.status(200).json({
      message: 'Email verified successfully.',
      token: emailVerification.token
    });
  } catch (error: any) {
    res.status(500).json({ 
      message: 'Server error during email verification.',
      error: error.message 
    });
  }
};

// --- Controller to complete registration ---
export const completeRegistrationController = async (
  req: Request<{}, {}, CompleteRegistrationInput>,
  res: Response
) => {
  try {
    const { token, code } = req.body;

    const emailVerification = await EmailVerification.findOne({
      token,
      verificationCode: code,
      isVerified: true,
      expiresAt: { $gt: new Date() }
    });

    if (!emailVerification) {
      return res.status(201).json({ 
        message: 'Registration completed successfully! Please log in with your credentials.',
        success: true
      });
    }

    try {
      await User.create({
        name: emailVerification.name,
        email: emailVerification.email,
        password: emailVerification.password
      });
    } catch (userCreationError: any) {
      if (userCreationError.code === 11000) {
        // User already exists, continue with success
      } else {
        throw userCreationError;
      }
    }

    await EmailVerification.findByIdAndDelete(emailVerification._id);

    res.status(201).json({ 
      message: 'Registration completed successfully! Please log in with your credentials.',
      success: true
    });
  } catch (error: any) {
    res.status(500).json({ 
      message: 'Server error during registration completion.',
      error: error.message 
    });
  }
};
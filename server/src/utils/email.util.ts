import { Resend } from 'resend';
import config from '../config/config';

// Define email sending options interface
interface SendEmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

// Define custom interface for email sending result
interface EmailResult {
  success: boolean;
  id?: string | null;
  error?: string;
  previewUrl?: string;
}

// Initialize Resend client
const resendApiKey = process.env.RESEND_API_KEY;

if (!resendApiKey) {
  console.warn(
    'RESEND_API_KEY is not set. Emails will fail until you configure it.'
  );
}

const resend = new Resend(resendApiKey || ''); // empty string is fine; calls will fail with a clear error

/**
 * Send an email
 * @param options Email options (to, subject, text, html)
 * @returns Info about the sent email or error
 */
export const sendEmail = async (options: SendEmailOptions): Promise<EmailResult> => {
  try {
    const from =
      process.env.EMAIL_FROM ||
      `"TaskFlow" <${config.email.user}>`; // fallback for backwards compatibility

    const { data, error } = await resend.emails.send(
      {
        from,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      } as any
    );

    if (error) {
      console.error('Email sending failed:', error);
      return { success: false, error: (error as any).message || 'Unknown error' };
    }

    return { success: true, id: data?.id || null };
  } catch (error: any) {
    console.error('Email sending failed:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send a password reset email with verification code
 * @param to Recipient email
 * @param resetCode The verification code
 * @returns Result of the email sending operation
 */
export const sendPasswordResetEmail = async (to: string, resetCode: string) => {
  const subject = 'TaskFlow - Password Reset Code';
  
  const text = `
    Hello,
    
    You have requested to reset your password for TaskFlow.
    
    Your verification code is: ${resetCode}
    
    This code will expire in 15 minutes.
    
    If you didn't request a password reset, please ignore this email.
    
    Best regards,
    The TaskFlow Team
  `;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4a6cf7;">TaskFlow Password Reset</h2>
      <p>Hello,</p>
      <p>You have requested to reset your password for TaskFlow.</p>
      <p>Your verification code is:</p>
      <div style="background-color: #f5f5f5; padding: 10px; border-radius: 5px; text-align: center; font-size: 24px; letter-spacing: 5px; font-weight: bold; margin: 20px 0;">
        ${resetCode}
      </div>
      <p>This code will expire in 15 minutes.</p>
      <p>If you didn't request a password reset, please ignore this email.</p>
      <p>Best regards,<br>The TaskFlow Team</p>
    </div>
  `;
  
  return sendEmail({ to, subject, text, html });
};

/**
 * Send an email verification code during registration
 * @param to Recipient email
 * @param name User's name
 * @param verificationCode The verification code
 * @returns Result of the email sending operation
 */
export const sendEmailVerificationCode = async (to: string, name: string, verificationCode: string) => {
  const subject = 'TaskFlow - Verify Your Email Address';
  
  const text = `
    Hello ${name},
    
    Welcome to TaskFlow! To complete your registration, please verify your email address.
    
    Your verification code is: ${verificationCode}
    
    This code will expire in 15 minutes.
    
    If you didn't create an account with TaskFlow, please ignore this email.
    
    Best regards,
    The TaskFlow Team
  `;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4a6cf7;">Welcome to TaskFlow!</h2>
      <p>Hello ${name},</p>
      <p>Thank you for creating an account with TaskFlow. To complete your registration, please verify your email address.</p>
      <p>Your verification code is:</p>
      <div style="background-color: #f5f5f5; padding: 10px; border-radius: 5px; text-align: center; font-size: 24px; letter-spacing: 5px; font-weight: bold; margin: 20px 0;">
        ${verificationCode}
      </div>
      <p>This code will expire in 15 minutes.</p>
      <p>If you didn't create an account with TaskFlow, please ignore this email.</p>
      <p>Best regards,<br>The TaskFlow Team</p>
    </div>
  `;
  
  return sendEmail({ to, subject, text, html });
};
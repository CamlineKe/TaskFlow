import nodemailer from 'nodemailer';
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
  info?: any; // Using any for simplicity, but can be more specific
  error?: string;
  previewUrl?: string;
}

/**
 * Configure nodemailer transporter
 * In production, you would use a real SMTP service
 * For development, we can use a test account or configure a real service
 */
const createTransporter = async () => {
  // Check if real SMTP credentials are configured
  if (config.email.host && config.email.user && config.email.pass && 
      config.email.host !== 'smtp.example.com' && config.email.user !== 'user@example.com') {
    // Try to use real SMTP credentials (Gmail or other service)
    console.log('Attempting to use configured SMTP service:', config.email.host);
    
    try {
      const transporter = nodemailer.createTransport({
        host: config.email.host,
        port: config.email.port,
        secure: config.email.secure,
        auth: {
          user: config.email.user,
          pass: config.email.pass,
        },
      });
      
      // Test the connection
      await transporter.verify();
      console.log('✅ SMTP connection verified successfully');
      return transporter;
    } catch (error: any) {
      console.error('❌ SMTP connection failed:', error.message);
      console.log('📧 Falling back to Ethereal test service');
      
      // Fall back to Ethereal if Gmail fails
      const testAccount = await nodemailer.createTestAccount();
      return nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    }
  } else {
    // Fall back to Ethereal test service for development
    console.log('📧 Using Ethereal test service (emails won\'t be delivered)');
    const testAccount = await nodemailer.createTestAccount();
    
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }
};

/**
 * Send an email
 * @param options Email options (to, subject, text, html)
 * @returns Info about the sent email or error
 */
export const sendEmail = async (options: SendEmailOptions): Promise<EmailResult> => {
  try {
    const transporter = await createTransporter();
    
    const info = await transporter.sendMail({
      from: `"TaskFlow" <${config.email.user}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });
    
    // Create result object
    const result: EmailResult = { success: true, info };
    
    // For development, add the preview URL
    if (process.env.NODE_ENV !== 'production') {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      console.log('Email preview URL: %s', previewUrl);
      if (previewUrl) {
        result.previewUrl = previewUrl;
      }
    }
    
    return result;
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
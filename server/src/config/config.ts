import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const config = {
  server: {
    port: process.env.PORT || 5000,
    nodeEnv: process.env.NODE_ENV || 'development',
  },
  database: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/taskflow',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'taskflow-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  email: {
    host: process.env.EMAIL_HOST || 'smtp.example.com',
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    user: process.env.EMAIL_USER || 'user@example.com',
    pass: process.env.EMAIL_PASSWORD || 'password',
  },
  resetToken: {
    expireTime: Number(process.env.RESET_TOKEN_EXPIRE) || 15 * 60 * 1000, // 15 minutes in milliseconds
  },
};

export default config;
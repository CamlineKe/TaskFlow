import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import apiRoutes from './api';

// Create the Express application instance
const app: Application = express();

// --- Global Middleware ---

// CORS that works for BOTH production and local development
const corsOptions = {
  origin: (origin: string | undefined, callback: Function) => {
    // Allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'https://taskflow-woad-phi.vercel.app', // Production frontend
      'http://localhost:3000', // Local frontend
      'http://localhost:3001'  // Alternative local
    ];
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      console.log('Blocked by CORS:', origin);
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Handle OPTIONS preflight explicitly
app.options('*', cors(corsOptions));

// Set various security-related HTTP headers
app.use(helmet());

// Enable the Express body parser for JSON
app.use(express.json());

// A simple route to verify that the server is running
app.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    message: 'Server is healthy and running!',
  });
});

// --- API Routes ---
app.use('/api', apiRoutes); // THE MASTER ROUTER

// Export the configured app instance
export default app;
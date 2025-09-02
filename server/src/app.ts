import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import apiRoutes from './api';

// Create the Express application instance
const app: Application = express();

// --- Global Middleware ---

// Enable CORS (Cross-Origin Resource Sharing)
app.use(cors());

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

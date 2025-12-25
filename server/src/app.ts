import express, { Application, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import apiRoutes from './api';

const app: Application = express();

// ========== 1. MANUAL CORS MIDDLEWARE (FIRST!) ==========
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`CORS: ${req.method} ${req.path} from ${req.headers.origin}`);
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', 'https://taskflow-woad-phi.vercel.app');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    console.log('CORS: Handling OPTIONS preflight');
    return res.status(200).end();
  }
  
  next();
});

// ========== 2. OTHER MIDDLEWARE ==========
app.use(helmet());
app.use(express.json());

// ========== 3. HEALTH CHECK ==========
app.get('/', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    message: 'Backend running with CORS',
    corsHeaders: {
      'allow-origin': 'https://taskflow-woad-phi.vercel.app'
    }
  });
});

// ========== 4. DEBUG ENDPOINT ==========
app.get('/api/debug-cors', (req: Request, res: Response) => {
  console.log('Debug CORS endpoint called');
  res.json({
    success: true,
    origin: req.headers.origin,
    method: req.method,
    headers: {
      'access-control-allow-origin': res.getHeader('Access-Control-Allow-Origin'),
      'access-control-allow-methods': res.getHeader('Access-Control-Allow-Methods')
    }
  });
});

// ========== 5. YOUR API ROUTES ==========
app.use('/api', apiRoutes);

export default app;
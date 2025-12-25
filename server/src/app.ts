import express, { Application, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import apiRoutes from './api';

const app: Application = express();

// ========== 1. MANUAL CORS MIDDLEWARE (FIRST!) ==========
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`🌐 CORS: ${req.method} ${req.path} from ${req.headers.origin}`);
  
  // Use res.header() instead of res.setHeader() for consistency
  res.header('Access-Control-Allow-Origin', 'https://taskflow-woad-phi.vercel.app');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    console.log('🌐 CORS: Handling OPTIONS preflight');
    return res.status(200).end();
  }
  
  next();
});

// ========== 2. OTHER MIDDLEWARE ==========
// Configure helmet to not interfere with CORS
app.use(helmet({
  crossOriginResourcePolicy: false,
  crossOriginEmbedderPolicy: false
}));

app.use(express.json());

// ========== 3. HEALTH CHECK ==========
app.get('/', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    message: 'Backend running with CORS',
    cors: 'enabled for https://taskflow-woad-phi.vercel.app',
    timestamp: new Date().toISOString()
  });
});

// ========== 4. DEBUG ENDPOINT ==========
app.get('/api/cors-test', (req: Request, res: Response) => {
  console.log('🔍 CORS test endpoint called');
  res.json({
    success: true,
    message: 'CORS is working!',
    origin: req.headers.origin,
    method: req.method,
    corsHeaders: {
      'allow-origin': res.getHeader('Access-Control-Allow-Origin'),
      'allow-methods': res.getHeader('Access-Control-Allow-Methods'),
      'allow-headers': res.getHeader('Access-Control-Allow-Headers')
    },
    timestamp: new Date().toISOString()
  });
});

// ========== 5. FALLBACK FOR LOCAL DEVELOPMENT ==========
// Only add localhost in development
if (process.env.NODE_ENV !== 'production') {
  app.use((req: Request, res: Response, next: NextFunction) => {
    const origin = req.headers.origin;
    if (origin && origin.includes('localhost')) {
      res.header('Access-Control-Allow-Origin', origin);
    }
    next();
  });
}

// ========== 6. YOUR API ROUTES ==========
app.use('/api', apiRoutes);

export default app;
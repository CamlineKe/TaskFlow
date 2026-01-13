import express, { Application, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import apiRoutes from './api';

const app: Application = express();

// ========== 1. CORS MIDDLEWARE (MUST BE FIRST) ==========
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`🌐 CORS: ${req.method} ${req.path} from ${req.headers.origin}`);
  
  // Determine allowed origin based on environment
  let allowedOrigin = 'https://taskflow-woad-phi.vercel.app';
  
  // In development, allow localhost origins
  if (process.env.NODE_ENV !== 'production') {
    allowedOrigin = req.headers.origin || 'http://localhost:3000';
  }
  
  // For production, check if the origin is allowed
  const origin = req.headers.origin;
  if (process.env.NODE_ENV === 'production') {
    const allowedOrigins = [
      'https://taskflow-woad-phi.vercel.app',
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002'
    ];
    
    if (origin && allowedOrigins.includes(origin)) {
      res.header('Access-Control-Allow-Origin', origin);
    } else {
      res.header('Access-Control-Allow-Origin', allowedOrigin);
    }
  } else {
    res.header('Access-Control-Allow-Origin', allowedOrigin);
  }
  
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // Handle preflight requests immediately
  if (req.method === 'OPTIONS') {
    console.log('🌐 CORS: Handling OPTIONS preflight');
    res.header('Access-Control-Max-Age', '86400'); // Cache preflight for 24 hours
    return res.status(200).end();
  }
  
  next();
});

// ========== 2. OTHER MIDDLEWARE ==========
// Configure helmet to not interfere with CORS
app.use(helmet({
  crossOriginResourcePolicy: false,
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
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



// ========== 5. YOUR API ROUTES ==========
app.use('/api', apiRoutes);

export default app;
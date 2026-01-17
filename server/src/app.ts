import express, { Application, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import apiRoutes from './api';

const app: Application = express();

// ========== 1. CORS MIDDLEWARE (MUST BE FIRST) ==========
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`🌐 CORS: ${req.method} ${req.path} from ${req.headers.origin}`);
  
  // List of allowed origins - USE YOUR ACTUAL DOMAINS
  const allowedOrigins = [
    'http://localhost:3000',  // Local development
    'http://localhost:3001',  // Alternative local port
    'https://taskflow-zeta-dusky.vercel.app',  // YOUR FRONTEND
    'https://task-flow-eight-xi.vercel.app',  // YOUR BACKEND (if needed)
  ];
  
  const origin = req.headers.origin;
  
  // Check if the request origin is in the allowed list
  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    console.log(`✅ Allowed origin: ${origin}`);
  } else if (process.env.NODE_ENV !== 'production') {
    // In development, allow any origin
    res.header('Access-Control-Allow-Origin', origin || '*');
    console.log(`⚠️ Development mode, allowing: ${origin || '*'}`);
  } else {
    // In production, default to your frontend
    res.header('Access-Control-Allow-Origin', 'https://taskflow-zeta-dusky.vercel.app');
    console.log(`🔒 Production, defaulting to frontend`);
  }
  
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-CSRF-Token');
  res.header('Access-Control-Expose-Headers', 'Content-Length, Content-Range');
  
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
      connectSrc: ["'self'", "https://taskflow-zeta-dusky.vercel.app", "https://task-flow-eight-xi.vercel.app", "http://localhost:3000"],
    },
  },
}));

app.use(express.json());

// ========== 3. HEALTH CHECK ==========
app.get('/', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    message: 'Backend running with CORS',
    cors: 'enabled',
    allowedOrigins: [
      'http://localhost:3000',
      'https://taskflow-zeta-dusky.vercel.app'
    ],
    backend: 'https://task-flow-eight-xi.vercel.app',
    timestamp: new Date().toISOString()
  });
});

// ========== 4. YOUR API ROUTES ==========
app.use('/api', apiRoutes);

export default app;
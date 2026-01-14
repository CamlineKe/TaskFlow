import express, { Application, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import apiRoutes from './api';

const app: Application = express();

// ========== 1. CORS MIDDLEWARE (MUST BE FIRST) ==========
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`🌐 CORS: ${req.method} ${req.path} from ${req.headers.origin}`);
  
  // Allow all origins by echoing back the requester origin.
  // If Origin is missing, fall back to '*'. This avoids CORS failures
  // when new frontend URLs are introduced.
  const origin = req.headers.origin;
  res.header('Access-Control-Allow-Origin', origin || '*');
  
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
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes.js';
import stockRoutes from './routes/stock.routes.js';
import documentRoutes from './routes/document.routes.js';
import leaveRoutes from './routes/leave.routes.js';
import meetingRoutes from './routes/meeting.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const SELF_URL = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;

// Allowed origins
const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.HR_FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:5174',
  'https://admin.millenium.co.ke',
  'https://hr.millenium.co.ke',
  'https://millenium.co.ke',
].filter(Boolean);

// Log allowed origins on startup
console.log('Allowed CORS origins:', allowedOrigins);

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, Postman, or same-origin)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list or matches patterns
    if (
      allowedOrigins.includes(origin) ||
      /^https:\/\/[a-z0-9-]+\.vercel\.app$/.test(origin) ||
      /^https?:\/\/([a-z0-9-]+\.)?millenium\.co\.ke$/.test(origin)
    ) {
      return callback(null, true);
    }
    
    // Log blocked origins for debugging
    console.warn(`CORS blocked origin: ${origin}`);
    callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 600 // Cache preflight for 10 minutes
}));
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - Origin: ${req.headers.origin || 'none'}`);
  next();
});

// Routes
app.use('/api', authRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api', documentRoutes);
app.use('/api', leaveRoutes);
app.use('/api', meetingRoutes);
app.use('/api', dashboardRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Millenium DAS Backend is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Debug endpoint to check CORS configuration
app.get('/api/debug/cors', (req, res) => {
  res.json({
    allowedOrigins,
    requestOrigin: req.headers.origin || 'no-origin',
    corsEnabled: true
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  
  // Handle CORS errors
  if (err.message.includes('CORS blocked')) {
    return res.status(403).json({ 
      error: 'CORS policy violation',
      message: err.message,
      origin: req.headers.origin
    });
  }
  
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`CORS enabled for: ${allowedOrigins.join(', ')}`);

  // Self-ping every 14 minutes to prevent Render free tier from sleeping
  if (process.env.NODE_ENV === 'production') {
    setInterval(async () => {
      try {
        await fetch(`${SELF_URL}/health`);
        console.log('[keep-alive] ping sent');
      } catch (e) {
        console.warn('[keep-alive] ping failed:', e.message);
      }
    }, 14 * 60 * 1000); // 14 minutes
  }
});


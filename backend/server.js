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
].filter(Boolean);

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (
      allowedOrigins.includes(origin) ||
      /^https:\/\/[a-z0-9-]+\.vercel\.app$/.test(origin) ||
      /^https?:\/\/([a-z0-9-]+\.)?millenium\.co\.ke$/.test(origin)
    ) {
      return callback(null, true);
    }
    callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api', authRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api', documentRoutes);
app.use('/api', leaveRoutes);
app.use('/api', meetingRoutes);
app.use('/api', dashboardRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Millenium DAS Backend is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);

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

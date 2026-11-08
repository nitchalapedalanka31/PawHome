import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/authRoutes';
import petRoutes from './routes/petRoutes';
import moodRoutes from './routes/moodRoutes';
import foodRoutes from './routes/foodRoutes';
import vetRoutes from './routes/vetRoutes';
import salonRoutes from './routes/salonRoutes';
import appointmentRoutes from './routes/appointmentRoutes';
import healthRoutes from './routes/healthRoutes';
import reminderRoutes from './routes/reminderRoutes';
import uploadRoutes from './routes/uploadRoutes';
import { errorHandler } from './middleware/errorHandler';

const app = express();

// Ensure upload directory exists
const uploadDir = path.resolve(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// CORS setup
app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);

// Body parsers with larger limit for base64 camera images
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Static uploads route
app.use('/uploads', express.static(uploadDir));

// Rate limiter for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 auth requests per window
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/pets', petRoutes);
app.use('/api/mood', moodRoutes);
app.use('/api/food', foodRoutes);
app.use('/api/vets', vetRoutes);
app.use('/api/salons', salonRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/upload', uploadRoutes);

// System Health Check
app.get('/api/health-check', (req, res) => {
  res.status(200).json({
    status: 'ok',
    app: 'PawHome API',
    team: 'Team Dorado',
    timestamp: new Date().toISOString(),
  });
});

// Centralized error handler
app.use(errorHandler);

export default app;

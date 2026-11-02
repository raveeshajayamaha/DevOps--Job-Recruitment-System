import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { fileURLToPath } from 'node:url';
import adminRoutes from './routes/admin.js';
import profileRoutes from './routes/profile.js';
import ActivityLog from './models/ActivityLog.js';
import Resume from './models/Resume.js';
import authRoutes from './routes/auth.js';
import jobRoutes from './routes/jobs.js';
import applicationRoutes from './routes/applications.js';
import interviewRoutes from './routes/interviews.js';
import Interview, { InterviewRound } from './models/Interview.js';
import Application from './models/Application.js';
import User from './models/User.js';
import { connectDB } from './config/db.js';

dotenv.config({ path: fileURLToPath(new URL('./.env', import.meta.url)), quiet: true });

const app = express();
app.disable('x-powered-by');
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json());

app.get('/', (req, res) => {
  res.send('JobRecruit Backend is Running');
});

app.get('/api/test', (req, res) => {
  const connected = mongoose.connection.readyState === 1;
  res.status(connected ? 200 : 503).json({
    success: connected,
    message: connected ? 'JobRecruit API is working' : 'MongoDB is unavailable',
    database: connected ? 'connected' : 'disconnected',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/interviews', interviewRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint not found' });
});

app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ success: false, message: 'Invalid JSON body' });
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ success: false, message: 'Request body is too large' });
  }
  if (err.status && [400, 401, 403, 404, 409].includes(err.status)) return res.status(err.status).json({ success: false, message: err.message });
  if (err.code === 11000) return res.status(409).json({ success: false, message: 'Record already exists' });
  if (['ValidationError', 'CastError'].includes(err.name)) return res.status(400).json({ success: false, message: 'Invalid request data' });
  console.error('Request failed:', err.name);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

async function startServer() {
  const port = Number(process.env.PORT || 5000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT must be an integer between 1 and 65535');
  }

  if (!process.env.JWT_SECRET || Buffer.byteLength(process.env.JWT_SECRET) < 32) throw new Error('JWT_SECRET must contain at least 32 bytes');
  await connectDB();
  await User.init();
  await ActivityLog.init();
  await Resume.init();
  await Application.init();
  await Interview.init();
  await InterviewRound.init();
  const server = app.listen(port, () => {
    console.info(`JobRecruit backend running at http://localhost:${port}`);
  });
  server.on('error', async (err) => {
    console.error('Server failed to start:', err.message);
    await mongoose.disconnect();
    process.exitCode = 1;
  });

  let stopping = false;
  const shutdown = () => {
    if (stopping) return;
    stopping = true;
    const timeout = setTimeout(() => process.exit(1), 10000);
    timeout.unref();
    server.close(async () => {
      await mongoose.disconnect();
      clearTimeout(timeout);
    });
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

startServer().catch(async (err) => {
  console.error('Backend startup failed:', err.message);
  await mongoose.disconnect();
  process.exitCode = 1;
});

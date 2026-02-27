import express from 'express';
import cors from 'cors';
import { getDb, closeDb } from './db/connection';
import roomsRouter from './routes/rooms';

const PORT = parseInt(process.env.PORT || '3001', 10);

const corsOrigins: (string | RegExp)[] = (process.env.CORS_ORIGIN || 'http://localhost:3000')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);
corsOrigins.push(/\.vercel\.app$/);

const app = express();
app.use(cors({ origin: corsOrigins, credentials: true }));
app.use(express.json());

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// REST routes
app.use('/api', roomsRouter);

// Initialize database on startup
getDb();

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n[Server] Shutting down...');
  closeDb();
  process.exit(0);
});

process.on('SIGTERM', () => {
  closeDb();
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`[Server] Landscape Game server running on port ${PORT}`);
});

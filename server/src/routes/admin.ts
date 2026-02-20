import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { createRoom, getSessionByCode } from '../game/RoomManager';

const router = Router();

// Set up multer for satellite image upload
const uploadsDir = path.join(__dirname, '..', '..', 'data', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.png';
    cb(null, `satellite-${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (jpg, png, webp) are allowed'));
    }
  },
});

/**
 * POST /api/rooms
 * Create a new game session.
 * Body: { name?, totalRounds?, canvasWidth?, canvasHeight? }
 * Returns: { session, adminToken, judgeToken }
 */
router.post('/rooms', (req, res) => {
  try {
    const { name = 'Landscape Game', totalRounds = 2, canvasWidth = 1200, canvasHeight = 800 } = req.body || {};
    const session = createRoom(name, totalRounds, canvasWidth, canvasHeight);
    res.json({
      session: {
        id: session.id,
        roomCode: session.roomCode,
        name: session.name,
        status: session.status,
        totalRounds: session.totalRounds,
        canvasWidth: session.canvasWidth,
        canvasHeight: session.canvasHeight,
      },
      adminToken: session.adminToken,
      judgeToken: session.judgeToken,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/upload
 * Upload a satellite/aerial image for a session.
 * Query: ?roomCode=XXXX&adminToken=YYYY
 * Body: multipart form with "image" field
 */
router.post('/upload', upload.single('image'), (req, res) => {
  try {
    const { roomCode, adminToken } = req.query as { roomCode?: string; adminToken?: string };
    if (!roomCode || !adminToken) {
      res.status(400).json({ error: 'roomCode and adminToken are required' });
      return;
    }

    const session = getSessionByCode(roomCode);
    if (!session) {
      res.status(404).json({ error: 'Room not found' });
      return;
    }
    if (session.adminToken !== adminToken) {
      res.status(403).json({ error: 'Invalid admin token' });
      return;
    }

    if (!req.file) {
      res.status(400).json({ error: 'No image file provided' });
      return;
    }

    const imagePath = `/uploads/${req.file.filename}`;

    // Update session with image path
    const { getDb } = require('../db/connection');
    getDb().prepare('UPDATE sessions SET satellite_image_path = ? WHERE id = ?').run(imagePath, session.id);

    res.json({ imagePath });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/rooms/:code
 * Get session info by room code.
 */
router.get('/rooms/:code', (req, res) => {
  try {
    const session = getSessionByCode(req.params.code);
    if (!session) {
      res.status(404).json({ error: 'Room not found' });
      return;
    }

    res.json({
      id: session.id,
      roomCode: session.roomCode,
      name: session.name,
      status: session.status,
      currentRound: session.currentRound,
      totalRounds: session.totalRounds,
      canvasWidth: session.canvasWidth,
      canvasHeight: session.canvasHeight,
      satelliteImagePath: session.satelliteImagePath,
      createdAt: session.createdAt,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

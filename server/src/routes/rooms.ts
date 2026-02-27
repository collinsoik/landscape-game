import { Router } from 'express';
import { getDb } from '../db/connection';
import { createRoom, getRoomByCode } from '../rooms';
import type { Submission, Vote } from '../types/models';

const router = Router();

/**
 * POST /api/rooms
 * Create a new room. Accepts optional { name } in body.
 * Returns { roomCode }.
 */
router.post('/rooms', (req, res) => {
  try {
    const { name } = req.body || {};
    const room = createRoom(name ?? '');
    res.json({ roomCode: room.room_code });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/rooms/:code
 * Get room info + submission count.
 */
router.get('/rooms/:code', (req, res) => {
  try {
    const room = getRoomByCode(req.params.code);
    if (!room) {
      res.status(404).json({ error: 'Room not found' });
      return;
    }

    const db = getDb();
    const row = db.prepare(
      'SELECT COUNT(*) as count FROM submissions WHERE room_code = ?'
    ).get(room.room_code) as { count: number };

    res.json({
      roomCode: room.room_code,
      name: room.name,
      status: room.status,
      createdAt: room.created_at,
      submissionCount: row.count,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/rooms/:code/submit
 * Submit a final design.
 * Body: { playerName, placements, stars }
 */
router.post('/rooms/:code/submit', (req, res) => {
  try {
    const room = getRoomByCode(req.params.code);
    if (!room) {
      res.status(404).json({ error: 'Room not found' });
      return;
    }

    const { playerName, placements, stars, landscapeId } = req.body || {};
    if (!playerName || placements === undefined || stars === undefined) {
      res.status(400).json({ error: 'playerName, placements, and stars are required' });
      return;
    }

    const db = getDb();
    const result = db.prepare(
      'INSERT INTO submissions (room_code, player_name, placements_json, stars_json, landscape_id) VALUES (?, ?, ?, ?, ?)'
    ).run(
      room.room_code,
      playerName,
      JSON.stringify(placements),
      JSON.stringify(stars),
      landscapeId || 'meadow',
    );

    res.json({ submissionId: result.lastInsertRowid });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/rooms/:code/submissions
 * Get all submissions for a room.
 */
router.get('/rooms/:code/submissions', (req, res) => {
  try {
    const room = getRoomByCode(req.params.code);
    if (!room) {
      res.status(404).json({ error: 'Room not found' });
      return;
    }

    const db = getDb();
    const rows = db.prepare(
      'SELECT * FROM submissions WHERE room_code = ? ORDER BY submitted_at ASC'
    ).all(room.room_code) as Submission[];

    const submissions = rows.map((row) => ({
      id: row.id,
      playerName: row.player_name,
      placements: JSON.parse(row.placements_json),
      stars: JSON.parse(row.stars_json),
      landscapeId: row.landscape_id || 'meadow',
      submittedAt: row.submitted_at,
    }));

    res.json({ submissions });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/rooms/:code/vote
 * Cast votes. Upserts by (room_code, voter_name).
 * Body: { voterName, mostBeautiful, mostEcoFriendly, mostCreative }
 * Values are submission IDs.
 */
router.post('/rooms/:code/vote', (req, res) => {
  try {
    const room = getRoomByCode(req.params.code);
    if (!room) {
      res.status(404).json({ error: 'Room not found' });
      return;
    }

    const { voterName, mostBeautiful, mostEcoFriendly, mostCreative } = req.body || {};
    if (!voterName) {
      res.status(400).json({ error: 'voterName is required' });
      return;
    }

    const db = getDb();
    db.prepare(`
      INSERT OR REPLACE INTO votes (room_code, voter_name, most_beautiful_id, most_eco_friendly_id, most_creative_id)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      room.room_code,
      voterName,
      mostBeautiful ?? null,
      mostEcoFriendly ?? null,
      mostCreative ?? null,
    );

    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/rooms/:code/results
 * Vote tallies per category with winners.
 */
router.get('/rooms/:code/results', (req, res) => {
  try {
    const room = getRoomByCode(req.params.code);
    if (!room) {
      res.status(404).json({ error: 'Room not found' });
      return;
    }

    const db = getDb();

    // Tally votes per category
    const categories = [
      { key: 'mostBeautiful', column: 'most_beautiful_id' },
      { key: 'mostEcoFriendly', column: 'most_eco_friendly_id' },
      { key: 'mostCreative', column: 'most_creative_id' },
    ] as const;

    const results: Record<string, { submissionId: number; playerName: string; votes: number }[]> = {};

    for (const cat of categories) {
      const rows = db.prepare(`
        SELECT v.${cat.column} as submission_id, s.player_name, COUNT(*) as vote_count
        FROM votes v
        JOIN submissions s ON s.id = v.${cat.column}
        WHERE v.room_code = ? AND v.${cat.column} IS NOT NULL
        GROUP BY v.${cat.column}
        ORDER BY vote_count DESC
      `).all(room.room_code) as { submission_id: number; player_name: string; vote_count: number }[];

      results[cat.key] = rows.map((r) => ({
        submissionId: r.submission_id,
        playerName: r.player_name,
        votes: r.vote_count,
      }));
    }

    res.json({ results });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

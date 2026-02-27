import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../db/connection';
import { getSessionByCode, getTeamsInSession, getPlacementsForTeam } from '../game/RoomManager';
import { getRound, completeRound } from '../game/RoundManager';
import { computeScore } from '../scoring/ScoringEngine';
import type { ZoneConfig, ScoreBreakdown } from '../types/models';

const router = Router();

/**
 * GET /api/rooms/:code/scores
 * Get auto-computed scores for all teams in the current (or specified) round.
 * Query: ?round=N (optional, defaults to current round)
 */
router.get('/rooms/:code/scores', (req, res) => {
  try {
    const session = getSessionByCode(req.params.code);
    if (!session) {
      res.status(404).json({ error: 'Room not found' });
      return;
    }

    const round = req.query.round ? parseInt(req.query.round as string, 10) : session.currentRound;
    if (round <= 0) {
      res.status(400).json({ error: 'No round in progress' });
      return;
    }

    const db = getDb();
    const teams = getTeamsInSession(session.id);
    const scores: Record<string, { teamName: string; autoScore: ScoreBreakdown }> = {};

    for (const team of teams) {
      const placements = getPlacementsForTeam(team.id, round);
      const zoneConfig: ZoneConfig = JSON.parse(team.zoneConfig);
      const breakdown = computeScore(placements, zoneConfig.zones);
      scores[team.id] = { teamName: team.name, autoScore: breakdown };
    }

    // Also include any existing judge scores
    const judgeRows = db.prepare(
      'SELECT * FROM judge_scores WHERE session_id = ? AND round = ?'
    ).all(session.id, round) as any[];

    const judgeScores: Record<string, any[]> = {};
    for (const row of judgeRows) {
      if (!judgeScores[row.team_id]) judgeScores[row.team_id] = [];
      judgeScores[row.team_id].push({
        judgeId: row.judge_id,
        biodiversity: row.biodiversity,
        sustainability: row.sustainability,
        aesthetics: row.aesthetics,
        ecosystemHealth: row.ecosystem_health,
        comment: row.comment,
        scoredAt: row.scored_at,
      });
    }

    res.json({ round, scores, judgeScores });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/rooms/:code/judge-scores
 * Submit judge scores for teams in a round.
 * Body: {
 *   judgeToken: string,
 *   round: number,
 *   scores: { teamId: string, biodiversity: number, sustainability: number, aesthetics: number, ecosystemHealth: number, comment: string }[]
 * }
 */
router.post('/rooms/:code/judge-scores', (req, res) => {
  try {
    const session = getSessionByCode(req.params.code);
    if (!session) {
      res.status(404).json({ error: 'Room not found' });
      return;
    }

    const { judgeToken, round, scores } = req.body || {};

    if (!judgeToken || session.judgeToken !== judgeToken) {
      res.status(403).json({ error: 'Invalid judge token' });
      return;
    }

    if (!round || !Array.isArray(scores)) {
      res.status(400).json({ error: 'round and scores array are required' });
      return;
    }

    const roundObj = getRound(session.id, round);
    if (!roundObj) {
      res.status(404).json({ error: `Round ${round} not found` });
      return;
    }

    const db = getDb();
    const judgeId = `judge-${Date.now()}`;

    const insertStmt = db.prepare(`
      INSERT INTO judge_scores (id, session_id, team_id, round, judge_id, biodiversity, sustainability, aesthetics, ecosystem_health, comment)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertMany = db.transaction((items: any[]) => {
      for (const item of items) {
        insertStmt.run(
          uuidv4(),
          session.id,
          item.teamId,
          round,
          judgeId,
          item.biodiversity || 0,
          item.sustainability || 0,
          item.aesthetics || 0,
          item.ecosystemHealth || 0,
          item.comment || ''
        );
      }
    });

    insertMany(scores);

    // Also persist auto scores at this point
    const teams = getTeamsInSession(session.id);
    const autoScoreStmt = db.prepare(`
      INSERT OR REPLACE INTO auto_scores (id, session_id, team_id, round, biodiversity, sustainability, aesthetics, ecosystem_health, total, breakdown)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const team of teams) {
      const placements = getPlacementsForTeam(team.id, round);
      const zoneConfig: ZoneConfig = JSON.parse(team.zoneConfig);
      const breakdown = computeScore(placements, zoneConfig.zones);

      autoScoreStmt.run(
        uuidv4(),
        session.id,
        team.id,
        round,
        breakdown.total.biodiversity,
        breakdown.total.sustainability,
        breakdown.total.aesthetics,
        breakdown.total.ecosystemHealth,
        breakdown.total.grand,
        JSON.stringify(breakdown)
      );
    }

    // If the round is in judging status, complete it
    if (roundObj.status === 'judging') {
      completeRound(session.id, round);
    }

    res.json({ success: true, judgeId });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

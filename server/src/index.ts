import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';

import type { ClientToServerEvents, ServerToClientEvents } from './types/events';
import { getDb, closeDb } from './db/connection';
import adminRouter from './routes/admin';
import judgeRouter from './routes/judge';
import {
  joinRoom,
  leaveRoom,
  getPlayer,
  getPlayersInSession,
  getSessionByCode,
  getSessionById,
  getRoomState,
  setPlayerConnected,
  getTeamWithPlayers,
  getPlacementsForTeam,
  getTeamsInSession,
} from './game/RoomManager';
import { assignTeams } from './game/TeamAssigner';
import { startRound, endRound, pauseRound, resumeRound, getTimeRemaining, getRound } from './game/RoundManager';
import { handlePlace, handleMove, handleRemove } from './game/StateSync';
import { handleRejoin } from './game/ReconnectionHandler';
import { computeScore } from './scoring/ScoringEngine';
import type { ZoneConfig, ScoreBreakdown } from './types/models';
import type { FinalScoreData } from './types/events';

const PORT = parseInt(process.env.PORT || '3001', 10);

const app = express();
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    /\.vercel\.app$/,
  ],
  credentials: true,
}));
app.use(express.json());

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '..', 'data', 'uploads')));

// REST routes
app.use('/api', adminRouter);
app.use('/api', judgeRouter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const httpServer = createServer(app);
const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: {
    origin: [
      'http://localhost:3000',
      'http://localhost:5173',
      /\.vercel\.app$/,
    ],
    credentials: true,
  },
});

// Initialize database on startup
getDb();

// Track socket <-> player mapping (bidirectional for O(1) lookups)
const socketPlayerMap = new Map<string, { playerId: string; sessionId: string }>();
const playerSocketMap = new Map<string, string>(); // playerId -> socketId

// --- Server-side rate limiter ---
// Tracks event timestamps per socket per event type. Sliding window approach.
const rateLimitBuckets = new Map<string, number[]>();

function checkRateLimit(socketId: string, eventType: string, maxEvents: number, windowMs: number): boolean {
  const key = `${socketId}:${eventType}`;
  const now = Date.now();
  let timestamps = rateLimitBuckets.get(key);
  if (!timestamps) {
    timestamps = [];
    rateLimitBuckets.set(key, timestamps);
  }
  // Evict expired entries
  while (timestamps.length > 0 && timestamps[0] <= now - windowMs) {
    timestamps.shift();
  }
  if (timestamps.length >= maxEvents) {
    return false; // Rate limit exceeded
  }
  timestamps.push(now);
  return true;
}

// Clean up stale rate limit entries periodically (every 30s)
setInterval(() => {
  const now = Date.now();
  for (const [key, timestamps] of rateLimitBuckets.entries()) {
    while (timestamps.length > 0 && timestamps[0] <= now - 10000) {
      timestamps.shift();
    }
    if (timestamps.length === 0) {
      rateLimitBuckets.delete(key);
    }
  }
}, 30000);

io.on('connection', (socket) => {
  console.log(`[Socket] Connected: ${socket.id}`);

  // --- Room events ---

  socket.on('room:join', (data, callback) => {
    const result = joinRoom(data.roomCode, data.playerName);
    if ('error' in result) {
      callback({ success: false, error: result.error });
      return;
    }

    const { player, session } = result;
    socketPlayerMap.set(socket.id, { playerId: player.id, sessionId: session.id });
    playerSocketMap.set(player.id, socket.id);

    socket.join(`session:${session.id}`);

    callback({ success: true, playerId: player.id, sessionId: session.id });

    // Broadcast to other players in the room
    socket.to(`session:${session.id}`).emit('room:player-joined', { player });

    // Send full room state to the joining player
    const state = getRoomState(session.id);
    if (state) {
      socket.emit('room:state', state);
    }
  });

  socket.on('room:rejoin', (data, callback) => {
    const playerInfo = { playerId: data.playerId, sessionId: '' };
    const player = getPlayer(data.playerId);
    if (player) {
      playerInfo.sessionId = player.sessionId;
      socketPlayerMap.set(socket.id, playerInfo);
      playerSocketMap.set(data.playerId, socket.id);
    }
    handleRejoin(socket, data.roomCode, data.playerId, callback);
  });

  socket.on('room:leave', () => {
    const info = socketPlayerMap.get(socket.id);
    if (!info) return;

    leaveRoom(info.playerId);
    socket.to(`session:${info.sessionId}`).emit('room:player-left', { playerId: info.playerId });
    socket.leave(`session:${info.sessionId}`);
    playerSocketMap.delete(info.playerId);
    socketPlayerMap.delete(socket.id);
  });

  // --- Element events (rate-limited) ---

  socket.on('element:place', (data) => {
    const info = socketPlayerMap.get(socket.id);
    if (!info) return;
    if (!checkRateLimit(socket.id, 'place', 10, 1000)) return; // max 10 placements/sec
    handlePlace(io, socket, info.playerId, info.sessionId, data);
  });

  socket.on('element:move', (data) => {
    const info = socketPlayerMap.get(socket.id);
    if (!info) return;
    if (!checkRateLimit(socket.id, 'move', 15, 1000)) return; // max 15 moves/sec
    handleMove(io, socket, info.playerId, info.sessionId, data);
  });

  socket.on('element:remove', (data) => {
    const info = socketPlayerMap.get(socket.id);
    if (!info) return;
    if (!checkRateLimit(socket.id, 'remove', 10, 1000)) return; // max 10 removes/sec
    handleRemove(io, socket, info.playerId, info.sessionId, data);
  });

  // --- Chat ---

  socket.on('chat:message', (data) => {
    const info = socketPlayerMap.get(socket.id);
    if (!info) return;

    // Validate chat message
    if (!data.text || typeof data.text !== 'string') return;
    const text = data.text.trim().slice(0, 500); // Cap at 500 chars
    if (text.length === 0) return;

    // Rate limit: max 5 messages per 3 seconds per socket
    if (!checkRateLimit(socket.id, 'chat', 5, 3000)) return;

    const player = getPlayer(info.playerId);
    if (!player) return;

    io.to(`session:${info.sessionId}`).emit('chat:message', {
      playerId: player.id,
      playerName: player.name,
      text,
      timestamp: new Date().toISOString(),
    });
  });

  // --- Admin events ---

  socket.on('admin:start-round', (data) => {
    const info = socketPlayerMap.get(socket.id);
    if (!info) return;

    const session = getSessionById(info.sessionId);
    if (!session || session.adminToken !== data.adminToken) {
      socket.emit('error', { message: 'Unauthorized', code: 'AUTH_FAILED' });
      return;
    }

    // If waiting, first assign teams and advance to round 1
    let nextRound = session.currentRound + 1;
    if (session.status === 'waiting') {
      // Determine team count: auto-assign based on player count
      const players = getPlayersInSession(session.id);
      const numTeams = Math.min(Math.max(1, Math.ceil(players.length / 4)), 8);
      const teams = assignTeams(session.id, numTeams);

      // Broadcast team assignments
      const teamsWithPlayers = getTeamWithPlayers(session.id);
      io.to(`session:${session.id}`).emit('room:teams-assigned', { teams: teamsWithPlayers });

      // Join team socket rooms — O(players) using reverse index instead of O(teams*players*sockets)
      for (const twp of teamsWithPlayers) {
        for (const p of twp.players) {
          const sid = playerSocketMap.get(p.id);
          if (sid) {
            const playerSocket = io.sockets.sockets.get(sid);
            if (playerSocket) {
              playerSocket.join(`team:${twp.team.id}`);
            }
          }
        }
      }

      nextRound = 1;
    }

    if (nextRound > session.totalRounds) {
      socket.emit('error', { message: 'All rounds completed' });
      return;
    }

    try {
      const round = startRound(
        session.id,
        nextRound,
        (remaining) => {
          io.to(`session:${session.id}`).emit('game:timer', { remaining });
        },
        () => {
          io.to(`session:${session.id}`).emit('game:round-end', { round: nextRound });
          broadcastFinalScores(session.id, nextRound);
        }
      );

      io.to(`session:${session.id}`).emit('game:round-start', {
        round: nextRound,
        duration: round.durationSeconds,
        areaLabel: round.areaLabel,
      });
    } catch (err: any) {
      socket.emit('error', { message: err.message });
    }
  });

  socket.on('admin:end-round', (data) => {
    const info = socketPlayerMap.get(socket.id);
    if (!info) return;

    const session = getSessionById(info.sessionId);
    if (!session || session.adminToken !== data.adminToken) {
      socket.emit('error', { message: 'Unauthorized', code: 'AUTH_FAILED' });
      return;
    }

    if (session.status !== 'playing') {
      socket.emit('error', { message: 'No active round to end' });
      return;
    }

    const ended = endRound(session.id, session.currentRound);
    if (!ended) {
      socket.emit('error', { message: 'Round already ended' });
      return;
    }
    io.to(`session:${session.id}`).emit('game:round-end', { round: session.currentRound });
    broadcastFinalScores(session.id, session.currentRound);
  });

  socket.on('admin:pause', (data) => {
    const info = socketPlayerMap.get(socket.id);
    if (!info) return;

    const session = getSessionById(info.sessionId);
    if (!session || session.adminToken !== data.adminToken) return;

    pauseRound(session.id);
    io.to(`session:${session.id}`).emit('game:pause');
  });

  socket.on('admin:resume', (data) => {
    const info = socketPlayerMap.get(socket.id);
    if (!info) return;

    const session = getSessionById(info.sessionId);
    if (!session || session.adminToken !== data.adminToken) return;

    const remaining = resumeRound(session.id);
    io.to(`session:${session.id}`).emit('game:resume', { remaining });
  });

  // --- Disconnect ---

  socket.on('disconnect', () => {
    console.log(`[Socket] Disconnected: ${socket.id}`);
    const info = socketPlayerMap.get(socket.id);
    if (!info) return;

    setPlayerConnected(info.playerId, false);
    socket.to(`session:${info.sessionId}`).emit('room:player-left', { playerId: info.playerId });
    playerSocketMap.delete(info.playerId);
    socketPlayerMap.delete(socket.id);
    // Clean up rate limit buckets for this socket
    for (const key of rateLimitBuckets.keys()) {
      if (key.startsWith(`${socket.id}:`)) {
        rateLimitBuckets.delete(key);
      }
    }
  });
});

/**
 * Compute and broadcast final scores for a round.
 */
function broadcastFinalScores(sessionId: string, round: number): void {
  const teams = getTeamsInSession(sessionId);
  const db = getDb();

  const rankings: FinalScoreData['rankings'] = [];

  for (const team of teams) {
    const placements = getPlacementsForTeam(team.id, round);
    const zoneConfig: ZoneConfig = JSON.parse(team.zoneConfig);
    const autoScore = computeScore(placements, zoneConfig.zones);

    // Load judge scores if any
    const judgeRows = db.prepare(
      'SELECT * FROM judge_scores WHERE session_id = ? AND team_id = ? AND round = ?'
    ).all(sessionId, team.id, round) as any[];

    let judgeScore: FinalScoreData['rankings'][0]['judgeScore'] | undefined;
    if (judgeRows.length > 0) {
      const avg = {
        biodiversity: 0, sustainability: 0, aesthetics: 0, ecosystemHealth: 0,
      };
      const comments: string[] = [];
      for (const jr of judgeRows) {
        avg.biodiversity += jr.biodiversity;
        avg.sustainability += jr.sustainability;
        avg.aesthetics += jr.aesthetics;
        avg.ecosystemHealth += jr.ecosystem_health;
        if (jr.comment) comments.push(jr.comment);
      }
      const n = judgeRows.length;
      judgeScore = {
        biodiversity: avg.biodiversity / n,
        sustainability: avg.sustainability / n,
        aesthetics: avg.aesthetics / n,
        ecosystemHealth: avg.ecosystemHealth / n,
        comments,
      };
    }

    const autoWeight = 0.6;
    const judgeWeight = 0.4;

    let finalScore = autoScore.total.grand;
    if (judgeScore) {
      const judgeTotal = judgeScore.biodiversity + judgeScore.sustainability + judgeScore.aesthetics + judgeScore.ecosystemHealth;
      finalScore = autoScore.total.grand * autoWeight + judgeTotal * judgeWeight;
    }

    rankings.push({
      teamId: team.id,
      teamName: team.name,
      autoScore,
      judgeScore,
      finalScore,
      rank: 0,
    });
  }

  // Sort by finalScore descending and assign ranks
  rankings.sort((a, b) => b.finalScore - a.finalScore);
  rankings.forEach((r, i) => { r.rank = i + 1; });

  io.to(`session:${sessionId}`).emit('score:final', { rankings });
}

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

httpServer.listen(PORT, () => {
  console.log(`[Server] Landscape Game server running on port ${PORT}`);
});

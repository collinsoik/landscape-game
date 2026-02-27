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
  updateTeamRound,
  getTeamStarsForRound,
  saveTeamStars,
  clearTeamPlacements,
} from './game/RoomManager';
import { assignTeams } from './game/TeamAssigner';
import { startRound, endRound, pauseRound, resumeRound, completeRound, getTimeRemaining, isTimerPaused, getRound } from './game/RoundManager';
import { handlePlace, handleMove, handleRemove } from './game/StateSync';
import { handleRejoin } from './game/ReconnectionHandler';
import { computeScore } from './scoring/ScoringEngine';
import { calculateStars, checkObjectives } from './scoring/StarCalculator';
import { initBudget, getRemaining, getTotal } from './game/BudgetManager';
import { initActions, getActionsRemaining, getActionLimit } from './game/ActionManager';
import { getScenario, getScenarioRound, campaignToScenario } from './config/scenarios';
import { getCampaign, getMissionFromCampaign, getTotalMissions } from './config/campaigns';
import { MissionEventManager } from './game/MissionEventManager';
import { getElement } from './scoring/ElementCatalog';
import type { ZoneConfig, ScoreBreakdown, Placement } from './types/models';
import type { FinalScoreData, RoundStartData } from './types/events';

const PORT = parseInt(process.env.PORT || '3001', 10);

const corsOrigins: (string | RegExp)[] = (process.env.CORS_ORIGIN || 'http://localhost:3000')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);
corsOrigins.push(/\.vercel\.app$/);

const app = express();
app.use(cors({
  origin: corsOrigins,
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
    origin: corsOrigins,
    credentials: true,
  },
});

// Initialize database on startup
getDb();

// Track socket <-> player mapping (bidirectional for O(1) lookups)
const socketPlayerMap = new Map<string, { playerId: string; sessionId: string }>();
const playerSocketMap = new Map<string, string>(); // playerId -> socketId

// Track active MissionEventManagers per session
const missionEventManagers = new Map<string, MissionEventManager>();

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

/**
 * Check if a scenarioId corresponds to a campaign.
 */
function isCampaignId(scenarioId: string): boolean {
  return !!getCampaign(scenarioId);
}

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
    console.log(`[Socket] Rejoin request: socket=${socket.id} player=${data.playerId} room=${data.roomCode}`);
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
    if (!info) {
      console.log(`[Admin] start-round rejected: socket ${socket.id} not in socketPlayerMap`);
      return;
    }

    const session = getSessionById(info.sessionId);
    if (!session || session.adminToken !== data.adminToken) {
      console.log(`[Admin] start-round auth failed: expected=${session?.adminToken}, got=${data.adminToken}`);
      socket.emit('error', { message: 'Unauthorized', code: 'AUTH_FAILED' });
      return;
    }
    console.log(`[Admin] start-round authorized for session ${session.id}, status=${session.status}`);

    // If waiting, first assign teams and advance to round 1
    const isFirstStart = session.status === 'waiting';
    let nextRound = session.currentRound + 1;
    if (isFirstStart) {
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

    // Check if this is a campaign-based session
    const useCampaign = session.scenarioId ? isCampaignId(session.scenarioId) : false;

    // Destroy any existing mission event manager for this session
    const existingManager = missionEventManagers.get(session.id);
    if (existingManager) {
      existingManager.destroy();
      missionEventManagers.delete(session.id);
    }

    // For campaigns, determine which teams advance vs retry
    const allTeams = getTeamsInSession(session.id);
    const advancingTeams: typeof allTeams = [];
    const retryingTeams: typeof allTeams = [];

    if (useCampaign && !isFirstStart) {
      for (const team of allTeams) {
        const previousRound = team.currentRound || (session.currentRound);
        const stars = getTeamStarsForRound(session.id, team.id, previousRound);
        if (stars !== null && stars === 0) {
          // Failed — retry same mission
          retryingTeams.push(team);
        } else {
          // Passed or no star data (non-mission round) — advance
          advancingTeams.push(team);
        }
      }
    } else {
      // All teams advance (first start or non-campaign)
      advancingTeams.push(...allTeams);
    }

    // Get mission config for advancing teams (the new round)
    const advancingMissionConfig = useCampaign && session.scenarioId
      ? getMissionFromCampaign(session.scenarioId, nextRound)
      : undefined;

    // Create MissionEventManager if the advancing mission has events
    let missionManager: MissionEventManager | undefined;
    if (advancingMissionConfig && advancingMissionConfig.midMissionEvents && advancingMissionConfig.midMissionEvents.length > 0) {
      missionManager = new MissionEventManager(io, session.id, nextRound, advancingMissionConfig);
      missionEventManagers.set(session.id, missionManager);
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

          // Clean up mission event manager
          const manager = missionEventManagers.get(session.id);
          if (manager) {
            manager.destroy();
            missionEventManagers.delete(session.id);
          }
        },
        isFirstStart,
        // Tick hook for mission events
        missionManager
          ? (remaining) => missionManager!.onTick(remaining)
          : undefined
      );

      const scenario = session.scenarioId ? getScenario(session.scenarioId) : undefined;
      const campaign = session.scenarioId ? getCampaign(session.scenarioId) : undefined;
      const scenarioRound = session.scenarioId
        ? getScenarioRound(session.scenarioId, nextRound)
        : undefined;

      // Helper to initialize a team for a mission round and build round-start data
      function startTeamMission(
        team: typeof allTeams[0],
        teamMissionRound: number,
        isRetry: boolean,
      ): { data: RoundStartData; prePlaced: Placement[] } {
        const teamMissionConfig = useCampaign && session!.scenarioId
          ? getMissionFromCampaign(session!.scenarioId!, teamMissionRound)
          : undefined;
        const teamScenarioRound = session!.scenarioId
          ? getScenarioRound(session!.scenarioId!, teamMissionRound)
          : undefined;

        const budgetAmount = teamMissionConfig?.budget ?? round.budget ?? (teamScenarioRound?.budget ?? 0);
        const refundRate = teamMissionConfig?.refundRate ?? teamScenarioRound?.refundRate ?? 1.0;
        const actionLimitAmount = teamMissionConfig?.actionLimit ?? teamScenarioRound?.actionLimit ?? 0;
        const startingPlacements = teamMissionConfig?.startingPlacements ?? teamScenarioRound?.startingPlacements ?? [];

        // For retries, clear previous placements for this team's round
        if (isRetry) {
          clearTeamPlacements(team.id, teamMissionRound);
        }

        // Init budget
        if (budgetAmount > 0) {
          initBudget(session!.id, team.id, teamMissionRound, budgetAmount, refundRate);
        }

        // Init actions
        if (actionLimitAmount > 0) {
          initActions(session!.id, team.id, teamMissionRound, actionLimitAmount);
        }

        // Update team's current round in DB
        updateTeamRound(team.id, teamMissionRound);

        // Insert pre-placed elements
        const prePlaced: Placement[] = [];
        if (startingPlacements.length > 0) {
          const db = getDb();
          const zoneConfig: ZoneConfig = JSON.parse(team.zoneConfig);
          for (const sp of startingPlacements) {
            const elDef = getElement(sp.elementType);
            if (!elDef) continue;

            const teamZone = zoneConfig.zones[0];
            const x = teamZone ? teamZone.x + sp.x * (teamZone.width / 1200) : sp.x;
            const y = teamZone ? teamZone.y + sp.y * (teamZone.height / 800) : sp.y;

            const placementId = require('uuid').v4();
            db.prepare(`
              INSERT INTO placements (id, session_id, team_id, player_id, round, element_type, x, y, width, height, zone_index, is_pre_placed)
              VALUES (?, ?, ?, '__scenario__', ?, ?, ?, ?, ?, ?, 0, 1)
            `).run(placementId, session!.id, team.id, teamMissionRound, sp.elementType, x, y, elDef.width, elDef.height);

            prePlaced.push({
              id: placementId,
              sessionId: session!.id,
              teamId: team.id,
              playerId: '__scenario__',
              round: teamMissionRound,
              elementType: sp.elementType,
              x, y,
              width: elDef.width,
              height: elDef.height,
              zoneIndex: 0,
              placedAt: new Date().toISOString(),
              isPrePlaced: true,
            });
          }
        }

        // Build round start data
        const roundStartData: RoundStartData = {
          round: teamMissionRound,
          duration: round.durationSeconds,
          areaLabel: teamMissionConfig?.title ?? round.areaLabel,
          paused: isFirstStart,
          budget: budgetAmount > 0 ? budgetAmount : undefined,
          actionLimit: actionLimitAmount > 0 ? actionLimitAmount : undefined,
          refundRate: refundRate < 1.0 ? refundRate : undefined,
          availableCategories: teamMissionConfig?.availableCategories ?? round.availableCategories ?? undefined,
          scenarioName: campaign?.name ?? scenario?.name,
          prePlacedElements: prePlaced.length > 0 ? prePlaced : undefined,
          retrying: isRetry,
          isBehind: teamMissionRound < nextRound,
        };

        if (teamMissionConfig) {
          roundStartData.missionType = teamMissionConfig.missionType;
          roundStartData.missionTitle = teamMissionConfig.title;
          roundStartData.missionNarrative = teamMissionConfig.narrative;
          roundStartData.objectives = teamMissionConfig.objectives;
          roundStartData.starThresholds = teamMissionConfig.starThresholds;
          roundStartData.missionEcoLesson = teamMissionConfig.ecoLesson;
          roundStartData.totalMissions = session!.scenarioId
            ? getTotalMissions(session!.scenarioId!)
            : undefined;
          roundStartData.goals = teamMissionConfig.objectives.map((obj) => ({
            text: obj.text,
            metric: obj.condition.type === 'min_score'
              ? {
                  category: (obj.condition as any).category ?? 'ecosystemHealth',
                  threshold: (obj.condition as any).threshold,
                }
              : undefined,
          }));
        } else if (teamScenarioRound) {
          roundStartData.goals = [teamScenarioRound.goal];
        }

        return { data: roundStartData, prePlaced };
      }

      // Start advancing teams on the new mission
      for (const team of advancingTeams) {
        const result = startTeamMission(team, nextRound, false);
        io.to(`team:${team.id}`).emit('game:round-start', result.data);
      }

      // Start retrying teams on their current mission
      for (const team of retryingTeams) {
        const teamMissionRound = team.currentRound || session.currentRound;
        const result = startTeamMission(team, teamMissionRound, true);
        io.to(`team:${team.id}`).emit('game:round-start', result.data);
      }
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

    // Clean up mission event manager
    const manager = missionEventManagers.get(session.id);
    if (manager) {
      manager.destroy();
      missionEventManagers.delete(session.id);
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

  socket.on('admin:finish-game', (data) => {
    const info = socketPlayerMap.get(socket.id);
    if (!info) return;

    const session = getSessionById(info.sessionId);
    if (!session || session.adminToken !== data.adminToken) {
      socket.emit('error', { message: 'Unauthorized', code: 'AUTH_FAILED' });
      return;
    }

    if (session.status !== 'judging') {
      socket.emit('error', { message: 'Can only finish game after judging' });
      return;
    }

    completeRound(session.id, session.currentRound);
    const finalData = broadcastFinalScores(session.id, session.currentRound);
    io.to(`session:${session.id}`).emit('game:finished', finalData);
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
 * Also computes star ratings for campaign missions.
 */
function broadcastFinalScores(sessionId: string, round: number): FinalScoreData {
  const session = getSessionById(sessionId);
  const teams = getTeamsInSession(sessionId);
  const db = getDb();

  const rankings: FinalScoreData['rankings'] = [];

  for (const team of teams) {
    // Use team's currentRound for mission config (supports retry)
    const teamRound = team.currentRound || round;
    const missionConfig = session?.scenarioId
      ? getMissionFromCampaign(session.scenarioId, teamRound)
      : undefined;

    const placements = getPlacementsForTeam(team.id, teamRound);
    const zoneConfig: ZoneConfig = JSON.parse(team.zoneConfig);
    const autoScore = computeScore(placements, zoneConfig.zones);

    // Load judge scores if any
    const judgeRows = db.prepare(
      'SELECT * FROM judge_scores WHERE session_id = ? AND team_id = ? AND round = ?'
    ).all(sessionId, team.id, teamRound) as any[];

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

    // Calculate and emit star ratings for campaign missions
    if (missionConfig) {
      const budgetRemaining = getRemaining(sessionId, team.id, teamRound);
      const totalBudget = getTotal(sessionId, team.id, teamRound);
      const starResult = calculateStars(
        autoScore,
        placements,
        missionConfig,
        budgetRemaining >= 0 ? budgetRemaining : missionConfig.budget,
        totalBudget >= 0 ? totalBudget : missionConfig.budget
      );

      // Persist stars in database
      saveTeamStars(sessionId, team.id, teamRound, starResult.stars);

      io.to(`team:${team.id}`).emit('mission:stars', {
        teamId: team.id,
        stars: starResult.stars,
        details: starResult.details,
      });

      // Also emit final objective status
      const objectives = checkObjectives(autoScore, placements, missionConfig);
      for (const obj of objectives) {
        if (obj.complete) {
          io.to(`team:${team.id}`).emit('mission:objective-complete', {
            teamId: team.id,
            objectiveId: obj.objectiveId,
          });
        }
      }
    }
  }

  // Sort by finalScore descending and assign ranks
  rankings.sort((a, b) => b.finalScore - a.finalScore);
  rankings.forEach((r, i) => { r.rank = i + 1; });

  const finalData: FinalScoreData = { rankings };
  io.to(`session:${sessionId}`).emit('score:final', finalData);
  return finalData;
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n[Server] Shutting down...');
  // Clean up all mission event managers
  for (const [, manager] of missionEventManagers) {
    manager.destroy();
  }
  missionEventManagers.clear();
  closeDb();
  process.exit(0);
});

process.on('SIGTERM', () => {
  for (const [, manager] of missionEventManagers) {
    manager.destroy();
  }
  missionEventManagers.clear();
  closeDb();
  process.exit(0);
});

httpServer.listen(PORT, () => {
  console.log(`[Server] Landscape Game server running on port ${PORT}`);
});

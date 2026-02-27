import { v4 as uuidv4 } from 'uuid';
import type { Server, Socket } from 'socket.io';
import { getDb } from '../db/connection';
import type { Placement, ZoneConfig } from '../types/models';
import type { ServerToClientEvents, ClientToServerEvents } from '../types/events';
import { getElement } from '../scoring/ElementCatalog';
import { getPlayer, getSessionById, getTeamById, getPlacementsForTeam } from './RoomManager';
import { isTimerPaused, getRound } from './RoundManager';
import { spendBudget, refundBudget, getRemaining, getTotal } from './BudgetManager';
import { useAction, getActionsRemaining, getActionLimit } from './ActionManager';
import { computeScore } from '../scoring/ScoringEngine';

type AppServer = Server<ClientToServerEvents, ServerToClientEvents>;

/**
 * Handle element:place event. Validates and persists the placement, then broadcasts.
 */
export function handlePlace(
  io: AppServer,
  socket: Socket<ClientToServerEvents, ServerToClientEvents>,
  playerId: string,
  sessionId: string,
  data: { elementType: string; x: number; y: number }
): void {
  const player = getPlayer(playerId);
  if (!player || !player.teamId) {
    socket.emit('element:rejected', { reason: 'Player not assigned to a team' });
    return;
  }

  const session = getSessionById(sessionId);
  if (!session || session.status !== 'playing') {
    socket.emit('element:rejected', { reason: 'Round is not active' });
    return;
  }

  if (isTimerPaused(sessionId)) {
    socket.emit('element:rejected', { reason: 'Timer has not started yet' });
    return;
  }

  // Use team's currentRound for placement tracking (supports mission retry)
  const team = getTeamById(player.teamId);
  const teamRound = team?.currentRound || session.currentRound;

  const elDef = getElement(data.elementType);
  if (!elDef) {
    socket.emit('element:rejected', { reason: `Unknown element type: ${data.elementType}` });
    return;
  }

  // Check action limit
  const actionsLeft = getActionsRemaining(sessionId, player.teamId, teamRound);
  if (actionsLeft === 0) {
    socket.emit('element:rejected', { reason: 'No actions remaining this round' });
    return;
  }

  // Check available categories for this round
  const round = getRound(sessionId, session.currentRound);
  if (round?.availableCategories && round.availableCategories.length > 0) {
    if (!round.availableCategories.includes(elDef.category)) {
      socket.emit('element:rejected', { reason: `${elDef.name} is not available this round` });
      return;
    }
  }

  // Check budget
  if (!spendBudget(sessionId, player.teamId, teamRound, elDef.cost)) {
    socket.emit('element:rejected', { reason: `Not enough coins (need ${elDef.cost})` });
    return;
  }

  // Validate placement within canvas bounds
  if (data.x < 0 || data.y < 0 || data.x + elDef.width > session.canvasWidth || data.y + elDef.height > session.canvasHeight) {
    // Refund since we already spent
    refundBudget(sessionId, player.teamId, teamRound, elDef.cost);
    socket.emit('element:rejected', { reason: 'Placement out of bounds' });
    return;
  }

  // Determine which zone the placement falls in
  const db = getDb();
  const teamRow = db.prepare('SELECT zone_config FROM teams WHERE id = ?').get(player.teamId) as any;
  if (!teamRow) {
    refundBudget(sessionId, player.teamId, session.currentRound, elDef.cost);
    socket.emit('element:rejected', { reason: 'Team not found' });
    return;
  }

  const zoneConfig: ZoneConfig = JSON.parse(teamRow.zone_config);
  const cx = data.x + elDef.width / 2;
  const cy = data.y + elDef.height / 2;
  const zone = zoneConfig.zones.find(
    (z) => cx >= z.x && cx <= z.x + z.width && cy >= z.y && cy <= z.y + z.height
  );

  // Allow placement anywhere on the team's canvas area; default to zone 0
  const zoneIndex = zone ? zone.index : 0;

  // Check maxCount per zone if element has it
  if (elDef.properties.maxCount !== undefined) {
    const countRow = db.prepare(
      'SELECT COUNT(*) as cnt FROM placements WHERE team_id = ? AND round = ? AND zone_index = ? AND element_type = ?'
    ).get(player.teamId, teamRound, zoneIndex, data.elementType) as any;
    if (countRow.cnt >= elDef.properties.maxCount) {
      refundBudget(sessionId, player.teamId, teamRound, elDef.cost);
      socket.emit('element:rejected', { reason: `Maximum ${elDef.properties.maxCount} ${elDef.name} per zone` });
      return;
    }
  }

  const placementId = uuidv4();
  db.prepare(`
    INSERT INTO placements (id, session_id, team_id, player_id, round, element_type, x, y, width, height, zone_index, is_pre_placed)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
  `).run(placementId, sessionId, player.teamId, playerId, teamRound, data.elementType, data.x, data.y, elDef.width, elDef.height, zoneIndex);

  const placement: Placement = {
    id: placementId,
    sessionId,
    teamId: player.teamId,
    playerId,
    round: teamRound,
    elementType: data.elementType,
    x: data.x,
    y: data.y,
    width: elDef.width,
    height: elDef.height,
    zoneIndex,
    placedAt: new Date().toISOString(),
    isPrePlaced: false,
  };

  // Consume action
  useAction(sessionId, player.teamId, teamRound);

  // Broadcast to the session room
  io.to(`session:${sessionId}`).emit('element:placed', { placement });

  // Broadcast budget update to team
  broadcastBudgetUpdate(io, sessionId, player.teamId, teamRound);

  // Broadcast action update to team
  broadcastActionUpdate(io, sessionId, player.teamId, teamRound);

  // Recompute and broadcast score update for this team
  debouncedBroadcastTeamScore(io, sessionId, player.teamId, teamRound);
}

/**
 * Handle element:move event.
 */
export function handleMove(
  io: AppServer,
  socket: Socket<ClientToServerEvents, ServerToClientEvents>,
  playerId: string,
  sessionId: string,
  data: { placementId: string; x: number; y: number }
): void {
  if (isTimerPaused(sessionId)) {
    socket.emit('element:rejected', { reason: 'Timer has not started yet' });
    return;
  }

  // Check action limit
  const player = getPlayer(playerId);
  if (!player || !player.teamId) {
    socket.emit('element:rejected', { reason: 'Player not assigned to a team' });
    return;
  }

  const session = getSessionById(sessionId);
  if (!session) return;

  const moveTeam = getTeamById(player.teamId);
  const moveTeamRound = moveTeam?.currentRound || session.currentRound;

  const moveActionsLeft = getActionsRemaining(sessionId, player.teamId, moveTeamRound);
  if (moveActionsLeft === 0) {
    socket.emit('element:rejected', { reason: 'No actions remaining this round' });
    return;
  }

  const db = getDb();
  const placement = db.prepare('SELECT * FROM placements WHERE id = ? AND session_id = ?').get(data.placementId, sessionId) as any;

  if (!placement) {
    socket.emit('element:rejected', { reason: 'Placement not found', placementId: data.placementId });
    return;
  }

  // Only the player who placed it or a teammate can move it
  if (player.teamId !== placement.team_id) {
    socket.emit('element:rejected', { reason: 'Cannot move another team\'s element', placementId: data.placementId });
    return;
  }

  // Pre-placed elements cannot be moved
  if (placement.is_pre_placed) {
    socket.emit('element:rejected', { reason: 'Cannot move a pre-placed element', placementId: data.placementId });
    return;
  }

  // Consume action
  useAction(sessionId, player.teamId, moveTeamRound);

  db.prepare('UPDATE placements SET x = ?, y = ? WHERE id = ?').run(data.x, data.y, data.placementId);

  io.to(`session:${sessionId}`).emit('element:moved', {
    placementId: data.placementId,
    x: data.x,
    y: data.y,
  });

  // Broadcast action update to team
  broadcastActionUpdate(io, sessionId, player.teamId, moveTeamRound);

  debouncedBroadcastTeamScore(io, sessionId, player.teamId, placement.round);
}

/**
 * Handle element:remove event.
 */
export function handleRemove(
  io: AppServer,
  socket: Socket<ClientToServerEvents, ServerToClientEvents>,
  playerId: string,
  sessionId: string,
  data: { placementId: string }
): void {
  if (isTimerPaused(sessionId)) {
    socket.emit('element:rejected', { reason: 'Timer has not started yet' });
    return;
  }

  const player = getPlayer(playerId);
  if (!player || !player.teamId) {
    socket.emit('element:rejected', { reason: 'Player not assigned to a team' });
    return;
  }

  const session = getSessionById(sessionId);
  if (!session) return;

  const removeTeam = getTeamById(player.teamId);
  const removeTeamRound = removeTeam?.currentRound || session.currentRound;

  // Check action limit
  const removeActionsLeft = getActionsRemaining(sessionId, player.teamId, removeTeamRound);
  if (removeActionsLeft === 0) {
    socket.emit('element:rejected', { reason: 'No actions remaining this round' });
    return;
  }

  const db = getDb();
  const placement = db.prepare('SELECT * FROM placements WHERE id = ? AND session_id = ?').get(data.placementId, sessionId) as any;

  if (!placement) {
    socket.emit('element:rejected', { reason: 'Placement not found', placementId: data.placementId });
    return;
  }

  if (player.teamId !== placement.team_id) {
    socket.emit('element:rejected', { reason: 'Cannot remove another team\'s element', placementId: data.placementId });
    return;
  }

  if (placement.is_pre_placed) {
    // Removing a pre-placed element costs 1 coin
    if (!spendBudget(sessionId, player.teamId, removeTeamRound, 1)) {
      socket.emit('element:rejected', { reason: 'Not enough coins to remove this element (costs 1 coin)' });
      return;
    }
  } else {
    // Removing a player-placed element refunds partial cost based on refundRate
    const elDef = getElement(placement.element_type);
    if (elDef) {
      refundBudget(sessionId, player.teamId, removeTeamRound, elDef.cost);
    }
  }

  // Consume action
  useAction(sessionId, player.teamId, removeTeamRound);

  db.prepare('DELETE FROM placements WHERE id = ?').run(data.placementId);

  io.to(`session:${sessionId}`).emit('element:removed', { placementId: data.placementId });

  // Broadcast budget update to team
  broadcastBudgetUpdate(io, sessionId, player.teamId, removeTeamRound);

  // Broadcast action update to team
  broadcastActionUpdate(io, sessionId, player.teamId, removeTeamRound);

  debouncedBroadcastTeamScore(io, sessionId, player.teamId, placement.round);
}

/**
 * Broadcast budget:update to a team.
 */
function broadcastBudgetUpdate(io: AppServer, sessionId: string, teamId: string, round: number): void {
  const remaining = getRemaining(sessionId, teamId, round);
  const total = getTotal(sessionId, teamId, round);
  if (remaining >= 0) {
    io.to(`team:${teamId}`).emit('budget:update', { teamId, remaining, total });
  }
}

/**
 * Broadcast actions:update to a team.
 */
function broadcastActionUpdate(io: AppServer, sessionId: string, teamId: string, round: number): void {
  const remaining = getActionsRemaining(sessionId, teamId, round);
  const limit = getActionLimit(sessionId, teamId, round);
  if (remaining >= 0) {
    io.to(`team:${teamId}`).emit('actions:update', { teamId, remaining, limit });
  }
}

/**
 * Debounced score recomputation per team.
 * With 60 users rapidly placing/moving elements, we avoid recomputing O(n^2) scoring
 * on every single event. Instead, we batch within a 300ms window per team.
 */
const scoreDebounceTimers = new Map<string, ReturnType<typeof setTimeout>>();

function debouncedBroadcastTeamScore(io: AppServer, sessionId: string, teamId: string, round: number): void {
  const key = `${sessionId}:${teamId}`;
  const existing = scoreDebounceTimers.get(key);
  if (existing) clearTimeout(existing);

  scoreDebounceTimers.set(key, setTimeout(() => {
    scoreDebounceTimers.delete(key);
    const placements = getPlacementsForTeam(teamId, round);
    const db = getDb();
    const teamRow = db.prepare('SELECT zone_config FROM teams WHERE id = ?').get(teamId) as any;
    const zoneConfig: ZoneConfig = teamRow ? JSON.parse(teamRow.zone_config) : { cols: 1, rows: 1, zones: [] };
    const scores = computeScore(placements, zoneConfig.zones);

    // Send to team room (only team members need live score updates)
    io.to(`team:${teamId}`).emit('score:update', { teamId, scores });
  }, 300));
}

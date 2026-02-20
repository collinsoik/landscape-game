import { v4 as uuidv4 } from 'uuid';
import type { Server, Socket } from 'socket.io';
import { getDb } from '../db/connection';
import type { Placement, ZoneConfig } from '../types/models';
import type { ServerToClientEvents, ClientToServerEvents } from '../types/events';
import { getElement } from '../scoring/ElementCatalog';
import { getPlayer, getSessionById, getPlacementsForTeam } from './RoomManager';
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

  const elDef = getElement(data.elementType);
  if (!elDef) {
    socket.emit('element:rejected', { reason: `Unknown element type: ${data.elementType}` });
    return;
  }

  // Validate placement within canvas bounds
  if (data.x < 0 || data.y < 0 || data.x + elDef.width > session.canvasWidth || data.y + elDef.height > session.canvasHeight) {
    socket.emit('element:rejected', { reason: 'Placement out of bounds' });
    return;
  }

  // Determine which zone the placement falls in
  const db = getDb();
  const teamRow = db.prepare('SELECT zone_config FROM teams WHERE id = ?').get(player.teamId) as any;
  if (!teamRow) {
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
    ).get(player.teamId, session.currentRound, zoneIndex, data.elementType) as any;
    if (countRow.cnt >= elDef.properties.maxCount) {
      socket.emit('element:rejected', { reason: `Maximum ${elDef.properties.maxCount} ${elDef.name} per zone` });
      return;
    }
  }

  const placementId = uuidv4();
  db.prepare(`
    INSERT INTO placements (id, session_id, team_id, player_id, round, element_type, x, y, width, height, zone_index)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(placementId, sessionId, player.teamId, playerId, session.currentRound, data.elementType, data.x, data.y, elDef.width, elDef.height, zoneIndex);

  const placement: Placement = {
    id: placementId,
    sessionId,
    teamId: player.teamId,
    playerId,
    round: session.currentRound,
    elementType: data.elementType,
    x: data.x,
    y: data.y,
    width: elDef.width,
    height: elDef.height,
    zoneIndex,
    placedAt: new Date().toISOString(),
  };

  // Broadcast to the session room
  io.to(`session:${sessionId}`).emit('element:placed', { placement });

  // Recompute and broadcast score update for this team
  broadcastTeamScore(io, sessionId, player.teamId, session.currentRound);
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
  const db = getDb();
  const placement = db.prepare('SELECT * FROM placements WHERE id = ? AND session_id = ?').get(data.placementId, sessionId) as any;

  if (!placement) {
    socket.emit('element:rejected', { reason: 'Placement not found', placementId: data.placementId });
    return;
  }

  // Only the player who placed it or a teammate can move it
  const player = getPlayer(playerId);
  if (!player || player.teamId !== placement.team_id) {
    socket.emit('element:rejected', { reason: 'Cannot move another team\'s element', placementId: data.placementId });
    return;
  }

  db.prepare('UPDATE placements SET x = ?, y = ? WHERE id = ?').run(data.x, data.y, data.placementId);

  io.to(`session:${sessionId}`).emit('element:moved', {
    placementId: data.placementId,
    x: data.x,
    y: data.y,
  });

  broadcastTeamScore(io, sessionId, player.teamId!, placement.round);
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
  const db = getDb();
  const placement = db.prepare('SELECT * FROM placements WHERE id = ? AND session_id = ?').get(data.placementId, sessionId) as any;

  if (!placement) {
    socket.emit('element:rejected', { reason: 'Placement not found', placementId: data.placementId });
    return;
  }

  const player = getPlayer(playerId);
  if (!player || player.teamId !== placement.team_id) {
    socket.emit('element:rejected', { reason: 'Cannot remove another team\'s element', placementId: data.placementId });
    return;
  }

  db.prepare('DELETE FROM placements WHERE id = ?').run(data.placementId);

  io.to(`session:${sessionId}`).emit('element:removed', { placementId: data.placementId });

  broadcastTeamScore(io, sessionId, player.teamId!, placement.round);
}

/**
 * Recompute and broadcast the score for a team.
 */
function broadcastTeamScore(io: AppServer, sessionId: string, teamId: string, round: number): void {
  const placements = getPlacementsForTeam(teamId, round);
  const db = getDb();
  const teamRow = db.prepare('SELECT zone_config FROM teams WHERE id = ?').get(teamId) as any;
  const zoneConfig: ZoneConfig = teamRow ? JSON.parse(teamRow.zone_config) : { cols: 1, rows: 1, zones: [] };
  const scores = computeScore(placements, zoneConfig.zones);

  io.to(`session:${sessionId}`).emit('score:update', { teamId, scores });
}

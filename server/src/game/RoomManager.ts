import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../db/connection';
import type { Session, Player, Team, Placement, ZoneConfig } from '../types/models';
import type { RoomStateData, TeamWithPlayers } from '../types/events';

function generateRoomCode(length: number): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no I,O,0,1 to avoid confusion
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export function createRoom(name: string, totalRounds: number, canvasWidth: number, canvasHeight: number): Session {
  const db = getDb();
  const id = uuidv4();
  let roomCode: string;

  // Ensure unique room code
  const checkStmt = db.prepare('SELECT 1 FROM sessions WHERE room_code = ?');
  do {
    roomCode = generateRoomCode(6);
  } while (checkStmt.get(roomCode));

  const adminToken = uuidv4();
  const judgeToken = uuidv4();

  db.prepare(`
    INSERT INTO sessions (id, room_code, name, status, current_round, total_rounds, admin_token, judge_token, canvas_width, canvas_height)
    VALUES (?, ?, ?, 'waiting', 0, ?, ?, ?, ?, ?)
  `).run(id, roomCode, name, totalRounds, adminToken, judgeToken, canvasWidth, canvasHeight);

  // Pre-create round entries
  for (let r = 1; r <= totalRounds; r++) {
    db.prepare(`
      INSERT INTO rounds (id, session_id, round_number, status, duration_seconds, area_label)
      VALUES (?, ?, ?, 'pending', 600, ?)
    `).run(uuidv4(), id, r, `Round ${r}`);
  }

  return getSessionById(id)!;
}

export function getSessionByCode(roomCode: string): Session | undefined {
  const db = getDb();
  const row = db.prepare('SELECT * FROM sessions WHERE room_code = ?').get(roomCode) as any;
  return row ? mapSession(row) : undefined;
}

export function getSessionById(id: string): Session | undefined {
  const db = getDb();
  const row = db.prepare('SELECT * FROM sessions WHERE id = ?').get(id) as any;
  return row ? mapSession(row) : undefined;
}

export function updateSession(id: string, updates: Partial<Pick<Session, 'status' | 'currentRound' | 'satelliteImagePath'>>): void {
  const db = getDb();
  const sets: string[] = [];
  const vals: any[] = [];

  if (updates.status !== undefined) { sets.push('status = ?'); vals.push(updates.status); }
  if (updates.currentRound !== undefined) { sets.push('current_round = ?'); vals.push(updates.currentRound); }
  if (updates.satelliteImagePath !== undefined) { sets.push('satellite_image_path = ?'); vals.push(updates.satelliteImagePath); }

  if (sets.length === 0) return;
  vals.push(id);
  db.prepare(`UPDATE sessions SET ${sets.join(', ')} WHERE id = ?`).run(...vals);
}

export function joinRoom(roomCode: string, playerName: string): { player: Player; session: Session } | { error: string } {
  const session = getSessionByCode(roomCode);
  if (!session) return { error: 'Room not found' };
  if (session.status !== 'waiting') return { error: 'Game already in progress' };

  const db = getDb();
  const existingCount = db.prepare('SELECT COUNT(*) as cnt FROM players WHERE session_id = ?').get(session.id) as any;
  if (existingCount.cnt >= 32) return { error: 'Room is full' };

  const id = uuidv4();
  db.prepare(`
    INSERT INTO players (id, session_id, name, connected, last_seen)
    VALUES (?, ?, ?, 1, datetime('now'))
  `).run(id, session.id, playerName);

  const player = getPlayer(id)!;
  return { player, session };
}

export function leaveRoom(playerId: string): void {
  const db = getDb();
  db.prepare('UPDATE players SET connected = 0 WHERE id = ?').run(playerId);
}

export function getPlayer(id: string): Player | undefined {
  const db = getDb();
  const row = db.prepare('SELECT * FROM players WHERE id = ?').get(id) as any;
  return row ? mapPlayer(row) : undefined;
}

export function getPlayersInSession(sessionId: string): Player[] {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM players WHERE session_id = ?').all(sessionId) as any[];
  return rows.map(mapPlayer);
}

export function getTeamsInSession(sessionId: string): Team[] {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM teams WHERE session_id = ?').all(sessionId) as any[];
  return rows.map(mapTeam);
}

export function getTeamWithPlayers(sessionId: string): TeamWithPlayers[] {
  const teams = getTeamsInSession(sessionId);
  const players = getPlayersInSession(sessionId);

  return teams.map((team) => ({
    team,
    players: players.filter((p) => p.teamId === team.id),
    zoneConfig: JSON.parse(team.zoneConfig) as ZoneConfig,
  }));
}

export function getPlacementsForSession(sessionId: string, round?: number): Placement[] {
  const db = getDb();
  let rows: any[];
  if (round !== undefined) {
    rows = db.prepare('SELECT * FROM placements WHERE session_id = ? AND round = ?').all(sessionId, round) as any[];
  } else {
    rows = db.prepare('SELECT * FROM placements WHERE session_id = ?').all(sessionId) as any[];
  }
  return rows.map(mapPlacement);
}

export function getPlacementsForTeam(teamId: string, round: number): Placement[] {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM placements WHERE team_id = ? AND round = ?').all(teamId, round) as any[];
  return rows.map(mapPlacement);
}

export function getRoomState(sessionId: string): RoomStateData | undefined {
  const session = getSessionById(sessionId);
  if (!session) return undefined;

  const players = getPlayersInSession(sessionId);
  const teams = getTeamWithPlayers(sessionId);
  const placements = getPlacementsForSession(sessionId, session.currentRound > 0 ? session.currentRound : undefined);

  return {
    session: {
      id: session.id,
      roomCode: session.roomCode,
      name: session.name,
      status: session.status,
      currentRound: session.currentRound,
      totalRounds: session.totalRounds,
      canvasWidth: session.canvasWidth,
      canvasHeight: session.canvasHeight,
      satelliteImagePath: session.satelliteImagePath,
    },
    players,
    teams,
    placements,
    scores: {},
  };
}

export function setPlayerConnected(playerId: string, connected: boolean): void {
  const db = getDb();
  db.prepare('UPDATE players SET connected = ?, last_seen = datetime(\'now\') WHERE id = ?').run(connected ? 1 : 0, playerId);
}

// Row mappers
function mapSession(row: any): Session {
  return {
    id: row.id,
    roomCode: row.room_code,
    name: row.name,
    status: row.status,
    satelliteImagePath: row.satellite_image_path,
    currentRound: row.current_round,
    totalRounds: row.total_rounds,
    adminToken: row.admin_token,
    judgeToken: row.judge_token,
    canvasWidth: row.canvas_width,
    canvasHeight: row.canvas_height,
    createdAt: row.created_at,
  };
}

function mapPlayer(row: any): Player {
  return {
    id: row.id,
    sessionId: row.session_id,
    name: row.name,
    teamId: row.team_id,
    zoneIndex: row.zone_index,
    connected: !!row.connected,
    lastSeen: row.last_seen,
  };
}

function mapTeam(row: any): Team {
  return {
    id: row.id,
    sessionId: row.session_id,
    name: row.name,
    color: row.color,
    zoneConfig: row.zone_config,
  };
}

function mapPlacement(row: any): Placement {
  return {
    id: row.id,
    sessionId: row.session_id,
    teamId: row.team_id,
    playerId: row.player_id,
    round: row.round,
    elementType: row.element_type,
    x: row.x,
    y: row.y,
    width: row.width,
    height: row.height,
    zoneIndex: row.zone_index,
    placedAt: row.placed_at,
  };
}

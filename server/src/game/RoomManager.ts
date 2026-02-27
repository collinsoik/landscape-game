import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../db/connection';
import type { Session, Player, Team, Placement, ZoneConfig } from '../types/models';
import type { RoomStateData, TeamWithPlayers } from '../types/events';
import { getTimeRemaining, isTimerPaused, getRound } from './RoundManager';
import { getRemaining, getTotal } from './BudgetManager';
import { getActionsRemaining, getActionLimit } from './ActionManager';
import { getScenario, getScenarioRound, campaignToScenario } from '../config/scenarios';
import { getCampaign, getMissionFromCampaign, getTotalMissions } from '../config/campaigns';

function generateRoomCode(length: number): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no I,O,0,1 to avoid confusion
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export function createRoom(name: string, totalRounds: number, canvasWidth: number, canvasHeight: number, scenarioId?: string): Session {
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

  // If a scenario or campaign is selected, use its settings
  const campaign = scenarioId ? getCampaign(scenarioId) : undefined;
  const scenario = campaign
    ? campaignToScenario(campaign)
    : scenarioId ? getScenario(scenarioId) : undefined;
  const effectiveRounds = scenario ? scenario.totalRounds : totalRounds;
  const effectiveScenarioId = campaign ? campaign.id : (scenario ? scenario.id : null);

  db.prepare(`
    INSERT INTO sessions (id, room_code, name, status, current_round, total_rounds, admin_token, judge_token, canvas_width, canvas_height, scenario_id)
    VALUES (?, ?, ?, 'waiting', 0, ?, ?, ?, ?, ?, ?)
  `).run(id, roomCode, name, effectiveRounds, adminToken, judgeToken, canvasWidth, canvasHeight, effectiveScenarioId);

  // Pre-create round entries with scenario config
  for (let r = 1; r <= effectiveRounds; r++) {
    const scenarioRound = scenario ? scenario.rounds[r - 1] : undefined;
    const duration = scenarioRound ? scenarioRound.durationSeconds : 600;
    const label = scenarioRound ? scenarioRound.label : `Round ${r}`;
    const budget = scenarioRound ? scenarioRound.budget : null;
    const categories = scenarioRound ? JSON.stringify(scenarioRound.availableCategories) : null;

    db.prepare(`
      INSERT INTO rounds (id, session_id, round_number, status, duration_seconds, area_label, budget, available_categories)
      VALUES (?, ?, ?, 'pending', ?, ?, ?, ?)
    `).run(uuidv4(), id, r, duration, label, budget, categories);
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

export function updateSession(id: string, updates: Partial<Pick<Session, 'status' | 'currentRound' | 'satelliteImagePath' | 'scenarioId'>>): void {
  const db = getDb();
  const sets: string[] = [];
  const vals: any[] = [];

  if (updates.status !== undefined) { sets.push('status = ?'); vals.push(updates.status); }
  if (updates.currentRound !== undefined) { sets.push('current_round = ?'); vals.push(updates.currentRound); }
  if (updates.satelliteImagePath !== undefined) { sets.push('satellite_image_path = ?'); vals.push(updates.satelliteImagePath); }
  if (updates.scenarioId !== undefined) { sets.push('scenario_id = ?'); vals.push(updates.scenarioId); }

  if (sets.length === 0) return;
  vals.push(id);
  db.prepare(`UPDATE sessions SET ${sets.join(', ')} WHERE id = ?`).run(...vals);
}

export function joinRoom(roomCode: string, playerName: string): { player: Player; session: Session } | { error: string } {
  const session = getSessionByCode(roomCode);
  if (!session) return { error: 'Room not found' };
  if (session.status !== 'waiting' && session.status !== 'playing' && playerName !== '__admin__') return { error: 'Game already in progress' };

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

export function getTeamById(teamId: string): Team | undefined {
  const db = getDb();
  const row = db.prepare('SELECT * FROM teams WHERE id = ?').get(teamId) as any;
  return row ? mapTeam(row) : undefined;
}

export function getTeamsInSession(sessionId: string): Team[] {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM teams WHERE session_id = ?').all(sessionId) as any[];
  return rows.map(mapTeam);
}

export function getTeamWithPlayers(sessionId: string): TeamWithPlayers[] {
  const teams = getTeamsInSession(sessionId);
  const players = getPlayersInSession(sessionId);
  const session = getSessionById(sessionId);
  const sessionRound = session?.currentRound ?? 0;

  return teams.map((team) => ({
    team,
    players: players.filter((p) => p.teamId === team.id),
    zoneConfig: JSON.parse(team.zoneConfig) as ZoneConfig,
    isBehind: team.currentRound > 0 && team.currentRound < sessionRound,
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

  // Collect placements per team's currentRound (supports retry where teams may be on different rounds)
  let placements: Placement[];
  if (session.currentRound > 0) {
    const allTeams = getTeamsInSession(sessionId);
    const teamRounds = new Set(allTeams.map((t) => t.currentRound || session.currentRound));
    if (teamRounds.size === 1) {
      // All teams on same round — simple query
      placements = getPlacementsForSession(sessionId, session.currentRound);
    } else {
      // Teams on different rounds — collect per team
      placements = [];
      for (const team of allTeams) {
        const teamRound = team.currentRound || session.currentRound;
        placements.push(...getPlacementsForTeam(team.id, teamRound));
      }
    }
  } else {
    placements = getPlacementsForSession(sessionId);
  }

  const state: RoomStateData = {
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
      scenarioId: session.scenarioId,
    },
    players,
    teams,
    placements,
    scores: {},
  };

  if (session.status === 'playing') {
    state.roundTimeRemaining = getTimeRemaining(sessionId);
    state.paused = isTimerPaused(sessionId);

    // Include budget state for the current round (use first team as reference, each team gets same budget)
    if (teams.length > 0) {
      const teamId = teams[0].team.id;
      const remaining = getRemaining(sessionId, teamId, session.currentRound);
      const total = getTotal(sessionId, teamId, session.currentRound);
      if (remaining >= 0) {
        state.budget = { remaining, total };
      }

      // Include action state
      const actionsRemaining = getActionsRemaining(sessionId, teamId, session.currentRound);
      const actionLimit = getActionLimit(sessionId, teamId, session.currentRound);
      if (actionsRemaining >= 0) {
        state.actions = { remaining: actionsRemaining, limit: actionLimit };
      }
    }

    // Include refund rate from mission or scenario config
    if (session.scenarioId) {
      const missionConfig = getMissionFromCampaign(session.scenarioId, session.currentRound);
      if (missionConfig && missionConfig.refundRate < 1.0) {
        state.refundRate = missionConfig.refundRate;
      } else {
        const scenarioRound = getScenarioRound(session.scenarioId, session.currentRound);
        if (scenarioRound && scenarioRound.refundRate < 1.0) {
          state.refundRate = scenarioRound.refundRate;
        }
      }
    }

    // Include available categories and goals from round/scenario
    const round = getRound(sessionId, session.currentRound);
    if (round?.availableCategories) {
      state.availableCategories = round.availableCategories;
    }

    // Include goals from mission config or scenario
    if (session.scenarioId) {
      const missionConfig = getMissionFromCampaign(session.scenarioId, session.currentRound);
      if (missionConfig) {
        state.goals = missionConfig.objectives.map((obj) => ({
          text: obj.text,
          metric: obj.condition.type === 'min_score'
            ? {
                category: (obj.condition as any).category ?? 'ecosystemHealth',
                threshold: (obj.condition as any).threshold,
              }
            : undefined,
        }));
      } else {
        const scenarioRound = getScenarioRound(session.scenarioId, session.currentRound);
        if (scenarioRound) {
          state.goals = [scenarioRound.goal];
        }
      }
    }
  }

  return state;
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
    scenarioId: row.scenario_id || null,
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
    currentRound: row.current_round ?? 0,
  };
}

export function updateTeamRound(teamId: string, round: number): void {
  const db = getDb();
  db.prepare('UPDATE teams SET current_round = ? WHERE id = ?').run(round, teamId);
}

export function getTeamStarsForRound(sessionId: string, teamId: string, round: number): number | null {
  const db = getDb();
  const row = db.prepare('SELECT stars FROM mission_stars WHERE session_id = ? AND team_id = ? AND round = ?').get(sessionId, teamId, round) as any;
  return row ? row.stars : null;
}

export function saveTeamStars(sessionId: string, teamId: string, round: number, stars: number): void {
  const db = getDb();
  db.prepare(`
    INSERT OR REPLACE INTO mission_stars (session_id, team_id, round, stars)
    VALUES (?, ?, ?, ?)
  `).run(sessionId, teamId, round, stars);
}

export function clearTeamPlacements(teamId: string, round: number): void {
  const db = getDb();
  db.prepare('DELETE FROM placements WHERE team_id = ? AND round = ?').run(teamId, round);
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
    isPrePlaced: !!row.is_pre_placed,
  };
}

import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../db/connection';
import type { Player, Team, ZoneConfig, ZoneRect } from '../types/models';
import { getPlayersInSession, getSessionById } from './RoomManager';

const TEAM_COLORS = [
  '#e74c3c', '#3498db', '#2ecc71', '#f39c12',
  '#9b59b6', '#1abc9c', '#e67e22', '#e84393',
];

const TEAM_NAMES = [
  'Red Cardinals', 'Blue Jays', 'Green Frogs', 'Orange Monarchs',
  'Purple Coneflowers', 'Teal Herons', 'Amber Foxes', 'Pink Flamingos',
];

/**
 * Shuffle array in-place (Fisher-Yates).
 */
function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Assign players into teams and compute zone grids.
 * numTeams should be >= 1 and <= 8. Players are shuffled and distributed round-robin.
 */
export function assignTeams(sessionId: string, numTeams: number): Team[] {
  const db = getDb();
  const session = getSessionById(sessionId);
  if (!session) throw new Error('Session not found');

  numTeams = Math.max(1, Math.min(numTeams, 8));
  const players = getPlayersInSession(sessionId);
  shuffle(players);

  // Compute grid layout for zones
  const cols = Math.ceil(Math.sqrt(numTeams));
  const rows = Math.ceil(numTeams / cols);
  const zoneWidth = session.canvasWidth / cols;
  const zoneHeight = session.canvasHeight / rows;

  const teams: Team[] = [];

  for (let t = 0; t < numTeams; t++) {
    const teamId = uuidv4();
    const row = Math.floor(t / cols);
    const col = t % cols;

    // Determine which players belong to this team
    const teamPlayers = players.filter((_, idx) => idx % numTeams === t);

    // Compute zones for team members within the team's grid cell
    const teamZones: ZoneRect[] = [];
    const playerCount = teamPlayers.length;
    const subCols = Math.ceil(Math.sqrt(playerCount || 1));
    const subRows = Math.ceil((playerCount || 1) / subCols);
    const subW = zoneWidth / subCols;
    const subH = zoneHeight / subRows;

    for (let p = 0; p < playerCount; p++) {
      const sr = Math.floor(p / subCols);
      const sc = p % subCols;
      teamZones.push({
        index: p,
        x: col * zoneWidth + sc * subW,
        y: row * zoneHeight + sr * subH,
        width: subW,
        height: subH,
        playerId: teamPlayers[p].id,
      });
    }

    // If there are no players, still create one empty zone
    if (playerCount === 0) {
      teamZones.push({
        index: 0,
        x: col * zoneWidth,
        y: row * zoneHeight,
        width: zoneWidth,
        height: zoneHeight,
        playerId: null,
      });
    }

    const zoneConfig: ZoneConfig = { cols: subCols, rows: subRows, zones: teamZones };

    db.prepare(`
      INSERT INTO teams (id, session_id, name, color, zone_config)
      VALUES (?, ?, ?, ?, ?)
    `).run(teamId, sessionId, TEAM_NAMES[t], TEAM_COLORS[t], JSON.stringify(zoneConfig));

    // Update player team_id and zone_index
    for (let p = 0; p < teamPlayers.length; p++) {
      db.prepare('UPDATE players SET team_id = ?, zone_index = ? WHERE id = ?')
        .run(teamId, p, teamPlayers[p].id);
    }

    teams.push({
      id: teamId,
      sessionId,
      name: TEAM_NAMES[t],
      color: TEAM_COLORS[t],
      zoneConfig: JSON.stringify(zoneConfig),
    });
  }

  return teams;
}

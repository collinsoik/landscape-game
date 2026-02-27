// Game configuration defaults

export const GAME_DEFAULTS = {
  canvas: {
    width: 1200,
    height: 800,
    spriteScale: 3,
  },
  room: {
    codeLength: 6,
    maxPlayers: 32,
    maxTeams: 8,
  },
  round: {
    defaultDuration: 600, // 10 minutes
    minDuration: 30,      // 30 seconds (supports short missions)
    maxDuration: 1800,    // 30 minutes
    defaultCount: 2,
  },
  sync: {
    moveThrottleMs: 100, // 10 events/sec per player
    reconnectTimeoutMs: 120000, // 2 minutes
  },
  scoring: {
    autoWeight: 0.6,
    judgeWeight: 0.4,
  },
  teams: {
    colors: [
      '#e74c3c', // Red
      '#3498db', // Blue
      '#2ecc71', // Green
      '#f39c12', // Orange
      '#9b59b6', // Purple
      '#1abc9c', // Teal
      '#e67e22', // Dark Orange
      '#e84393', // Pink
    ],
    names: [
      'Red Cardinals',
      'Blue Jays',
      'Green Frogs',
      'Orange Monarchs',
      'Purple Coneflowers',
      'Teal Herons',
      'Amber Foxes',
      'Pink Flamingos',
    ],
  },
};

export const TEAM_COLORS = GAME_DEFAULTS.teams.colors;
export const TEAM_NAMES = GAME_DEFAULTS.teams.names;

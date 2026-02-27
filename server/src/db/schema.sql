-- Landscape Biodiversity Game - SQLite Schema

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  room_code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL DEFAULT 'Landscape Game',
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'playing', 'judging', 'finished')),
  satellite_image_path TEXT,
  current_round INTEGER NOT NULL DEFAULT 0,
  total_rounds INTEGER NOT NULL DEFAULT 2,
  admin_token TEXT NOT NULL,
  judge_token TEXT NOT NULL,
  canvas_width INTEGER NOT NULL DEFAULT 1200,
  canvas_height INTEGER NOT NULL DEFAULT 800,
  scenario_id TEXT DEFAULT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS players (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  team_id TEXT REFERENCES teams(id) ON DELETE SET NULL,
  zone_index INTEGER,
  connected INTEGER NOT NULL DEFAULT 1,
  last_seen TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS teams (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  zone_config TEXT NOT NULL DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS placements (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  team_id TEXT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  player_id TEXT NOT NULL,
  round INTEGER NOT NULL,
  element_type TEXT NOT NULL,
  x REAL NOT NULL,
  y REAL NOT NULL,
  width REAL NOT NULL,
  height REAL NOT NULL,
  zone_index INTEGER NOT NULL,
  is_pre_placed INTEGER NOT NULL DEFAULT 0,
  placed_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS auto_scores (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  team_id TEXT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  round INTEGER NOT NULL,
  biodiversity REAL NOT NULL DEFAULT 0,
  sustainability REAL NOT NULL DEFAULT 0,
  aesthetics REAL NOT NULL DEFAULT 0,
  ecosystem_health REAL NOT NULL DEFAULT 0,
  total REAL NOT NULL DEFAULT 0,
  breakdown TEXT NOT NULL DEFAULT '{}',
  UNIQUE(session_id, team_id, round)
);

CREATE TABLE IF NOT EXISTS judge_scores (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  team_id TEXT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  round INTEGER NOT NULL,
  judge_id TEXT NOT NULL,
  biodiversity REAL NOT NULL DEFAULT 0,
  sustainability REAL NOT NULL DEFAULT 0,
  aesthetics REAL NOT NULL DEFAULT 0,
  ecosystem_health REAL NOT NULL DEFAULT 0,
  comment TEXT NOT NULL DEFAULT '',
  scored_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS rounds (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  round_number INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'judging', 'completed')),
  started_at TEXT,
  ended_at TEXT,
  duration_seconds INTEGER NOT NULL DEFAULT 600,
  area_label TEXT NOT NULL DEFAULT 'Main Area',
  budget INTEGER DEFAULT NULL,
  available_categories TEXT DEFAULT NULL,
  UNIQUE(session_id, round_number)
);

CREATE TABLE IF NOT EXISTS mission_stars (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  team_id TEXT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  round INTEGER NOT NULL,
  stars INTEGER NOT NULL DEFAULT 0,
  UNIQUE(session_id, team_id, round)
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_players_session ON players(session_id);
CREATE INDEX IF NOT EXISTS idx_players_team ON players(team_id);
CREATE INDEX IF NOT EXISTS idx_teams_session ON teams(session_id);
CREATE INDEX IF NOT EXISTS idx_placements_session_round ON placements(session_id, round);
CREATE INDEX IF NOT EXISTS idx_placements_team_round ON placements(team_id, round);
CREATE INDEX IF NOT EXISTS idx_auto_scores_session ON auto_scores(session_id);
CREATE INDEX IF NOT EXISTS idx_judge_scores_session ON judge_scores(session_id);
CREATE INDEX IF NOT EXISTS idx_rounds_session ON rounds(session_id);

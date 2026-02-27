import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (db) return db;

  const defaultPath = path.join(__dirname, '..', '..', 'data', 'landscape.db');
  const dbPath = process.env.DB_PATH
    ? path.resolve(process.env.DB_PATH)
    : defaultPath;
  const dataDir = path.dirname(dbPath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  // Read and execute schema
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf-8');
  db.exec(schema);

  // Migrations: add columns that may be missing from older databases
  const sessionCols = db.prepare("PRAGMA table_info(sessions)").all() as { name: string }[];
  const sessionColNames = new Set(sessionCols.map((c) => c.name));
  if (!sessionColNames.has('scenario_id')) {
    db.exec("ALTER TABLE sessions ADD COLUMN scenario_id TEXT DEFAULT NULL");
  }

  const roundCols = db.prepare("PRAGMA table_info(rounds)").all() as { name: string }[];
  const roundColNames = new Set(roundCols.map((c) => c.name));
  if (!roundColNames.has('budget')) {
    db.exec("ALTER TABLE rounds ADD COLUMN budget INTEGER DEFAULT NULL");
  }
  if (!roundColNames.has('available_categories')) {
    db.exec("ALTER TABLE rounds ADD COLUMN available_categories TEXT DEFAULT NULL");
  }

  const placementCols = db.prepare("PRAGMA table_info(placements)").all() as { name: string }[];
  const placementColNames = new Set(placementCols.map((c) => c.name));
  if (!placementColNames.has('is_pre_placed')) {
    db.exec("ALTER TABLE placements ADD COLUMN is_pre_placed INTEGER NOT NULL DEFAULT 0");
  }

  // Add current_round to teams table if missing
  const teamCols = db.prepare("PRAGMA table_info(teams)").all() as { name: string }[];
  const teamColNames = new Set(teamCols.map((c) => c.name));
  if (!teamColNames.has('current_round')) {
    db.exec("ALTER TABLE teams ADD COLUMN current_round INTEGER DEFAULT 0");
  }

  return db;
}

export function closeDb(): void {
  if (db) {
    db.close();
    db = null;
  }
}

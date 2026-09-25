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

  // Upgrade existing databases without hiding a failed migration.
  const columns = db.pragma('table_info(submissions)') as { name: string }[];
  if (!columns.some((column) => column.name === 'landscape_id')) {
    db.exec("ALTER TABLE submissions ADD COLUMN landscape_id TEXT NOT NULL DEFAULT 'meadow'");
  }

  return db;
}

export function closeDb(): void {
  if (db) {
    db.close();
    db = null;
  }
}

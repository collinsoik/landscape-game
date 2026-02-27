CREATE TABLE IF NOT EXISTS rooms (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  room_code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open', 'closed')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  room_code TEXT NOT NULL,
  player_name TEXT NOT NULL,
  placements_json TEXT NOT NULL,
  stars_json TEXT NOT NULL,
  submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (room_code) REFERENCES rooms(room_code)
);

CREATE TABLE IF NOT EXISTS votes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  room_code TEXT NOT NULL,
  voter_name TEXT NOT NULL,
  most_beautiful_id INTEGER,
  most_eco_friendly_id INTEGER,
  most_creative_id INTEGER,
  voted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(room_code, voter_name),
  FOREIGN KEY (room_code) REFERENCES rooms(room_code),
  FOREIGN KEY (most_beautiful_id) REFERENCES submissions(id),
  FOREIGN KEY (most_eco_friendly_id) REFERENCES submissions(id),
  FOREIGN KEY (most_creative_id) REFERENCES submissions(id)
);

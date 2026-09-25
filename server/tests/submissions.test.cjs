const assert = require('node:assert/strict');
const { test } = require('node:test');
const { mkdtempSync, readFileSync, rmSync } = require('node:fs');
const { tmpdir } = require('node:os');
const path = require('node:path');
const { spawn } = require('node:child_process');
const { once } = require('node:events');
const { createServer } = require('node:net');
const Database = require('better-sqlite3');

test('migrates old submissions and persists every background through a server restart', async (t) => {
  const directory = mkdtempSync(path.join(tmpdir(), 'landscape-submissions-'));
  const dbPath = path.join(directory, 'test.db');
  const db = new Database(dbPath);
  const schema = readFileSync(path.join(__dirname, '../src/db/schema.sql'), 'utf8')
    .replace("  landscape_id TEXT NOT NULL DEFAULT 'meadow',\n", '');
  db.exec(schema);
  db.exec("INSERT INTO rooms (room_code) VALUES ('ABC123')");
  db.exec("INSERT INTO submissions (room_code, player_name, placements_json, stars_json) VALUES ('ABC123', 'Legacy', '[]', '[]')");
  db.close();
  const socket = createServer();
  socket.listen(0, '127.0.0.1');
  await once(socket, 'listening');
  const port = socket.address().port;
  await new Promise(resolve => socket.close(resolve));
  const origin = `http://127.0.0.1:${port}`;
  let child;
  async function start() {
    child = spawn(process.execPath, ['dist/index.js'], {
      cwd: path.join(__dirname, '..'),
      env: { ...process.env, DB_PATH: dbPath, PORT: String(port) },
      stdio: 'pipe',
    });
    for (let attempt = 0; attempt < 100; attempt++) {
      if (child.exitCode !== null) throw new Error('Test API exited');
      try { if ((await fetch(`${origin}/api/health`)).ok) return; } catch {}
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    throw new Error('Test API did not start');
  }
  async function stop() {
    if (child && child.exitCode === null) {
      const exited = once(child, 'exit');
      child.kill('SIGTERM');
      await exited;
    }
  }
  t.after(async () => { await stop(); rmSync(directory, { recursive: true, force: true }); });
  await start();
  const old = await (await fetch(`${origin}/api/rooms/ABC123/submissions`)).json();
  assert.equal(old.submissions[0].landscapeId, 'meadow');
  const created = await (await fetch(`${origin}/api/rooms`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'Background regression test' }),
  })).json();
  const room = `${origin}/api/rooms/${created.roomCode}`;
  const landscapes = ['meadow', 'riverside', 'rocky-hills', 'lakeside', 'coastal'];
  const placements = [{ id: 'test-tree', elementType: 'oak_tree', x: 100, y: 200, round: 1 }];
  for (const landscapeId of landscapes) {
    const response = await fetch(`${room}/submit`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerName: landscapeId, placements, stars: [{ round: 1, stars: 3 }], landscapeId }),
    });
    assert.equal(response.status, 200);
  }
  await stop();
  await start();
  const saved = await (await fetch(`${room}/submissions`)).json();
  assert.deepEqual(saved.submissions.map(s => s.landscapeId), landscapes);
  for (const submission of saved.submissions) assert.deepEqual(submission.placements, placements);
  assert.equal((await (await fetch(room)).json()).submissionCount, 5);
});

import { getDb } from './db/connection';
import type { Room } from './types/models';

function generateRoomCode(length: number = 6): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no I,O,0,1 to avoid confusion
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export function createRoom(name: string = ''): Room {
  const db = getDb();

  // Ensure unique room code
  const checkStmt = db.prepare('SELECT 1 FROM rooms WHERE room_code = ?');
  let roomCode: string;
  do {
    roomCode = generateRoomCode();
  } while (checkStmt.get(roomCode));

  db.prepare(
    'INSERT INTO rooms (room_code, name) VALUES (?, ?)'
  ).run(roomCode, name);

  return getRoomByCode(roomCode)!;
}

export function getRoomByCode(roomCode: string): Room | undefined {
  const db = getDb();
  const row = db.prepare('SELECT * FROM rooms WHERE room_code = ?').get(roomCode) as Room | undefined;
  return row ?? undefined;
}

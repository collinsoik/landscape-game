import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../db/connection';
import type { Round } from '../types/models';
import { getSessionById, updateSession } from './RoomManager';

// In-memory timer state per session
interface TimerState {
  remaining: number;
  interval: ReturnType<typeof setInterval> | null;
  paused: boolean;
}

const timers = new Map<string, TimerState>();

function mapRound(row: any): Round {
  return {
    id: row.id,
    sessionId: row.session_id,
    roundNumber: row.round_number,
    status: row.status,
    startedAt: row.started_at,
    endedAt: row.ended_at,
    durationSeconds: row.duration_seconds,
    areaLabel: row.area_label,
  };
}

export function getRound(sessionId: string, roundNumber: number): Round | undefined {
  const db = getDb();
  const row = db.prepare('SELECT * FROM rounds WHERE session_id = ? AND round_number = ?').get(sessionId, roundNumber) as any;
  return row ? mapRound(row) : undefined;
}

export function getRoundsForSession(sessionId: string): Round[] {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM rounds WHERE session_id = ? ORDER BY round_number').all(sessionId) as any[];
  return rows.map(mapRound);
}

/**
 * Start a round. Transitions round from pending to active, starts the countdown timer.
 * Returns the round or throws on error.
 * onTick is called every second with remaining seconds.
 * onEnd is called when the timer hits 0.
 */
export function startRound(
  sessionId: string,
  roundNumber: number,
  onTick: (remaining: number) => void,
  onEnd: () => void
): Round {
  const session = getSessionById(sessionId);
  if (!session) throw new Error('Session not found');

  const round = getRound(sessionId, roundNumber);
  if (!round) throw new Error(`Round ${roundNumber} not found`);
  if (round.status !== 'pending') throw new Error(`Round ${roundNumber} is not pending (status: ${round.status})`);

  const db = getDb();
  db.prepare(`
    UPDATE rounds SET status = 'active', started_at = datetime('now') WHERE id = ?
  `).run(round.id);

  updateSession(sessionId, { status: 'playing', currentRound: roundNumber });

  // Clear any existing timer to prevent duplicate intervals
  clearTimer(sessionId);

  // Set up timer
  const state: TimerState = {
    remaining: round.durationSeconds,
    interval: null,
    paused: false,
  };

  state.interval = setInterval(() => {
    if (state.paused) return;
    state.remaining--;
    onTick(state.remaining);
    if (state.remaining <= 0) {
      endRound(sessionId, roundNumber);
      onEnd();
    }
  }, 1000);

  timers.set(sessionId, state);

  return getRound(sessionId, roundNumber)!;
}

/**
 * End the current round. Transitions active -> judging.
 */
export function endRound(sessionId: string, roundNumber: number): void {
  const db = getDb();
  db.prepare(`
    UPDATE rounds SET status = 'judging', ended_at = datetime('now')
    WHERE session_id = ? AND round_number = ?
  `).run(sessionId, roundNumber);

  updateSession(sessionId, { status: 'judging' });
  clearTimer(sessionId);
}

/**
 * Mark a round as completed (after judging).
 */
export function completeRound(sessionId: string, roundNumber: number): void {
  const db = getDb();
  db.prepare(`
    UPDATE rounds SET status = 'completed' WHERE session_id = ? AND round_number = ?
  `).run(sessionId, roundNumber);

  const session = getSessionById(sessionId);
  if (session && roundNumber >= session.totalRounds) {
    updateSession(sessionId, { status: 'finished' });
  }
}

/**
 * Pause the current round timer.
 */
export function pauseRound(sessionId: string): void {
  const state = timers.get(sessionId);
  if (state) {
    state.paused = true;
  }
}

/**
 * Resume the current round timer.
 */
export function resumeRound(sessionId: string): number {
  const state = timers.get(sessionId);
  if (state) {
    state.paused = false;
    return state.remaining;
  }
  return 0;
}

/**
 * Get remaining time for the current round.
 */
export function getTimeRemaining(sessionId: string): number {
  const state = timers.get(sessionId);
  return state ? state.remaining : 0;
}

function clearTimer(sessionId: string): void {
  const state = timers.get(sessionId);
  if (state?.interval) {
    clearInterval(state.interval);
    state.interval = null;
  }
  timers.delete(sessionId);
}

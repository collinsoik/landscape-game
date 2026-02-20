import type { Socket } from 'socket.io';
import type { ServerToClientEvents, ClientToServerEvents, RejoinResponse } from '../types/events';
import { getPlayer, getSessionById, getRoomState, setPlayerConnected } from './RoomManager';
import { getTimeRemaining } from './RoundManager';

/**
 * Handle a player attempting to rejoin an existing session.
 * Validates the player and session exist, marks the player as connected,
 * and sends back the full room state snapshot.
 */
export function handleRejoin(
  socket: Socket<ClientToServerEvents, ServerToClientEvents>,
  roomCode: string,
  playerId: string,
  callback: (res: RejoinResponse) => void
): void {
  const player = getPlayer(playerId);
  if (!player) {
    callback({ success: false, error: 'Player not found' });
    return;
  }

  const session = getSessionById(player.sessionId);
  if (!session || session.roomCode !== roomCode) {
    callback({ success: false, error: 'Room not found or player does not belong to this room' });
    return;
  }

  // Mark reconnected
  setPlayerConnected(playerId, true);

  // Join socket rooms
  socket.join(`session:${session.id}`);
  if (player.teamId) {
    socket.join(`team:${player.teamId}`);
  }

  // Build state snapshot
  const state = getRoomState(session.id);
  if (!state) {
    callback({ success: false, error: 'Failed to load room state' });
    return;
  }

  // Include remaining time if round is active
  if (session.status === 'playing') {
    state.roundTimeRemaining = getTimeRemaining(session.id);
  }

  callback({ success: true, state });

  // Notify others that this player reconnected
  socket.to(`session:${session.id}`).emit('room:player-reconnected', { playerId });
}

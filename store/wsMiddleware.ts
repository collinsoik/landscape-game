import type { GameSocket } from '@/lib/ws/client';
import { useGameStore } from './index';
import type { ZoneConfig } from '@/lib/ws/protocol';

/**
 * Binds all server->client socket events to Zustand store updates.
 * Call once after socket connects.
 */
export function bindSocketToStore(socket: GameSocket): void {
  const store = useGameStore;

  socket.on('room:state', (data) => {
    store.getState().setRoomState({
      sessionName: data.session.name,
      status: data.session.status,
      currentRound: data.session.currentRound,
      totalRounds: data.session.totalRounds,
      canvasWidth: data.session.canvasWidth,
      canvasHeight: data.session.canvasHeight,
      satelliteImagePath: data.session.satelliteImagePath,
      roundTimeRemaining: data.roundTimeRemaining ?? null,
    });
    store.getState().setPlayers(data.players);
    store.getState().setTeams(data.teams);
    store.getState().setPlacements(data.placements);

    // Apply scores
    for (const [teamId, breakdown] of Object.entries(data.scores)) {
      store.getState().updateScore(teamId, breakdown);
    }

    // Find my zone config
    const playerId = store.getState().playerId;
    if (playerId) {
      for (const tw of data.teams) {
        const myPlayer = tw.players.find((p) => p.id === playerId);
        if (myPlayer) {
          store.getState().setZoneConfig(tw.zoneConfig);
          store.getState().setMyZoneIndex(myPlayer.zoneIndex);
          break;
        }
      }
    }
  });

  socket.on('room:player-joined', ({ player }) => {
    store.getState().addPlayer(player);
  });

  socket.on('room:player-left', ({ playerId }) => {
    store.getState().removePlayer(playerId);
  });

  socket.on('room:player-reconnected', ({ playerId }) => {
    store.getState().reconnectPlayer(playerId);
  });

  socket.on('room:teams-assigned', ({ teams }) => {
    store.getState().setTeams(teams);

    // Find my zone
    const playerId = store.getState().playerId;
    if (playerId) {
      for (const tw of teams) {
        const myPlayer = tw.players.find((p) => p.id === playerId);
        if (myPlayer) {
          store.getState().setZoneConfig(tw.zoneConfig);
          store.getState().setMyZoneIndex(myPlayer.zoneIndex);
          break;
        }
      }
    }
  });

  socket.on('game:round-start', ({ round, duration, areaLabel }) => {
    store.getState().setRoomState({
      status: 'playing',
      currentRound: round,
      roundTimeRemaining: duration,
      paused: false,
      areaLabel,
    });
  });

  socket.on('game:round-end', ({ round }) => {
    store.getState().setRoomState({
      status: 'judging',
      roundTimeRemaining: null,
    });
  });

  socket.on('game:timer', ({ remaining }) => {
    store.getState().setTimer(remaining);
  });

  socket.on('game:pause', () => {
    store.getState().setPaused(true);
  });

  socket.on('game:resume', ({ remaining }) => {
    store.getState().setPaused(false);
    store.getState().setTimer(remaining);
  });

  socket.on('element:placed', ({ placement }) => {
    store.getState().addPlacement(placement);
  });

  socket.on('element:moved', ({ placementId, x, y }) => {
    store.getState().movePlacement(placementId, x, y);
  });

  socket.on('element:removed', ({ placementId }) => {
    store.getState().removePlacement(placementId);
  });

  socket.on('element:rejected', ({ reason }) => {
    store.getState().setError(reason);
    // Clear error after 3s
    setTimeout(() => store.getState().setError(null), 3000);
  });

  socket.on('score:update', ({ teamId, scores }) => {
    store.getState().updateScore(teamId, scores);
  });

  socket.on('score:final', (data) => {
    store.getState().setFinalResults(data);
    store.getState().setRoomState({ status: 'finished' });
  });

  socket.on('error', ({ message }) => {
    store.getState().setError(message);
  });
}

/**
 * Removes all socket listeners (call on disconnect/cleanup).
 */
export function unbindSocketFromStore(socket: GameSocket): void {
  socket.off('room:state');
  socket.off('room:player-joined');
  socket.off('room:player-left');
  socket.off('room:player-reconnected');
  socket.off('room:teams-assigned');
  socket.off('game:round-start');
  socket.off('game:round-end');
  socket.off('game:timer');
  socket.off('game:pause');
  socket.off('game:resume');
  socket.off('element:placed');
  socket.off('element:moved');
  socket.off('element:removed');
  socket.off('element:rejected');
  socket.off('score:update');
  socket.off('score:final');
  socket.off('error');
}

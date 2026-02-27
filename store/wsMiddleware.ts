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
      paused: data.paused ?? false,
      scenarioId: data.session.scenarioId ?? null,
      budget: data.budget ?? null,
      actions: data.actions ?? null,
      refundRate: data.refundRate ?? null,
      availableCategories: data.availableCategories ?? null,
      goals: data.goals ?? null,
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

  socket.on('game:round-start', (data) => {
    store.getState().setRoomState({
      status: 'playing',
      currentRound: data.round,
      roundTimeRemaining: data.duration,
      roundDuration: data.duration,
      paused: data.paused ?? false,
      areaLabel: data.areaLabel,
      budget: data.budget ? { remaining: data.budget, total: data.budget } : null,
      actions: data.actionLimit ? { remaining: data.actionLimit, limit: data.actionLimit } : null,
      refundRate: data.refundRate ?? null,
      availableCategories: data.availableCategories ?? null,
      goals: data.goals ?? null,
      scenarioName: data.scenarioName ?? null,
      // Mission fields
      missionType: data.missionType ?? null,
      missionTitle: data.missionTitle ?? null,
      missionNarrative: data.missionNarrative ?? null,
      missionEcoLesson: data.missionEcoLesson ?? null,
      objectives: data.objectives ?? [],
      starThresholds: data.starThresholds ?? null,
      totalMissions: data.totalMissions ?? 0,
      // Reset per-mission state
      missionStars: null,
      starDetails: [],
      objectivesCompleted: [],
      activeMissionEvent: null,
      // Retry fields
      retrying: data.retrying ?? false,
      isBehind: data.isBehind ?? false,
      teamCurrentRound: data.round,
    });

    // For retries, clear existing placements before adding pre-placed
    if (data.retrying) {
      store.getState().setPlacements([]);
    }

    // Add pre-placed elements to placements
    if (data.prePlacedElements) {
      for (const p of data.prePlacedElements) {
        store.getState().addPlacement(p);
      }
    }
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

  socket.on('budget:update', ({ teamId, remaining, total }) => {
    store.getState().setRoomState({ budget: { remaining, total } });
  });

  socket.on('actions:update', ({ teamId, remaining, limit }) => {
    store.getState().setRoomState({ actions: { remaining, limit } });
  });

  socket.on('score:update', ({ teamId, scores }) => {
    store.getState().updateScore(teamId, scores);
  });

  socket.on('score:final', (data) => {
    store.getState().setFinalResults(data);
    // Don't set status to 'finished' here — the server controls status transitions
    // via game:round-end. Setting it prematurely after round 1 of a multi-round game
    // would incorrectly end the session for clients.
  });

  socket.on('game:finished', (data) => {
    store.getState().setFinalResults(data);
    store.getState().setRoomState({ status: 'finished' });
  });

  // Mission events
  socket.on('mission:event', (data) => {
    store.getState().setRoomState({ activeMissionEvent: data });
    // Auto-clear after 4 seconds
    setTimeout(() => {
      const current = store.getState().room.activeMissionEvent;
      if (current && current.eventType === data.eventType) {
        store.getState().setRoomState({ activeMissionEvent: null });
      }
    }, 4000);
  });

  socket.on('mission:stars', ({ stars, details }) => {
    store.getState().setRoomState({ missionStars: stars, starDetails: details });
  });

  socket.on('mission:objective-complete', ({ objectiveId }) => {
    const current = store.getState().room.objectivesCompleted;
    if (!current.includes(objectiveId)) {
      store.getState().setRoomState({
        objectivesCompleted: [...current, objectiveId],
      });
    }
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
  socket.off('budget:update');
  socket.off('actions:update');
  socket.off('score:update');
  socket.off('score:final');
  socket.off('game:finished');
  socket.off('mission:event');
  socket.off('mission:stars');
  socket.off('mission:objective-complete');
  socket.off('error');
}

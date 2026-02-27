import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createGameSlice, type GameSlice } from './slices/gameSlice';
import { createCanvasSlice, type CanvasSlice } from './slices/canvasSlice';

export type GameStore = GameSlice & CanvasSlice;

export const useGameStore = create<GameStore>()(
  persist(
    (...a) => ({
      ...createGameSlice(...a),
      ...createCanvasSlice(...a),
    }),
    {
      name: 'landscape-game',
      storage: createJSONStorage(() => sessionStorage),
      skipHydration: true,
      partialize: (state) => ({
        playerName: state.playerName,
        placements: state.placements,
        roundResults: state.roundResults,
        currentRound: state.currentRound,
        phase: state.phase,
        submittedRoomCode: state.submittedRoomCode,
        landscapeId: state.landscapeId,
      }),
    },
  ),
);

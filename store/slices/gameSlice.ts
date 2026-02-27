import { StateCreator } from 'zustand';

export type GamePhase = 'name_entry' | 'playing' | 'round_complete' | 'submission' | 'gallery';

export interface RoundResult {
  round: number;
  stars: number;
}

export interface GameSlice {
  // State
  phase: GamePhase;
  playerName: string;
  currentRound: number;
  roundResults: RoundResult[];
  submittedRoomCode: string | null;
  allowMovePreviousRound: boolean;

  // Actions
  setPlayerName: (name: string) => void;
  startGame: () => void;
  completeRound: (stars: number) => void;
  advanceRound: () => void;
  setPhase: (phase: GamePhase) => void;
  setSubmittedRoomCode: (code: string) => void;
  toggleMovePreviousRound: () => void;
  resetGame: () => void;
}

export const createGameSlice: StateCreator<GameSlice, [], [], GameSlice> = (set) => ({
  phase: 'name_entry',
  playerName: '',
  currentRound: 1,
  roundResults: [],
  submittedRoomCode: null,
  allowMovePreviousRound: false,

  setPlayerName: (name) => set({ playerName: name }),
  startGame: () => set({ phase: 'playing', currentRound: 1, roundResults: [] }),
  completeRound: (stars) =>
    set((state) => ({
      phase: 'round_complete',
      roundResults: [...state.roundResults, { round: state.currentRound, stars }],
    })),
  advanceRound: () =>
    set((state) => {
      if (state.currentRound >= 4) {
        return { phase: 'submission' };
      }
      return { phase: 'playing', currentRound: state.currentRound + 1 };
    }),
  setPhase: (phase) => set({ phase }),
  setSubmittedRoomCode: (code) => set({ submittedRoomCode: code }),
  toggleMovePreviousRound: () => set((state) => ({ allowMovePreviousRound: !state.allowMovePreviousRound })),
  resetGame: () =>
    set({
      phase: 'name_entry',
      playerName: '',
      currentRound: 1,
      roundResults: [],
      submittedRoomCode: null,
      allowMovePreviousRound: false,
    }),
});

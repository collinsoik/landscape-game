import type { StateCreator } from 'zustand';
import type { ScoreBreakdown, FinalScoreData } from '@/lib/ws/protocol';

export interface ScoreSlice {
  scores: Record<string, ScoreBreakdown>;
  finalResults: FinalScoreData | null;

  updateScore: (teamId: string, breakdown: ScoreBreakdown) => void;
  setFinalResults: (data: FinalScoreData) => void;
  resetScores: () => void;
}

export const createScoreSlice: StateCreator<ScoreSlice, [], [], ScoreSlice> = (set) => ({
  scores: {},
  finalResults: null,

  updateScore: (teamId, breakdown) =>
    set((s) => ({
      scores: { ...s.scores, [teamId]: breakdown },
    })),

  setFinalResults: (data) => set({ finalResults: data }),

  resetScores: () => set({ scores: {}, finalResults: null }),
});

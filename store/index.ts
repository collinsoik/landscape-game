import { create } from 'zustand';
import { createGameSlice, type GameSlice } from './slices/gameSlice';
import { createCanvasSlice, type CanvasSlice } from './slices/canvasSlice';

export type GameStore = GameSlice & CanvasSlice;

export const useGameStore = create<GameStore>()((...a) => ({
  ...createGameSlice(...a),
  ...createCanvasSlice(...a),
}));

import { create } from 'zustand';
import { createConnectionSlice, type ConnectionSlice } from './slices/connectionSlice';
import { createRoomSlice, type RoomSlice } from './slices/roomSlice';
import { createCanvasSlice, type CanvasSlice } from './slices/canvasSlice';
import { createScoreSlice, type ScoreSlice } from './slices/scoreSlice';

export type GameStore = ConnectionSlice & RoomSlice & CanvasSlice & ScoreSlice;

export const useGameStore = create<GameStore>()((...a) => ({
  ...createConnectionSlice(...a),
  ...createRoomSlice(...a),
  ...createCanvasSlice(...a),
  ...createScoreSlice(...a),
}));

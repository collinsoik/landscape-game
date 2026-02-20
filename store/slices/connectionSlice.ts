import type { StateCreator } from 'zustand';

export interface ConnectionSlice {
  connected: boolean;
  playerId: string | null;
  roomCode: string | null;
  playerName: string | null;
  sessionId: string | null;
  reconnecting: boolean;
  error: string | null;

  setConnected: (connected: boolean) => void;
  setPlayer: (playerId: string, playerName: string) => void;
  setRoom: (roomCode: string, sessionId: string) => void;
  setReconnecting: (reconnecting: boolean) => void;
  setError: (error: string | null) => void;
  resetConnection: () => void;
}

const initialState = {
  connected: false,
  playerId: null,
  roomCode: null,
  playerName: null,
  sessionId: null,
  reconnecting: false,
  error: null,
};

export const createConnectionSlice: StateCreator<ConnectionSlice, [], [], ConnectionSlice> = (set) => ({
  ...initialState,

  setConnected: (connected) => set({ connected, error: null }),
  setPlayer: (playerId, playerName) => set({ playerId, playerName }),
  setRoom: (roomCode, sessionId) => set({ roomCode, sessionId }),
  setReconnecting: (reconnecting) => set({ reconnecting }),
  setError: (error) => set({ error }),
  resetConnection: () => set(initialState),
});

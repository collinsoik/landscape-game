import type { StateCreator } from 'zustand';
import type { Player, TeamWithPlayers } from '@/lib/ws/protocol';

export interface RoomState {
  sessionName: string;
  status: string;
  currentRound: number;
  totalRounds: number;
  canvasWidth: number;
  canvasHeight: number;
  satelliteImagePath: string | null;
  roundTimeRemaining: number | null;
  paused: boolean;
  areaLabel: string;
}

export interface RoomSlice {
  room: RoomState;
  players: Player[];
  teams: TeamWithPlayers[];

  setRoomState: (state: Partial<RoomState>) => void;
  setPlayers: (players: Player[]) => void;
  addPlayer: (player: Player) => void;
  removePlayer: (playerId: string) => void;
  reconnectPlayer: (playerId: string) => void;
  setTeams: (teams: TeamWithPlayers[]) => void;
  setTimer: (remaining: number) => void;
  setPaused: (paused: boolean) => void;
  resetRoom: () => void;
}

const initialRoom: RoomState = {
  sessionName: '',
  status: 'waiting',
  currentRound: 0,
  totalRounds: 0,
  canvasWidth: 1200,
  canvasHeight: 800,
  satelliteImagePath: null,
  roundTimeRemaining: null,
  paused: false,
  areaLabel: '',
};

export const createRoomSlice: StateCreator<RoomSlice, [], [], RoomSlice> = (set) => ({
  room: initialRoom,
  players: [],
  teams: [],

  setRoomState: (partial) =>
    set((s) => ({ room: { ...s.room, ...partial } })),

  setPlayers: (players) => set({ players }),

  addPlayer: (player) =>
    set((s) => ({
      players: s.players.some((p) => p.id === player.id)
        ? s.players.map((p) => (p.id === player.id ? player : p))
        : [...s.players, player],
    })),

  removePlayer: (playerId) =>
    set((s) => ({
      players: s.players.map((p) =>
        p.id === playerId ? { ...p, connected: false } : p
      ),
    })),

  reconnectPlayer: (playerId) =>
    set((s) => ({
      players: s.players.map((p) =>
        p.id === playerId ? { ...p, connected: true } : p
      ),
    })),

  setTeams: (teams) => set({ teams }),

  setTimer: (remaining) =>
    set((s) => ({ room: { ...s.room, roundTimeRemaining: remaining } })),

  setPaused: (paused) =>
    set((s) => ({ room: { ...s.room, paused } })),

  resetRoom: () => set({ room: initialRoom, players: [], teams: [] }),
});

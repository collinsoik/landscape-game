import type { StateCreator } from 'zustand';
import type { Player, TeamWithPlayers, MissionType, MissionObjective, StarThresholds, MissionEventData, StarDetail } from '@/lib/ws/protocol';

export interface RoomState {
  sessionName: string;
  status: string;
  currentRound: number;
  totalRounds: number;
  canvasWidth: number;
  canvasHeight: number;
  satelliteImagePath: string | null;
  roundTimeRemaining: number | null;
  roundDuration: number | null;
  paused: boolean;
  areaLabel: string;
  scenarioId: string | null;
  budget: { remaining: number; total: number } | null;
  actions: { remaining: number; limit: number } | null;
  refundRate: number | null;
  availableCategories: string[] | null;
  goals: { text: string; metric?: { category: string; threshold: number } }[] | null;
  scenarioName: string | null;
  // Mission system fields
  missionType: MissionType | null;
  missionTitle: string | null;
  missionNarrative: string | null;
  missionEcoLesson: string | null;
  objectives: MissionObjective[];
  starThresholds: StarThresholds | null;
  missionStars: number | null;
  starDetails: StarDetail[];
  objectivesCompleted: string[];
  activeMissionEvent: MissionEventData | null;
  totalMissions: number;
  // Retry fields
  teamCurrentRound: number;
  isBehind: boolean;
  retrying: boolean;
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
  roundDuration: null,
  paused: false,
  areaLabel: '',
  scenarioId: null,
  budget: null,
  actions: null,
  refundRate: null,
  availableCategories: null,
  goals: null,
  scenarioName: null,
  missionType: null,
  missionTitle: null,
  missionNarrative: null,
  missionEcoLesson: null,
  objectives: [],
  starThresholds: null,
  missionStars: null,
  starDetails: [],
  objectivesCompleted: [],
  activeMissionEvent: null,
  totalMissions: 0,
  teamCurrentRound: 0,
  isBehind: false,
  retrying: false,
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

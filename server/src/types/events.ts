// Socket.io event type definitions

import type { Placement, Player, Team, ZoneConfig, ScoreBreakdown } from './models';

// Client -> Server events
export interface ClientToServerEvents {
  // Room
  'room:join': (data: { roomCode: string; playerName: string }, callback: (res: JoinResponse) => void) => void;
  'room:rejoin': (data: { roomCode: string; playerId: string }, callback: (res: RejoinResponse) => void) => void;
  'room:leave': () => void;

  // Game
  'element:place': (data: PlaceElementData) => void;
  'element:move': (data: MoveElementData) => void;
  'element:remove': (data: { placementId: string }) => void;

  // Chat
  'chat:message': (data: { text: string }) => void;

  // Admin
  'admin:start-round': (data: { adminToken: string }) => void;
  'admin:end-round': (data: { adminToken: string }) => void;
  'admin:pause': (data: { adminToken: string }) => void;
  'admin:resume': (data: { adminToken: string }) => void;
}

// Server -> Client events
export interface ServerToClientEvents {
  // Room state
  'room:state': (data: RoomStateData) => void;
  'room:player-joined': (data: { player: Player }) => void;
  'room:player-left': (data: { playerId: string }) => void;
  'room:player-reconnected': (data: { playerId: string }) => void;
  'room:teams-assigned': (data: { teams: TeamWithPlayers[] }) => void;

  // Game state
  'game:round-start': (data: RoundStartData) => void;
  'game:round-end': (data: { round: number }) => void;
  'game:timer': (data: { remaining: number }) => void;
  'game:pause': () => void;
  'game:resume': (data: { remaining: number }) => void;

  // Elements
  'element:placed': (data: { placement: Placement }) => void;
  'element:moved': (data: { placementId: string; x: number; y: number }) => void;
  'element:removed': (data: { placementId: string }) => void;
  'element:rejected': (data: { reason: string; placementId?: string }) => void;

  // Scoring
  'score:update': (data: { teamId: string; scores: ScoreBreakdown }) => void;
  'score:final': (data: FinalScoreData) => void;

  // Chat
  'chat:message': (data: { playerId: string; playerName: string; text: string; timestamp: string }) => void;

  // Errors
  'error': (data: { message: string; code?: string }) => void;
}

// Data types for events
export interface JoinResponse {
  success: boolean;
  playerId?: string;
  sessionId?: string;
  error?: string;
}

export interface RejoinResponse {
  success: boolean;
  state?: RoomStateData;
  error?: string;
}

export interface RoomStateData {
  session: {
    id: string;
    roomCode: string;
    name: string;
    status: string;
    currentRound: number;
    totalRounds: number;
    canvasWidth: number;
    canvasHeight: number;
    satelliteImagePath: string | null;
  };
  players: Player[];
  teams: TeamWithPlayers[];
  placements: Placement[];
  scores: Record<string, ScoreBreakdown>;
  roundTimeRemaining?: number;
}

export interface TeamWithPlayers {
  team: Team;
  players: Player[];
  zoneConfig: ZoneConfig;
}

export interface PlaceElementData {
  elementType: string;
  x: number;
  y: number;
}

export interface MoveElementData {
  placementId: string;
  x: number;
  y: number;
}

export interface RoundStartData {
  round: number;
  duration: number;
  areaLabel: string;
}

export interface FinalScoreData {
  rankings: {
    teamId: string;
    teamName: string;
    autoScore: ScoreBreakdown;
    judgeScore?: {
      biodiversity: number;
      sustainability: number;
      aesthetics: number;
      ecosystemHealth: number;
      comments: string[];
    };
    finalScore: number;
    rank: number;
  }[];
}

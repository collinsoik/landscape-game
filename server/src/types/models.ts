// Shared type definitions for the landscape biodiversity game

export interface Session {
  id: string;
  roomCode: string;
  name: string;
  status: 'waiting' | 'playing' | 'judging' | 'finished';
  satelliteImagePath: string | null;
  currentRound: number;
  totalRounds: number;
  adminToken: string;
  judgeToken: string;
  canvasWidth: number;
  canvasHeight: number;
  createdAt: string;
}

export interface Player {
  id: string;
  sessionId: string;
  name: string;
  teamId: string | null;
  zoneIndex: number | null;
  connected: boolean;
  lastSeen: string;
}

export interface Team {
  id: string;
  sessionId: string;
  name: string;
  color: string;
  zoneConfig: string; // JSON: { cols, rows, zones: ZoneRect[] }
}

export interface ZoneRect {
  index: number;
  x: number;
  y: number;
  width: number;
  height: number;
  playerId: string | null;
}

export interface ZoneConfig {
  cols: number;
  rows: number;
  zones: ZoneRect[];
}

export interface Placement {
  id: string;
  sessionId: string;
  teamId: string;
  playerId: string;
  round: number;
  elementType: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zoneIndex: number;
  placedAt: string;
}

export interface AutoScore {
  id: string;
  sessionId: string;
  teamId: string;
  round: number;
  biodiversity: number;
  sustainability: number;
  aesthetics: number;
  ecosystemHealth: number;
  total: number;
  breakdown: string; // JSON: detailed breakdown
}

export interface JudgeScore {
  id: string;
  sessionId: string;
  teamId: string;
  round: number;
  judgeId: string;
  biodiversity: number;
  sustainability: number;
  aesthetics: number;
  ecosystemHealth: number;
  comment: string;
  scoredAt: string;
}

export interface Round {
  id: string;
  sessionId: string;
  roundNumber: number;
  status: 'pending' | 'active' | 'judging' | 'completed';
  startedAt: string | null;
  endedAt: string | null;
  durationSeconds: number;
  areaLabel: string;
}

// Element catalog types
export interface ElementDefinition {
  type: string;
  name: string;
  category: ElementCategory;
  description: string;
  spriteKey: string;
  width: number;
  height: number;
  baseScores: {
    biodiversity: number;
    sustainability: number;
    aesthetics: number;
    ecosystemHealth: number;
  };
  properties: ElementProperties;
}

export type ElementCategory =
  | 'trees'
  | 'shrubs'
  | 'flowers'
  | 'ground_cover'
  | 'water_features'
  | 'structures'
  | 'wildlife_habitat'
  | 'invasive';

export interface ElementProperties {
  isNative: boolean;
  providesShade: boolean;
  attractsPollinators: boolean;
  waterAbsorption: number; // 0-10
  carbonSequestration: number; // 0-10
  wildlifeValue: number; // 0-10
  shadeRequirement: 'full_sun' | 'partial_shade' | 'full_shade' | 'any';
  waterRequirement: 'low' | 'medium' | 'high';
  maxCount?: number; // per zone
}

export interface InteractionRule {
  elementA: string;
  elementB: string;
  radius: number;
  effect: 'synergy' | 'conflict';
  scoreCategory: keyof AutoScore;
  value: number;
  description: string;
}

export interface EcosystemPattern {
  name: string;
  description: string;
  requiredElements: { type: string; minCount: number }[];
  maxRadius: number;
  bonusPoints: number;
  category: keyof Pick<AutoScore, 'biodiversity' | 'sustainability' | 'aesthetics' | 'ecosystemHealth'>;
}

export interface ScoreBreakdown {
  base: {
    biodiversity: number;
    sustainability: number;
    aesthetics: number;
    ecosystemHealth: number;
  };
  interactions: {
    rule: string;
    value: number;
    category: string;
  }[];
  patterns: {
    name: string;
    bonus: number;
    category: string;
  }[];
  crossZoneBonus: number;
  diversityBonus: number;
  total: {
    biodiversity: number;
    sustainability: number;
    aesthetics: number;
    ecosystemHealth: number;
    grand: number;
  };
}

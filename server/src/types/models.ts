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
  scenarioId: string | null;
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
  currentRound: number;
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
  isPrePlaced: boolean;
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

export type ScoreCategory = 'biodiversity' | 'sustainability' | 'aesthetics' | 'ecosystemHealth';

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
  budget: number | null;
  availableCategories: string[] | null;
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
  cost: number; // 1-3 coins
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
  scoreCategory: ScoreCategory;
  value: number;
  description: string;
}

export interface EcosystemPattern {
  name: string;
  description: string;
  requiredElements: { type: string; minCount: number }[];
  maxRadius: number;
  bonusPoints: number;
  category: ScoreCategory;
}

// === Mission System Types ===

export type MissionType = 'build' | 'fix' | 'survive' | 'discover' | 'race' | 'restore';

export interface MissionObjective {
  id: string;
  text: string;
  condition: ObjectiveCondition;
}

export type ObjectiveCondition =
  | { type: 'min_score'; category?: ScoreCategory; threshold: number }
  | { type: 'pattern'; patternName: string }
  | { type: 'min_synergies'; count: number }
  | { type: 'no_conflicts' }
  | { type: 'remove_all_invasives' }
  | { type: 'min_patterns'; count: number };

export interface StarThresholds {
  oneStar: StarCondition;
  twoStar: StarCondition;
  threeStar: StarCondition;
}

export interface StarCondition {
  objectives?: string[];
  minScore?: number;
  minCategoryScore?: { category: ScoreCategory; threshold: number };
  minSynergies?: number;
  maxCoinsSpent?: number;
  noConflicts?: boolean;
}

export interface MidMissionEventConfig {
  eventType: 'drought' | 'invasive_spawn' | 'budget_cut' | 'wind_storm' | 'pollinator_boost';
  triggerType: 'time' | 'condition';
  triggerTime?: number;
  triggerCondition?: 'first_synergy' | 'half_budget_spent';
}

export interface MissionEventData {
  eventType: string;
  title: string;
  message: string;
  affectedPlacements?: string[];
  severity: 'info' | 'warning' | 'danger';
}

export interface StarDetail {
  star: number;
  earned: boolean;
  reason: string;
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

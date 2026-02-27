// Scenario definitions for the landscape biodiversity game
// This file is imported by both frontend and server, so avoid @/ path aliases

export type ElementCategory =
  | 'trees'
  | 'shrubs'
  | 'flowers'
  | 'ground_cover'
  | 'water_features'
  | 'structures'
  | 'wildlife_habitat'
  | 'invasive';

export type ScoreCategory = 'biodiversity' | 'sustainability' | 'aesthetics' | 'ecosystemHealth';

export interface ScenarioRound {
  budget: number; // 0 = unlimited
  actionLimit: number; // 0 = unlimited
  refundRate: number; // 0.0 to 1.0 (1.0 = full refund)
  availableCategories: ElementCategory[];
  startingPlacements: { elementType: string; x: number; y: number }[];
  goal: { text: string; metric?: { category: ScoreCategory; threshold: number } };
  durationSeconds: number;
  label: string;
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  totalRounds: number;
  rounds: ScenarioRound[];
}

export const SCENARIOS: Scenario[] = [
  // 1. Neighborhood Park — Progressive intro (Beginner)
  {
    id: 'neighborhood_park',
    name: 'Neighborhood Park',
    description: 'Start simple and build up! Learn the basics of landscape design one step at a time.',
    difficulty: 'beginner',
    totalRounds: 3,
    rounds: [
      {
        budget: 8,
        actionLimit: 15,
        refundRate: 0.75,
        availableCategories: ['flowers', 'ground_cover'],
        startingPlacements: [],
        goal: { text: 'Plant a colorful meadow — score 25+', metric: { category: 'aesthetics', threshold: 25 } },
        durationSeconds: 480,
        label: 'Meadow Basics',
      },
      {
        budget: 10,
        actionLimit: 18,
        refundRate: 0.75,
        availableCategories: ['flowers', 'ground_cover', 'trees', 'shrubs'],
        startingPlacements: [],
        goal: { text: 'Add trees and shrubs — create a Native Meadow pattern' },
        durationSeconds: 540,
        label: 'Growing the Park',
      },
      {
        budget: 14,
        actionLimit: 22,
        refundRate: 0.5,
        availableCategories: ['trees', 'shrubs', 'flowers', 'ground_cover', 'water_features', 'structures', 'wildlife_habitat', 'invasive'],
        startingPlacements: [],
        goal: { text: 'Create a Bird Sanctuary — score 100+', metric: { category: 'ecosystemHealth', threshold: 100 } },
        durationSeconds: 600,
        label: 'Full Landscape',
      },
    ],
  },

  // 2. Invasive Takeover — Broken landscape (Intermediate)
  {
    id: 'invasive_takeover',
    name: 'Invasive Takeover',
    description: 'The park is overrun with invasive species! Remove them and restore the ecosystem.',
    difficulty: 'intermediate',
    totalRounds: 3,
    rounds: [
      {
        budget: 10,
        actionLimit: 18,
        refundRate: 0.5,
        availableCategories: ['flowers', 'ground_cover', 'trees'],
        startingPlacements: [
          { elementType: 'invasive_vine', x: 150, y: 200 },
          { elementType: 'invasive_vine', x: 450, y: 350 },
          { elementType: 'invasive_vine', x: 750, y: 150 },
          { elementType: 'invasive_vine', x: 900, y: 500 },
          { elementType: 'invasive_grass', x: 300, y: 450 },
          { elementType: 'invasive_grass', x: 600, y: 600 },
          { elementType: 'invasive_grass', x: 1000, y: 300 },
        ],
        goal: { text: 'Remove all invasives & score positive' },
        durationSeconds: 540,
        label: 'Clear the Invasives',
      },
      {
        budget: 12,
        actionLimit: 18,
        refundRate: 0.5,
        availableCategories: ['flowers', 'ground_cover', 'trees', 'shrubs', 'water_features'],
        startingPlacements: [
          { elementType: 'invasive_vine', x: 200, y: 300 },
          { elementType: 'invasive_grass', x: 800, y: 400 },
        ],
        goal: { text: 'Build a Woodland Edge pattern — score 60+', metric: { category: 'biodiversity', threshold: 60 } },
        durationSeconds: 540,
        label: 'Rebuild & Defend',
      },
      {
        budget: 14,
        actionLimit: 22,
        refundRate: 0.5,
        availableCategories: ['trees', 'shrubs', 'flowers', 'ground_cover', 'water_features', 'structures', 'wildlife_habitat', 'invasive'],
        startingPlacements: [],
        goal: { text: 'Achieve 2 ecosystem patterns — score 120+', metric: { category: 'ecosystemHealth', threshold: 120 } },
        durationSeconds: 600,
        label: 'Thriving Ecosystem',
      },
    ],
  },

  // 3. Budget Crunch — Tight optimization (Advanced)
  {
    id: 'budget_crunch',
    name: 'Budget Crunch',
    description: 'Limited funds, big goals. Every coin counts — optimize your landscape!',
    difficulty: 'advanced',
    totalRounds: 2,
    rounds: [
      {
        budget: 7,
        actionLimit: 12,
        refundRate: 0.25,
        availableCategories: ['trees', 'flowers', 'ground_cover', 'shrubs'],
        startingPlacements: [],
        goal: { text: 'Score 50+ with only 7 coins', metric: { category: 'biodiversity', threshold: 50 } },
        durationSeconds: 480,
        label: 'Tight Budget',
      },
      {
        budget: 8,
        actionLimit: 14,
        refundRate: 0.25,
        availableCategories: ['trees', 'flowers', 'ground_cover', 'shrubs', 'water_features', 'structures'],
        startingPlacements: [],
        goal: { text: 'Score 90+ and achieve 1 ecosystem pattern', metric: { category: 'ecosystemHealth', threshold: 90 } },
        durationSeconds: 540,
        label: 'Stretch Goals',
      },
    ],
  },

  // 4. Restore the Wetland — Partial landscape (Intermediate)
  {
    id: 'restore_wetland',
    name: 'Restore the Wetland',
    description: 'A pond and some grass are all that remain. Build a thriving wetland ecosystem!',
    difficulty: 'intermediate',
    totalRounds: 3,
    rounds: [
      {
        budget: 10,
        actionLimit: 16,
        refundRate: 0.75,
        availableCategories: ['ground_cover', 'flowers'],
        startingPlacements: [
          { elementType: 'small_pond', x: 500, y: 350 },
          { elementType: 'native_grass', x: 420, y: 300 },
        ],
        goal: { text: 'Build a Rain Garden Ecosystem around the pond', metric: { category: 'sustainability', threshold: 30 } },
        durationSeconds: 480,
        label: 'Wetland Foundation',
      },
      {
        budget: 12,
        actionLimit: 18,
        refundRate: 0.5,
        availableCategories: ['ground_cover', 'flowers', 'shrubs', 'trees'],
        startingPlacements: [],
        goal: { text: 'Score 30+ in sustainability', metric: { category: 'sustainability', threshold: 30 } },
        durationSeconds: 540,
        label: 'Adding Structure',
      },
      {
        budget: 14,
        actionLimit: 22,
        refundRate: 0.5,
        availableCategories: ['trees', 'shrubs', 'flowers', 'ground_cover', 'water_features', 'structures', 'wildlife_habitat', 'invasive'],
        startingPlacements: [],
        goal: { text: 'Achieve 3 ecosystem patterns — score 150+', metric: { category: 'ecosystemHealth', threshold: 150 } },
        durationSeconds: 600,
        label: 'Full Wetland',
      },
    ],
  },

  // 5. Free Play — Current sandbox behavior (default)
  {
    id: 'free_play',
    name: 'Free Play',
    description: 'No budget limits, no locked elements. Build whatever you want!',
    difficulty: 'beginner',
    totalRounds: 2,
    rounds: [
      {
        budget: 0,
        actionLimit: 0,
        refundRate: 1.0,
        availableCategories: ['trees', 'shrubs', 'flowers', 'ground_cover', 'water_features', 'structures', 'wildlife_habitat', 'invasive'],
        startingPlacements: [],
        goal: { text: 'Build your dream landscape!' },
        durationSeconds: 600,
        label: 'Round 1',
      },
      {
        budget: 0,
        actionLimit: 0,
        refundRate: 1.0,
        availableCategories: ['trees', 'shrubs', 'flowers', 'ground_cover', 'water_features', 'structures', 'wildlife_habitat', 'invasive'],
        startingPlacements: [],
        goal: { text: 'Keep improving your landscape!' },
        durationSeconds: 600,
        label: 'Round 2',
      },
    ],
  },
];

export function getScenario(id: string): Scenario | undefined {
  return SCENARIOS.find((s) => s.id === id);
}

export function getScenarioRound(scenarioId: string, roundNumber: number): ScenarioRound | undefined {
  const scenario = getScenario(scenarioId);
  if (!scenario) return undefined;
  return scenario.rounds[roundNumber - 1];
}

// ─── Campaign Definitions (for room creation UI) ───

export interface CampaignInfo {
  id: string;
  name: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  totalMissions: number;
  chapters: { name: string; missionCount: number; unlockStars: number }[];
}

export const CAMPAIGNS: CampaignInfo[] = [
  {
    id: 'greenfield_park',
    name: 'Greenfield Park',
    description: 'Learn ecology through quick puzzle missions! Build gardens, fix problems, and survive dramatic events.',
    difficulty: 'beginner',
    totalMissions: 12,
    chapters: [
      { name: 'First Seeds', missionCount: 4, unlockStars: 0 },
      { name: 'Growing Pains', missionCount: 4, unlockStars: 6 },
      { name: 'Master Ecologist', missionCount: 4, unlockStars: 14 },
    ],
  },
  {
    id: 'invasive_takeover_campaign',
    name: 'Invasive Takeover',
    description: 'The park is overrun with invasive species! Clear, rebuild, and defend across 6 intense missions.',
    difficulty: 'intermediate',
    totalMissions: 6,
    chapters: [
      { name: 'Clear the Invasion', missionCount: 2, unlockStars: 0 },
      { name: 'Rebuild & Defend', missionCount: 2, unlockStars: 3 },
      { name: 'Thriving Ecosystem', missionCount: 2, unlockStars: 8 },
    ],
  },
];

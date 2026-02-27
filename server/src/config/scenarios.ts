// Server-side scenario definitions
// Duplicated from config/scenarios.ts to avoid rootDir issues (same pattern as ElementCatalog)

import type { ElementCategory, ScoreCategory, MissionType, MissionObjective, StarThresholds, MidMissionEventConfig } from '../types/models';

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

// === Mission System Types ===

export interface MissionConfig {
  id: string;
  missionType: MissionType;
  title: string;
  narrative: string;
  ecoLesson: string;

  // Inherited from ScenarioRound (unchanged):
  budget: number;
  actionLimit: number;
  refundRate: number;
  availableCategories: ElementCategory[];
  startingPlacements: { elementType: string; x: number; y: number }[];
  durationSeconds: number;

  // New mission fields:
  availableElements?: string[];
  objectives: MissionObjective[];
  starThresholds: StarThresholds;
  midMissionEvents?: MidMissionEventConfig[];
}

export interface CampaignChapter {
  id: string;
  name: string;
  missions: MissionConfig[];
  unlockStars: number;
}

export interface Campaign {
  id: string;
  name: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  chapters: CampaignChapter[];
}

// === Legacy Scenarios ===

export const SCENARIOS: Scenario[] = [
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
        goal: { text: 'Plant a colorful meadow — score 18+', metric: { category: 'aesthetics', threshold: 18 } },
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
        goal: { text: 'Create a Bird Sanctuary — score 70+', metric: { category: 'ecosystemHealth', threshold: 70 } },
        durationSeconds: 600,
        label: 'Full Landscape',
      },
    ],
  },
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
        goal: { text: 'Build a Woodland Edge pattern — score 42+', metric: { category: 'biodiversity', threshold: 42 } },
        durationSeconds: 540,
        label: 'Rebuild & Defend',
      },
      {
        budget: 14,
        actionLimit: 22,
        refundRate: 0.5,
        availableCategories: ['trees', 'shrubs', 'flowers', 'ground_cover', 'water_features', 'structures', 'wildlife_habitat', 'invasive'],
        startingPlacements: [],
        goal: { text: 'Achieve 2 ecosystem patterns — score 85+', metric: { category: 'ecosystemHealth', threshold: 85 } },
        durationSeconds: 600,
        label: 'Thriving Ecosystem',
      },
    ],
  },
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
        goal: { text: 'Score 35+ with only 7 coins', metric: { category: 'biodiversity', threshold: 35 } },
        durationSeconds: 480,
        label: 'Tight Budget',
      },
      {
        budget: 8,
        actionLimit: 14,
        refundRate: 0.25,
        availableCategories: ['trees', 'flowers', 'ground_cover', 'shrubs', 'water_features', 'structures'],
        startingPlacements: [],
        goal: { text: 'Score 65+ and achieve 1 ecosystem pattern', metric: { category: 'ecosystemHealth', threshold: 65 } },
        durationSeconds: 540,
        label: 'Stretch Goals',
      },
    ],
  },
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
        goal: { text: 'Build a Rain Garden Ecosystem around the pond', metric: { category: 'sustainability', threshold: 22 } },
        durationSeconds: 480,
        label: 'Wetland Foundation',
      },
      {
        budget: 12,
        actionLimit: 18,
        refundRate: 0.5,
        availableCategories: ['ground_cover', 'flowers', 'shrubs', 'trees'],
        startingPlacements: [],
        goal: { text: 'Score 22+ in sustainability', metric: { category: 'sustainability', threshold: 22 } },
        durationSeconds: 540,
        label: 'Adding Structure',
      },
      {
        budget: 14,
        actionLimit: 22,
        refundRate: 0.5,
        availableCategories: ['trees', 'shrubs', 'flowers', 'ground_cover', 'water_features', 'structures', 'wildlife_habitat', 'invasive'],
        startingPlacements: [],
        goal: { text: 'Achieve 3 ecosystem patterns — score 105+', metric: { category: 'ecosystemHealth', threshold: 105 } },
        durationSeconds: 600,
        label: 'Full Wetland',
      },
    ],
  },
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

// === Campaign helpers ===

/**
 * Convert a MissionConfig to a ScenarioRound for backward compatibility.
 */
export function missionToScenarioRound(mission: MissionConfig): ScenarioRound {
  return {
    budget: mission.budget,
    actionLimit: mission.actionLimit,
    refundRate: mission.refundRate,
    availableCategories: mission.availableCategories,
    startingPlacements: mission.startingPlacements,
    goal: {
      text: mission.objectives[0]?.text ?? mission.title,
      metric: mission.objectives[0]?.condition.type === 'min_score'
        ? {
            category: (mission.objectives[0].condition as { type: 'min_score'; category?: ScoreCategory; threshold: number }).category ?? 'ecosystemHealth',
            threshold: (mission.objectives[0].condition as { type: 'min_score'; threshold: number }).threshold,
          }
        : undefined,
    },
    durationSeconds: mission.durationSeconds,
    label: mission.title,
  };
}

/**
 * Convert a Campaign to a Scenario for backward compatibility.
 */
export function campaignToScenario(campaign: Campaign): Scenario {
  const allMissions = campaign.chapters.flatMap((ch) => ch.missions);
  return {
    id: campaign.id,
    name: campaign.name,
    description: campaign.description,
    difficulty: campaign.difficulty,
    totalRounds: allMissions.length,
    rounds: allMissions.map(missionToScenarioRound),
  };
}

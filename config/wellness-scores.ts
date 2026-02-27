// Wellness score configuration — people & bird impact scores for landscape elements

/** Base contribution of each element to people and bird scores */
export const WELLNESS_BASE_SCORES: Record<string, { people: number; bird: number }> = {
  oak_tree:          { people: 1, bird: 3 },
  maple_tree:        { people: 2, bird: 2 },
  pine_tree:         { people: 1, bird: 3 },
  fruit_tree:        { people: 3, bird: 2 },
  wildflower_patch:  { people: 2, bird: 2 },
  sunflower_cluster: { people: 3, bird: 1 },
  shade_fern:        { people: 1, bird: 1 },
  birdhouse:         { people: 1, bird: 3 },
  birdbath:          { people: 1, bird: 3 },
  insect_hotel:      { people: 1, bird: 1 },
  log_pile:          { people: 0, bird: 2 },
  bench:             { people: 3, bird: 0 },
};

const TREE_TYPES = ['oak_tree', 'maple_tree', 'pine_tree', 'fruit_tree'];

export interface SynergyRule {
  elementA: string | string[];
  elementB: string | string[];
  bonus: { people: number; bird: number };
  radius: number;
}

/** Proximity synergies — bonus when elements are within radius (px) */
export const SYNERGY_RULES: SynergyRule[] = [
  // Bird synergies
  { elementA: ['birdbath'],      elementB: TREE_TYPES,                bonus: { people: 0, bird: 2 }, radius: 200 },
  { elementA: ['birdhouse'],     elementB: TREE_TYPES,                bonus: { people: 0, bird: 2 }, radius: 200 },
  { elementA: ['birdbath'],      elementB: ['birdhouse'],             bonus: { people: 0, bird: 1 }, radius: 200 },
  { elementA: ['log_pile'],      elementB: TREE_TYPES,                bonus: { people: 0, bird: 1 }, radius: 200 },
  { elementA: ['insect_hotel'],  elementB: ['birdhouse'],             bonus: { people: 0, bird: 1 }, radius: 200 },
  // People synergies
  { elementA: ['bench'], elementB: ['sunflower_cluster', 'wildflower_patch'], bonus: { people: 2, bird: 0 }, radius: 200 },
  { elementA: ['bench'], elementB: ['birdbath'],                              bonus: { people: 2, bird: 0 }, radius: 200 },
  { elementA: ['bench'], elementB: ['fruit_tree', 'maple_tree'],              bonus: { people: 2, bird: 0 }, radius: 200 },
  { elementA: ['fruit_tree'],    elementB: ['wildflower_patch'],              bonus: { people: 1, bird: 0 }, radius: 200 },
];

export interface PenaltyRule {
  elementA: string | string[];
  elementB: string | string[];
  penalty: { people: number; bird: number };
  closeRadius: number;
  farRadius: number;
}

/** Penalties — full penalty within closeRadius, linear falloff to 0 at farRadius */
export const PENALTY_RULES: PenaltyRule[] = [
  { elementA: ['bench'], elementB: ['birdhouse'], penalty: { people: 0, bird: 2 }, closeRadius: 150, farRadius: 300 },
  { elementA: ['bench'], elementB: ['log_pile'],  penalty: { people: 1, bird: 1 }, closeRadius: 150, farRadius: 300 },
];

export interface WellnessLabel {
  min: number;
  max: number;
  label: string;
  color: string;
}

export const WELLNESS_LABELS: WellnessLabel[] = [
  { min: 0,  max: 3,  label: 'Unhappy',  color: '#c0392b' },
  { min: 4,  max: 7,  label: 'Uneasy',   color: '#d4793a' },
  { min: 8,  max: 11, label: 'Content',   color: '#d4b83a' },
  { min: 12, max: 15, label: 'Happy',     color: '#6a9a4a' },
  { min: 16, max: 20, label: 'Thriving',  color: '#2ecc71' },
];

export function getWellnessLabel(score: number): WellnessLabel {
  return WELLNESS_LABELS.find((l) => score >= l.min && score <= l.max) ?? WELLNESS_LABELS[0];
}

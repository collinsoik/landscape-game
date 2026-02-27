export interface RoundConfig {
  round: number;
  category: string;
  cap: number;
  elements: string[];
  starCriteria: StarCriteria[];
}

export interface StarCriteria {
  stars: number;
  description: string;
  check: (placements: { elementType: string }[]) => boolean;
}

export interface ProximityRequirement {
  element: string;
  requiresNearby: string[];
  maxDistance: number;
  description: string;
}

export const ROUNDS: RoundConfig[] = [
  {
    round: 1,
    category: 'Trees',
    cap: 4,
    elements: ['oak_tree', 'maple_tree', 'pine_tree', 'fruit_tree'],
    starCriteria: [
      {
        stars: 1,
        description: 'Place at least 1 tree',
        check: (p) => p.length >= 1,
      },
      {
        stars: 2,
        description: 'Place at least 3 trees',
        check: (p) => p.length >= 3,
      },
      {
        stars: 3,
        description: 'Place 4 trees with at least 2 different species',
        check: (p) => p.length >= 4 && new Set(p.map(e => e.elementType)).size >= 2,
      },
    ],
  },
  {
    round: 2,
    category: 'Decorations',
    cap: 4,
    elements: ['birdhouse', 'birdbath', 'insect_hotel', 'log_pile'],
    starCriteria: [
      {
        stars: 1,
        description: 'Place at least 1 decoration',
        check: (p) => p.length >= 1,
      },
      {
        stars: 2,
        description: 'Place at least 3 decorations',
        check: (p) => p.length >= 3,
      },
      {
        stars: 3,
        description: 'Place 4 decorations including a birdhouse',
        check: (p) => p.length >= 4 && p.some(e => e.elementType === 'birdhouse'),
      },
    ],
  },
  {
    round: 3,
    category: 'Flowers',
    cap: 4,
    elements: ['wildflower_patch', 'sunflower_cluster', 'shade_fern'],
    starCriteria: [
      {
        stars: 1,
        description: 'Place at least 1 flower',
        check: (p) => p.length >= 1,
      },
      {
        stars: 2,
        description: 'Place at least 3 flowers',
        check: (p) => p.length >= 3,
      },
      {
        stars: 3,
        description: 'Place 4 flowers with at least 2 different species',
        check: (p) => p.length >= 4 && new Set(p.map(e => e.elementType)).size >= 2,
      },
    ],
  },
];

export const PROXIMITY_REQUIREMENTS: ProximityRequirement[] = [
  {
    element: 'insect_hotel',
    requiresNearby: ['wildflower_patch', 'sunflower_cluster', 'shade_fern'],
    maxDistance: 150,
    description: 'Place near flowers to unlock',
  },
];

export const AWARDS = ['Most Beautiful', 'Most Eco-Friendly', 'Most Creative'] as const;
export type Award = (typeof AWARDS)[number];

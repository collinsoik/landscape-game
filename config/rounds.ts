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
    category: 'Flowers',
    cap: 4,
    elements: ['wildflower_patch', 'sunflower', 'shade_fern'],
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
  {
    round: 3,
    category: 'Shrubs',
    cap: 3,
    elements: ['native_shrub', 'berry_bush', 'hedge_row'],
    starCriteria: [
      {
        stars: 1,
        description: 'Place at least 1 shrub',
        check: (p) => p.length >= 1,
      },
      {
        stars: 2,
        description: 'Place at least 2 shrubs',
        check: (p) => p.length >= 2,
      },
      {
        stars: 3,
        description: 'Place 3 shrubs with at least 2 different species',
        check: (p) => p.length >= 3 && new Set(p.map(e => e.elementType)).size >= 2,
      },
    ],
  },
  {
    round: 4,
    category: 'Objects',
    cap: 3,
    elements: ['birdhouse', 'insect_hotel', 'compost_bin'],
    starCriteria: [
      {
        stars: 1,
        description: 'Place at least 1 object',
        check: (p) => p.length >= 1,
      },
      {
        stars: 2,
        description: 'Place at least 2 objects',
        check: (p) => p.length >= 2,
      },
      {
        stars: 3,
        description: 'Place 3 objects with insect hotel near flowers',
        check: (p) => {
          if (p.length < 3) return false;
          return p.some(e => e.elementType === 'insect_hotel');
        },
      },
    ],
  },
];

export const PROXIMITY_REQUIREMENTS: ProximityRequirement[] = [
  {
    element: 'insect_hotel',
    requiresNearby: ['wildflower_patch', 'sunflower', 'shade_fern'],
    maxDistance: 150,
    description: 'Place near flowers to unlock',
  },
];

export const AWARDS = ['Most Beautiful', 'Most Eco-Friendly', 'Most Creative'] as const;
export type Award = (typeof AWARDS)[number];

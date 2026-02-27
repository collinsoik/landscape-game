// Landscape background catalog — purely visual backgrounds for the game canvas

export type LandscapeId = 'meadow' | 'riverside' | 'rocky-hills' | 'lakeside' | 'coastal';

export interface LandscapeDef {
  id: LandscapeId;
  name: string;
  description: string;
}

export const LANDSCAPE_CATALOG: LandscapeDef[] = [
  {
    id: 'meadow',
    name: 'Meadow',
    description: 'A lush green meadow with wildflower dots and rolling terrain',
  },
  {
    id: 'riverside',
    name: 'Riverside',
    description: 'Grassy terrain with a winding stream cutting across',
  },
  {
    id: 'rocky-hills',
    name: 'Rocky Hills',
    description: 'Green hills scattered with gray and brown boulders',
  },
  {
    id: 'lakeside',
    name: 'Lakeside',
    description: 'A peaceful landscape with a large pond',
  },
  {
    id: 'coastal',
    name: 'Coastal',
    description: 'Grassy cliffs giving way to sandy beach and ocean',
  },
];

export const DEFAULT_LANDSCAPE: LandscapeId = 'meadow';

export function getLandscapeDef(id: string): LandscapeDef | undefined {
  return LANDSCAPE_CATALOG.find((l) => l.id === id);
}

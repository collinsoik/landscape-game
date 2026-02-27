import type { Placement } from '../types/models';

interface Point {
  x: number;
  y: number;
}

function centerOf(p: Placement): Point {
  return { x: p.x + p.width / 2, y: p.y + p.height / 2 };
}

function distance(a: Point, b: Point): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Find all placements within a given radius of a target point.
 */
export function findWithinRadius(
  placements: Placement[],
  target: Point,
  radius: number,
  excludeId?: string
): Placement[] {
  return placements.filter((p) => {
    if (excludeId && p.id === excludeId) return false;
    return distance(centerOf(p), target) <= radius;
  });
}

/**
 * Find all placement pairs where the distance between their centers is within the given radius.
 * Returns each pair only once (no duplicates).
 */
export function findPairsWithinRadius(
  placements: Placement[],
  radius: number
): { a: Placement; b: Placement; dist: number }[] {
  const pairs: { a: Placement; b: Placement; dist: number }[] = [];
  for (let i = 0; i < placements.length; i++) {
    for (let j = i + 1; j < placements.length; j++) {
      const d = distance(centerOf(placements[i]), centerOf(placements[j]));
      if (d <= radius) {
        pairs.push({ a: placements[i], b: placements[j], dist: d });
      }
    }
  }
  return pairs;
}

/**
 * Find placements of specific types within radius of a point.
 */
export function findTypeWithinRadius(
  placements: Placement[],
  target: Point,
  radius: number,
  elementType: string
): Placement[] {
  return placements.filter((p) => {
    if (p.elementType !== elementType) return false;
    return distance(centerOf(p), target) <= radius;
  });
}

/**
 * Compute the centroid of a set of placements.
 */
export function centroid(placements: Placement[]): Point {
  if (placements.length === 0) return { x: 0, y: 0 };
  let sx = 0, sy = 0;
  for (const p of placements) {
    const c = centerOf(p);
    sx += c.x;
    sy += c.y;
  }
  return { x: sx / placements.length, y: sy / placements.length };
}

/**
 * Check if all placements fit within a given radius from their centroid.
 */
export function fitsInRadius(placements: Placement[], maxRadius: number): boolean {
  if (placements.length <= 1) return true;
  const c = centroid(placements);
  return placements.every((p) => distance(centerOf(p), c) <= maxRadius);
}

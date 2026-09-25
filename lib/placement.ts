import type { LocalPlacement } from './types';

// Two sprite pixels of tolerance catch finger jitter without imposing spacing
// between neighboring plants. Different kinds of objects may still overlap.
const DUPLICATE_DISTANCE = 6;

export function hasDuplicatePlacement(
  placements: LocalPlacement[], elementType: string, x: number, y: number, exceptId?: string,
): boolean {
  return placements.some((p) => p.id !== exceptId && p.elementType === elementType &&
    Math.hypot(p.x - x, p.y - y) <= DUPLICATE_DISTANCE);
}

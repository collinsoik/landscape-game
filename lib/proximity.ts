import { PROXIMITY_REQUIREMENTS } from '@/config/rounds';
import { LocalPlacement } from '@/lib/types';

function distance(a: { x: number; y: number; width: number; height: number }, b: { x: number; y: number; width: number; height: number }): number {
  const aCenterX = a.x + a.width / 2;
  const aCenterY = a.y + a.height / 2;
  const bCenterX = b.x + b.width / 2;
  const bCenterY = b.y + b.height / 2;
  return Math.sqrt((aCenterX - bCenterX) ** 2 + (aCenterY - bCenterY) ** 2);
}

export function isElementUnlocked(elementType: string, placements: LocalPlacement[]): boolean {
  const req = PROXIMITY_REQUIREMENTS.find((r) => r.element === elementType);
  if (!req) return true; // No proximity requirement

  // Check if any qualifying nearby element exists
  return placements.some(
    (p) => req.requiresNearby.includes(p.elementType)
  );
}

export function getProximityDescription(elementType: string): string | null {
  const req = PROXIMITY_REQUIREMENTS.find((r) => r.element === elementType);
  return req?.description ?? null;
}

// Zone validation — checks if a point is within a zone rectangle

import type { ZoneRect } from '@/server/src/types/models';

/** Returns true if the point (px, py) is inside the given zone rectangle. */
export function isPointInZone(px: number, py: number, zone: ZoneRect): boolean {
  return (
    px >= zone.x &&
    px < zone.x + zone.width &&
    py >= zone.y &&
    py < zone.y + zone.height
  );
}

/** Finds the zone containing the given point, or undefined if none. */
export function findZoneAt(
  px: number,
  py: number,
  zones: ZoneRect[],
): ZoneRect | undefined {
  return zones.find((z) => isPointInZone(px, py, z));
}

/**
 * Clamps an element position so it stays within the given zone,
 * accounting for element width/height.
 */
export function clampToZone(
  x: number,
  y: number,
  elWidth: number,
  elHeight: number,
  zone: ZoneRect,
): { x: number; y: number } {
  return {
    x: Math.max(zone.x, Math.min(x, zone.x + zone.width - elWidth)),
    y: Math.max(zone.y, Math.min(y, zone.y + zone.height - elHeight)),
  };
}

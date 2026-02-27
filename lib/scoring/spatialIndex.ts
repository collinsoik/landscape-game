// Simple spatial index for finding nearby elements on the canvas

export interface SpatialElement {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Find all elements within a given radius of a target point.
 * Uses center-to-center distance calculation.
 */
export function findNearby(
  elements: SpatialElement[],
  targetX: number,
  targetY: number,
  radius: number,
  excludeId?: string
): SpatialElement[] {
  return elements.filter((el) => {
    if (el.id === excludeId) return false;
    const cx = el.x + el.width / 2;
    const cy = el.y + el.height / 2;
    const dist = Math.sqrt((cx - targetX) ** 2 + (cy - targetY) ** 2);
    return dist <= radius;
  });
}

/**
 * Calculate center-to-center distance between two elements.
 */
export function elementDistance(a: SpatialElement, b: SpatialElement): number {
  const ax = a.x + a.width / 2;
  const ay = a.y + a.height / 2;
  const bx = b.x + b.width / 2;
  const by = b.y + b.height / 2;
  return Math.sqrt((ax - bx) ** 2 + (ay - by) ** 2);
}

/**
 * Check if all given elements are within maxRadius of each other (cluster check).
 * Used for ecosystem pattern detection.
 */
export function isCluster(elements: SpatialElement[], maxRadius: number): boolean {
  for (let i = 0; i < elements.length; i++) {
    for (let j = i + 1; j < elements.length; j++) {
      if (elementDistance(elements[i], elements[j]) > maxRadius) {
        return false;
      }
    }
  }
  return true;
}

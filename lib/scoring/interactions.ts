// Client-side interaction checking for preview scores

import { INTERACTION_RULES } from '@/config/scoring-rules';
import { elementDistance, type SpatialElement } from './spatialIndex';

export interface ActiveInteraction {
  elementAId: string;
  elementBId: string;
  rule: typeof INTERACTION_RULES[number];
  distance: number;
}

/**
 * Find all active interactions between placed elements.
 * Returns list of active synergy/conflict pairs.
 */
export function findActiveInteractions(
  elements: (SpatialElement & { type: string })[]
): ActiveInteraction[] {
  const interactions: ActiveInteraction[] = [];

  for (let i = 0; i < elements.length; i++) {
    for (let j = i + 1; j < elements.length; j++) {
      const a = elements[i];
      const b = elements[j];
      const dist = elementDistance(a, b);

      // Check both orderings (A-B and B-A) against rules
      for (const rule of INTERACTION_RULES) {
        const matches =
          (a.type === rule.elementA && b.type === rule.elementB) ||
          (a.type === rule.elementB && b.type === rule.elementA);

        if (matches && dist <= rule.radius) {
          interactions.push({
            elementAId: a.id,
            elementBId: b.id,
            rule,
            distance: dist,
          });
        }
      }
    }
  }

  return interactions;
}

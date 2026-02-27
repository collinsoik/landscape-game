// Pure calculation of people & bird wellness scores from placements

import type { LocalPlacement } from '@/lib/types';
import { elementDistance, type SpatialElement } from '@/lib/scoring/spatialIndex';
import {
  WELLNESS_BASE_SCORES,
  SYNERGY_RULES,
  PENALTY_RULES,
  getWellnessLabel,
} from '@/config/wellness-scores';

export interface WellnessScores {
  peopleScore: number;
  birdScore: number;
  peopleLabel: string;
  birdLabel: string;
  peopleColor: string;
  birdColor: string;
}

function matchesGroup(elementType: string, group: string | string[]): boolean {
  if (Array.isArray(group)) return group.includes(elementType);
  return elementType === group;
}

function toSpatial(p: LocalPlacement): SpatialElement {
  return { id: p.id, type: p.elementType, x: p.x, y: p.y, width: p.width, height: p.height };
}

export function calculateWellnessScores(placements: LocalPlacement[]): WellnessScores {
  let rawPeople = 0;
  let rawBird = 0;

  // Sum base scores
  for (const p of placements) {
    const base = WELLNESS_BASE_SCORES[p.elementType];
    if (base) {
      rawPeople += base.people;
      rawBird += base.bird;
    }
  }

  // Check all unique pairs for synergies and penalties
  for (let i = 0; i < placements.length; i++) {
    for (let j = i + 1; j < placements.length; j++) {
      const a = placements[i];
      const b = placements[j];
      const dist = elementDistance(toSpatial(a), toSpatial(b));

      // Synergies
      for (const rule of SYNERGY_RULES) {
        const forwardMatch =
          matchesGroup(a.elementType, rule.elementA) && matchesGroup(b.elementType, rule.elementB);
        const reverseMatch =
          matchesGroup(b.elementType, rule.elementA) && matchesGroup(a.elementType, rule.elementB);
        if ((forwardMatch || reverseMatch) && dist <= rule.radius) {
          rawPeople += rule.bonus.people;
          rawBird += rule.bonus.bird;
        }
      }

      // Penalties (linear falloff)
      for (const rule of PENALTY_RULES) {
        const forwardMatch =
          matchesGroup(a.elementType, rule.elementA) && matchesGroup(b.elementType, rule.elementB);
        const reverseMatch =
          matchesGroup(b.elementType, rule.elementA) && matchesGroup(a.elementType, rule.elementB);
        if (forwardMatch || reverseMatch) {
          let factor = 0;
          if (dist <= rule.closeRadius) {
            factor = 1;
          } else if (dist < rule.farRadius) {
            factor = 1 - (dist - rule.closeRadius) / (rule.farRadius - rule.closeRadius);
          }
          if (factor > 0) {
            rawPeople -= rule.penalty.people * factor;
            rawBird -= rule.penalty.bird * factor;
          }
        }
      }
    }
  }

  // Normalize to 0-20 range
  const peopleScore = Math.round(Math.min(20, Math.max(0, rawPeople * 0.6 + 2)));
  const birdScore = Math.round(Math.min(20, Math.max(0, rawBird * 0.6 + 2)));

  const pLabel = getWellnessLabel(peopleScore);
  const bLabel = getWellnessLabel(birdScore);

  return {
    peopleScore,
    birdScore,
    peopleLabel: pLabel.label,
    birdLabel: bLabel.label,
    peopleColor: pLabel.color,
    birdColor: bLabel.color,
  };
}

// Client-side score calculator for preview (matches server scoring logic)

import { getElementDef } from '@/config/elements';
import { CROSS_ZONE_BONUS, DIVERSITY_BONUS, DIMINISHING_RETURNS } from '@/config/scoring-rules';
import type { ScoreBreakdown, ZoneRect } from '@/server/src/types/models';
import { findActiveInteractions } from './interactions';
import { detectPatterns } from './ecosystems';
import type { SpatialElement } from './spatialIndex';

interface PlacedElement extends SpatialElement {
  type: string;
  zoneIndex: number;
}

/**
 * Get the diminishing returns multiplier for the Nth copy of an element type.
 * 1st copy = 1.0, 2nd = 0.7, 3rd = 0.4, 4th+ = 0.25
 */
function getDiminishingMultiplier(copyIndex: number): number {
  return DIMINISHING_RETURNS[Math.min(copyIndex, DIMINISHING_RETURNS.length - 1)];
}

/**
 * Calculate preview score for a team's placements.
 * This runs client-side for immediate feedback; server is authoritative.
 */
export function calculatePreviewScore(
  elements: PlacedElement[],
  zones: ZoneRect[]
): ScoreBreakdown {
  const base = { biodiversity: 0, sustainability: 0, aesthetics: 0, ecosystemHealth: 0 };

  // 1. Base scores from each element (with diminishing returns for duplicates)
  const typeCounts = new Map<string, number>();
  for (const el of elements) {
    const def = getElementDef(el.type);
    if (def) {
      const count = typeCounts.get(el.type) || 0;
      const multiplier = getDiminishingMultiplier(count);
      typeCounts.set(el.type, count + 1);

      base.biodiversity += Math.round(def.baseScores.biodiversity * multiplier);
      base.sustainability += Math.round(def.baseScores.sustainability * multiplier);
      base.aesthetics += Math.round(def.baseScores.aesthetics * multiplier);
      base.ecosystemHealth += Math.round(def.baseScores.ecosystemHealth * multiplier);
    }
  }

  // 2. Pairwise interactions
  const activeInteractions = findActiveInteractions(elements);
  const interactionDetails = activeInteractions.map((ai) => ({
    rule: ai.rule.description,
    value: ai.rule.value,
    category: ai.rule.scoreCategory,
  }));

  const interactionScores = { biodiversity: 0, sustainability: 0, aesthetics: 0, ecosystemHealth: 0 };
  for (const ai of activeInteractions) {
    const cat = ai.rule.scoreCategory as keyof typeof interactionScores;
    if (cat in interactionScores) {
      interactionScores[cat] += ai.rule.value;
    }
  }

  // 3. Ecosystem patterns
  const patterns = detectPatterns(elements);
  const patternDetails = patterns.map((p) => ({
    name: p.pattern.name,
    bonus: p.pattern.bonusPoints,
    category: p.pattern.category,
  }));

  const patternScores = { biodiversity: 0, sustainability: 0, aesthetics: 0, ecosystemHealth: 0 };
  for (const p of patterns) {
    patternScores[p.pattern.category] += p.pattern.bonusPoints;
  }

  // 4. Cross-zone bonus
  let crossZoneBonus = 0;
  for (const el of elements) {
    const zone = zones[el.zoneIndex];
    if (!zone) continue;

    const cx = el.x + el.width / 2;
    const cy = el.y + el.height / 2;
    const borderDist = CROSS_ZONE_BONUS.borderDistance;

    const nearBorder =
      cx - zone.x < borderDist ||
      zone.x + zone.width - cx < borderDist ||
      cy - zone.y < borderDist ||
      zone.y + zone.height - cy < borderDist;

    if (nearBorder) {
      crossZoneBonus += CROSS_ZONE_BONUS.bonusPerElement;
    }
  }
  crossZoneBonus = Math.min(crossZoneBonus, CROSS_ZONE_BONUS.maxBonus);

  // 5. Diversity bonus (nonlinear — rewards using many categories)
  const categories = new Set(elements.map((e) => getElementDef(e.type)?.category).filter(Boolean));
  const diversityBonus = DIVERSITY_BONUS.thresholds[
    Math.min(categories.size, DIVERSITY_BONUS.thresholds.length - 1)
  ];

  // Total
  const total = {
    biodiversity: base.biodiversity + interactionScores.biodiversity + patternScores.biodiversity,
    sustainability: base.sustainability + interactionScores.sustainability + patternScores.sustainability,
    aesthetics: base.aesthetics + interactionScores.aesthetics + patternScores.aesthetics,
    ecosystemHealth: base.ecosystemHealth + interactionScores.ecosystemHealth + patternScores.ecosystemHealth,
    grand: 0,
  };
  total.grand =
    total.biodiversity +
    total.sustainability +
    total.aesthetics +
    total.ecosystemHealth +
    crossZoneBonus +
    diversityBonus;

  return {
    base,
    interactions: interactionDetails,
    patterns: patternDetails,
    crossZoneBonus,
    diversityBonus,
    total,
  };
}

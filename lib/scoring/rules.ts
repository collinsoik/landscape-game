// Client-side score calculator for preview (matches server scoring logic)

import { getElementDef } from '@/config/elements';
import { CROSS_ZONE_BONUS, DIVERSITY_BONUS } from '@/config/scoring-rules';
import type { ScoreBreakdown, ZoneRect } from '@/server/src/types/models';
import { findActiveInteractions } from './interactions';
import { detectPatterns } from './ecosystems';
import type { SpatialElement } from './spatialIndex';

interface PlacedElement extends SpatialElement {
  type: string;
  zoneIndex: number;
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

  // 1. Base scores from each element
  for (const el of elements) {
    const def = getElementDef(el.type);
    if (def) {
      base.biodiversity += def.baseScores.biodiversity;
      base.sustainability += def.baseScores.sustainability;
      base.aesthetics += def.baseScores.aesthetics;
      base.ecosystemHealth += def.baseScores.ecosystemHealth;
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

  // 5. Diversity bonus
  const categories = new Set(elements.map((e) => getElementDef(e.type)?.category).filter(Boolean));
  const diversityBonus = categories.size * DIVERSITY_BONUS.pointsPerCategory;

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

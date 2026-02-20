import type { Placement, ScoreBreakdown, ZoneRect } from '../types/models';
import { getElement } from './ElementCatalog';
import { getRulesForPair, getAllPatterns, CROSS_ZONE_BONUS, DIVERSITY_BONUS } from './InteractionMatrix';
import { findPairsWithinRadius, findTypeWithinRadius, fitsInRadius } from './NeighborDetector';

/**
 * Compute the full score breakdown for a set of placements belonging to one team in one round.
 */
export function computeScore(placements: Placement[], zones: ZoneRect[]): ScoreBreakdown {
  const base = { biodiversity: 0, sustainability: 0, aesthetics: 0, ecosystemHealth: 0 };
  const interactions: ScoreBreakdown['interactions'] = [];
  const patterns: ScoreBreakdown['patterns'] = [];

  // 1. Base scores from each placed element
  for (const p of placements) {
    const def = getElement(p.elementType);
    if (!def) continue;
    base.biodiversity += def.baseScores.biodiversity;
    base.sustainability += def.baseScores.sustainability;
    base.aesthetics += def.baseScores.aesthetics;
    base.ecosystemHealth += def.baseScores.ecosystemHealth;
  }

  // 2. Pairwise interaction rules
  // Collect the maximum rule radius to limit pair search
  const processedPairs = new Set<string>();
  for (let i = 0; i < placements.length; i++) {
    for (let j = i + 1; j < placements.length; j++) {
      const a = placements[i];
      const b = placements[j];
      const rules = getRulesForPair(a.elementType, b.elementType);
      if (rules.length === 0) continue;

      const cx1 = a.x + a.width / 2;
      const cy1 = a.y + a.height / 2;
      const cx2 = b.x + b.width / 2;
      const cy2 = b.y + b.height / 2;
      const dist = Math.sqrt((cx1 - cx2) ** 2 + (cy1 - cy2) ** 2);

      for (const rule of rules) {
        // Deduplicate: for same-type pairs (e.g., oak_tree|oak_tree),
        // a given rule should only apply once per pair
        const pairKey = `${rule.description}|${[a.id, b.id].sort().join(',')}`;
        if (processedPairs.has(pairKey)) continue;
        processedPairs.add(pairKey);

        if (dist <= rule.radius) {
          const cat = rule.scoreCategory as keyof typeof base;
          if (cat in base) {
            interactions.push({
              rule: rule.description,
              value: rule.value,
              category: cat,
            });
          }
        }
      }
    }
  }

  // 3. Ecosystem pattern bonuses
  const allPatterns = getAllPatterns();
  for (const pattern of allPatterns) {
    // Check if we have enough of each required element type
    const matchingPlacements: Placement[] = [];
    let satisfied = true;

    for (const req of pattern.requiredElements) {
      const ofType = placements.filter((p) => p.elementType === req.type);
      if (ofType.length < req.minCount) {
        satisfied = false;
        break;
      }
      matchingPlacements.push(...ofType.slice(0, req.minCount));
    }

    if (!satisfied) continue;

    // Check spatial proximity -- all matching elements must fit within maxRadius
    if (fitsInRadius(matchingPlacements, pattern.maxRadius)) {
      patterns.push({
        name: pattern.name,
        bonus: pattern.bonusPoints,
        category: pattern.category,
      });
    }
  }

  // 4. Cross-zone bonus: elements placed near zone borders benefit neighboring zones
  let crossZoneBonus = 0;
  if (zones.length > 1) {
    for (const p of placements) {
      const cx = p.x + p.width / 2;
      const cy = p.y + p.height / 2;
      // Find the zone this element belongs to
      const zone = zones.find((z) => z.index === p.zoneIndex);
      if (!zone) continue;

      const distToLeft = cx - zone.x;
      const distToRight = (zone.x + zone.width) - cx;
      const distToTop = cy - zone.y;
      const distToBottom = (zone.y + zone.height) - cy;
      const minDist = Math.min(distToLeft, distToRight, distToTop, distToBottom);

      if (minDist <= CROSS_ZONE_BONUS.borderDistance) {
        crossZoneBonus += CROSS_ZONE_BONUS.bonusPerElement;
      }
    }
    crossZoneBonus = Math.min(crossZoneBonus, CROSS_ZONE_BONUS.maxBonus);
  }

  // 5. Diversity bonus: points for using elements from many different categories
  const categoriesUsed = new Set(
    placements.map((p) => getElement(p.elementType)?.category).filter(Boolean)
  );
  const diversityBonus = categoriesUsed.size * DIVERSITY_BONUS.pointsPerCategory;

  // Tally totals
  const interactionTotals = { biodiversity: 0, sustainability: 0, aesthetics: 0, ecosystemHealth: 0 };
  for (const i of interactions) {
    const cat = i.category as keyof typeof interactionTotals;
    if (cat in interactionTotals) {
      interactionTotals[cat] += i.value;
    }
  }

  const patternTotals = { biodiversity: 0, sustainability: 0, aesthetics: 0, ecosystemHealth: 0 };
  for (const p of patterns) {
    const cat = p.category as keyof typeof patternTotals;
    if (cat in patternTotals) {
      patternTotals[cat] += p.bonus;
    }
  }

  const total = {
    biodiversity: base.biodiversity + interactionTotals.biodiversity + patternTotals.biodiversity,
    sustainability: base.sustainability + interactionTotals.sustainability + patternTotals.sustainability,
    aesthetics: base.aesthetics + interactionTotals.aesthetics + patternTotals.aesthetics,
    ecosystemHealth: base.ecosystemHealth + interactionTotals.ecosystemHealth + patternTotals.ecosystemHealth,
    grand: 0,
  };

  // Add cross-zone and diversity to the grand total (spread evenly)
  total.biodiversity += diversityBonus / 4;
  total.sustainability += diversityBonus / 4;
  total.aesthetics += diversityBonus / 4;
  total.ecosystemHealth += diversityBonus / 4;

  total.grand = total.biodiversity + total.sustainability + total.aesthetics + total.ecosystemHealth + crossZoneBonus;

  return {
    base,
    interactions,
    patterns,
    crossZoneBonus,
    diversityBonus,
    total,
  };
}

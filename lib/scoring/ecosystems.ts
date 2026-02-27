// Client-side ecosystem pattern detection for preview scores

import { ECOSYSTEM_PATTERNS } from '@/config/scoring-rules';
import { isCluster, type SpatialElement } from './spatialIndex';

export interface DetectedPattern {
  pattern: typeof ECOSYSTEM_PATTERNS[number];
  elements: SpatialElement[];
}

/**
 * Detect ecosystem patterns in the current element placements.
 * A pattern matches when all required elements are present within maxRadius.
 */
export function detectPatterns(
  elements: (SpatialElement & { type: string })[]
): DetectedPattern[] {
  const detected: DetectedPattern[] = [];

  for (const pattern of ECOSYSTEM_PATTERNS) {
    // Collect candidate elements for each requirement
    const candidateGroups: (SpatialElement & { type: string })[][] = [];
    let allSatisfied = true;

    for (const req of pattern.requiredElements) {
      const matching = elements.filter((e) => e.type === req.type);
      if (matching.length < req.minCount) {
        allSatisfied = false;
        break;
      }
      candidateGroups.push(matching.slice(0, req.minCount));
    }

    if (!allSatisfied) continue;

    // Flatten candidates and check if they form a cluster
    const allCandidates = candidateGroups.flat();
    if (isCluster(allCandidates, pattern.maxRadius)) {
      detected.push({
        pattern,
        elements: allCandidates,
      });
    }
  }

  return detected;
}

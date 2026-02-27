import type { ScoreBreakdown, Placement, MissionObjective, StarDetail, ScoreCategory } from '../types/models';
import type { MissionConfig } from '../config/scenarios';
import { getElement } from './ElementCatalog';

interface ObjectiveResult {
  objectiveId: string;
  complete: boolean;
}

/**
 * Check which objectives are complete for the current mission state.
 */
export function checkObjectives(
  breakdown: ScoreBreakdown,
  placements: Placement[],
  missionConfig: MissionConfig
): ObjectiveResult[] {
  return missionConfig.objectives.map((obj) => ({
    objectiveId: obj.id,
    complete: evaluateObjective(obj, breakdown, placements),
  }));
}

function evaluateObjective(
  objective: MissionObjective,
  breakdown: ScoreBreakdown,
  placements: Placement[]
): boolean {
  const cond = objective.condition;

  switch (cond.type) {
    case 'min_score': {
      if (cond.category) {
        const catScore = breakdown.total[cond.category as keyof typeof breakdown.total];
        return typeof catScore === 'number' && catScore >= cond.threshold;
      }
      return breakdown.total.grand >= cond.threshold;
    }

    case 'pattern': {
      return breakdown.patterns.some((p) => p.name === cond.patternName);
    }

    case 'min_synergies': {
      const synergies = breakdown.interactions.filter((i) => i.value > 0);
      return synergies.length >= cond.count;
    }

    case 'no_conflicts': {
      const conflicts = breakdown.interactions.filter((i) => i.value < 0);
      return conflicts.length === 0;
    }

    case 'remove_all_invasives': {
      const invasives = placements.filter((p) => {
        const def = getElement(p.elementType);
        return def?.category === 'invasive';
      });
      return invasives.length === 0;
    }

    case 'min_patterns': {
      return breakdown.patterns.length >= cond.count;
    }

    default:
      return false;
  }
}

/**
 * Calculate star rating based on mission thresholds and current state.
 */
export function calculateStars(
  breakdown: ScoreBreakdown,
  placements: Placement[],
  missionConfig: MissionConfig,
  budgetRemaining: number,
  totalBudget: number
): { stars: number; details: StarDetail[] } {
  const objectiveResults = checkObjectives(breakdown, placements, missionConfig);
  const completedIds = new Set(
    objectiveResults.filter((r) => r.complete).map((r) => r.objectiveId)
  );

  const thresholds = missionConfig.starThresholds;
  const details: StarDetail[] = [];

  const oneStarEarned = evaluateStarCondition(thresholds.oneStar, breakdown, placements, completedIds, budgetRemaining, totalBudget);
  details.push({
    star: 1,
    earned: oneStarEarned,
    reason: describeStarCondition(thresholds.oneStar),
  });

  const twoStarEarned = oneStarEarned && evaluateStarCondition(thresholds.twoStar, breakdown, placements, completedIds, budgetRemaining, totalBudget);
  details.push({
    star: 2,
    earned: twoStarEarned,
    reason: describeStarCondition(thresholds.twoStar),
  });

  const threeStarEarned = twoStarEarned && evaluateStarCondition(thresholds.threeStar, breakdown, placements, completedIds, budgetRemaining, totalBudget);
  details.push({
    star: 3,
    earned: threeStarEarned,
    reason: describeStarCondition(thresholds.threeStar),
  });

  const stars = threeStarEarned ? 3 : twoStarEarned ? 2 : oneStarEarned ? 1 : 0;

  return { stars, details };
}

function evaluateStarCondition(
  condition: MissionConfig['starThresholds']['oneStar'],
  breakdown: ScoreBreakdown,
  placements: Placement[],
  completedObjectives: Set<string>,
  budgetRemaining: number,
  totalBudget: number
): boolean {
  // All specified conditions must be met
  if (condition.objectives) {
    if (!condition.objectives.every((id) => completedObjectives.has(id))) return false;
  }

  if (condition.minScore !== undefined) {
    if (breakdown.total.grand < condition.minScore) return false;
  }

  if (condition.minCategoryScore) {
    const cat = condition.minCategoryScore.category as keyof typeof breakdown.total;
    const score = breakdown.total[cat];
    if (typeof score !== 'number' || score < condition.minCategoryScore.threshold) return false;
  }

  if (condition.minSynergies !== undefined) {
    const synergies = breakdown.interactions.filter((i) => i.value > 0);
    if (synergies.length < condition.minSynergies) return false;
  }

  if (condition.maxCoinsSpent !== undefined) {
    const spent = totalBudget - budgetRemaining;
    if (spent > condition.maxCoinsSpent) return false;
  }

  if (condition.noConflicts) {
    const conflicts = breakdown.interactions.filter((i) => i.value < 0);
    if (conflicts.length > 0) return false;
  }

  return true;
}

function describeStarCondition(condition: MissionConfig['starThresholds']['oneStar']): string {
  const parts: string[] = [];

  if (condition.objectives?.length) {
    parts.push('Complete required objectives');
  }
  if (condition.minScore !== undefined) {
    parts.push(`Score ${condition.minScore}+`);
  }
  if (condition.minCategoryScore) {
    parts.push(`${condition.minCategoryScore.category} ${condition.minCategoryScore.threshold}+`);
  }
  if (condition.minSynergies !== undefined) {
    parts.push(`${condition.minSynergies}+ synergies`);
  }
  if (condition.maxCoinsSpent !== undefined) {
    parts.push(`Spend ≤${condition.maxCoinsSpent} coins`);
  }
  if (condition.noConflicts) {
    parts.push('No conflicts');
  }

  return parts.join(', ') || 'Complete the mission';
}

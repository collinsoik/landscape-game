import { ROUNDS } from '@/config/rounds';
import { LocalPlacement } from '@/lib/types';

export function calculateStars(round: number, placements: LocalPlacement[]): number {
  const roundConfig = ROUNDS.find((r) => r.round === round);
  if (!roundConfig) return 0;

  const roundPlacements = placements.filter((p) => p.round === round);
  let earned = 0;

  for (const criteria of roundConfig.starCriteria) {
    if (criteria.check(roundPlacements)) {
      earned = criteria.stars;
    }
  }

  return earned;
}

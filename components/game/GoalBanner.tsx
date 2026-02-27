'use client';

import { ROUNDS } from '@/config/rounds';
import type { LocalPlacement } from '@/lib/types';
import { calculateStars } from '@/lib/stars';

interface GoalBannerProps {
  currentRound: number;
  placements: LocalPlacement[];
}

export default function GoalBanner({ currentRound, placements }: GoalBannerProps) {
  const roundConfig = ROUNDS[currentRound - 1];
  if (!roundConfig) return null;

  const currentStars = calculateStars(currentRound, placements);

  return (
    <div
      className="px-4 py-2 flex items-center gap-4 text-sm"
      style={{ background: '#0d1f0d', borderBottom: '1px solid #1a3a1a' }}
    >
      <span className="text-[#f39c12] font-bold uppercase tracking-wider flex-shrink-0">
        Stars
      </span>
      <div className="flex items-center gap-3 flex-1">
        {roundConfig.starCriteria.map((criteria) => {
          const earned = currentStars >= criteria.stars;
          return (
            <div key={criteria.stars} className="flex items-center gap-1.5">
              <span
                className="text-lg"
                style={{ color: earned ? '#f39c12' : '#333' }}
              >
                {'\u2605'}
              </span>
              <span className={earned ? 'text-[#d4e8c2]' : 'text-[#4a6a3a]'}>
                {criteria.description}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

'use client';

import { useMemo } from 'react';
import type { LocalPlacement } from '@/lib/types';
import { calculateWellnessScores } from '@/lib/wellness-scores';

interface WellnessMetersProps {
  placements: LocalPlacement[];
}

function MeterBar({ label, icon, score, maxScore, color, qualLabel }: {
  label: string;
  icon: string;
  score: number;
  maxScore: number;
  color: string;
  qualLabel: string;
}) {
  const pct = Math.min(100, (score / maxScore) * 100);

  return (
    <div className="flex items-center gap-2 flex-1 min-w-0">
      <span className="text-base flex-shrink-0" aria-hidden>{icon}</span>
      <span className="text-xs font-bold text-[#d4e8c2] flex-shrink-0 w-12">{label}</span>
      <div className="flex-1 h-3 rounded-full bg-neutral-700 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span
        className="text-xs font-semibold flex-shrink-0 w-16 text-right"
        style={{ color }}
      >
        {qualLabel}
      </span>
    </div>
  );
}

export default function WellnessMeters({ placements }: WellnessMetersProps) {
  const scores = useMemo(() => calculateWellnessScores(placements), [placements]);

  return (
    <div
      className="px-4 py-1.5 flex flex-col md:flex-row items-stretch md:items-center gap-2 md:gap-6"
      style={{ background: '#0d1f0d', borderBottom: '1px solid #1a3a1a' }}
    >
      <MeterBar
        label="People"
        icon="👤"
        score={scores.peopleScore}
        maxScore={20}
        color={scores.peopleColor}
        qualLabel={scores.peopleLabel}
      />
      <MeterBar
        label="Birds"
        icon="🐦"
        score={scores.birdScore}
        maxScore={20}
        color={scores.birdColor}
        qualLabel={scores.birdLabel}
      />
    </div>
  );
}

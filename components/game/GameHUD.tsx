'use client';

import { ROUNDS } from '@/config/rounds';
import PixelButton from '@/components/shared/PixelButton';

interface GameHUDProps {
  currentRound: number;
  placedCount: number;
  cap: number;
  onNextRound: () => void;
}

export default function GameHUD({
  currentRound,
  placedCount,
  cap,
  onNextRound,
}: GameHUDProps) {
  const roundConfig = ROUNDS[currentRound - 1];

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-neutral-800 border-b border-neutral-700 text-white text-sm">
      <div className="flex items-center gap-4">
        <span className="font-semibold text-base">
          Round {currentRound}/{ROUNDS.length}: {roundConfig?.category}
        </span>
        <span className="text-neutral-400">
          {placedCount}/{cap} placed
        </span>
      </div>

      <div className="flex items-center gap-4">
        <PixelButton variant="primary" size="sm" onClick={onNextRound}>
          {currentRound >= ROUNDS.length ? 'Finish' : 'Next Round'}
        </PixelButton>
      </div>
    </div>
  );
}

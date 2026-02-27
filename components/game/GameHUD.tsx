'use client';

import { ROUNDS } from '@/config/rounds';
import PixelButton from '@/components/shared/PixelButton';

interface GameHUDProps {
  currentRound: number;
  placedCount: number;
  cap: number;
  allowMovePreviousRound: boolean;
  onToggleMovePrevious: () => void;
  onNextRound: () => void;
}

export default function GameHUD({
  currentRound,
  placedCount,
  cap,
  allowMovePreviousRound,
  onToggleMovePrevious,
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
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={allowMovePreviousRound}
            onChange={onToggleMovePrevious}
            className="w-4 h-4 accent-green-500 cursor-pointer"
          />
          <span className="text-neutral-300 text-xs">Move previous</span>
        </label>

        <PixelButton variant="primary" size="sm" onClick={onNextRound}>
          {currentRound >= ROUNDS.length ? 'Finish' : 'Next Round'}
        </PixelButton>
      </div>
    </div>
  );
}

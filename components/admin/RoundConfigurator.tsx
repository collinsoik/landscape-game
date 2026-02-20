'use client';

import { useState } from 'react';
import { PixelButton } from '@/components/shared/PixelButton';
import { PixelInput } from '@/components/shared/PixelInput';
import { GAME_DEFAULTS } from '@/config/game-defaults';

interface RoundConfiguratorProps {
  totalRounds: number;
  onUpdate: (rounds: { count: number; duration: number; labels: string[] }) => void;
}

export function RoundConfigurator({ totalRounds, onUpdate }: RoundConfiguratorProps) {
  const [count, setCount] = useState(totalRounds);
  const [duration, setDuration] = useState(GAME_DEFAULTS.round.defaultDuration);
  const [labels, setLabels] = useState<string[]>(
    Array.from({ length: totalRounds }, (_, i) => `Area ${i + 1}`)
  );

  function handleCountChange(val: string) {
    const n = Math.max(1, Math.min(10, parseInt(val) || 1));
    setCount(n);
    setLabels((prev) => {
      const next = [...prev];
      while (next.length < n) next.push(`Area ${next.length + 1}`);
      return next.slice(0, n);
    });
  }

  function handleLabelChange(index: number, val: string) {
    setLabels((prev) => {
      const next = [...prev];
      next[index] = val;
      return next;
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block text-sm font-bold text-green-200 mb-1">Rounds</label>
          <PixelInput
            type="number"
            value={count}
            onChange={(e) => handleCountChange(e.target.value)}
            min={1}
            max={10}
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-bold text-green-200 mb-1">Duration (sec)</label>
          <PixelInput
            type="number"
            value={duration}
            onChange={(e) => setDuration(parseInt(e.target.value) || GAME_DEFAULTS.round.defaultDuration)}
            min={GAME_DEFAULTS.round.minDuration}
            max={GAME_DEFAULTS.round.maxDuration}
            step={60}
          />
        </div>
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-bold text-green-200">Round Labels</label>
        {Array.from({ length: count }, (_, i) => (
          <PixelInput
            key={i}
            value={labels[i] || ''}
            onChange={(e) => handleLabelChange(i, e.target.value)}
            placeholder={`Round ${i + 1} area`}
          />
        ))}
      </div>
      <PixelButton onClick={() => onUpdate({ count, duration, labels })}>
        Save Round Config
      </PixelButton>
    </div>
  );
}

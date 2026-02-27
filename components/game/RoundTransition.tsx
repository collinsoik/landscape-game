'use client';

import { useEffect, useState } from 'react';
import { ROUNDS } from '@/config/rounds';
import PixelButton from '@/components/shared/PixelButton';

interface RoundTransitionProps {
  show: boolean;
  round: number;
  starsEarned: number;
  onContinue: () => void;
  isFinalRound: boolean;
}

export default function RoundTransition({
  show,
  round,
  starsEarned,
  onContinue,
  isFinalRound,
}: RoundTransitionProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) setVisible(true);
    else setVisible(false);
  }, [show]);

  if (!visible) return null;

  const roundConfig = ROUNDS[round - 1];
  const nextRound = ROUNDS[round]; // undefined if final

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center"
      style={{ background: 'rgba(13, 31, 13, 0.95)' }}
    >
      <div className="text-center max-w-md px-4">
        <div className="text-3xl font-bold text-[#8bba6a] mb-4" style={{ textShadow: '2px 2px 0 #1a3a1a' }}>
          Round {round} Complete!
        </div>

        {/* Stars earned */}
        <div className="flex justify-center gap-2 mb-4">
          {[1, 2, 3].map((s) => (
            <span
              key={s}
              className="text-4xl"
              style={{ color: s <= starsEarned ? '#f39c12' : '#333' }}
            >
              {'\u2605'}
            </span>
          ))}
        </div>

        {/* Criteria checklist */}
        <div className="mb-6 text-left inline-block">
          {roundConfig?.starCriteria.map((c) => {
            const met = starsEarned >= c.stars;
            return (
              <div key={c.stars} className="flex items-center gap-2 mb-1">
                <span
                  className="w-5 h-5 rounded-sm flex items-center justify-center text-xs font-bold"
                  style={{
                    background: met ? '#2ecc71' : '#1a3a1a',
                    border: met ? '1px solid #27ae60' : '1px solid #2d5a27',
                    color: met ? '#0d1f0d' : '#4a6a3a',
                  }}
                >
                  {met ? '\u2713' : ''}
                </span>
                <span className={met ? 'text-[#2ecc71]' : 'text-[#6a9a4a]'}>
                  {c.description}
                </span>
              </div>
            );
          })}
        </div>

        {/* Next round preview */}
        {nextRound && !isFinalRound && (
          <div className="mb-4 text-sm text-[#d4e8c2]">
            Next: <span className="text-[#8bba6a] font-bold">Round {round + 1} - {nextRound.category}</span>
            <span className="text-[#6a9a4a]"> (up to {nextRound.cap} elements)</span>
          </div>
        )}

        <PixelButton variant="primary" size="lg" onClick={onContinue}>
          {isFinalRound ? 'Submit Your Design' : 'Next Round'}
        </PixelButton>
      </div>
    </div>
  );
}

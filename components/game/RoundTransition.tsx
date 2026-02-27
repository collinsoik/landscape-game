'use client';

import { useEffect, useRef, useState } from 'react';
import type { ScoreBreakdown } from '@/lib/types';

interface RoundTransitionProps {
  show: boolean;
  round: number;
  totalRounds: number;
  scores: ScoreBreakdown | null;
  budget?: number;
  actionLimit?: number;
  refundRate?: number;
  goals?: { text: string }[];
  newCategories?: string[];
  previousCategories?: string[];
  onDismiss: () => void;
}

export default function RoundTransition({
  show,
  round,
  totalRounds,
  scores,
  budget,
  actionLimit,
  refundRate,
  goals,
  newCategories,
  previousCategories,
  onDismiss,
}: RoundTransitionProps) {
  const [visible, setVisible] = useState(false);
  const onDismissRef = useRef(onDismiss);
  onDismissRef.current = onDismiss;

  useEffect(() => {
    if (show) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        onDismissRef.current();
      }, 5000);
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [show]);

  if (!visible) return null;

  // Determine newly unlocked categories
  const unlocked = newCategories?.filter(
    (c) => !previousCategories?.includes(c)
  ) ?? [];

  const CATEGORY_LABELS: Record<string, string> = {
    trees: 'Trees', shrubs: 'Shrubs', flowers: 'Flowers',
    ground_cover: 'Ground Cover', water_features: 'Water',
    structures: 'Structures', wildlife_habitat: 'Habitat', invasive: 'Invasive',
  };

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center"
      style={{ background: 'rgba(13, 31, 13, 0.95)' }}
      onClick={onDismiss}
    >
      <div className="text-center max-w-md px-4" onClick={(e) => e.stopPropagation()}>
        <div className="text-3xl font-bold text-[#8bba6a] mb-2" style={{ textShadow: '2px 2px 0 #1a3a1a' }}>
          Round {round} of {totalRounds}
        </div>

        {scores && (
          <div className="mb-4">
            <div className="text-sm text-[#6a9a4a] mb-1">Previous Score</div>
            <div className="text-2xl font-bold text-[#d4e8c2]">
              {Math.round(scores.total.grand)}
            </div>
          </div>
        )}

        {unlocked.length > 0 && (
          <div className="mb-4">
            <div className="text-sm text-[#f39c12] font-bold mb-1">NEW Unlocked!</div>
            <div className="flex flex-wrap gap-2 justify-center">
              {unlocked.map((c) => (
                <span
                  key={c}
                  className="px-2 py-1 text-xs font-bold uppercase rounded bg-[#2d5a27] text-[#8bba6a]"
                  style={{ boxShadow: '0 0 6px rgba(139,186,106,0.3)' }}
                >
                  {CATEGORY_LABELS[c] ?? c}
                </span>
              ))}
            </div>
          </div>
        )}

        {(budget && budget > 0 || actionLimit && actionLimit > 0 || refundRate !== undefined && refundRate < 1.0) && (
          <div className="mb-3 flex flex-wrap gap-3 justify-center text-sm text-[#d4e8c2]">
            {budget && budget > 0 && (
              <span>
                Budget: <span className="font-bold text-[#f39c12]">{budget} coins</span>
              </span>
            )}
            {actionLimit && actionLimit > 0 && (
              <span>
                Actions: <span className="font-bold text-[#3498db]">{actionLimit} per round</span>
              </span>
            )}
            {refundRate !== undefined && refundRate < 1.0 && (
              <span>
                Refund: <span className="font-bold text-[#e67e22]">{Math.round(refundRate * 100)}%</span>
              </span>
            )}
          </div>
        )}

        {goals?.[0] && (
          <div className="mb-4 text-sm text-[#d4e8c2]">
            Goal: <span className="text-[#8bba6a]">{goals[0].text}</span>
          </div>
        )}

        <button
          onClick={onDismiss}
          className="px-4 py-2 text-xs font-bold uppercase tracking-wider cursor-pointer
            bg-[#2d5a27] text-[#8bba6a] hover:bg-[#3a7a34] transition-colors"
        >
          Got it!
        </button>
      </div>
    </div>
  );
}

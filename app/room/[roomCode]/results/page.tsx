'use client';

import { useEffect, use } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useGameStore } from '@/store';
import PixelButton from '@/components/shared/PixelButton';
import PixelCard from '@/components/shared/PixelCard';

interface ResultsPageProps {
  params: Promise<{ roomCode: string }>;
}

const CATEGORY_LABELS: Record<string, string> = {
  biodiversity: 'Biodiversity',
  sustainability: 'Sustainability',
  aesthetics: 'Aesthetics',
  ecosystemHealth: 'Ecosystem Health',
};

const MEDAL_COLORS = ['#f1c40f', '#bdc3c7', '#cd7f32'];

export default function ResultsPage({ params }: ResultsPageProps) {
  const { roomCode } = use(params);
  const { connect } = useWebSocket();

  const finalResults = useGameStore((s) => s.finalResults);

  useEffect(() => {
    connect();
  }, [connect]);

  if (!finalResults) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-[#6a9a4a] animate-pulse">
          Waiting for final scores...
        </p>
      </div>
    );
  }

  const { rankings } = finalResults;

  return (
    <div className="flex min-h-screen flex-col items-center p-6">
      <h1
        className="text-3xl font-bold uppercase tracking-widest text-[#8bba6a] mb-1"
        style={{ textShadow: '2px 2px 0 #1a3a1a' }}
      >
        Results
      </h1>
      <p className="text-xs text-[#4a6a3a] mb-8">
        Room: <span className="font-mono font-bold">{roomCode}</span>
      </p>

      {/* Leaderboard */}
      <div className="w-full max-w-2xl flex flex-col gap-4">
        {rankings.map((entry) => (
          <PixelCard
            key={entry.teamId}
            glow={entry.rank === 1}
            className="relative"
          >
            <div className="flex items-start gap-4">
              {/* Rank badge */}
              <div
                className="flex items-center justify-center w-10 h-10 flex-shrink-0 text-lg font-bold"
                style={{
                  color: MEDAL_COLORS[entry.rank - 1] ?? '#6a9a4a',
                  background: '#0d1f0d',
                  boxShadow:
                    'inset 1px 1px 0 rgba(255,255,255,0.1), inset -1px -1px 0 rgba(0,0,0,0.3)',
                }}
              >
                #{entry.rank}
              </div>

              <div className="flex-1">
                <h3 className="text-base font-bold text-[#d4e8c2] mb-2">
                  {entry.teamName}
                </h3>

                {/* Score categories */}
                <div className="grid grid-cols-2 gap-x-6 gap-y-1 mb-3">
                  {(['biodiversity', 'sustainability', 'aesthetics', 'ecosystemHealth'] as const).map(
                    (cat) => (
                      <div key={cat} className="flex justify-between text-xs">
                        <span className="text-[#6a9a4a]">
                          {CATEGORY_LABELS[cat]}
                        </span>
                        <span className="font-mono text-[#8bba6a]">
                          {(entry.autoScore?.total?.[cat] ?? 0).toFixed(1)}
                        </span>
                      </div>
                    )
                  )}
                </div>

                {/* Judge scores if available */}
                {entry.judgeScore && (
                  <div className="mb-2">
                    <p className="text-xs font-bold text-[#8b6914] uppercase mb-1">
                      Judge Scores
                    </p>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                      {(['biodiversity', 'sustainability', 'aesthetics', 'ecosystemHealth'] as const).map(
                        (cat) => (
                          <div key={cat} className="flex justify-between text-xs">
                            <span className="text-[#6a9a4a]">
                              {CATEGORY_LABELS[cat]}
                            </span>
                            <span className="font-mono text-[#c9a84c]">
                              {entry.judgeScore?.[cat] ?? 0}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                    {entry.judgeScore?.comments && entry.judgeScore.comments.length > 0 && (
                      <div className="mt-1">
                        {entry.judgeScore.comments.map((c, i) => (
                          <p key={i} className="text-xs text-[#6a9a4a] italic">
                            &quot;{c}&quot;
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Final score */}
              <div
                className="flex flex-col items-center justify-center px-3 py-2 flex-shrink-0"
                style={{
                  background: '#0d1f0d',
                  boxShadow:
                    'inset 1px 1px 0 rgba(255,255,255,0.1), inset -1px -1px 0 rgba(0,0,0,0.3)',
                }}
              >
                <span className="text-2xl font-bold font-mono text-[#8bba6a]">
                  {entry.finalScore.toFixed(0)}
                </span>
                <span className="text-[8px] uppercase text-[#4a6a3a]">
                  Total
                </span>
              </div>
            </div>
          </PixelCard>
        ))}
      </div>

      {/* Back to home */}
      <div className="mt-8">
        <PixelButton variant="secondary" onClick={() => (window.location.href = '/')}>
          Back to Home
        </PixelButton>
      </div>
    </div>
  );
}

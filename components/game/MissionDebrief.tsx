'use client';

import { useEffect, useState } from 'react';
import type { ScoreBreakdown, MissionObjective, StarDetail } from '@/lib/types';

interface MissionDebriefProps {
  show: boolean;
  missionTitle: string;
  scores: ScoreBreakdown | null;
  objectives: MissionObjective[];
  objectivesCompleted: string[];
  stars: number;
  starDetails: StarDetail[];
  ecoLesson: string | null;
  round: number;
  totalMissions: number;
  onNext: () => void;
}

export default function MissionDebrief({
  show,
  missionTitle,
  scores,
  objectives,
  objectivesCompleted,
  stars,
  starDetails,
  ecoLesson,
  round,
  totalMissions,
  onNext,
}: MissionDebriefProps) {
  const [visible, setVisible] = useState(false);
  const [animatedScore, setAnimatedScore] = useState(0);
  const [showStars, setShowStars] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      setAnimatedScore(0);
      setShowStars(false);

      // Animate score counting up
      const target = scores?.total.grand ?? 0;
      const duration = 1500;
      const steps = 30;
      const increment = target / steps;
      let current = 0;
      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          current = target;
          clearInterval(timer);
          // Show stars after score animation
          setTimeout(() => setShowStars(true), 300);
        }
        setAnimatedScore(Math.round(current));
      }, duration / steps);

      return () => clearInterval(timer);
    } else {
      setVisible(false);
    }
  }, [show, scores]);

  if (!visible) return null;

  const isLastMission = round >= totalMissions;
  const failed = stars === 0;

  return (
    <div
      className="fixed inset-0 z-[95] flex items-center justify-center"
      style={{ background: 'rgba(13, 31, 13, 0.97)' }}
    >
      <div className="text-center max-w-md px-6 w-full">
        {/* Title */}
        <div className="text-xs text-[#6a9a4a] uppercase tracking-widest mb-1">
          {failed ? 'Mission Failed' : 'Mission Complete'}
        </div>
        <h2 className="text-xl font-bold text-[#8bba6a] mb-4" style={{ textShadow: '2px 2px 0 #1a3a1a' }}>
          {missionTitle}
        </h2>

        {/* Score tally */}
        <div className="mb-4">
          <div className="text-3xl font-bold text-[#d4e8c2] font-mono tabular-nums">
            {animatedScore}
          </div>
          <div className="text-xs text-[#6a9a4a]">Total Score</div>
        </div>

        {/* Score categories */}
        {scores && (
          <div className="grid grid-cols-4 gap-2 mb-4 text-sm">
            {([
              { key: 'biodiversity', label: 'Biodiversity', color: '#2ecc71' },
              { key: 'sustainability', label: 'Sustain.', color: '#3498db' },
              { key: 'aesthetics', label: 'Aesthetics', color: '#e74c3c' },
              { key: 'ecosystemHealth', label: 'Ecosystem', color: '#f39c12' },
            ] as const).map((cat) => (
              <div key={cat.key} className="text-center">
                <div className="font-bold tabular-nums" style={{ color: cat.color }}>
                  {Math.round(scores.total[cat.key])}
                </div>
                <div className="text-xs" style={{ color: '#6a9a4a' }}>
                  {cat.label}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Objectives */}
        <div className="mb-4">
          <div className="flex flex-col gap-2 text-sm">
            {objectives.map((obj) => {
              const complete = objectivesCompleted.includes(obj.id);
              return (
                <div key={obj.id} className="flex items-center gap-2.5">
                  <span
                    className="w-5 h-5 rounded-sm flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{
                      background: complete ? '#2ecc71' : '#c0392b',
                      color: '#fff',
                    }}
                  >
                    {complete ? '\u2713' : '\u2717'}
                  </span>
                  <span className={complete ? 'text-[#2ecc71]' : 'text-[#c0392b]'}>
                    {obj.text}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Star rating */}
        {showStars && (
          <div className="mb-4">
            <div className="flex items-center justify-center gap-1 text-2xl mb-1">
              {[1, 2, 3].map((n) => (
                <span
                  key={n}
                  className={`transition-all duration-300 ${n <= stars ? 'scale-110' : 'scale-100 opacity-30'}`}
                  style={{
                    color: n <= stars ? '#f39c12' : '#2d5a27',
                    textShadow: n <= stars ? '0 0 8px rgba(243, 156, 18, 0.5)' : 'none',
                  }}
                >
                  {'\u2605'}
                </span>
              ))}
            </div>
            <div className="flex flex-col gap-1 text-xs text-[#6a9a4a]">
              {starDetails.map((d) => (
                <div key={d.star} className={d.earned ? 'text-[#f39c12]' : ''}>
                  {'\u2605'.repeat(d.star)}: {d.reason}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Eco lesson */}
        {ecoLesson && (
          <div className="mb-5 p-3 rounded text-sm text-left" style={{ background: '#1a3a1a' }}>
            <div className="text-xs font-bold uppercase text-[#2ecc71] mb-1">
              Ecology Lesson
            </div>
            <p className="text-[#d4e8c2] leading-relaxed">{ecoLesson}</p>
          </div>
        )}

        {/* Retry message */}
        {failed && (
          <div className="mb-4 p-2 rounded text-xs" style={{ background: '#2a0f0f', border: '1px solid #c0392b' }}>
            <p className="text-[#e74c3c] font-bold mb-1">You&apos;ll retry this mission!</p>
            <p className="text-[#d4e8c2]">
              Earn at least 1 star to advance. Your teacher will start the next round when everyone is ready.
            </p>
          </div>
        )}

        {/* Next button */}
        <button
          onClick={() => {
            setVisible(false);
            onNext();
          }}
          className="px-6 py-2 text-sm font-bold uppercase tracking-wider cursor-pointer
            bg-[#2d5a27] text-[#8bba6a] hover:bg-[#3a7a34] transition-colors"
          style={{
            boxShadow: 'inset -1px -1px 0 rgba(0,0,0,0.3), inset 1px 1px 0 rgba(255,255,255,0.1)',
          }}
        >
          {failed ? 'Retry Mission' : isLastMission ? 'View Results' : 'Next Mission'}
        </button>
      </div>
    </div>
  );
}

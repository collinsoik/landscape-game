'use client';

import React, { useState } from 'react';
import type { MissionObjective } from '@/lib/types';
import { ECOSYSTEM_PATTERNS } from '@/config/scoring-rules';
import { getElementDef } from '@/config/elements';

interface GoalBannerProps {
  goals: { text: string; metric?: { category: string; threshold: number } }[];
  currentScores?: { biodiversity: number; sustainability: number; aesthetics: number; ecosystemHealth: number; grand: number } | null;
  objectives?: MissionObjective[];
  objectivesCompleted?: string[];
  missionType?: string | null;
}

const CATEGORY_COLORS: Record<string, string> = {
  biodiversity: '#2ecc71',
  sustainability: '#3498db',
  aesthetics: '#e74c3c',
  ecosystemHealth: '#f39c12',
};

function getScoreProgress(
  obj: MissionObjective,
  currentScores: GoalBannerProps['currentScores'],
): React.ReactNode {
  if (obj.condition.type !== 'min_score' || !currentScores) return null;
  const { threshold, category } = obj.condition;
  const catKey = category ?? 'grand';
  const current = catKey === 'grand'
    ? currentScores.grand
    : (currentScores as any)[catKey] ?? 0;
  const percent = Math.min(1, Math.max(0, current / threshold));
  const color = category ? (CATEGORY_COLORS[category] ?? '#8bba6a') : '#8bba6a';
  return (
    <div className="flex items-center gap-1.5 ml-1">
      <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: '#1a3a1a' }}>
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${percent * 100}%`, background: percent >= 1 ? '#2ecc71' : color }}
        />
      </div>
      <span className="text-xs font-mono tabular-nums" style={{ color: percent >= 1 ? '#2ecc71' : '#6a9a4a' }}>
        {Math.round(current)}/{threshold}
      </span>
    </div>
  );
}

export default function GoalBanner({ goals, currentScores, objectives, objectivesCompleted, missionType }: GoalBannerProps) {
  const [hoveredPattern, setHoveredPattern] = useState<string | null>(null);

  // If we have mission objectives, show multi-objective checklist
  if (objectives && objectives.length > 0) {
    return (
      <div
        className="px-4 py-2 flex items-center gap-3 text-sm relative"
        style={{ background: '#0d1f0d', borderBottom: '1px solid #1a3a1a' }}
      >
        {missionType && (
          <span
            className="font-bold uppercase tracking-wider flex-shrink-0 px-2 py-0.5 rounded text-xs"
            style={{
              color: getMissionTypeColor(missionType),
              background: `${getMissionTypeColor(missionType)}20`,
              border: `1px solid ${getMissionTypeColor(missionType)}40`,
            }}
          >
            {missionType}
          </span>
        )}
        <div className="flex items-center gap-4 flex-1 overflow-x-auto">
          {objectives.map((obj) => {
            const complete = objectivesCompleted?.includes(obj.id) ?? false;
            const patternName = obj.condition.type === 'pattern' ? obj.condition.patternName : null;
            const pattern = patternName ? ECOSYSTEM_PATTERNS.find((p) => p.name === patternName) : null;
            return (
              <div key={obj.id} className="flex items-center gap-1.5 flex-shrink-0 relative">
                <span
                  className="w-4 h-4 rounded-sm flex items-center justify-center text-[10px] font-bold"
                  style={{
                    background: complete ? '#2ecc71' : '#1a3a1a',
                    border: complete ? '1px solid #27ae60' : '1px solid #2d5a27',
                    color: complete ? '#0d1f0d' : '#4a6a3a',
                  }}
                >
                  {complete ? '\u2713' : ''}
                </span>
                <span className={complete ? 'text-[#2ecc71] line-through opacity-70' : 'text-[#d4e8c2]'}>
                  {obj.text}
                </span>
                {pattern && (
                  <span
                    className="text-[#3498db] cursor-help ml-0.5"
                    onMouseEnter={() => setHoveredPattern(patternName)}
                    onMouseLeave={() => setHoveredPattern(null)}
                  >
                    {'\u24D8'}
                  </span>
                )}
                {pattern && hoveredPattern === patternName && (
                  <div
                    className="absolute top-full left-0 mt-1 z-50 p-2.5 rounded text-xs whitespace-nowrap"
                    style={{ background: '#0d1f0d', border: '1px solid #2d5a27', boxShadow: '0 4px 12px rgba(0,0,0,0.6)' }}
                  >
                    <div className="text-[#8bba6a] font-bold mb-1">{pattern.name}</div>
                    <div className="text-[#d4e8c2]">
                      {pattern.requiredElements.map((req) => {
                        const def = getElementDef(req.type);
                        return req.minCount > 1 ? `${def?.name ?? req.type} x${req.minCount}` : def?.name ?? req.type;
                      }).join(' + ')}
                      <span className="text-[#6a9a4a]"> (within {pattern.maxRadius}px)</span>
                    </div>
                    <div className="text-[#6a9a4a] italic mt-0.5">{pattern.description}</div>
                  </div>
                )}
                {getScoreProgress(obj, currentScores)}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Fallback: legacy single-goal display
  if (!goals || goals.length === 0) return null;

  const goal = goals[0];
  const metric = goal.metric;

  let progress: number | null = null;
  if (metric && currentScores) {
    const categoryMap: Record<string, number> = {
      biodiversity: currentScores.biodiversity,
      sustainability: currentScores.sustainability,
      aesthetics: currentScores.aesthetics,
      ecosystemHealth: currentScores.ecosystemHealth,
    };
    const current = categoryMap[metric.category] ?? currentScores.grand;
    progress = Math.min(1, Math.max(0, current / metric.threshold));
  }

  return (
    <div
      className="px-4 py-1.5 flex items-center gap-3 text-xs"
      style={{ background: '#0d1f0d', borderBottom: '1px solid #1a3a1a' }}
    >
      <span className="text-[#f39c12] font-bold uppercase tracking-wider flex-shrink-0">
        Goal
      </span>
      <span className="text-[#d4e8c2] flex-1">{goal.text}</span>
      {progress !== null && (
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="w-24 h-2 bg-[#1a3a1a] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${progress * 100}%`,
                background: progress >= 1 ? '#2ecc71' : '#f39c12',
              }}
            />
          </div>
          <span className={progress >= 1 ? 'text-[#2ecc71] font-bold' : 'text-[#6a9a4a]'}>
            {Math.round(progress * 100)}%
          </span>
        </div>
      )}
    </div>
  );
}

function getMissionTypeColor(type: string): string {
  switch (type) {
    case 'build': return '#2ecc71';
    case 'fix': return '#f39c12';
    case 'survive': return '#e74c3c';
    case 'discover': return '#3498db';
    case 'race': return '#9b59b6';
    case 'restore': return '#1abc9c';
    default: return '#8bba6a';
  }
}

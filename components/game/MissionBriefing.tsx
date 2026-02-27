'use client';

import { useEffect, useRef, useState } from 'react';
import type { MissionType, MissionObjective, StarThresholds } from '@/lib/types';
import { ECOSYSTEM_PATTERNS } from '@/config/scoring-rules';
import { getElementDef } from '@/config/elements';

interface MissionBriefingProps {
  show: boolean;
  missionType: MissionType;
  missionTitle: string;
  missionNarrative: string;
  objectives: MissionObjective[];
  starThresholds: StarThresholds;
  budget?: number;
  actionLimit?: number;
  duration: number;
  availableCategories?: string[];
  round: number;
  totalMissions: number;
  retrying?: boolean;
  onReady: () => void;
}

const MISSION_TYPE_ICONS: Record<string, string> = {
  build: '\u{1F331}',    // seedling
  fix: '\u{1F527}',      // wrench
  survive: '\u{26A1}',   // lightning
  discover: '\u{1F50D}', // magnifying glass
  race: '\u{23F1}',      // stopwatch
  restore: '\u{1F33F}',  // herb
};

const CATEGORY_LABELS: Record<string, string> = {
  trees: 'Trees', shrubs: 'Shrubs', flowers: 'Flowers',
  ground_cover: 'Ground Cover', water_features: 'Water',
  structures: 'Structures', wildlife_habitat: 'Habitat', invasive: 'Invasive',
};

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

function getPatternInfo(patternName: string) {
  const pattern = ECOSYSTEM_PATTERNS.find((p) => p.name === patternName);
  if (!pattern) return null;
  const elementNames = pattern.requiredElements.map((req) => {
    const def = getElementDef(req.type);
    const name = def?.name ?? req.type;
    return req.minCount > 1 ? `${name} x${req.minCount}` : name;
  });
  return { ...pattern, elementNames };
}

function describeStarCondition(cond: StarThresholds['oneStar']): string {
  const parts: string[] = [];
  if (cond.objectives?.length) parts.push('Complete objectives');
  if (cond.minScore !== undefined) parts.push(`Score ${cond.minScore}+`);
  if (cond.minSynergies !== undefined) parts.push(`${cond.minSynergies}+ synergies`);
  if (cond.maxCoinsSpent !== undefined) parts.push(`Spend \u2264${cond.maxCoinsSpent} coins`);
  if (cond.noConflicts) parts.push('No conflicts');
  if (cond.minCategoryScore) parts.push(`${cond.minCategoryScore.category} ${cond.minCategoryScore.threshold}+`);
  return parts.join(' + ') || 'Complete the mission';
}

export default function MissionBriefing({
  show,
  missionType,
  missionTitle,
  missionNarrative,
  objectives,
  starThresholds,
  budget,
  actionLimit,
  duration,
  availableCategories,
  round,
  totalMissions,
  retrying,
  onReady,
}: MissionBriefingProps) {
  const [visible, setVisible] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;

  useEffect(() => {
    if (show) {
      setVisible(true);
      setCountdown(10);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setVisible(false);
            onReadyRef.current();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    } else {
      setVisible(false);
    }
  }, [show]);

  if (!visible) return null;

  const typeColor = getMissionTypeColor(missionType);
  const icon = MISSION_TYPE_ICONS[missionType] ?? '';

  return (
    <div
      className="fixed inset-0 z-[95] flex items-center justify-center"
      style={{ background: 'rgba(13, 31, 13, 0.97)' }}
    >
      <div className="text-center max-w-lg px-6 w-full">
        {/* Mission number */}
        <div className="text-sm text-[#6a9a4a] uppercase tracking-widest mb-2">
          Mission {round} of {totalMissions}
          {retrying && (
            <span
              className="ml-2 px-2 py-0.5 text-xs font-bold rounded"
              style={{ background: '#c0392b', color: '#fff' }}
            >
              RETRY
            </span>
          )}
        </div>

        {/* Title + Type icon */}
        <div className="flex items-center justify-center gap-3 mb-2">
          <span className="text-2xl">{icon}</span>
          <h2
            className="text-2xl font-bold"
            style={{ color: typeColor, textShadow: '2px 2px 0 #1a3a1a' }}
          >
            {missionTitle}
          </h2>
        </div>

        {/* Type badge */}
        <div className="mb-4">
          <span
            className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded"
            style={{
              color: typeColor,
              background: `${typeColor}20`,
              border: `1px solid ${typeColor}40`,
            }}
          >
            {missionType} mission
          </span>
        </div>

        {/* Narrative */}
        <p className="text-sm text-[#d4e8c2] mb-5 leading-relaxed">
          {missionNarrative}
        </p>

        {/* Objectives & Constraints in two columns */}
        <div className="flex gap-6 mb-5 text-left">
          {/* Objectives */}
          <div className="flex-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#f39c12] mb-2">
              Objectives
            </h3>
            <div className="flex flex-col gap-2">
              {objectives.map((obj) => {
                const patternInfo = obj.condition.type === 'pattern'
                  ? getPatternInfo(obj.condition.patternName)
                  : null;
                return (
                  <div key={obj.id} className="flex flex-col gap-1">
                    <div className="flex items-start gap-2 text-sm">
                      <span className="w-3.5 h-3.5 mt-0.5 rounded-sm border border-[#2d5a27] flex-shrink-0" />
                      <span className="text-[#d4e8c2]">{obj.text}</span>
                    </div>
                    {patternInfo && (
                      <div className="ml-5 text-xs p-2 rounded" style={{ background: '#1a3a1a' }}>
                        <div className="text-[#8bba6a] font-bold">
                          {patternInfo.elementNames.join(' + ')}
                          <span className="text-[#6a9a4a] font-normal"> (within {patternInfo.maxRadius}px)</span>
                        </div>
                        <div className="text-[#6a9a4a] italic mt-0.5">{patternInfo.description}</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Constraints */}
          <div className="flex-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#3498db] mb-2">
              Constraints
            </h3>
            <div className="flex flex-col gap-2 text-sm text-[#d4e8c2]">
              <div className="flex items-center gap-2">
                <span className="text-[#f39c12]">{'\u23F1'}</span>
                <span>{duration}s time limit</span>
              </div>
              {budget !== undefined && budget > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-[#f39c12]">{'\u26AB'}</span>
                  <span>{budget} coins</span>
                </div>
              )}
              {actionLimit !== undefined && actionLimit > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-[#3498db]">{'\u26A1'}</span>
                  <span>{actionLimit} actions</span>
                </div>
              )}
              {availableCategories && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {availableCategories.map((cat) => (
                    <span
                      key={cat}
                      className="text-xs px-2 py-0.5 rounded bg-[#1a3a1a] text-[#6a9a4a]"
                    >
                      {CATEGORY_LABELS[cat] ?? cat}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Star thresholds */}
        <div className="mb-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#f39c12] mb-2">
            Star Rating
          </h3>
          <div className="flex flex-col gap-1.5 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-[#f39c12]">{'\u2605'}</span>
              <span className="text-[#6a9a4a]">{describeStarCondition(starThresholds.oneStar)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#f39c12]">{'\u2605\u2605'}</span>
              <span className="text-[#6a9a4a]">{describeStarCondition(starThresholds.twoStar)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#f39c12]">{'\u2605\u2605\u2605'}</span>
              <span className="text-[#6a9a4a]">{describeStarCondition(starThresholds.threeStar)}</span>
            </div>
          </div>
        </div>

        {/* Ready button */}
        <button
          onClick={() => {
            setVisible(false);
            onReady();
          }}
          className="px-6 py-2 text-sm font-bold uppercase tracking-wider cursor-pointer
            bg-[#2d5a27] text-[#8bba6a] hover:bg-[#3a7a34] transition-colors"
          style={{
            boxShadow: 'inset -1px -1px 0 rgba(0,0,0,0.3), inset 1px 1px 0 rgba(255,255,255,0.1)',
          }}
        >
          Ready! ({countdown})
        </button>
      </div>
    </div>
  );
}

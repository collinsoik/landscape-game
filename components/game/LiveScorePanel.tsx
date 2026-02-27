'use client';

import { useState, useMemo } from 'react';
import type { ScoreBreakdown } from '@/lib/types';
import type { Placement } from '@/server/src/types/models';
import { getElementDef } from '@/config/elements';

interface LiveScorePanelProps {
  scores: ScoreBreakdown | null;
  placements?: Placement[];
}

type CatKey = 'biodiversity' | 'sustainability' | 'aesthetics' | 'ecosystemHealth';

const CATEGORIES: { key: CatKey; label: string; color: string }[] = [
  { key: 'biodiversity', label: 'Biodiversity', color: '#2ecc71' },
  { key: 'sustainability', label: 'Sustainability', color: '#3498db' },
  { key: 'aesthetics', label: 'Aesthetics', color: '#e74c3c' },
  { key: 'ecosystemHealth', label: 'Ecosystem', color: '#f39c12' },
];

export default function LiveScorePanel({ scores, placements }: LiveScorePanelProps) {
  const [collapsed, setCollapsed] = useState(true);

  if (!scores) return null;

  // Compute per-plant base contributions per category
  const plantSegments = useMemo(() => {
    if (!placements || placements.length === 0) return null;
    const segments: Record<CatKey, { name: string; value: number }[]> = {
      biodiversity: [], sustainability: [], aesthetics: [], ecosystemHealth: [],
    };
    for (const p of placements) {
      const def = getElementDef(p.elementType);
      if (!def) continue;
      for (const cat of CATEGORIES) {
        const val = def.baseScores[cat.key];
        if (val > 0) segments[cat.key].push({ name: def.name, value: val });
      }
    }
    return segments;
  }, [placements]);

  // Compute synergy/pattern bonus per category
  const bonusPerCat = useMemo(() => {
    const bonus: Record<CatKey, number> = { biodiversity: 0, sustainability: 0, aesthetics: 0, ecosystemHealth: 0 };
    if (!scores) return bonus;
    for (const inter of scores.interactions) {
      const cat = inter.category as CatKey;
      if (cat in bonus) bonus[cat] += inter.value;
    }
    for (const pat of scores.patterns) {
      const cat = pat.category as CatKey;
      if (cat in bonus) bonus[cat] += pat.bonus;
    }
    return bonus;
  }, [scores]);

  return (
    <div className="fixed bottom-4 right-16 md:right-4 z-30" style={{ minWidth: 200 }}>
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold uppercase tracking-wider cursor-pointer
          bg-[#0d1f0d] text-[#8bba6a] hover:bg-[#1a3a1a] transition-colors rounded-t w-full justify-between"
        style={{ boxShadow: '0 -1px 0 #1a3a1a' }}
      >
        <span>Score: {Math.round(scores.total.grand)}</span>
        <span className={`transition-transform ${collapsed ? '' : 'rotate-180'}`}>
          &#9650;
        </span>
      </button>
      {!collapsed && (
        <div
          className="p-2 rounded-b rounded-tl"
          style={{ background: '#0d1f0d', boxShadow: '0 2px 8px rgba(0,0,0,0.5)' }}
        >
          <div className="flex flex-col gap-2">
            {CATEGORIES.map((cat) => {
              const total = scores.total[cat.key];
              const segments = plantSegments?.[cat.key] ?? [];
              const bonus = bonusPerCat[cat.key];
              const maxVal = Math.max(total, 1);

              return (
                <div key={cat.key}>
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-xs text-[#6a9a4a]">{cat.label}</span>
                    <span className="text-sm font-bold" style={{ color: cat.color }}>
                      {Math.round(total)}
                    </span>
                  </div>
                  <div className="h-2.5 rounded-sm overflow-hidden flex" style={{ background: '#1a3a1a' }}>
                    {segments.map((seg, i) => (
                      <div
                        key={i}
                        className="h-full"
                        style={{
                          width: `${(seg.value / maxVal) * 100}%`,
                          background: cat.color,
                          opacity: 0.5 + (i % 2) * 0.3,
                          borderRight: i < segments.length - 1 ? '1px solid #0d1f0d' : 'none',
                        }}
                        title={`${seg.name}: +${seg.value}`}
                      />
                    ))}
                    {bonus !== 0 && (
                      <div
                        className="h-full"
                        style={{
                          width: `${(Math.abs(bonus) / maxVal) * 100}%`,
                          background: bonus > 0
                            ? `repeating-linear-gradient(45deg, ${cat.color}, ${cat.color} 2px, transparent 2px, transparent 4px)`
                            : `repeating-linear-gradient(45deg, #c0392b, #c0392b 2px, transparent 2px, transparent 4px)`,
                        }}
                        title={`Synergies/Patterns: ${bonus > 0 ? '+' : ''}${Math.round(bonus)}`}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

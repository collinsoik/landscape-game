'use client';

import { useMemo } from 'react';
import { ELEMENT_CATALOG, ELEMENT_CATEGORIES } from '@/config/elements';
import type { ElementDefinition } from '@/server/src/types/models';
import ElementCategory from './ElementCategory';

interface ElementSidebarProps {
  selectedElementType: string | null;
  onSelectElement: (type: string) => void;
  disabled?: boolean;
  availableCategories?: string[] | null;
  budgetRemaining?: number;
}

export default function ElementSidebar({
  selectedElementType,
  onSelectElement,
  disabled,
  availableCategories,
  budgetRemaining,
}: ElementSidebarProps) {
  // Group elements by category
  const grouped = useMemo(() => {
    const map = new Map<string, ElementDefinition[]>();
    for (const el of ELEMENT_CATALOG) {
      const list = map.get(el.category) ?? [];
      list.push(el);
      map.set(el.category, list);
    }
    return map;
  }, []);

  return (
    <div className={[
      'w-full md:w-64 flex-shrink-0 bg-neutral-850 border-l border-neutral-700 flex flex-col h-full',
      disabled ? 'opacity-50 pointer-events-none' : '',
    ].join(' ')}
      style={{ backgroundColor: '#1a1a1a' }}
    >
      {/* Header */}
      <div className="px-3 py-2.5 border-b border-neutral-700">
        <h2 className="text-base font-bold text-white">Elements</h2>
        <p className="text-xs text-neutral-400 mt-0.5">
          {disabled ? 'Waiting for teacher to start the timer...' : 'Drag or tap to place on canvas'}
        </p>
      </div>

      {/* Scrollable element list */}
      <div className="flex-1 overflow-y-auto py-1">
        {ELEMENT_CATEGORIES.map((cat) => {
          const elements = grouped.get(cat.key);
          if (!elements || elements.length === 0) return null;

          // Determine if this category is locked (not in availableCategories)
          const isLocked = availableCategories != null
            && availableCategories.length > 0
            && !availableCategories.includes(cat.key);

          return (
            <ElementCategory
              key={cat.key}
              categoryKey={cat.key}
              label={cat.label}
              color={cat.color}
              elements={elements}
              selectedElementType={selectedElementType}
              onSelectElement={onSelectElement}
              locked={isLocked}
              budgetRemaining={budgetRemaining}
            />
          );
        })}
      </div>

      {/* Selected element info */}
      {selectedElementType && (
        <SelectedInfo type={selectedElementType} />
      )}
    </div>
  );
}

const WATER_LABELS: Record<string, string> = {
  low: 'Low', medium: 'Medium', high: 'High',
};
const SHADE_LABELS: Record<string, string> = {
  full_sun: 'Full Sun', partial_shade: 'Partial Shade', full_shade: 'Full Shade', any: 'Any',
};

const SCORE_CATEGORIES = [
  { key: 'biodiversity',    label: 'Biodiversity',  color: '#2ecc71' },
  { key: 'sustainability',  label: 'Sustainability', color: '#3498db' },
  { key: 'aesthetics',      label: 'Aesthetics',    color: '#e74c3c' },
  { key: 'ecosystemHealth', label: 'Ecosystem',     color: '#f39c12' },
] as const;

function SelectedInfo({ type }: { type: string }) {
  const el = ELEMENT_CATALOG.find((e) => e.type === type);
  if (!el) return null;

  const scores = el.baseScores;
  const props = el.properties;
  const maxScore = 10;

  return (
    <div className="px-3 py-3 border-t border-neutral-700 bg-neutral-800/50 space-y-2.5">
      {/* Name + Cost */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-white">{el.name}</span>
        <span className="text-sm font-bold text-[#f39c12]">
          {el.cost} coin{el.cost !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Description */}
      <p className="text-xs text-neutral-400 leading-snug">{el.description}</p>

      {/* Resource Requirements */}
      <div className="flex gap-2">
        <div
          className="flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded"
          style={{ backgroundColor: '#3498db15', color: '#67b8e3' }}
        >
          <span>{'\uD83D\uDCA7'}</span>
          <span>{WATER_LABELS[props.waterRequirement] ?? 'Medium'} Water</span>
        </div>
        <div
          className="flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded"
          style={{ backgroundColor: '#f1c40f15', color: '#f1c40f' }}
        >
          <span>{'\u2600'}</span>
          <span>{SHADE_LABELS[props.shadeRequirement] ?? 'Any'}</span>
        </div>
      </div>

      {/* Property Badges */}
      {(props.isNative || props.providesShade || props.attractsPollinators) && (
        <div className="flex gap-1.5 flex-wrap">
          {props.isNative && (
            <span className="text-[11px] px-1.5 py-0.5 rounded font-medium text-green-400"
                  style={{ backgroundColor: '#22c55e18' }}>
              {'\uD83C\uDF3F'} Native
            </span>
          )}
          {props.providesShade && (
            <span className="text-[11px] px-1.5 py-0.5 rounded font-medium text-green-400"
                  style={{ backgroundColor: '#22c55e18' }}>
              {'\uD83C\uDF33'} Provides Shade
            </span>
          )}
          {props.attractsPollinators && (
            <span className="text-[11px] px-1.5 py-0.5 rounded font-medium text-amber-400"
                  style={{ backgroundColor: '#f59e0b18' }}>
              {'\uD83D\uDC1D'} Pollinators
            </span>
          )}
        </div>
      )}

      {/* Score Breakdown with Bars */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
          Base Scores
        </span>
        {SCORE_CATEGORIES.map(({ key, label, color }) => {
          const value = scores[key as keyof typeof scores];
          return (
            <div key={key} className="flex items-center gap-2">
              <span className="text-xs text-neutral-400 w-[76px] flex-shrink-0">{label}</span>
              <div className="flex-1 h-2 rounded-full bg-neutral-700/60 overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.max(0, (Math.abs(value) / maxScore) * 100)}%`,
                    backgroundColor: value >= 0 ? color : '#c0392b',
                  }}
                />
              </div>
              <span
                className="text-xs font-bold tabular-nums w-7 text-right"
                style={{ color: value > 0 ? color : value < 0 ? '#c0392b' : '#666' }}
              >
                {value > 0 ? '+' : ''}{value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

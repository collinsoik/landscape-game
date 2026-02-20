'use client';

import { useMemo } from 'react';
import { ELEMENT_CATALOG, ELEMENT_CATEGORIES } from '@/config/elements';
import type { ElementDefinition } from '@/server/src/types/models';
import ElementCategory from './ElementCategory';

interface ElementSidebarProps {
  selectedElementType: string | null;
  onSelectElement: (type: string) => void;
}

export default function ElementSidebar({
  selectedElementType,
  onSelectElement,
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
    <div className="w-64 flex-shrink-0 bg-neutral-850 border-l border-neutral-700 flex flex-col h-full"
      style={{ backgroundColor: '#1a1a1a' }}
    >
      {/* Header */}
      <div className="px-3 py-2 border-b border-neutral-700">
        <h2 className="text-sm font-semibold text-white">Elements</h2>
        <p className="text-[10px] text-neutral-400 mt-0.5">
          Drag or tap to place on canvas
        </p>
      </div>

      {/* Scrollable element list */}
      <div className="flex-1 overflow-y-auto py-1">
        {ELEMENT_CATEGORIES.map((cat) => {
          const elements = grouped.get(cat.key);
          if (!elements || elements.length === 0) return null;
          return (
            <ElementCategory
              key={cat.key}
              categoryKey={cat.key}
              label={cat.label}
              color={cat.color}
              elements={elements}
              selectedElementType={selectedElementType}
              onSelectElement={onSelectElement}
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

function SelectedInfo({ type }: { type: string }) {
  const el = ELEMENT_CATALOG.find((e) => e.type === type);
  if (!el) return null;

  const scores = el.baseScores;

  return (
    <div className="px-3 py-2 border-t border-neutral-700 bg-neutral-800/50">
      <div className="text-xs font-semibold text-white mb-1">{el.name}</div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px]">
        <ScoreRow label="Bio" value={scores.biodiversity} />
        <ScoreRow label="Sus" value={scores.sustainability} />
        <ScoreRow label="Aes" value={scores.aesthetics} />
        <ScoreRow label="Eco" value={scores.ecosystemHealth} />
      </div>
    </div>
  );
}

function ScoreRow({ label, value }: { label: string; value: number }) {
  const color = value > 0 ? 'text-green-400' : value < 0 ? 'text-red-400' : 'text-neutral-400';
  return (
    <div className="flex justify-between">
      <span className="text-neutral-400">{label}</span>
      <span className={color}>
        {value > 0 ? '+' : ''}
        {value}
      </span>
    </div>
  );
}

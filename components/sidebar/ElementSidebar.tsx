'use client';

import { useMemo } from 'react';
import { ELEMENT_CATALOG, getElementDef } from '@/config/elements';
import { ROUNDS } from '@/config/rounds';
import type { LocalPlacement } from '@/lib/types';
import ElementCard from './ElementCard';

interface ElementSidebarProps {
  currentRound: number;
  placements: LocalPlacement[];
  selectedElementType: string | null;
  onSelectElement: (type: string) => void;
  disabled?: boolean;
}

export default function ElementSidebar({
  currentRound,
  placements,
  selectedElementType,
  onSelectElement,
  disabled,
}: ElementSidebarProps) {
  const roundConfig = ROUNDS[currentRound - 1];

  const roundPlacements = useMemo(
    () => placements.filter((p) => p.round === currentRound),
    [placements, currentRound],
  );

  const elements = useMemo(
    () => roundConfig.elements.map((type) => ELEMENT_CATALOG.find((e) => e.type === type)).filter(Boolean),
    [roundConfig],
  );

  const atCap = roundPlacements.length >= roundConfig.cap;

  return (
    <div
      className={[
        'w-full md:w-64 flex-shrink-0 border-l border-neutral-700 flex flex-col h-full',
        disabled ? 'opacity-50 pointer-events-none' : '',
      ].join(' ')}
      style={{ backgroundColor: '#1a1a1a' }}
    >
      {/* Header */}
      <div className="px-3 py-2.5 border-b border-neutral-700">
        <h2 className="text-base font-bold text-white">
          Round {currentRound}: {roundConfig.category}
        </h2>
        <p className="text-xs text-neutral-400 mt-0.5">
          {roundPlacements.length}/{roundConfig.cap} placed
          {atCap && ' (cap reached)'}
        </p>
      </div>

      {/* Element list */}
      <div className="flex-1 overflow-y-auto py-1 px-2">
        <div className="flex flex-col gap-0.5">
          {elements.map((el) => el && (
            <ElementCard
              key={el.type}
              element={el}
              isSelected={selectedElementType === el.type}
              onSelect={onSelectElement}
              disabled={atCap && selectedElementType !== el.type}
              placements={placements}
            />
          ))}
        </div>
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

  return (
    <div className="px-3 py-3 border-t border-neutral-700 bg-neutral-800/50 space-y-2">
      <span className="text-sm font-bold text-white">{el.name}</span>
      <p className="text-xs text-neutral-400 leading-snug">{el.description}</p>
    </div>
  );
}

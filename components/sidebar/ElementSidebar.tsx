'use client';

import { useMemo } from 'react';
import { ELEMENT_CATALOG, getElementDef } from '@/config/elements';
import { ROUNDS } from '@/config/rounds';
import type { LocalPlacement } from '@/lib/types';
import ElementCard from './ElementCard';
import PixelButton from '@/components/shared/PixelButton';

interface ElementSidebarProps {
  currentRound: number;
  placements: LocalPlacement[];
  selectedElementType: string | null;
  selectedPlacementId: string | null;
  onSelectElement: (type: string) => void;
  onSelectTool: () => void;
  onDeletePlacement: () => void;
  disabled?: boolean;
}

export default function ElementSidebar({
  currentRound,
  placements,
  selectedElementType,
  selectedPlacementId,
  onSelectElement,
  onSelectTool,
  onDeletePlacement,
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
  const inSelectMode = selectedElementType === null;

  const selectedPlacement = selectedPlacementId
    ? placements.find((p) => p.id === selectedPlacementId)
    : null;

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

      {/* Select tool button */}
      <div className="px-2 pt-1.5 pb-0.5">
        <button
          onClick={onSelectTool}
          className={[
            'w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-sm font-medium transition-colors cursor-pointer',
            inSelectMode
              ? 'bg-neutral-600 text-white'
              : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-neutral-200',
          ].join(' ')}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M3 1L3 12L6.5 8.5L9.5 14L11.5 13L8.5 7L13 7L3 1Z"
              fill="currentColor"
            />
          </svg>
          Select
        </button>
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

      {/* Bottom info panel */}
      {selectedPlacement ? (
        <SelectedPlacementInfo
          placement={selectedPlacement}
          onDelete={onDeletePlacement}
        />
      ) : selectedElementType ? (
        <SelectedInfo type={selectedElementType} />
      ) : null}
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

function SelectedPlacementInfo({
  placement,
  onDelete,
}: {
  placement: LocalPlacement;
  onDelete: () => void;
}) {
  const el = getElementDef(placement.elementType);
  if (!el) return null;

  return (
    <div className="px-3 py-3 border-t border-neutral-700 bg-neutral-800/50 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-white">{el.name}</span>
        <span className="text-xs text-neutral-500">Round {placement.round}</span>
      </div>
      <p className="text-xs text-neutral-400 leading-snug">{el.description}</p>
      <PixelButton variant="danger" size="sm" onClick={onDelete} className="w-full">
        Delete
      </PixelButton>
    </div>
  );
}

'use client';

import { useEffect, useRef, useState, memo } from 'react';
import type { ElementDefinition } from '@/config/elements';
import type { LocalPlacement } from '@/lib/types';
import { getSprite } from '@/lib/sprites/loader';
import { isElementUnlocked, getProximityDescription } from '@/lib/proximity';

interface ElementCardProps {
  element: ElementDefinition;
  isSelected: boolean;
  onSelect: (type: string) => void;
  disabled?: boolean;
  placements: LocalPlacement[];
}

function ElementCard({
  element,
  isSelected,
  onSelect,
  disabled = false,
  placements,
}: ElementCardProps) {
  const [spriteUrl, setSpriteUrl] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const unlocked = isElementUnlocked(element.type, placements);
  const proximityDesc = getProximityDescription(element.type);
  const isDisabled = disabled || !unlocked;

  useEffect(() => {
    getSprite(element.type, element.category, element.width, element.height).then(
      (img) => setSpriteUrl(img.src),
    );
  }, [element]);

  const handleDragStart = (e: React.DragEvent) => {
    if (isDisabled) { e.preventDefault(); return; }
    e.dataTransfer.setData('application/element-type', element.type);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleSelect = () => {
    if (isDisabled) return;
    onSelect(element.type);
  };

  // Truncate description for condensed view
  const shortDesc = element.description.length > 60
    ? element.description.slice(0, 57) + '...'
    : element.description;

  return (
    <div ref={cardRef} className="flex flex-col">
      <div
        draggable={!isDisabled}
        onDragStart={handleDragStart}
        onClick={handleSelect}
        onTouchEnd={handleSelect}
        className={`flex items-center gap-2.5 p-2 rounded-t select-none transition-colors relative
          ${isDisabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
          ${isSelected ? 'bg-white/20 ring-2 ring-white/60' : !isDisabled ? 'bg-white/5 hover:bg-white/10' : 'bg-white/5'}
          ${!isSelected ? 'rounded-b' : ''}`}
        title={!unlocked && proximityDesc ? proximityDesc : undefined}
      >
        <div
          className="flex-shrink-0 rounded"
          style={{ width: 44, height: 44, imageRendering: 'pixelated', overflow: 'hidden' }}
        >
          {spriteUrl && (
            <img src={spriteUrl} alt={element.name} className="w-full h-full object-contain" draggable={false} />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-sm font-semibold text-white truncate block">{element.name}</span>
          {!unlocked && proximityDesc ? (
            <span className="text-xs text-amber-400">{proximityDesc}</span>
          ) : (
            <span className="text-[11px] text-neutral-500 leading-tight block">{shortDesc}</span>
          )}
        </div>
      </div>

      {/* Expanded details on selection */}
      {isSelected && (
        <div className="bg-white/10 rounded-b px-3 py-2 space-y-1.5 border-t border-white/10">
          <p className="text-xs text-neutral-300 leading-snug">{element.description}</p>
          {element.funFacts && element.funFacts.length > 0 && (
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Quick Facts</span>
              <ul className="space-y-0.5">
                {element.funFacts.map((fact, i) => (
                  <li key={i} className="text-[11px] text-neutral-400 leading-snug flex gap-1.5">
                    <span className="text-emerald-500 flex-shrink-0">*</span>
                    <span>{fact}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default memo(ElementCard);

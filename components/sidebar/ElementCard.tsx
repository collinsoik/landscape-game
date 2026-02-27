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

  return (
    <div
      ref={cardRef}
      draggable={!isDisabled}
      onDragStart={handleDragStart}
      onClick={handleSelect}
      onTouchEnd={handleSelect}
      className={`flex items-center gap-2.5 p-2 rounded select-none transition-colors relative
        ${isDisabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
        ${isSelected ? 'bg-white/20 ring-2 ring-white/60' : !isDisabled ? 'bg-white/5 hover:bg-white/10' : 'bg-white/5'}`}
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
        {!unlocked && proximityDesc && (
          <span className="text-xs text-amber-400">{proximityDesc}</span>
        )}
      </div>
    </div>
  );
}

export default memo(ElementCard);

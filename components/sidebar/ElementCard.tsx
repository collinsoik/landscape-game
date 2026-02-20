'use client';

import { useEffect, useRef, useState, memo } from 'react';
import type { ElementDefinition } from '@/server/src/types/models';
import { getSprite } from '@/lib/sprites/loader';

interface ElementCardProps {
  element: ElementDefinition;
  isSelected: boolean;
  onSelect: (type: string) => void;
}

function ElementCard({
  element,
  isSelected,
  onSelect,
}: ElementCardProps) {
  const [spriteUrl, setSpriteUrl] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getSprite(element.type, element.category, element.width, element.height).then(
      (img) => setSpriteUrl(img.src),
    );
  }, [element]);

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('application/element-type', element.type);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const totalScore =
    element.baseScores.biodiversity +
    element.baseScores.sustainability +
    element.baseScores.aesthetics +
    element.baseScores.ecosystemHealth;

  return (
    <div
      ref={cardRef}
      draggable
      onDragStart={handleDragStart}
      onClick={() => onSelect(element.type)}
      onTouchEnd={() => onSelect(element.type)}
      className={`flex items-center gap-2 p-2 rounded cursor-pointer select-none transition-colors
        ${
          isSelected
            ? 'bg-white/20 ring-2 ring-white/60'
            : 'bg-white/5 hover:bg-white/10'
        }`}
    >
      {/* Sprite preview */}
      <div
        className="flex-shrink-0 rounded"
        style={{
          width: 36,
          height: 36,
          imageRendering: 'pixelated',
          overflow: 'hidden',
        }}
      >
        {spriteUrl && (
          <img
            src={spriteUrl}
            alt={element.name}
            className="w-full h-full object-contain"
            draggable={false}
          />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium text-white truncate">
          {element.name}
        </div>
        <div className="text-[10px] text-neutral-400 truncate">
          {element.description}
        </div>
      </div>

      {/* Score badge */}
      <div
        className={`flex-shrink-0 text-xs font-bold rounded px-1.5 py-0.5 ${
          totalScore >= 0
            ? 'text-green-300 bg-green-900/40'
            : 'text-red-300 bg-red-900/40'
        }`}
      >
        {totalScore >= 0 ? '+' : ''}
        {totalScore}
      </div>
    </div>
  );
}

export default memo(ElementCard);

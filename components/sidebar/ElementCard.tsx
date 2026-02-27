'use client';

import { useEffect, useRef, useState, memo } from 'react';
import type { ElementDefinition } from '@/server/src/types/models';
import { getSprite } from '@/lib/sprites/loader';

interface ElementCardProps {
  element: ElementDefinition;
  isSelected: boolean;
  onSelect: (type: string) => void;
  canAfford?: boolean;
}

const WATER_LABEL: Record<string, { text: string; color: string }> = {
  low:    { text: 'Low',  color: '#67b8e3' },
  medium: { text: 'Med',  color: '#3498db' },
  high:   { text: 'High', color: '#2471a3' },
};

const SHADE_LABEL: Record<string, { text: string; icon: string; color: string }> = {
  full_sun:       { text: 'Sun',     icon: '\u2600', color: '#f1c40f' },
  partial_shade:  { text: 'Part',    icon: '\u26C5', color: '#d4a017' },
  full_shade:     { text: 'Shade',   icon: '\uD83C\uDF11', color: '#7f8c8d' },
  any:            { text: 'Any',     icon: '\u2726', color: '#6a9a4a' },
};

function ElementCard({
  element,
  isSelected,
  onSelect,
  canAfford = true,
}: ElementCardProps) {
  const [spriteUrl, setSpriteUrl] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getSprite(element.type, element.category, element.width, element.height).then(
      (img) => setSpriteUrl(img.src),
    );
  }, [element]);

  const handleDragStart = (e: React.DragEvent) => {
    if (!canAfford) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData('application/element-type', element.type);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleSelect = () => {
    if (!canAfford) return;
    onSelect(element.type);
  };

  const totalScore =
    element.baseScores.biodiversity +
    element.baseScores.sustainability +
    element.baseScores.aesthetics +
    element.baseScores.ecosystemHealth;

  const waterReq = element.properties?.waterRequirement || 'medium';
  const shadeReq = element.properties?.shadeRequirement || 'any';
  const water = WATER_LABEL[waterReq] ?? WATER_LABEL.medium;
  const shade = SHADE_LABEL[shadeReq] ?? SHADE_LABEL.any;

  return (
    <div
      ref={cardRef}
      draggable={canAfford}
      onDragStart={handleDragStart}
      onClick={handleSelect}
      onTouchEnd={handleSelect}
      className={`flex items-center gap-2.5 p-2 rounded select-none transition-colors
        ${!canAfford ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
        ${
          isSelected
            ? 'bg-white/20 ring-2 ring-white/60'
            : canAfford
              ? 'bg-white/5 hover:bg-white/10'
              : 'bg-white/5'
        }`}
    >
      {/* Sprite preview */}
      <div
        className="flex-shrink-0 rounded"
        style={{
          width: 44,
          height: 44,
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
        {/* Row 1: Name + Cost */}
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-semibold text-white truncate">
            {element.name}
          </span>
          <span
            className="flex-shrink-0 text-xs font-bold tabular-nums ml-auto"
            style={{ color: canAfford ? '#f39c12' : '#555' }}
          >
            {element.cost}<span className="text-[11px]">{'\u00A0'}coin{element.cost !== 1 ? 's' : ''}</span>
          </span>
        </div>

        {/* Row 2: Resource requirements */}
        <div className="flex items-center gap-1.5 mt-1">
          <span
            className="text-[11px] font-medium rounded px-1 py-px leading-tight"
            style={{ color: water.color, backgroundColor: `${water.color}18` }}
          >
            {'\uD83D\uDCA7'}{water.text}
          </span>
          <span
            className="text-[11px] font-medium rounded px-1 py-px leading-tight"
            style={{ color: shade.color, backgroundColor: `${shade.color}18` }}
          >
            {shade.icon}{shade.text}
          </span>
          {element.properties?.isNative && (
            <span className="text-[11px] font-medium rounded px-1 py-px leading-tight text-green-400"
                  style={{ backgroundColor: '#22c55e18' }}>
              {'\uD83C\uDF3F'}
            </span>
          )}
        </div>
      </div>

      {/* Score badge */}
      <div
        className={`flex-shrink-0 text-sm font-bold rounded px-2 py-1 tabular-nums ${
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

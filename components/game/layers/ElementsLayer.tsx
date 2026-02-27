'use client';

import { Layer, Image as KonvaImage } from 'react-konva';
import { useEffect, useState, useCallback, memo } from 'react';
import type { LocalPlacement } from '@/lib/types';
import { getElementDef } from '@/config/elements';
import { getSprite, getSpriteSync } from '@/lib/sprites/loader';
import { GAME_DEFAULTS } from '@/config/game-defaults';

interface ElementsLayerProps {
  placements: LocalPlacement[];
  currentRound: number;
  selectedElementType: string | null;
  selectedPlacementId: string | null;
  onSelect: (placementId: string | null) => void;
  onMove: (placementId: string, x: number, y: number) => void;
  canvasWidth: number;
  canvasHeight: number;
}

function ElementsLayer({
  placements,
  currentRound,
  selectedElementType,
  selectedPlacementId,
  onSelect,
  onMove,
  canvasWidth,
  canvasHeight,
}: ElementsLayerProps) {
  const [loadGen, setLoadGen] = useState(0);

  useEffect(() => {
    let cancelled = false;
    placements.forEach((p) => {
      const def = getElementDef(p.elementType);
      if (!def) return;
      const cached = getSpriteSync(def.type, def.width, def.height);
      if (cached) return;
      getSprite(def.type, def.category, def.width, def.height).then(() => {
        if (!cancelled) setLoadGen((g) => g + 1);
      });
    });
    return () => { cancelled = true; };
  }, [placements]);

  const handleDragEnd = useCallback(
    (placementId: string, elWidth: number, elHeight: number) =>
      (e: { target: { x: () => number; y: () => number; position: (p: { x: number; y: number }) => void } }) => {
        const x = Math.max(0, Math.min(e.target.x(), canvasWidth - elWidth));
        const y = Math.max(0, Math.min(e.target.y(), canvasHeight - elHeight));
        e.target.position({ x, y });
        onMove(placementId, x, y);
      },
    [canvasWidth, canvasHeight, onMove],
  );

  const scale = GAME_DEFAULTS.canvas.spriteScale;

  return (
    <Layer>
      {placements.map((p) => {
        const def = getElementDef(p.elementType);
        if (!def) return null;
        const sprite = getSpriteSync(def.type, def.width, def.height);
        if (!sprite) return null;

        const isCurrentRound = p.round === currentRound;
        const inSelectMode = selectedElementType === null;
        const canMove = isCurrentRound || inSelectMode;
        const isSelected = p.id === selectedPlacementId;

        return (
          <KonvaImage
            key={p.id}
            id={p.id}
            x={p.x}
            y={p.y}
            width={def.width * scale}
            height={def.height * scale}
            image={sprite}
            draggable={canMove}
            onClick={() => onSelect(isSelected ? null : p.id)}
            onTap={() => onSelect(isSelected ? null : p.id)}
            onDragEnd={handleDragEnd(p.id, def.width * scale, def.height * scale)}
            strokeEnabled={isSelected}
            stroke="#ffffff"
            strokeWidth={isSelected ? 2 : 0}
            shadowEnabled={isSelected}
            shadowColor="#ffffff"
            shadowBlur={8}
            shadowOpacity={0.6}
            opacity={canMove ? 1 : 0.6}
          />
        );
      })}
    </Layer>
  );
}

export default memo(ElementsLayer);

'use client';

import { Layer, Image as KonvaImage } from 'react-konva';
import { useEffect, useState, useCallback, memo } from 'react';
import type { Placement, ZoneRect } from '@/server/src/types/models';
import { getElementDef } from '@/config/elements';
import { getSprite, getSpriteSync } from '@/lib/sprites/loader';
import { clampToZone } from '@/lib/zones/validator';
import { GAME_DEFAULTS } from '@/config/game-defaults';

interface ElementsLayerProps {
  placements: Placement[];
  playerZone: ZoneRect | null;
  currentPlayerId: string;
  selectedPlacementId: string | null;
  onSelect: (placementId: string | null) => void;
  onMove: (placementId: string, x: number, y: number) => void;
  onHover?: (placementId: string | null) => void;
}

function ElementsLayer({
  placements,
  playerZone,
  currentPlayerId,
  selectedPlacementId,
  onSelect,
  onMove,
  onHover,
}: ElementsLayerProps) {
  const [loadGen, setLoadGen] = useState(0);

  // Kick off loading for all placements; bump loadGen when any new sprite loads
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
    (placementId: string, playerId: string, elWidth: number, elHeight: number) =>
      (e: { target: { x: () => number; y: () => number; position: (p: { x: number; y: number }) => void } }) => {
        if (playerId !== currentPlayerId || !playerZone) return;
        const clamped = clampToZone(
          e.target.x(),
          e.target.y(),
          elWidth,
          elHeight,
          playerZone,
        );
        e.target.position(clamped);
        onMove(placementId, clamped.x, clamped.y);
      },
    [currentPlayerId, playerZone, onMove],
  );

  const scale = GAME_DEFAULTS.canvas.spriteScale;

  return (
    <Layer>
      {placements.map((p) => {
        const def = getElementDef(p.elementType);
        if (!def) return null;
        const sprite = getSpriteSync(def.type, def.width, def.height);
        if (!sprite) return null;

        const isOwn = p.playerId === currentPlayerId;
        const isSelected = p.id === selectedPlacementId;
        const isPrePlaced = p.isPrePlaced;
        const isInvasive = def.category === 'invasive';

        // Pre-placed elements are not draggable
        const draggable = isOwn && !isPrePlaced;

        // Visual treatment for pre-placed elements
        let strokeColor = '#ffffff';
        let strokeWidth = isSelected ? 2 : 0;
        let shadowColor = '#ffffff';

        if (isPrePlaced && isInvasive) {
          // Red pulsing border for invasive pre-placed elements
          strokeColor = '#e74c3c';
          strokeWidth = 2;
          shadowColor = '#e74c3c';
        } else if (isPrePlaced) {
          // Subtle grey tint for neutral pre-placed
          strokeColor = '#888888';
          strokeWidth = 1;
          shadowColor = '#888888';
        }

        return (
          <KonvaImage
            key={p.id}
            id={p.id}
            x={p.x}
            y={p.y}
            width={def.width * scale}
            height={def.height * scale}
            image={sprite}
            draggable={draggable}
            onClick={() => onSelect(isSelected ? null : p.id)}
            onTap={() => onSelect(isSelected ? null : p.id)}
            onMouseEnter={() => onHover?.(p.id)}
            onMouseLeave={() => onHover?.(null)}
            onDragEnd={handleDragEnd(p.id, p.playerId, def.width * scale, def.height * scale)}
            strokeEnabled={isSelected || (isPrePlaced && isInvasive)}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            shadowEnabled={isSelected || (isPrePlaced && isInvasive)}
            shadowColor={shadowColor}
            shadowBlur={isPrePlaced && isInvasive ? 12 : 8}
            shadowOpacity={isPrePlaced && isInvasive ? 0.8 : 0.6}
            opacity={isPrePlaced && !isInvasive ? 0.7 : 1}
          />
        );
      })}
    </Layer>
  );
}

export default memo(ElementsLayer);

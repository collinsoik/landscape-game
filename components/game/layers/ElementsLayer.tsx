'use client';

import { Layer, Image as KonvaImage } from 'react-konva';
import { useEffect, useState, useCallback } from 'react';
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
}

export default function ElementsLayer({
  placements,
  playerZone,
  currentPlayerId,
  selectedPlacementId,
  onSelect,
  onMove,
}: ElementsLayerProps) {
  const [spritesReady, setSpritesReady] = useState(false);

  // Preload all needed sprites
  useEffect(() => {
    const loads = placements.map((p) => {
      const def = getElementDef(p.elementType);
      if (!def) return Promise.resolve();
      return getSprite(def.type, def.category, def.width, def.height);
    });
    Promise.all(loads).then(() => setSpritesReady(true));
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

  if (!spritesReady) return <Layer />;

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

        return (
          <KonvaImage
            key={p.id}
            id={p.id}
            x={p.x}
            y={p.y}
            width={def.width * scale}
            height={def.height * scale}
            image={sprite}
            draggable={isOwn}
            onClick={() => onSelect(isSelected ? null : p.id)}
            onTap={() => onSelect(isSelected ? null : p.id)}
            onDragEnd={handleDragEnd(p.id, p.playerId, def.width * scale, def.height * scale)}
            strokeEnabled={isSelected}
            stroke="#ffffff"
            strokeWidth={isSelected ? 2 : 0}
            shadowEnabled={isSelected}
            shadowColor="#ffffff"
            shadowBlur={8}
            shadowOpacity={0.6}
          />
        );
      })}
    </Layer>
  );
}

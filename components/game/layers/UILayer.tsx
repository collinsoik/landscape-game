'use client';

import { Layer, Image as KonvaImage, Rect } from 'react-konva';
import { useEffect, useState } from 'react';
import { getElementDef } from '@/config/elements';
import { getSprite, getSpriteSync } from '@/lib/sprites/loader';
import { GAME_DEFAULTS } from '@/config/game-defaults';

interface UILayerProps {
  selectedElementType: string | null;
  cursorPos: { x: number; y: number } | null;
  cursorInBounds: boolean;
  placementAllowed: boolean;
  hideSprite: boolean;
}

export default function UILayer({
  selectedElementType,
  cursorPos,
  cursorInBounds,
  placementAllowed,
  hideSprite,
}: UILayerProps) {
  const [spriteLoaded, setSpriteLoaded] = useState(false);

  const def = selectedElementType ? getElementDef(selectedElementType) : null;
  const scale = GAME_DEFAULTS.canvas.spriteScale;

  useEffect(() => {
    if (!def) {
      setSpriteLoaded(false);
      return;
    }
    getSprite(def.type, def.category, def.width, def.height).then(() =>
      setSpriteLoaded(true),
    );
  }, [def]);

  if (!def || !cursorPos || !spriteLoaded) return <Layer listening={false} />;

  const sprite = getSpriteSync(def.type, def.width, def.height);
  const w = def.width * scale;
  const h = def.height * scale;

  return (
    <Layer listening={false} imageSmoothingEnabled={false}>
      {sprite && !hideSprite && (
        <KonvaImage
          x={cursorPos.x - w / 2}
          y={cursorPos.y - h / 2}
          width={w}
          height={h}
          image={sprite}
          opacity={cursorInBounds && placementAllowed ? 1 : 0.6}
        />
      )}
      {!placementAllowed && (
        <Rect x={cursorPos.x - w / 2} y={cursorPos.y - h / 2}
          width={w} height={h} stroke="#ff6b6b" strokeWidth={3}
          fill="rgba(255, 60, 60, 0.15)" />
      )}
    </Layer>
  );
}

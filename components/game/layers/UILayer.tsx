'use client';

import { Layer, Rect, Image as KonvaImage, Text } from 'react-konva';
import { useEffect, useState } from 'react';
import { getElementDef } from '@/config/elements';
import { getSprite, getSpriteSync } from '@/lib/sprites/loader';
import { GAME_DEFAULTS } from '@/config/game-defaults';

interface UILayerProps {
  /** Currently selected element type from sidebar (for placement ghost) */
  selectedElementType: string | null;
  /** Current mouse/touch position on canvas */
  cursorPos: { x: number; y: number } | null;
  /** Whether the cursor is within the player's zone */
  cursorInZone: boolean;
}

export default function UILayer({
  selectedElementType,
  cursorPos,
  cursorInZone,
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
    <Layer listening={false}>
      {/* Placement ghost preview */}
      {sprite && (
        <KonvaImage
          x={cursorPos.x - w / 2}
          y={cursorPos.y - h / 2}
          width={w}
          height={h}
          image={sprite}
          opacity={cursorInZone ? 0.6 : 0.3}
        />
      )}
      {/* Zone warning indicator */}
      {!cursorInZone && (
        <Text
          x={cursorPos.x - 40}
          y={cursorPos.y + h / 2 + 6}
          text="Outside zone"
          fontSize={14}
          fontFamily="sans-serif"
          fontStyle="bold"
          fill="#e74c3c"
          opacity={0.85}
        />
      )}
    </Layer>
  );
}

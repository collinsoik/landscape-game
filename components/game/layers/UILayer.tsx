'use client';

import { Layer, Image as KonvaImage } from 'react-konva';
import { useEffect, useState } from 'react';
import { getElementDef } from '@/config/elements';
import { getSprite, getSpriteSync } from '@/lib/sprites/loader';
import { GAME_DEFAULTS } from '@/config/game-defaults';

interface UILayerProps {
  selectedElementType: string | null;
  cursorPos: { x: number; y: number } | null;
  cursorInBounds: boolean;
}

export default function UILayer({
  selectedElementType,
  cursorPos,
  cursorInBounds,
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
      {sprite && (
        <KonvaImage
          x={cursorPos.x - w / 2}
          y={cursorPos.y - h / 2}
          width={w}
          height={h}
          image={sprite}
          opacity={cursorInBounds ? 0.6 : 0.3}
        />
      )}
    </Layer>
  );
}

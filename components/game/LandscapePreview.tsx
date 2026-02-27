'use client';

import dynamic from 'next/dynamic';
import { useRef, useState, useEffect } from 'react';
import { Image as KonvaImage, Layer } from 'react-konva';
import type { LocalPlacement } from '@/lib/types';
import { getElementDef } from '@/config/elements';
import { getSprite, getSpriteSync } from '@/lib/sprites/loader';
import { GAME_DEFAULTS } from '@/config/game-defaults';
import BackgroundLayer from './layers/BackgroundLayer';

const Stage = dynamic(
  () => import('react-konva').then((m) => m.Stage),
  { ssr: false },
);

interface LandscapePreviewProps {
  placements: LocalPlacement[];
  canvasWidth: number;
  canvasHeight: number;
}

export default function LandscapePreview({
  placements,
  canvasWidth,
  canvasHeight,
}: LandscapePreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [loadGen, setLoadGen] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => setContainerWidth(el.clientWidth);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

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

  const scale = containerWidth / canvasWidth;
  const stageWidth = canvasWidth * scale;
  const stageHeight = canvasHeight * scale;
  const spriteScale = GAME_DEFAULTS.canvas.spriteScale;

  return (
    <div ref={containerRef} className="w-full bg-[#0d1f0d]" style={{ imageRendering: 'pixelated' }}>
      {containerWidth > 0 && (
        <Stage width={stageWidth} height={stageHeight} scaleX={scale} scaleY={scale} listening={false}>
          <BackgroundLayer width={canvasWidth} height={canvasHeight} satelliteImagePath={null} />
          <Layer listening={false}>
            {placements.map((p) => {
              const def = getElementDef(p.elementType);
              if (!def) return null;
              const sprite = getSpriteSync(def.type, def.width, def.height);
              if (!sprite) return null;
              return (
                <KonvaImage
                  key={p.id}
                  x={p.x}
                  y={p.y}
                  width={def.width * spriteScale}
                  height={def.height * spriteScale}
                  image={sprite}
                  listening={false}
                />
              );
            })}
          </Layer>
        </Stage>
      )}
    </div>
  );
}

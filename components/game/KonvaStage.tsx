'use client';

import dynamic from 'next/dynamic';
import { useRef, useCallback, useState } from 'react';
import { getElementDef } from '@/config/elements';
import { GAME_DEFAULTS } from '@/config/game-defaults';
import BackgroundLayer from './layers/BackgroundLayer';
import ElementsLayer from './layers/ElementsLayer';
import UILayer from './layers/UILayer';

const Stage = dynamic(
  () => import('react-konva').then((m) => m.Stage),
  { ssr: false },
);

interface KonvaStageProps {
  width: number;
  height: number;
  canvasWidth: number;
  canvasHeight: number;
  placements: import('@/lib/types').LocalPlacement[];
  currentRound: number;
  selectedElementType: string | null;
  selectedPlacementId: string | null;
  onSelectPlacement: (id: string | null) => void;
  onMovePlacement: (placementId: string, x: number, y: number) => void;
  onPlaceElement: (elementType: string, x: number, y: number) => void;
  onClearSelection: () => void;
}

export default function KonvaStage({
  width,
  height,
  canvasWidth,
  canvasHeight,
  placements,
  currentRound,
  selectedElementType,
  selectedPlacementId,
  onSelectPlacement,
  onMovePlacement,
  onPlaceElement,
  onClearSelection,
}: KonvaStageProps) {
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const scaleX = width / canvasWidth;
  const scaleY = height / canvasHeight;
  const scale = Math.min(scaleX, scaleY);

  const screenToCanvas = useCallback(
    (screenX: number, screenY: number): { x: number; y: number } => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return { x: 0, y: 0 };
      return {
        x: (screenX - rect.left) / scale,
        y: (screenY - rect.top) / scale,
      };
    },
    [scale],
  );

  const isInBounds = (x: number, y: number) =>
    x >= 0 && x <= canvasWidth && y >= 0 && y <= canvasHeight;

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => setCursorPos(screenToCanvas(e.clientX, e.clientY)),
    [screenToCanvas],
  );

  const handleMouseLeave = useCallback(() => setCursorPos(null), []);

  const handleStageClick = useCallback(
    (e: React.MouseEvent) => {
      const pos = screenToCanvas(e.clientX, e.clientY);
      if (selectedElementType && isInBounds(pos.x, pos.y)) {
        const def = getElementDef(selectedElementType);
        const spriteScale = GAME_DEFAULTS.canvas.spriteScale;
        if (def) {
          onPlaceElement(
            selectedElementType,
            pos.x - (def.width * spriteScale) / 2,
            pos.y - (def.height * spriteScale) / 2,
          );
        }
        return;
      }
      onClearSelection();
    },
    [selectedElementType, onPlaceElement, onClearSelection, screenToCanvas, canvasWidth, canvasHeight],
  );

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (e.changedTouches.length !== 1) return;
      const touch = e.changedTouches[0];
      const pos = screenToCanvas(touch.clientX, touch.clientY);
      if (selectedElementType && isInBounds(pos.x, pos.y)) {
        const def = getElementDef(selectedElementType);
        const spriteScale = GAME_DEFAULTS.canvas.spriteScale;
        if (def) {
          onPlaceElement(
            selectedElementType,
            pos.x - (def.width * spriteScale) / 2,
            pos.y - (def.height * spriteScale) / 2,
          );
        }
      }
    },
    [selectedElementType, onPlaceElement, screenToCanvas, canvasWidth, canvasHeight],
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setCursorPos(screenToCanvas(e.clientX, e.clientY));
    },
    [screenToCanvas],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const elementType = e.dataTransfer.getData('application/element-type');
      if (!elementType) return;
      const pos = screenToCanvas(e.clientX, e.clientY);
      if (!isInBounds(pos.x, pos.y)) return;
      const def = getElementDef(elementType);
      const spriteScale = GAME_DEFAULTS.canvas.spriteScale;
      if (def) {
        onPlaceElement(
          elementType,
          pos.x - (def.width * spriteScale) / 2,
          pos.y - (def.height * spriteScale) / 2,
        );
      }
    },
    [onPlaceElement, screenToCanvas, canvasWidth, canvasHeight],
  );

  const cursorInBounds = cursorPos ? isInBounds(cursorPos.x, cursorPos.y) : false;

  return (
    <div
      ref={containerRef}
      className="relative"
      style={{
        width: canvasWidth * scale,
        height: canvasHeight * scale,
        imageRendering: 'pixelated' as const,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleStageClick}
      onTouchEnd={handleTouchEnd}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <Stage
        width={canvasWidth * scale}
        height={canvasHeight * scale}
        scaleX={scale}
        scaleY={scale}
      >
        <BackgroundLayer width={canvasWidth} height={canvasHeight} satelliteImagePath={null} />
        <ElementsLayer
          placements={placements}
          currentRound={currentRound}
          selectedElementType={selectedElementType}
          selectedPlacementId={selectedPlacementId}
          onSelect={onSelectPlacement}
          onMove={onMovePlacement}
          canvasWidth={canvasWidth}
          canvasHeight={canvasHeight}
        />
        <UILayer
          selectedElementType={selectedElementType}
          cursorPos={cursorPos}
          cursorInBounds={cursorInBounds}
        />
      </Stage>
    </div>
  );
}

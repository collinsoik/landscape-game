'use client';

import dynamic from 'next/dynamic';
import { useRef, useCallback, useState, useEffect } from 'react';
import { getElementDef } from '@/config/elements';
import { GAME_DEFAULTS } from '@/config/game-defaults';
import type { LandscapeId } from '@/config/landscapes';
import { getPlacementError } from '@/lib/terrain';
import { hasDuplicatePlacement } from '@/lib/placement';
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
  landscapeId?: LandscapeId;
  onSelectPlacement: (id: string | null) => void;
  onMovePlacement: (placementId: string, x: number, y: number) => void;
  onPlaceElement: (elementType: string, x: number, y: number) => string | null;
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
  landscapeId = 'meadow',
  onSelectPlacement,
  onMovePlacement,
  onPlaceElement,
  onClearSelection,
}: KonvaStageProps) {
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);
  const [placementError, setPlacementError] = useState<string | null>(null);
  const [nativeDragging, setNativeDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const elementClickedRef = useRef(false);

  useEffect(() => {
    const endDrag = () => { setNativeDragging(false); setCursorPos(null); };
    window.addEventListener('landscape-drag-end', endDrag);
    return () => window.removeEventListener('landscape-drag-end', endDrag);
  }, []);

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

  const tryPlaceElement = useCallback((elementType: string, x: number, y: number) => {
    const error = getPlacementError(landscapeId, elementType, x, y, canvasWidth, canvasHeight) ||
      onPlaceElement(elementType, x, y);
    setPlacementError(error);
    if (!error) setCursorPos(null);
  }, [landscapeId, canvasWidth, canvasHeight, onPlaceElement]);

  const tryMovePlacement = useCallback((id: string, x: number, y: number) => {
    const placement = placements.find((p) => p.id === id);
    if (!placement) return false;
    const error = getPlacementError(landscapeId, placement.elementType, x, y, canvasWidth, canvasHeight) ||
      (hasDuplicatePlacement(placements, placement.elementType, x, y, id)
        ? 'There is already one here. Try a spot beside it.' : null);
    setPlacementError(error);
    if (error) return false;
    onMovePlacement(id, x, y);
    return true;
  }, [placements, landscapeId, canvasWidth, canvasHeight, onMovePlacement]);

  const previewMove = useCallback((id: string, x: number, y: number) => {
    const placement = placements.find((p) => p.id === id);
    if (!placement) return null;
    const error = getPlacementError(landscapeId, placement.elementType, x, y, canvasWidth, canvasHeight) ||
      (hasDuplicatePlacement(placements, placement.elementType, x, y, id)
        ? 'There is already one here. Try a spot beside it.' : null);
    setPlacementError(error);
    return error;
  }, [placements, landscapeId, canvasWidth, canvasHeight]);

  const handleElementSelect = useCallback(
    (id: string | null) => {
      elementClickedRef.current = true;
      onSelectPlacement(id);
    },
    [onSelectPlacement],
  );

  const handleElementInteraction = useCallback(() => {
    elementClickedRef.current = true;
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      setCursorPos(screenToCanvas(e.clientX, e.clientY));
      setPlacementError(null);
    },
    [screenToCanvas],
  );

  const handleMouseLeave = useCallback(() => setCursorPos(null), []);

  const handleStageClick = useCallback(
    (e: React.MouseEvent) => {
      // Skip if an element was just clicked (its handler already ran)
      if (elementClickedRef.current) {
        elementClickedRef.current = false;
        return;
      }
      const pos = screenToCanvas(e.clientX, e.clientY);
      if (selectedElementType && isInBounds(pos.x, pos.y)) {
        const def = getElementDef(selectedElementType);
        const spriteScale = GAME_DEFAULTS.canvas.spriteScale;
        if (def) {
          tryPlaceElement(
            selectedElementType,
            pos.x - (def.width * spriteScale) / 2,
            pos.y - (def.height * spriteScale) / 2,
          );
        }
        return;
      }
      onClearSelection();
    },
    [selectedElementType, tryPlaceElement, onClearSelection, screenToCanvas, canvasWidth, canvasHeight],
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setNativeDragging(true);
      setCursorPos(screenToCanvas(e.clientX, e.clientY));
    },
    [screenToCanvas],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setNativeDragging(false);
      const elementType = e.dataTransfer.getData('application/element-type');
      if (!elementType) return;
      const pos = screenToCanvas(e.clientX, e.clientY);
      if (!isInBounds(pos.x, pos.y)) return;
      const def = getElementDef(elementType);
      const spriteScale = GAME_DEFAULTS.canvas.spriteScale;
      if (def) {
        tryPlaceElement(
          elementType,
          pos.x - (def.width * spriteScale) / 2,
          pos.y - (def.height * spriteScale) / 2,
        );
      }
    },
    [tryPlaceElement, screenToCanvas, canvasWidth, canvasHeight],
  );

  const cursorInBounds = cursorPos ? isInBounds(cursorPos.x, cursorPos.y) : false;
  const selectedDef = selectedElementType ? getElementDef(selectedElementType) : undefined;
  const hoverX = cursorPos && selectedDef ? cursorPos.x - selectedDef.width * GAME_DEFAULTS.canvas.spriteScale / 2 : 0;
  const hoverY = cursorPos && selectedDef ? cursorPos.y - selectedDef.height * GAME_DEFAULTS.canvas.spriteScale / 2 : 0;
  const hoverError = selectedDef && cursorPos ? getPlacementError(
    landscapeId, selectedDef.type,
    hoverX, hoverY,
    canvasWidth, canvasHeight,
  ) || (hasDuplicatePlacement(placements, selectedDef.type, hoverX, hoverY)
    ? 'There is already one here. Try a spot beside it.' : null) : null;
  const message = placementError || hoverError;

  return (
    <div
      ref={containerRef}
      data-landscape-canvas
      className="relative"
      style={{
        width: canvasWidth * scale,
        height: canvasHeight * scale,
        imageRendering: 'pixelated' as const,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleStageClick}
      onPointerDownCapture={() => { elementClickedRef.current = false; }}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <Stage
        width={canvasWidth * scale}
        height={canvasHeight * scale}
        scaleX={scale}
        scaleY={scale}
      >
        <BackgroundLayer width={canvasWidth} height={canvasHeight} landscapeId={landscapeId} />
        <ElementsLayer
          placements={placements}
          currentRound={currentRound}
          selectedElementType={selectedElementType}
          selectedPlacementId={selectedPlacementId}
          onSelect={handleElementSelect}
          onInteract={handleElementInteraction}
          onMove={tryMovePlacement}
          onPreviewMove={previewMove}
          canvasWidth={canvasWidth}
          canvasHeight={canvasHeight}
        />
        <UILayer
          selectedElementType={selectedElementType}
          cursorPos={cursorPos}
          cursorInBounds={cursorInBounds}
          placementAllowed={!hoverError}
          hideSprite={nativeDragging}
        />
      </Stage>
      <p role="status" aria-live="polite" className={`absolute bottom-2 left-2 right-2 pointer-events-none rounded px-3 py-2 text-center text-sm text-white ${message ? 'bg-red-950/95 border-2 border-red-400' : 'bg-black/80'}`}>
        {message || (landscapeId === 'coastal'
          ? 'Keep objects off water. Plants go on grass; other objects can go on sand.'
          : landscapeId === 'meadow'
            ? 'Keep the whole object inside your landscape.'
            : 'Place objects on clear ground, away from water and rocks. Plants stay off sand.')}
      </p>
    </div>
  );
}

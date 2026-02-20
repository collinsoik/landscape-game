'use client';

import dynamic from 'next/dynamic';
import { useRef, useCallback, useState } from 'react';
import type { Placement, ZoneRect } from '@/server/src/types/models';
import { getElementDef } from '@/config/elements';
import { isPointInZone } from '@/lib/zones/validator';
import { GAME_DEFAULTS } from '@/config/game-defaults';
import BackgroundLayer from './layers/BackgroundLayer';
import ZoneHighlightLayer from './layers/ZoneHighlightLayer';
import ElementsLayer from './layers/ElementsLayer';
import InteractionsLayer from './layers/InteractionsLayer';
import UILayer from './layers/UILayer';

// Dynamically import react-konva Stage with SSR disabled (Konva needs browser APIs)
const Stage = dynamic(
  () => import('react-konva').then((m) => m.Stage),
  { ssr: false },
);

interface KonvaStageProps {
  width: number;
  height: number;
  canvasWidth: number;
  canvasHeight: number;
  satelliteImagePath: string | null;
  zones: ZoneRect[];
  teamColor: string;
  currentZoneIndex: number | null;
  playerZone: ZoneRect | null;
  currentPlayerId: string;
  placements: Placement[];
  selectedElementType: string | null;
  selectedPlacementId: string | null;
  onSelectPlacement: (id: string | null) => void;
  onMovePlacement: (placementId: string, x: number, y: number) => void;
  onPlaceElement: (elementType: string, x: number, y: number) => void;
  onClearSelection: () => void;
  playerNames?: Record<number, string>;
}

export default function KonvaStage({
  width,
  height,
  canvasWidth,
  canvasHeight,
  satelliteImagePath,
  zones,
  teamColor,
  currentZoneIndex,
  playerZone,
  currentPlayerId,
  placements,
  selectedElementType,
  selectedPlacementId,
  onSelectPlacement,
  onMovePlacement,
  onPlaceElement,
  onClearSelection,
  playerNames,
}: KonvaStageProps) {
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);
  const [hoveredPlacementId, setHoveredPlacementId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Scale to fit the container while preserving aspect ratio
  const scaleX = width / canvasWidth;
  const scaleY = height / canvasHeight;
  const scale = Math.min(scaleX, scaleY);

  const cursorInZone =
    cursorPos && playerZone
      ? isPointInZone(cursorPos.x, cursorPos.y, playerZone)
      : false;

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

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const pos = screenToCanvas(e.clientX, e.clientY);
      setCursorPos(pos);
    },
    [screenToCanvas],
  );

  const handleMouseLeave = useCallback(() => {
    setCursorPos(null);
  }, []);

  const handleStageClick = useCallback(
    (e: React.MouseEvent) => {
      const pos = screenToCanvas(e.clientX, e.clientY);

      // If we have a selected element type from sidebar, place it
      if (selectedElementType && playerZone && isPointInZone(pos.x, pos.y, playerZone)) {
        const def = getElementDef(selectedElementType);
        const spriteScale = GAME_DEFAULTS.canvas.spriteScale;
        if (def) {
          // Center the element on click position
          onPlaceElement(
            selectedElementType,
            pos.x - (def.width * spriteScale) / 2,
            pos.y - (def.height * spriteScale) / 2,
          );
        }
        return;
      }

      // Otherwise deselect
      onClearSelection();
    },
    [selectedElementType, playerZone, onPlaceElement, onClearSelection, screenToCanvas],
  );

  // Handle HTML5 drag-and-drop from sidebar
  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const pos = screenToCanvas(e.clientX, e.clientY);
      setCursorPos(pos);
    },
    [screenToCanvas],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const elementType = e.dataTransfer.getData('application/element-type');
      if (!elementType || !playerZone) return;

      const pos = screenToCanvas(e.clientX, e.clientY);
      if (!isPointInZone(pos.x, pos.y, playerZone)) return;

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
    [playerZone, onPlaceElement, screenToCanvas],
  );

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
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <Stage
        width={canvasWidth * scale}
        height={canvasHeight * scale}
        scaleX={scale}
        scaleY={scale}
      >
        <BackgroundLayer
          width={canvasWidth}
          height={canvasHeight}
          satelliteImagePath={satelliteImagePath}
        />
        <ZoneHighlightLayer
          zones={zones}
          teamColor={teamColor}
          currentZoneIndex={currentZoneIndex}
          playerNames={playerNames}
        />
        <ElementsLayer
          placements={placements}
          playerZone={playerZone}
          currentPlayerId={currentPlayerId}
          selectedPlacementId={selectedPlacementId}
          onSelect={onSelectPlacement}
          onMove={onMovePlacement}
        />
        <InteractionsLayer
          placements={placements}
          selectedPlacementId={selectedPlacementId}
          hoveredPlacementId={hoveredPlacementId}
        />
        <UILayer
          selectedElementType={selectedElementType}
          cursorPos={cursorPos}
          cursorInZone={cursorInZone}
        />
      </Stage>
    </div>
  );
}

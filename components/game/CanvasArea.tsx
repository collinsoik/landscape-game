'use client';

import { useRef, useState, useEffect } from 'react';
import type { LocalPlacement } from '@/lib/types';
import KonvaStage from './KonvaStage';

interface CanvasAreaProps {
  canvasWidth: number;
  canvasHeight: number;
  placements: LocalPlacement[];
  currentRound: number;
  selectedElementType: string | null;
  selectedPlacementId: string | null;
  onSelectPlacement: (id: string | null) => void;
  onMovePlacement: (placementId: string, x: number, y: number) => void;
  onPlaceElement: (elementType: string, x: number, y: number) => void;
  onClearSelection: () => void;
}

export default function CanvasArea(props: CanvasAreaProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => setSize({ width: el.clientWidth, height: el.clientHeight });
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className="flex-1 flex items-center justify-center bg-neutral-900 overflow-hidden"
    >
      {size.width > 0 && size.height > 0 && (
        <KonvaStage {...props} width={size.width} height={size.height} />
      )}
    </div>
  );
}

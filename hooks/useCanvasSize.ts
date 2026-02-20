'use client';

import { useState, useEffect, useCallback, type RefObject } from 'react';

interface CanvasSize {
  width: number;
  height: number;
  scale: number;
}

export function useCanvasSize(
  containerRef: RefObject<HTMLDivElement | null>,
  baseWidth: number,
  baseHeight: number
): CanvasSize {
  const [size, setSize] = useState<CanvasSize>({
    width: baseWidth,
    height: baseHeight,
    scale: 1,
  });

  const updateSize = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const scaleX = rect.width / baseWidth;
    const scaleY = rect.height / baseHeight;
    const scale = Math.min(scaleX, scaleY, 1);

    setSize({
      width: baseWidth * scale,
      height: baseHeight * scale,
      scale,
    });
  }, [containerRef, baseWidth, baseHeight]);

  useEffect(() => {
    updateSize();

    const observer = new ResizeObserver(updateSize);
    const container = containerRef.current;
    if (container) {
      observer.observe(container);
    }

    return () => observer.disconnect();
  }, [updateSize, containerRef]);

  return size;
}

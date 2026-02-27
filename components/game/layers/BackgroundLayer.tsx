'use client';

import { Layer, Image as KonvaImage } from 'react-konva';
import { useEffect, useState } from 'react';
import type { LandscapeId } from '@/config/landscapes';
import { getBackgroundRenderer } from '@/lib/backgrounds';

interface BackgroundLayerProps {
  width: number;
  height: number;
  landscapeId?: LandscapeId;
}

export default function BackgroundLayer({
  width,
  height,
  landscapeId = 'meadow',
}: BackgroundLayerProps) {
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!width || !height) return;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = getBackgroundRenderer(landscapeId);
    draw(ctx, width, height);

    const img = new window.Image();
    img.onload = () => setImage(img);
    img.src = canvas.toDataURL();
  }, [width, height, landscapeId]);

  return (
    <Layer listening={false}>
      {image && (
        <KonvaImage
          x={0}
          y={0}
          width={width}
          height={height}
          image={image}
        />
      )}
    </Layer>
  );
}

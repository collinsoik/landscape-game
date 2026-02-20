'use client';

import { Layer, Rect, Image as KonvaImage } from 'react-konva';
import { useEffect, useState } from 'react';

interface BackgroundLayerProps {
  width: number;
  height: number;
  satelliteImagePath: string | null;
}

export default function BackgroundLayer({
  width,
  height,
  satelliteImagePath,
}: BackgroundLayerProps) {
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!satelliteImagePath) return;
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.src = satelliteImagePath;
    img.onload = () => setImage(img);
  }, [satelliteImagePath]);

  return (
    <Layer listening={false}>
      {/* Gradient placeholder background */}
      <Rect
        x={0}
        y={0}
        width={width}
        height={height}
        fillLinearGradientStartPoint={{ x: 0, y: 0 }}
        fillLinearGradientEndPoint={{ x: width, y: height }}
        fillLinearGradientColorStops={[
          0, '#4a7c3f',
          0.5, '#6b8f3c',
          1, '#3d6b2e',
        ]}
      />
      {/* Satellite image overlay if available */}
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

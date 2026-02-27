'use client';

import { memo } from 'react';
import { Layer, Rect, Text } from 'react-konva';
import type { ZoneRect } from '@/server/src/types/models';

interface ZoneHighlightLayerProps {
  zones: ZoneRect[];
  teamColor: string;
  currentZoneIndex: number | null;
  playerNames?: Record<number, string>;
}

export default memo(function ZoneHighlightLayer({
  zones,
  teamColor,
  currentZoneIndex,
  playerNames,
}: ZoneHighlightLayerProps) {
  return (
    <Layer listening={false}>
      {/* Grey out non-buildable zones */}
      {zones.map((zone) => {
        const isCurrent = zone.index === currentZoneIndex;
        if (isCurrent) return null;
        return (
          <Rect
            key={`zone-overlay-${zone.index}`}
            x={zone.x}
            y={zone.y}
            width={zone.width}
            height={zone.height}
            fill="rgba(0,0,0,0.35)"
          />
        );
      })}
      {/* Zone borders */}
      {zones.map((zone) => {
        const isCurrent = zone.index === currentZoneIndex;
        return (
          <Rect
            key={`zone-${zone.index}`}
            x={zone.x}
            y={zone.y}
            width={zone.width}
            height={zone.height}
            stroke={isCurrent ? '#ffffff' : 'rgba(255,255,255,0.15)'}
            strokeWidth={isCurrent ? 2 : 1}
            fill="transparent"
            {...(isCurrent ? {} : { dash: [6, 4] })}
          />
        );
      })}
      {/* Zone labels */}
      {zones.map((zone) => {
        const isCurrent = zone.index === currentZoneIndex;
        const label = playerNames?.[zone.index] ?? `Zone ${zone.index + 1}`;
        return (
          <Text
            key={`zone-label-${zone.index}`}
            x={zone.x + 4}
            y={zone.y + 4}
            text={isCurrent ? `${label} (You)` : label}
            fontSize={isCurrent ? 12 : 11}
            fontFamily="sans-serif"
            fill={isCurrent ? '#ffffff' : 'rgba(255,255,255,0.5)'}
          />
        );
      })}
    </Layer>
  );
})

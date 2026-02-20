'use client';

import { Layer, Rect, Text } from 'react-konva';
import type { ZoneRect } from '@/server/src/types/models';

interface ZoneHighlightLayerProps {
  zones: ZoneRect[];
  teamColor: string;
  currentZoneIndex: number | null;
  playerNames?: Record<number, string>;
}

export default function ZoneHighlightLayer({
  zones,
  teamColor,
  currentZoneIndex,
  playerNames,
}: ZoneHighlightLayerProps) {
  return (
    <Layer listening={false}>
      {zones.map((zone) => {
        const isCurrent = zone.index === currentZoneIndex;
        return (
          <Rect
            key={`zone-${zone.index}`}
            x={zone.x}
            y={zone.y}
            width={zone.width}
            height={zone.height}
            stroke={teamColor}
            strokeWidth={isCurrent ? 3 : 1}
            fill={isCurrent ? `${teamColor}22` : 'transparent'}
            dash={isCurrent ? undefined : [6, 4]}
          />
        );
      })}
      {/* Zone labels */}
      {zones.map((zone) => {
        const label = playerNames?.[zone.index] ?? `Zone ${zone.index + 1}`;
        return (
          <Text
            key={`zone-label-${zone.index}`}
            x={zone.x + 4}
            y={zone.y + 4}
            text={label}
            fontSize={11}
            fontFamily="sans-serif"
            fill={teamColor}
            opacity={0.7}
          />
        );
      })}
    </Layer>
  );
}

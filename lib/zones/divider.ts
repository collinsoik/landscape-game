// Zone grid divider — splits canvas into rectangular zones for players

import type { ZoneRect, ZoneConfig } from '@/server/src/types/models';

/**
 * Divides canvas into a grid of zones for N players.
 * Grid layout: cols = ceil(sqrt(N)), rows = ceil(N / cols).
 */
export function divideZones(
  canvasWidth: number,
  canvasHeight: number,
  playerCount: number,
): ZoneConfig {
  if (playerCount <= 0) {
    return { cols: 0, rows: 0, zones: [] };
  }

  const cols = Math.ceil(Math.sqrt(playerCount));
  const rows = Math.ceil(playerCount / cols);

  const zoneWidth = canvasWidth / cols;
  const zoneHeight = canvasHeight / rows;

  const zones: ZoneRect[] = [];

  for (let i = 0; i < playerCount; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    zones.push({
      index: i,
      x: col * zoneWidth,
      y: row * zoneHeight,
      width: zoneWidth,
      height: zoneHeight,
      playerId: null,
    });
  }

  return { cols, rows, zones };
}

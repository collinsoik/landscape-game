'use client';

import { Layer, Circle, Line, Text } from 'react-konva';
import type { Placement } from '@/server/src/types/models';
import { INTERACTION_RULES } from '@/config/scoring-rules';
import { getElementDef } from '@/config/elements';
import { GAME_DEFAULTS } from '@/config/game-defaults';

interface InteractionsLayerProps {
  placements: Placement[];
  selectedPlacementId: string | null;
  hoveredPlacementId: string | null;
}

interface ActiveInteraction {
  ax: number;
  ay: number;
  bx: number;
  by: number;
  effect: 'synergy' | 'conflict';
  value: number;
  description: string;
}

function distance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

function getCenter(p: Placement): { cx: number; cy: number } {
  const def = getElementDef(p.elementType);
  const scale = GAME_DEFAULTS.canvas.spriteScale;
  const w = (def?.width ?? 32) * scale;
  const h = (def?.height ?? 32) * scale;
  return { cx: p.x + w / 2, cy: p.y + h / 2 };
}

export default function InteractionsLayer({
  placements,
  selectedPlacementId,
  hoveredPlacementId,
}: InteractionsLayerProps) {
  const focusId = selectedPlacementId ?? hoveredPlacementId;
  const focusPlacement = focusId
    ? placements.find((p) => p.id === focusId)
    : null;

  if (!focusPlacement) return <Layer listening={false} />;

  const focusCenter = getCenter(focusPlacement);
  const scale = GAME_DEFAULTS.canvas.spriteScale;

  // Find relevant interaction rules for the focused element
  const relevantRules = INTERACTION_RULES.filter(
    (r) =>
      r.elementA === focusPlacement.elementType ||
      r.elementB === focusPlacement.elementType,
  );

  // Find unique radii for radius circles
  const radii = [...new Set(relevantRules.map((r) => r.radius * scale))];

  // Build a lookup index: elementType -> placements of that type
  const placementsByType = new Map<string, Placement[]>();
  for (const p of placements) {
    const list = placementsByType.get(p.elementType);
    if (list) {
      list.push(p);
    } else {
      placementsByType.set(p.elementType, [p]);
    }
  }

  // Find active interactions using indexed lookup — O(n) total
  const interactions: ActiveInteraction[] = [];
  for (const rule of relevantRules) {
    const otherType =
      rule.elementA === focusPlacement.elementType
        ? rule.elementB
        : rule.elementA;

    const candidates = placementsByType.get(otherType);
    if (!candidates) continue;

    for (const p of candidates) {
      if (p.id === focusPlacement.id) continue;

      const otherCenter = getCenter(p);
      const dist = distance(
        focusCenter.cx,
        focusCenter.cy,
        otherCenter.cx,
        otherCenter.cy,
      );

      if (dist <= rule.radius * scale) {
        interactions.push({
          ax: focusCenter.cx,
          ay: focusCenter.cy,
          bx: otherCenter.cx,
          by: otherCenter.cy,
          effect: rule.effect,
          value: rule.value,
          description: rule.description,
        });
      }
    }
  }

  return (
    <Layer listening={false}>
      {/* Radius circles */}
      {radii.map((r, i) => (
        <Circle
          key={`radius-${i}`}
          x={focusCenter.cx}
          y={focusCenter.cy}
          radius={r}
          stroke="rgba(255,255,255,0.25)"
          strokeWidth={1}
          dash={[4, 4]}
          fill="rgba(255,255,255,0.03)"
        />
      ))}

      {/* Interaction lines — dashed for synergy, solid for conflict */}
      {interactions.map((inter, i) => {
        const isSynergy = inter.effect === 'synergy';
        const color = isSynergy ? '#2ecc71' : '#e74c3c';
        const dashPattern = isSynergy ? [6, 3] : undefined;

        return (
          <Line
            key={`interaction-${i}`}
            points={[inter.ax, inter.ay, inter.bx, inter.by]}
            stroke={color}
            strokeWidth={2}
            dash={dashPattern}
            opacity={0.8}
          />
        );
      })}

      {/* Score popups at midpoint with icon for colorblind accessibility */}
      {interactions.map((inter, i) => {
        const isSynergy = inter.effect === 'synergy';
        const color = isSynergy ? '#2ecc71' : '#e74c3c';
        const midX = (inter.ax + inter.bx) / 2;
        const midY = (inter.ay + inter.by) / 2;
        const icon = isSynergy ? '\u2714' : '\u2716';
        const label = isSynergy ? `${icon} +${inter.value}` : `${icon} ${inter.value}`;

        return (
          <Text
            key={`score-popup-${i}`}
            x={midX - 16}
            y={midY - 8}
            text={label}
            fontSize={13}
            fontFamily="sans-serif"
            fontStyle="bold"
            fill={color}
            stroke="#000"
            strokeWidth={0.5}
          />
        );
      })}
    </Layer>
  );
}

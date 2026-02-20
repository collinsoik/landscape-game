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

  // Find active interactions with nearby elements
  const interactions: ActiveInteraction[] = [];
  for (const rule of relevantRules) {
    const otherType =
      rule.elementA === focusPlacement.elementType
        ? rule.elementB
        : rule.elementA;

    for (const p of placements) {
      if (p.id === focusPlacement.id) continue;
      if (p.elementType !== otherType) continue;

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

      {/* Interaction lines */}
      {interactions.map((inter, i) => {
        const isSynergy = inter.effect === 'synergy';
        const color = isSynergy ? '#2ecc71' : '#e74c3c';
        const midX = (inter.ax + inter.bx) / 2;
        const midY = (inter.ay + inter.by) / 2;

        return (
          <Line
            key={`interaction-${i}`}
            points={[inter.ax, inter.ay, inter.bx, inter.by]}
            stroke={color}
            strokeWidth={2}
            dash={[6, 3]}
            opacity={0.8}
          />
        );
      })}

      {/* Score popups at midpoint */}
      {interactions.map((inter, i) => {
        const isSynergy = inter.effect === 'synergy';
        const color = isSynergy ? '#2ecc71' : '#e74c3c';
        const midX = (inter.ax + inter.bx) / 2;
        const midY = (inter.ay + inter.by) / 2;
        const label = isSynergy ? `+${inter.value}` : `${inter.value}`;

        return (
          <Text
            key={`score-popup-${i}`}
            x={midX - 12}
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

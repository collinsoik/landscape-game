'use client';

import React from 'react';
import { Layer, Ring, Rect, Line, Text, Group } from 'react-konva';
import type { Placement } from '@/server/src/types/models';
// ScoreCategory type unused but kept for reference
import { INTERACTION_RULES } from '@/config/scoring-rules';
import { getElementDef } from '@/config/elements';
import { GAME_DEFAULTS } from '@/config/game-defaults';
import SynergyPulse from './SynergyPulse';

const CATEGORY_COLORS: Record<string, string> = {
  biodiversity: '#2ecc71',
  sustainability: '#3498db',
  aesthetics: '#e74c3c',
  ecosystemHealth: '#f39c12',
};

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
  category: string;
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

  if (!focusPlacement || !Array.isArray(placements)) return <Layer listening={false} />;

  const focusCenter = getCenter(focusPlacement);
  const scale = GAME_DEFAULTS.canvas.spriteScale;

  // Find relevant interaction rules for the focused element
  const relevantRules = INTERACTION_RULES.filter(
    (r) =>
      r.elementA === focusPlacement.elementType ||
      r.elementB === focusPlacement.elementType,
  );

  // Find unique radii with their dominant category color
  const radiiMap = new Map<number, string>();
  for (const r of relevantRules) {
    const scaledR = r.radius * scale;
    if (!radiiMap.has(scaledR)) {
      radiiMap.set(scaledR, r.scoreCategory);
    }
  }
  const radii = [...radiiMap.entries()].map(([r, cat]) => ({ radius: r, color: CATEGORY_COLORS[cat] ?? '#8bba6a' }));

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
          category: rule.scoreCategory,
        });
      }
    }
  }

  return (
    <Layer listening={false}>
      {/* Colored radius rings */}
      {radii.map((r, i) => (
        <Ring
          key={`radius-${i}`}
          x={focusCenter.cx}
          y={focusCenter.cy}
          innerRadius={Math.max(0, r.radius - 1)}
          outerRadius={r.radius + 1}
          fill={r.color}
          opacity={0.15}
          stroke={r.color}
          strokeWidth={1}
          dash={[6, 4]}
        />
      ))}

      {/* Interaction lines — glow line behind + main line */}
      {interactions.map((inter, i) => {
        const isSynergy = inter.effect === 'synergy';
        const catColor = CATEGORY_COLORS[inter.category] ?? (isSynergy ? '#2ecc71' : '#e74c3c');
        const color = isSynergy ? catColor : '#e74c3c';
        const lineProps = {
          points: [inter.ax, inter.ay, inter.bx, inter.by],
          stroke: color,
          lineCap: 'round' as const,
          ...(isSynergy ? { dash: [8, 4] } : {}),
        };

        return (
          <React.Fragment key={`interaction-${i}`}>
            {/* Glow line */}
            <Line
              {...lineProps}
              strokeWidth={12}
              opacity={0.12}
            />
            {/* Main line */}
            <Line
              {...lineProps}
              strokeWidth={4}
              opacity={0.8}
            />
          </React.Fragment>
        );
      })}

      {/* Ripple pulses at synergy midpoints */}
      {interactions
        .filter((inter) => inter.effect === 'synergy')
        .map((inter) => {
          const midX = (inter.ax + inter.bx) / 2;
          const midY = (inter.ay + inter.by) / 2;
          const color = CATEGORY_COLORS[inter.category] ?? '#2ecc71';
          // Use coordinate-based key for stable identity across re-renders
          const key = `pulse-${Math.round(inter.ax)}-${Math.round(inter.ay)}-${Math.round(inter.bx)}-${Math.round(inter.by)}`;
          return <SynergyPulse key={key} x={midX} y={midY} color={color} />;
        })}

      {/* Score popups with dark background */}
      {interactions.map((inter, i) => {
        const isSynergy = inter.effect === 'synergy';
        const color = isSynergy ? (CATEGORY_COLORS[inter.category] ?? '#2ecc71') : '#e74c3c';
        const midX = (inter.ax + inter.bx) / 2;
        const midY = (inter.ay + inter.by) / 2;
        const icon = isSynergy ? '\u2714' : '\u2716';
        const label = isSynergy ? `${icon} +${inter.value}` : `${icon} ${inter.value}`;
        const textWidth = label.length * 11;

        return (
          <Group key={`score-popup-${i}`}>
            <Rect
              x={midX - textWidth / 2 - 6}
              y={midY - 14}
              width={textWidth + 12}
              height={28}
              fill="#0d1f0d"
              cornerRadius={5}
              opacity={0.9}
            />
            <Text
              x={midX - textWidth / 2}
              y={midY - 9}
              text={label}
              fontSize={18}
              fontFamily="sans-serif"
              fontStyle="bold"
              fill={color}
            />
          </Group>
        );
      })}
    </Layer>
  );
}

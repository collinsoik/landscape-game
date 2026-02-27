'use client';

import { useEffect, useRef, useState } from 'react';
import type { Placement, ZoneConfig } from '@/lib/types';
import { getElementDef, ELEMENT_CATEGORIES } from '@/config/elements';

interface TeamCanvasGridProps {
  teams: {
    teamId: string;
    teamName: string;
    teamColor: string;
    placements: Placement[];
    zoneConfig: ZoneConfig;
    autoScore: number;
  }[];
  canvasWidth: number;
  canvasHeight: number;
}

/**
 * Judge view: renders all team canvases in a grid at reduced scale.
 * Uses plain canvas 2D (not Konva) for lightweight rendering.
 */
export function TeamCanvasGrid({ teams, canvasWidth, canvasHeight }: TeamCanvasGridProps) {
  const [expandedTeam, setExpandedTeam] = useState<string | null>(null);
  const baseScale = 0.35;
  const expandedScale = 0.65;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {teams.map((team) => {
        const isExpanded = expandedTeam === team.teamId;
        const currentScale = isExpanded ? expandedScale : baseScale;
        const thumbW = canvasWidth * currentScale;
        const thumbH = canvasHeight * currentScale;

        return (
          <div
            key={team.teamId}
            className={[
              'space-y-2',
              isExpanded ? 'col-span-1 sm:col-span-2' : '',
            ].join(' ')}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-sm"
                  style={{ backgroundColor: team.teamColor }}
                />
                <span className="font-bold text-green-100">{team.teamName}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-green-400 font-mono">
                  Score: {team.autoScore.toFixed(0)}
                </span>
                <button
                  onClick={() => setExpandedTeam(isExpanded ? null : team.teamId)}
                  className="text-xs text-[#8bba6a] hover:text-[#a8d880] cursor-pointer"
                >
                  {isExpanded ? 'Collapse' : 'Expand'}
                </button>
              </div>
            </div>
            <TeamCanvasThumb
              placements={team.placements}
              zoneConfig={team.zoneConfig}
              teamColor={team.teamColor}
              width={thumbW}
              height={thumbH}
              canvasWidth={canvasWidth}
              canvasHeight={canvasHeight}
              scale={currentScale}
            />
          </div>
        );
      })}
    </div>
  );
}

function TeamCanvasThumb({
  placements,
  zoneConfig,
  teamColor,
  width,
  height,
  canvasWidth,
  canvasHeight,
  scale,
}: {
  placements: Placement[];
  zoneConfig: ZoneConfig;
  teamColor: string;
  width: number;
  height: number;
  canvasWidth: number;
  canvasHeight: number;
  scale: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background
    ctx.fillStyle = '#0f1a0f';
    ctx.fillRect(0, 0, width, height);

    // Zone grid
    ctx.strokeStyle = teamColor + '40';
    ctx.lineWidth = 1;
    for (const zone of zoneConfig.zones) {
      ctx.strokeRect(zone.x * scale, zone.y * scale, zone.width * scale, zone.height * scale);
    }

    // Elements
    for (const placement of placements) {
      const def = getElementDef(placement.elementType);
      if (!def) continue;

      const cat = ELEMENT_CATEGORIES.find((c) => c.key === def.category);
      ctx.fillStyle = cat?.color || '#888';
      ctx.fillRect(
        placement.x * scale,
        placement.y * scale,
        placement.width * scale,
        placement.height * scale
      );

      // Element initial
      const fontSize = Math.max(8, 10 * scale);
      ctx.fillStyle = '#fff';
      ctx.font = `bold ${fontSize}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(
        def.name[0],
        (placement.x + placement.width / 2) * scale,
        (placement.y + placement.height / 2) * scale
      );
    }

    // Border
    ctx.strokeStyle = teamColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, width, height);
  }, [placements, zoneConfig, teamColor, width, height, scale]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="rounded border border-green-800"
      style={{ width: `${width}px`, height: `${height}px` }}
    />
  );
}

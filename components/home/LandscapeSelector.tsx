'use client';

import { useEffect, useRef, useCallback } from 'react';
import { LANDSCAPE_CATALOG, type LandscapeId } from '@/config/landscapes';
import { getBackgroundRenderer } from '@/lib/backgrounds';

const THUMB_W = 160;
const THUMB_H = 107; // ~3:2 ratio

interface LandscapeSelectorProps {
  value: LandscapeId;
  onChange: (id: LandscapeId) => void;
}

function Thumbnail({ id, selected, onSelect }: { id: LandscapeId; selected: boolean; onSelect: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const draw = getBackgroundRenderer(id);
    draw(ctx, THUMB_W, THUMB_H);
  }, [id]);

  return (
    <button
      type="button"
      onClick={onSelect}
      className="cursor-pointer focus:outline-none"
      style={{
        padding: 3,
        background: selected ? '#8bba6a' : 'transparent',
        boxShadow: selected
          ? '0 0 8px rgba(139,186,106,0.5), inset -1px -1px 0 rgba(0,0,0,0.3), inset 1px 1px 0 rgba(255,255,255,0.15)'
          : 'inset -1px -1px 0 rgba(0,0,0,0.3), inset 1px 1px 0 rgba(255,255,255,0.08)',
      }}
    >
      <canvas
        ref={canvasRef}
        width={THUMB_W}
        height={THUMB_H}
        style={{ display: 'block', imageRendering: 'pixelated', width: THUMB_W, height: THUMB_H }}
      />
    </button>
  );
}

export default function LandscapeSelector({ value, onChange }: LandscapeSelectorProps) {
  const handleSelect = useCallback(
    (id: LandscapeId) => () => onChange(id),
    [onChange],
  );

  return (
    <div>
      <label className="block text-xs font-bold uppercase tracking-widest text-[#8bba6a] mb-2">
        Choose Your Landscape
      </label>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
        {LANDSCAPE_CATALOG.map((l) => (
          <div key={l.id} className="flex flex-col items-center gap-1">
            <Thumbnail id={l.id} selected={value === l.id} onSelect={handleSelect(l.id)} />
            <span className={`text-[10px] ${value === l.id ? 'text-[#8bba6a] font-bold' : 'text-[#6a9a4a]'}`}>
              {l.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

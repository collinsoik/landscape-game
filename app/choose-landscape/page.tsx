'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/store';
import { LANDSCAPE_CATALOG, type LandscapeId } from '@/config/landscapes';
import { getBackgroundRenderer } from '@/lib/backgrounds';
import PixelButton from '@/components/shared/PixelButton';

function LandscapeCard({
  id,
  name,
  description,
  selected,
  onSelect,
}: {
  id: LandscapeId;
  name: string;
  description: string;
  selected: boolean;
  onSelect: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => setDims({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const obs = new ResizeObserver(measure);
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !dims.w || !dims.h) return;
    canvas.width = dims.w;
    canvas.height = dims.h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const draw = getBackgroundRenderer(id);
    draw(ctx, dims.w, dims.h);
  }, [id, dims.w, dims.h]);

  return (
    <button
      type="button"
      onClick={onSelect}
      className="relative cursor-pointer flex flex-col overflow-hidden transition-transform duration-150 hover:scale-[1.02] active:scale-[0.99] focus:outline-none"
      style={{
        background: '#1a2e1a',
        boxShadow: selected
          ? '0 0 0 4px #8bba6a, 0 0 16px rgba(139,186,106,0.4), inset -2px -2px 0 rgba(0,0,0,0.3), inset 2px 2px 0 rgba(255,255,255,0.1)'
          : 'inset -2px -2px 0 rgba(0,0,0,0.3), inset 2px 2px 0 rgba(255,255,255,0.08), 4px 4px 0 rgba(0,0,0,0.3)',
      }}
    >
      <div ref={containerRef} className="w-full aspect-[3/2]">
        <canvas
          ref={canvasRef}
          style={{ display: 'block', width: '100%', height: '100%', imageRendering: 'pixelated' }}
        />
      </div>
      <div className="px-3 py-2 text-left w-full">
        <p className={`text-sm font-bold uppercase tracking-wider ${selected ? 'text-[#8bba6a]' : 'text-[#d4e8c2]'}`}>
          {name}
        </p>
        <p className="text-xs text-[#6a9a4a] leading-tight">{description}</p>
      </div>
      {selected && (
        <div className="absolute top-2 right-2 w-6 h-6 bg-[#8bba6a] flex items-center justify-center"
          style={{ boxShadow: 'inset -1px -1px 0 rgba(0,0,0,0.3), inset 1px 1px 0 rgba(255,255,255,0.2)' }}
        >
          <span className="text-[#1a2e1a] text-xs font-bold">✓</span>
        </div>
      )}
    </button>
  );
}

export default function ChooseLandscapePage() {
  const router = useRouter();
  const playerName = useGameStore((s) => s.playerName);
  const setLandscapeId = useGameStore((s) => s.setLandscapeId);
  const startGame = useGameStore((s) => s.startGame);
  const clearCanvas = useGameStore((s) => s.clearCanvas);

  const [selected, setSelected] = useState<LandscapeId>('meadow');

  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    const unsub = useGameStore.persist.onFinishHydration(() => setHydrated(true));
    if (useGameStore.persist.hasHydrated()) setHydrated(true);
    return unsub;
  }, []);

  if (!hydrated) return null;
  if (!playerName) {
    router.replace('/');
    return null;
  }

  const handleConfirm = () => {
    setLandscapeId(selected);
    clearCanvas();
    startGame();
    router.push('/game');
  };

  return (
    <div className="flex flex-col min-h-screen p-4 md:p-8">
      <div className="text-center mb-6">
        <h1
          className="text-3xl font-bold uppercase tracking-widest text-[#8bba6a] mb-2"
          style={{ textShadow: '2px 2px 0 #1a3a1a' }}
        >
          Choose Your Landscape
        </h1>
        <p className="text-sm text-[#6a9a4a]">
          Pick a backdrop for your wildlife sanctuary, {playerName}!
        </p>
      </div>

      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto w-full auto-rows-min">
        {LANDSCAPE_CATALOG.map((l) => (
          <LandscapeCard
            key={l.id}
            id={l.id}
            name={l.name}
            description={l.description}
            selected={selected === l.id}
            onSelect={() => setSelected(l.id)}
          />
        ))}
      </div>

      <div className="mt-6 text-center">
        <PixelButton variant="primary" size="lg" onClick={handleConfirm}>
          Start Building
        </PixelButton>
      </div>
    </div>
  );
}

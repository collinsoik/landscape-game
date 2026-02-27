'use client';

import { useRef, useEffect } from 'react';
import { Ring } from 'react-konva';
import type Konva from 'konva';

interface SynergyPulseProps {
  x: number;
  y: number;
  color: string;
}

export default function SynergyPulse({ x, y, color }: SynergyPulseProps) {
  const ringRefs = [useRef<Konva.Ring>(null), useRef<Konva.Ring>(null), useRef<Konva.Ring>(null)];
  const animRef = useRef<number>(0);
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    const offsets = [0, 0.33, 0.66];
    let active = true;
    const animate = () => {
      if (!active) return;
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      for (let i = 0; i < 3; i++) {
        const ring = ringRefs[i].current;
        if (!ring) continue;
        try {
          const phase = (elapsed / 2 + offsets[i]) % 1;
          const radius = phase * 25;
          const opacity = (1 - phase) * 0.4;
          if (opacity <= 0.02) {
            ring.visible(false);
          } else {
            ring.visible(true);
            ring.innerRadius(Math.max(0, radius - 1.5));
            ring.outerRadius(radius + 1.5);
            ring.opacity(opacity);
          }
        } catch {
          // Node may be detached during unmount — safe to ignore
        }
      }
      // Batch draw the layer once per frame
      try {
        ringRefs[0].current?.getLayer()?.batchDraw();
      } catch {
        // Layer may be destroyed — safe to ignore
      }
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => {
      active = false;
      cancelAnimationFrame(animRef.current);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      {[0, 1, 2].map((i) => (
        <Ring
          key={i}
          ref={ringRefs[i]}
          x={x}
          y={y}
          innerRadius={0}
          outerRadius={1.5}
          fill={color}
          opacity={0.4}
          listening={false}
        />
      ))}
    </>
  );
}

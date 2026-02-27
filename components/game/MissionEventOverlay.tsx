'use client';

import { useEffect, useState } from 'react';
import type { MissionEventData } from '@/lib/types';

interface MissionEventOverlayProps {
  event: MissionEventData | null;
}

const EVENT_STYLES: Record<string, { bg: string; border: string; text: string; icon: string }> = {
  drought: {
    bg: 'rgba(192, 57, 43, 0.95)',
    border: '#e74c3c',
    text: '#fde8e8',
    icon: '\u{1F525}', // fire
  },
  invasive_spawn: {
    bg: 'rgba(211, 84, 0, 0.95)',
    border: '#e67e22',
    text: '#fef3e5',
    icon: '\u{1F3F5}', // rosette (closest to invasive plant)
  },
  budget_cut: {
    bg: 'rgba(241, 196, 15, 0.92)',
    border: '#f1c40f',
    text: '#1a1a00',
    icon: '\u{2702}', // scissors
  },
  wind_storm: {
    bg: 'rgba(52, 73, 94, 0.95)',
    border: '#7f8c8d',
    text: '#ecf0f1',
    icon: '\u{1F32A}', // tornado/wind
  },
  pollinator_boost: {
    bg: 'rgba(39, 174, 96, 0.95)',
    border: '#2ecc71',
    text: '#e8f8f0',
    icon: '\u{1F41D}', // bee
  },
};

export default function MissionEventOverlay({ event }: MissionEventOverlayProps) {
  const [visible, setVisible] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    if (event) {
      setVisible(true);
      setFadeOut(false);

      const fadeTimer = setTimeout(() => setFadeOut(true), 2500);
      const hideTimer = setTimeout(() => setVisible(false), 3200);

      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(hideTimer);
      };
    } else {
      setVisible(false);
    }
  }, [event]);

  if (!visible || !event) return null;

  const style = EVENT_STYLES[event.eventType] ?? EVENT_STYLES.drought;

  return (
    <div
      className={`fixed top-16 left-0 right-0 z-[80] flex justify-center pointer-events-none transition-all duration-500 ${
        fadeOut ? 'opacity-0 -translate-y-2' : 'opacity-100 translate-y-0'
      }`}
    >
      <div
        className="px-8 py-4 max-w-xl w-full mx-4 flex items-center gap-4 rounded shadow-2xl"
        style={{
          background: style.bg,
          border: `2px solid ${style.border}`,
          boxShadow: `0 0 30px ${style.border}60`,
        }}
      >
        <span className="text-3xl flex-shrink-0">{style.icon}</span>
        <div className="flex-1">
          <div className="text-sm font-bold uppercase tracking-wider" style={{ color: style.text }}>
            {event.title}
          </div>
          <div className="text-xs mt-0.5" style={{ color: style.text, opacity: 0.85 }}>
            {event.message}
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { type ReactNode } from 'react';

interface PixelCardProps {
  title?: string;
  glow?: boolean;
  className?: string;
  children: ReactNode;
}

export default function PixelCard({
  title,
  glow = false,
  className = '',
  children,
}: PixelCardProps) {
  return (
    <div
      className={[
        'bg-[#1a2e1a] text-[#d4e8c2] p-4',
        glow ? 'shadow-[0_0_12px_rgba(45,90,39,0.5)]' : '',
        className,
      ].join(' ')}
      style={{
        boxShadow: [
          'inset -2px -2px 0 rgba(0,0,0,0.4)',
          'inset 2px 2px 0 rgba(255,255,255,0.1)',
          '4px 4px 0 rgba(0,0,0,0.3)',
          glow ? '0 0 12px rgba(45,90,39,0.5)' : '',
        ]
          .filter(Boolean)
          .join(', '),
      }}
    >
      {title && (
        <h3
          className="text-sm font-bold uppercase tracking-widest text-[#8bba6a] mb-3 pb-2"
          style={{
            borderBottom: '2px solid #2d5a27',
          }}
        >
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}

'use client';

import TutorialSlide from '../TutorialSlide';
import { ELEMENT_CATEGORIES } from '@/config/elements';

/** Two-panel: mock sidebar + mock canvas with pick-and-place flow */
function PickAndPlaceIllustration() {
  const categories = ELEMENT_CATEGORIES.slice(0, 5);

  return (
    <div className="flex gap-4 md:gap-6 w-full max-w-lg mx-auto items-stretch" style={{ minHeight: 180 }}>
      {/* Mock sidebar */}
      <div
        className="flex flex-col gap-2 p-3 w-[140px] flex-shrink-0"
        style={{
          background: '#0d1f0d',
          border: '2px solid #2d5a27',
          boxShadow: 'inset -2px -2px 0 rgba(0,0,0,0.3), inset 2px 2px 0 rgba(255,255,255,0.05)',
        }}
      >
        <div className="text-[10px] uppercase tracking-wider text-[#4a6a3a] mb-1">Elements</div>
        {categories.map((cat, i) => (
          <div
            key={cat.key}
            className="flex items-center gap-2 px-2 py-1.5 relative"
            style={{
              background: i === 0 ? 'rgba(45,90,39,0.3)' : 'transparent',
              border: i === 0 ? '2px solid #8bba6a' : '2px solid transparent',
              boxShadow: i === 0 ? '0 0 8px rgba(139,186,106,0.3)' : 'none',
            }}
          >
            <div
              style={{
                width: 14, height: 14, borderRadius: 2,
                background: cat.color,
                boxShadow: 'inset -1px -1px 0 rgba(0,0,0,0.3)',
                flexShrink: 0,
              }}
            />
            <span className="text-[11px] text-[#d4e8c2] truncate">{cat.label}</span>
            {/* Numbered circle "1" on first element */}
            {i === 0 && (
              <div
                className="absolute -right-3 -top-3 w-6 h-6 flex items-center justify-center text-[10px] font-bold text-white"
                style={{
                  background: '#e67e22', borderRadius: '50%',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.4)',
                }}
              >
                1
              </div>
            )}
          </div>
        ))}
        {/* Bouncing cursor hand */}
        <div
          className="absolute animate-bounce"
          style={{
            left: 90, top: 58, fontSize: 20,
            filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.5))',
          }}
        >
          👆
        </div>
      </div>

      {/* Arrow */}
      <div className="flex items-center flex-shrink-0">
        <div
          className="text-[#8bba6a] text-2xl font-bold"
          style={{ textShadow: '0 0 6px rgba(139,186,106,0.4)' }}
        >
          &rarr;
        </div>
      </div>

      {/* Mock canvas */}
      <div
        className="flex-1 relative"
        style={{
          background: 'linear-gradient(to bottom, #1a3a1a, #1e4020)',
          border: '2px solid #2d5a27',
          boxShadow: 'inset 0 0 20px rgba(0,0,0,0.3)',
          minHeight: 160,
        }}
      >
        {/* Grid dots */}
        {Array.from({ length: 9 }).map((_, i) => (
          <div
            key={i}
            className="absolute"
            style={{
              width: 3, height: 3, borderRadius: '50%',
              background: '#2d5a2744',
              left: `${25 + (i % 3) * 25}%`,
              top: `${25 + Math.floor(i / 3) * 25}%`,
            }}
          />
        ))}

        {/* Placed element */}
        <div className="absolute" style={{ top: '35%', left: '45%' }}>
          <div
            style={{
              width: 28, height: 28, borderRadius: '50%',
              background: ELEMENT_CATEGORIES[0].color,
              boxShadow: `0 0 10px ${ELEMENT_CATEGORIES[0].color}55, inset -2px -2px 0 rgba(0,0,0,0.3), inset 2px 2px 0 rgba(255,255,255,0.15)`,
            }}
          />
          {/* Numbered circle "2" */}
          <div
            className="absolute -right-3 -top-3 w-6 h-6 flex items-center justify-center text-[10px] font-bold text-white"
            style={{
              background: '#e67e22', borderRadius: '50%',
              boxShadow: '0 2px 4px rgba(0,0,0,0.4)',
            }}
          >
            2
          </div>
        </div>

        {/* Click ripple */}
        <div
          className="absolute animate-ping"
          style={{
            top: '35%', left: '45%',
            width: 28, height: 28, borderRadius: '50%',
            border: '2px solid #8bba6a44',
            marginTop: 0,
          }}
        />
      </div>
    </div>
  );
}

export default function SlidePickAndPlace() {
  return (
    <TutorialSlide
      title="Pick and Place"
      body="Choose from the sidebar on the left. Then click on the map to place it!"
      illustration={<PickAndPlaceIllustration />}
    />
  );
}

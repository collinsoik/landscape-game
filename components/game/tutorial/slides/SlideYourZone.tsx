'use client';

import TutorialSlide from '../TutorialSlide';

/** Mock canvas with zone boundaries, highlighted player zone, element outside with red X */
function YourZoneIllustration() {
  return (
    <div
      className="relative w-full max-w-md aspect-[4/3] mx-auto"
      style={{
        background: 'linear-gradient(to bottom, #1a3a1a, #1e4020)',
        border: '3px solid #2d5a27',
        boxShadow: 'inset 0 0 30px rgba(0,0,0,0.3), 0 4px 0 rgba(0,0,0,0.3)',
        imageRendering: 'pixelated',
      }}
    >
      {/* Zone grid — 2x2 */}
      {/* Other zone — top-left (dimmed) */}
      <div
        className="absolute"
        style={{
          top: '5%', left: '5%', width: '43%', height: '43%',
          border: '2px dashed #4a6a3a55',
          background: 'rgba(0,0,0,0.2)',
        }}
      >
        <div className="absolute top-1 left-2 text-[9px] text-[#4a6a3a55] uppercase tracking-wider">
          Team A
        </div>
      </div>

      {/* Player zone — top-right (highlighted!) */}
      <div
        className="absolute"
        style={{
          top: '5%', left: '52%', width: '43%', height: '43%',
          border: '3px solid #8bba6a',
          background: 'rgba(139,186,106,0.08)',
          boxShadow: '0 0 16px rgba(139,186,106,0.2), inset 0 0 16px rgba(139,186,106,0.05)',
        }}
      >
        <div className="absolute top-1 left-2 text-[10px] text-[#8bba6a] uppercase tracking-wider font-bold">
          Your Zone!
        </div>

        {/* Happy elements inside */}
        {[
          { x: '20%', y: '40%', color: '#2d5a27', size: 20 },
          { x: '55%', y: '50%', color: '#c94c8e', size: 14 },
          { x: '70%', y: '35%', color: '#3b82c4', size: 16 },
        ].map((el, i) => (
          <div
            key={i}
            className="absolute"
            style={{
              left: el.x, top: el.y,
              width: el.size, height: el.size, borderRadius: '50%',
              background: el.color,
              boxShadow: `inset -2px -2px 0 rgba(0,0,0,0.3), inset 2px 2px 0 rgba(255,255,255,0.15), 0 0 6px ${el.color}44`,
            }}
          />
        ))}
      </div>

      {/* Other zone — bottom-left (dimmed) */}
      <div
        className="absolute"
        style={{
          top: '52%', left: '5%', width: '43%', height: '43%',
          border: '2px dashed #4a6a3a55',
          background: 'rgba(0,0,0,0.2)',
        }}
      >
        <div className="absolute top-1 left-2 text-[9px] text-[#4a6a3a55] uppercase tracking-wider">
          Team C
        </div>
      </div>

      {/* Other zone — bottom-right (dimmed) */}
      <div
        className="absolute"
        style={{
          top: '52%', left: '52%', width: '43%', height: '43%',
          border: '2px dashed #4a6a3a55',
          background: 'rgba(0,0,0,0.2)',
        }}
      >
        <div className="absolute top-1 left-2 text-[9px] text-[#4a6a3a55] uppercase tracking-wider">
          Team D
        </div>
      </div>

      {/* Element outside zone with red X */}
      <div className="absolute" style={{ bottom: '18%', left: '18%' }}>
        <div
          style={{
            width: 18, height: 18, borderRadius: '50%',
            background: '#4a7c3f',
            opacity: 0.5,
            boxShadow: 'inset -1px -1px 0 rgba(0,0,0,0.3)',
          }}
        />
        <div
          className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center text-[10px] font-bold text-white"
          style={{
            background: '#c0392b', borderRadius: '50%',
            boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
          }}
        >
          X
        </div>
      </div>
    </div>
  );
}

export default function SlideYourZone() {
  return (
    <TutorialSlide
      title="Your Building Zone"
      body="You can only build inside your colored zone. Stay inside the lines!"
      illustration={<YourZoneIllustration />}
    />
  );
}

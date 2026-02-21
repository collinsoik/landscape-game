'use client';

import TutorialSlide from '../TutorialSlide';

/** Populated landscape with synergy lines and sparkle animations */
function ReadyIllustration() {
  return (
    <div
      className="relative w-full max-w-md aspect-[4/3] mx-auto overflow-hidden"
      style={{
        background: 'linear-gradient(to bottom, #1a3a1a 0%, #1e4020 100%)',
        border: '3px solid #2d5a27',
        boxShadow: 'inset 0 0 40px rgba(0,0,0,0.3), 0 4px 0 rgba(0,0,0,0.3)',
        imageRendering: 'pixelated',
      }}
    >
      {/* Ground */}
      <div
        className="absolute bottom-0 left-0 right-0"
        style={{ height: '25%', background: 'linear-gradient(to bottom, #2d5a27, #1a3a1a)' }}
      />

      {/* Elements placed around the scene */}
      {/* Oak tree */}
      <div className="absolute" style={{ bottom: '24%', left: '10%' }}>
        <div style={{ width: 10, height: 24, background: '#5c3d1e', margin: '0 auto' }} />
        <div
          style={{
            width: 36, height: 36, borderRadius: '50%', background: '#2d5a27',
            marginTop: -8,
            boxShadow: 'inset -3px -3px 0 rgba(0,0,0,0.3), inset 3px 3px 0 rgba(255,255,255,0.1)',
          }}
        />
      </div>

      {/* Fern near oak */}
      <div className="absolute" style={{ bottom: '22%', left: '25%' }}>
        <div
          style={{
            width: 20, height: 20, borderRadius: '50%', background: '#4a7c3f',
            boxShadow: 'inset -2px -2px 0 rgba(0,0,0,0.3), inset 2px 2px 0 rgba(255,255,255,0.1)',
          }}
        />
      </div>

      {/* Synergy line between oak and fern */}
      <svg
        className="absolute animate-pulse"
        style={{ bottom: '30%', left: '15%', width: 80, height: 20, overflow: 'visible' }}
      >
        <line
          x1="10" y1="10" x2="60" y2="10"
          stroke="#4ade80" strokeWidth="2" strokeDasharray="6 4"
          style={{ filter: 'drop-shadow(0 0 4px rgba(74,222,128,0.5))' }}
        />
      </svg>

      {/* Pond */}
      <div
        className="absolute"
        style={{
          bottom: '6%', left: '40%',
          width: 70, height: 30, borderRadius: '50%',
          background: 'linear-gradient(135deg, #2a6fa8, #3b82c4)',
          boxShadow: 'inset -2px -2px 0 rgba(0,0,0,0.3), inset 2px 2px 0 rgba(255,255,255,0.15), 0 0 10px rgba(59,130,196,0.3)',
        }}
      />

      {/* Flower cluster near pond */}
      <div className="absolute" style={{ bottom: '18%', left: '55%' }}>
        <div
          style={{
            width: 16, height: 16, borderRadius: '50%', background: '#c94c8e',
            boxShadow: 'inset -2px -2px 0 rgba(0,0,0,0.3), 0 0 6px rgba(201,76,142,0.3)',
          }}
        />
      </div>

      {/* Shrub */}
      <div className="absolute" style={{ bottom: '22%', right: '18%' }}>
        <div
          style={{
            width: 26, height: 22, borderRadius: '40%', background: '#4a7c3f',
            boxShadow: 'inset -2px -2px 0 rgba(0,0,0,0.3), inset 2px 2px 0 rgba(255,255,255,0.1)',
          }}
        />
      </div>

      {/* Another tree — right */}
      <div className="absolute" style={{ bottom: '24%', right: '8%' }}>
        <div style={{ width: 8, height: 20, background: '#5c3d1e', margin: '0 auto' }} />
        <div
          style={{
            width: 30, height: 30, borderRadius: '50%', background: '#3a6a2e',
            marginTop: -6,
            boxShadow: 'inset -3px -3px 0 rgba(0,0,0,0.3), inset 3px 3px 0 rgba(255,255,255,0.1)',
          }}
        />
      </div>

      {/* Synergy line between shrub and tree */}
      <svg
        className="absolute animate-pulse"
        style={{ bottom: '32%', right: '10%', width: 70, height: 20, overflow: 'visible' }}
      >
        <line
          x1="5" y1="10" x2="55" y2="10"
          stroke="#4ade80" strokeWidth="2" strokeDasharray="6 4"
          style={{ filter: 'drop-shadow(0 0 4px rgba(74,222,128,0.5))' }}
        />
      </svg>

      {/* Birdhouse */}
      <div className="absolute" style={{ bottom: '42%', left: '68%' }}>
        <div style={{ width: 4, height: 14, background: '#5c3d1e', margin: '0 auto' }} />
        <div
          style={{
            width: 16, height: 14, background: '#8b6914', marginTop: -2,
            boxShadow: 'inset -2px -2px 0 rgba(0,0,0,0.3), inset 2px 2px 0 rgba(255,255,255,0.15)',
          }}
        >
          <div
            style={{
              width: 5, height: 5, borderRadius: '50%', background: '#1a2e1a',
              margin: '3px auto 0',
            }}
          />
        </div>
      </div>

      {/* Sparkles */}
      {[
        { x: '15%', y: '15%', delay: '0s' },
        { x: '50%', y: '10%', delay: '0.5s' },
        { x: '80%', y: '20%', delay: '1s' },
        { x: '35%', y: '8%', delay: '1.5s' },
        { x: '70%', y: '12%', delay: '0.7s' },
        { x: '25%', y: '5%', delay: '1.2s' },
      ].map((s, i) => (
        <div
          key={i}
          className="absolute animate-ping"
          style={{
            left: s.x, top: s.y,
            width: 6, height: 6,
            background: '#fbbf24',
            clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
            animationDelay: s.delay,
            animationDuration: '2s',
          }}
        />
      ))}
    </div>
  );
}

export default function SlideReady() {
  return (
    <TutorialSlide
      title="You Got This!"
      body="Click items to select them. Press Delete to remove. Drag to rearrange. Now go build something amazing!"
      tip="Tap the ? button anytime to see this again."
      illustration={<ReadyIllustration />}
    />
  );
}

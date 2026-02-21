'use client';

import TutorialSlide from '../TutorialSlide';

/** CSS mini-landscape: trees, flowers, a pond */
function WelcomeIllustration() {
  return (
    <div
      className="relative w-full max-w-md aspect-[4/3] mx-auto"
      style={{
        background: 'linear-gradient(to bottom, #1a3a1a 0%, #1e4020 100%)',
        border: '3px solid #2d5a27',
        boxShadow: 'inset 0 0 40px rgba(0,0,0,0.3), 0 4px 0 rgba(0,0,0,0.3)',
        imageRendering: 'pixelated',
        overflow: 'hidden',
      }}
    >
      {/* Ground */}
      <div
        className="absolute bottom-0 left-0 right-0"
        style={{ height: '30%', background: 'linear-gradient(to bottom, #2d5a27, #1a3a1a)' }}
      />

      {/* Tree 1 — left */}
      <div className="absolute" style={{ bottom: '28%', left: '12%' }}>
        <div style={{ width: 12, height: 28, background: '#5c3d1e', margin: '0 auto' }} />
        <div
          style={{
            width: 40, height: 40, borderRadius: '50%', background: '#2d5a27',
            marginTop: -10, boxShadow: 'inset -3px -3px 0 rgba(0,0,0,0.3), inset 3px 3px 0 rgba(255,255,255,0.1)',
          }}
        />
      </div>

      {/* Tree 2 — center-left */}
      <div className="absolute" style={{ bottom: '28%', left: '30%' }}>
        <div style={{ width: 10, height: 22, background: '#5c3d1e', margin: '0 auto' }} />
        <div
          style={{
            width: 32, height: 32, borderRadius: '50%', background: '#4a7c3f',
            marginTop: -8, boxShadow: 'inset -3px -3px 0 rgba(0,0,0,0.3), inset 3px 3px 0 rgba(255,255,255,0.1)',
          }}
        />
      </div>

      {/* Tree 3 — right */}
      <div className="absolute" style={{ bottom: '28%', right: '15%' }}>
        <div style={{ width: 14, height: 32, background: '#5c3d1e', margin: '0 auto' }} />
        <div
          style={{
            width: 44, height: 44, borderRadius: '50%', background: '#3a6a2e',
            marginTop: -12, boxShadow: 'inset -3px -3px 0 rgba(0,0,0,0.3), inset 3px 3px 0 rgba(255,255,255,0.1)',
          }}
        />
      </div>

      {/* Pond */}
      <div
        className="absolute"
        style={{
          bottom: '8%', left: '50%', transform: 'translateX(-50%)',
          width: 80, height: 36, borderRadius: '50%',
          background: 'linear-gradient(135deg, #2a6fa8, #3b82c4)',
          boxShadow: 'inset -2px -2px 0 rgba(0,0,0,0.3), inset 2px 2px 0 rgba(255,255,255,0.15), 0 0 12px rgba(59,130,196,0.3)',
        }}
      />

      {/* Flowers */}
      {[
        { x: '22%', y: '18%', color: '#c94c8e', size: 10 },
        { x: '45%', y: '14%', color: '#e67e22', size: 8 },
        { x: '60%', y: '20%', color: '#c94c8e', size: 10 },
        { x: '75%', y: '16%', color: '#e67e22', size: 9 },
        { x: '38%', y: '22%', color: '#8e44ad', size: 8 },
      ].map((f, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            bottom: f.y, left: f.x,
            width: f.size, height: f.size, borderRadius: '50%',
            background: f.color,
            boxShadow: `0 0 4px ${f.color}66`,
          }}
        />
      ))}

      {/* Grass tufts */}
      {[18, 35, 55, 70, 85].map((x, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            bottom: '27%', left: `${x}%`,
            width: 0, height: 0,
            borderLeft: '4px solid transparent', borderRight: '4px solid transparent',
            borderBottom: '10px solid #4a7c3f',
          }}
        />
      ))}
    </div>
  );
}

export default function SlideWelcome() {
  return (
    <TutorialSlide
      title="Build Your World!"
      body="Place plants, water, and more to create an awesome landscape. Work with your team to get the highest score!"
      illustration={<WelcomeIllustration />}
    />
  );
}

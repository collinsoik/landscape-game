'use client';

import TutorialSlide from '../TutorialSlide';

function MissionIllustration() {
  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-md mx-auto">
      {/* Before / After comparison */}
      <div className="flex gap-4 md:gap-8 w-full items-stretch">
        {/* Before */}
        <div className="flex-1 text-center">
          <div className="text-xs uppercase tracking-wider text-[#c0392b] mb-2 font-bold">Before</div>
          <div
            className="relative aspect-[4/3]"
            style={{
              background: 'linear-gradient(to bottom, #2a1a0a, #3a2a1a)',
              border: '2px solid #5c3d1e',
              boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)',
            }}
          >
            {/* Dead ground */}
            <div className="absolute bottom-0 left-0 right-0" style={{ height: '30%', background: '#3a2a1a' }} />
            {/* Invasive vines */}
            {[20, 50, 75].map((x) => (
              <div key={x} className="absolute" style={{ bottom: '25%', left: `${x}%` }}>
                <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#c0392b', opacity: 0.8 }} />
              </div>
            ))}
          </div>
        </div>

        {/* Arrow */}
        <div className="flex items-center">
          <div className="text-[#8bba6a] text-2xl font-bold" style={{ textShadow: '0 0 6px rgba(139,186,106,0.4)' }}>
            &rarr;
          </div>
        </div>

        {/* After */}
        <div className="flex-1 text-center">
          <div className="text-xs uppercase tracking-wider text-[#2ecc71] mb-2 font-bold">After</div>
          <div
            className="relative aspect-[4/3]"
            style={{
              background: 'linear-gradient(to bottom, #1a3a1a, #1e4020)',
              border: '2px solid #2d5a27',
              boxShadow: 'inset 0 0 20px rgba(0,0,0,0.3)',
            }}
          >
            {/* Ground */}
            <div className="absolute bottom-0 left-0 right-0" style={{ height: '30%', background: '#2d5a27' }} />
            {/* Trees and flowers */}
            <div className="absolute" style={{ bottom: '28%', left: '15%' }}>
              <div style={{ width: 6, height: 16, background: '#5c3d1e', margin: '0 auto' }} />
              <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#2d5a27', marginTop: -4 }} />
            </div>
            <div className="absolute" style={{ bottom: '26%', left: '50%' }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#c94c8e' }} />
            </div>
            <div className="absolute" style={{ bottom: '10%', left: '70%' }}>
              <div style={{ width: 30, height: 14, borderRadius: '50%', background: '#3b82c4', opacity: 0.8 }} />
            </div>
            {/* Sparkles */}
            {[{ x: '30%', y: '15%' }, { x: '65%', y: '20%' }].map((s, i) => (
              <div key={i} className="absolute animate-ping" style={{
                left: s.x, top: s.y, width: 5, height: 5, background: '#fbbf24',
                clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
                animationDuration: '2s', animationDelay: `${i * 0.5}s`,
              }} />
            ))}
          </div>
        </div>
      </div>

      {/* Goal card */}
      <div
        className="px-4 py-2 text-center w-full max-w-xs"
        style={{
          background: '#1a3a1a',
          border: '2px solid #2d5a27',
          boxShadow: 'inset -2px -2px 0 rgba(0,0,0,0.3), inset 2px 2px 0 rgba(255,255,255,0.05)',
        }}
      >
        <div className="text-xs uppercase tracking-wider text-[#f39c12] font-bold mb-1">Your Goal</div>
        <div className="text-sm text-[#d4e8c2]">Transform the landscape to score as high as you can!</div>
      </div>
    </div>
  );
}

export default function SlideMission() {
  return (
    <TutorialSlide
      title="Your Mission"
      body="Each round has a goal. Build your landscape to meet (or beat!) the target. Work with your team to create the best ecosystem!"
      illustration={<MissionIllustration />}
    />
  );
}

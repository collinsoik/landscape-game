'use client';

import TutorialSlide from '../TutorialSlide';

/** Two examples side by side: good combo vs bad combo */
function SynergiesIllustration() {
  return (
    <div className="flex flex-col sm:flex-row gap-6 md:gap-10 w-full max-w-lg mx-auto items-center justify-center">
      {/* Good combo */}
      <div className="flex flex-col items-center gap-2">
        <div className="text-xs uppercase tracking-wider text-[#8bba6a] font-bold mb-1">
          Good Combo
        </div>
        <div className="relative flex items-center gap-3">
          {/* Oak tree */}
          <div className="flex flex-col items-center">
            <div
              style={{
                width: 36, height: 36, borderRadius: '50%',
                background: '#2d5a27',
                boxShadow: 'inset -3px -3px 0 rgba(0,0,0,0.3), inset 3px 3px 0 rgba(255,255,255,0.1), 0 0 8px rgba(45,90,39,0.4)',
              }}
            />
            <span className="text-[11px] text-[#8bba6a] mt-1">Oak</span>
          </div>

          {/* Animated green dashed line */}
          <div className="relative" style={{ width: 50, height: 4 }}>
            <div
              style={{
                position: 'absolute', top: 0, left: 0, right: 0,
                borderTop: '3px dashed #4ade80',
                boxShadow: '0 0 6px rgba(74,222,128,0.4)',
              }}
              className="animate-pulse"
            />
          </div>

          {/* Fern */}
          <div className="flex flex-col items-center">
            <div
              style={{
                width: 28, height: 28, borderRadius: '50%',
                background: '#4a7c3f',
                boxShadow: 'inset -3px -3px 0 rgba(0,0,0,0.3), inset 3px 3px 0 rgba(255,255,255,0.1), 0 0 8px rgba(74,124,63,0.4)',
              }}
            />
            <span className="text-[11px] text-[#8bba6a] mt-1">Fern</span>
          </div>
        </div>

        {/* Badge */}
        <div className="flex items-center gap-2 mt-1">
          <span
            className="px-2 py-0.5 text-sm font-bold"
            style={{
              background: 'rgba(74,222,128,0.15)', color: '#4ade80',
              boxShadow: 'inset -1px -1px 0 rgba(0,0,0,0.2), inset 1px 1px 0 rgba(255,255,255,0.1)',
            }}
          >
            +5
          </span>
          <div
            className="w-5 h-5 flex items-center justify-center text-[11px] font-bold"
            style={{
              background: '#22c55e', color: 'white', borderRadius: '50%',
              boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
            }}
          >
            &#10003;
          </div>
        </div>
      </div>

      {/* Divider */}
      <div
        className="hidden sm:block"
        style={{ width: 2, height: 100, background: '#2d5a27' }}
      />
      <div
        className="sm:hidden"
        style={{ height: 2, width: 100, background: '#2d5a27' }}
      />

      {/* Bad combo */}
      <div className="flex flex-col items-center gap-2">
        <div className="text-xs uppercase tracking-wider text-[#c0392b] font-bold mb-1">
          Bad Combo
        </div>
        <div className="relative flex items-center gap-3">
          {/* Invasive vine */}
          <div className="flex flex-col items-center">
            <div
              style={{
                width: 32, height: 32, borderRadius: '50%',
                background: '#c0392b',
                boxShadow: 'inset -3px -3px 0 rgba(0,0,0,0.3), inset 3px 3px 0 rgba(255,255,255,0.1), 0 0 8px rgba(192,57,43,0.4)',
              }}
            />
            <span className="text-[11px] text-[#c0392b] mt-1">Vine</span>
          </div>

          {/* Red line */}
          <div className="relative" style={{ width: 50, height: 4 }}>
            <div
              style={{
                position: 'absolute', top: 0, left: 0, right: 0,
                borderTop: '3px dashed #ef4444',
                boxShadow: '0 0 6px rgba(239,68,68,0.4)',
              }}
              className="animate-pulse"
            />
          </div>

          {/* Flower */}
          <div className="flex flex-col items-center">
            <div
              style={{
                width: 28, height: 28, borderRadius: '50%',
                background: '#c94c8e',
                boxShadow: 'inset -3px -3px 0 rgba(0,0,0,0.3), inset 3px 3px 0 rgba(255,255,255,0.1), 0 0 8px rgba(201,76,142,0.4)',
              }}
            />
            <span className="text-[11px] text-[#c94c8e] mt-1">Flower</span>
          </div>
        </div>

        {/* Badge */}
        <div className="flex items-center gap-2 mt-1">
          <span
            className="px-2 py-0.5 text-sm font-bold"
            style={{
              background: 'rgba(239,68,68,0.15)', color: '#ef4444',
              boxShadow: 'inset -1px -1px 0 rgba(0,0,0,0.2), inset 1px 1px 0 rgba(255,255,255,0.1)',
            }}
          >
            -3
          </span>
          <div
            className="w-5 h-5 flex items-center justify-center text-[11px] font-bold"
            style={{
              background: '#ef4444', color: 'white', borderRadius: '50%',
              boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
            }}
          >
            X
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SlideSynergies() {
  return (
    <TutorialSlide
      title="Teamwork Between Plants"
      body="Some plants help each other! Green lines = bonus points. Red lines = lost points."
      illustration={<SynergiesIllustration />}
    />
  );
}

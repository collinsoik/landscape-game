'use client';

import PixelButton from '@/components/shared/PixelButton';

interface TutorialNavProps {
  current: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
  onDot: (index: number) => void;
  onSkip: () => void;
  isLast: boolean;
}

export default function TutorialNav({
  current,
  total,
  onPrev,
  onNext,
  onDot,
  onSkip,
  isLast,
}: TutorialNavProps) {
  return (
    <>
      {/* Skip button — absolute top-right */}
      <button
        onClick={onSkip}
        className="absolute top-4 right-4 z-10 text-[#6a9a4a] hover:text-[#8bba6a] text-xs uppercase tracking-wider cursor-pointer px-3 py-2"
        title="Skip tutorial (Esc)"
      >
        Skip (Esc)
      </button>

      {/* Bottom nav bar */}
      <div
        className="flex items-center justify-between px-6 py-4 flex-shrink-0"
        style={{ borderTop: '2px solid #2d5a27' }}
      >
        {/* Dot indicators */}
        <div className="flex items-center gap-3">
          {Array.from({ length: total }).map((_, i) => (
            <button
              key={i}
              onClick={() => onDot(i)}
              className="cursor-pointer p-1"
              style={{ minWidth: 44, minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              aria-label={`Go to slide ${i + 1}`}
            >
              <div
                className="w-4 h-4 transition-all duration-150"
                style={{
                  background: i === current ? '#8bba6a' : i < current ? '#4a7c3f' : '#2d3d2d',
                  boxShadow:
                    i === current
                      ? '0 0 6px rgba(139, 186, 106, 0.6), inset -1px -1px 0 rgba(0,0,0,0.2), inset 1px 1px 0 rgba(255,255,255,0.15)'
                      : 'inset -1px -1px 0 rgba(0,0,0,0.2), inset 1px 1px 0 rgba(255,255,255,0.1)',
                }}
              />
            </button>
          ))}
        </div>

        {/* Back / Next buttons */}
        <div className="flex gap-3">
          {current > 0 && (
            <PixelButton variant="secondary" size="lg" onClick={onPrev} className="min-w-[120px]">
              &laquo; Back
            </PixelButton>
          )}
          <PixelButton variant="primary" size="lg" onClick={onNext} className="min-w-[120px]">
            {isLast ? "LET'S BUILD!" : 'Next \u00BB'}
          </PixelButton>
        </div>
      </div>
    </>
  );
}

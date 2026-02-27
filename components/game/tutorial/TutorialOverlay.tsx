'use client';

import { useState, useCallback, useEffect } from 'react';
import TutorialNav from './TutorialNav';
import SlideWelcome from './slides/SlideWelcome';
import SlideRounds from './slides/SlideRounds';
import SlidePickAndPlace from './slides/SlidePickAndPlace';
import SlideStars from './slides/SlideStars';
import SlideReady from './slides/SlideReady';

const TUTORIAL_STORAGE_KEY = 'landscape-game-tutorial-seen';

const SLIDES = [SlideWelcome, SlideRounds, SlidePickAndPlace, SlideStars, SlideReady];
const TOTAL_SLIDES = SLIDES.length;

interface TutorialOverlayProps {
  open: boolean;
  onClose: () => void;
  compact?: boolean;
}

export default function TutorialOverlay({ open, onClose, compact }: TutorialOverlayProps) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (open) setStep(0);
  }, [open]);

  const handleNext = useCallback(() => {
    if (step < TOTAL_SLIDES - 1) setStep((s) => s + 1);
    else onClose();
  }, [step, onClose]);

  const handlePrev = useCallback(() => setStep((s) => Math.max(0, s - 1)), []);
  const handleSkip = useCallback(() => onClose(), [onClose]);
  const handleDot = useCallback((index: number) => setStep(index), []);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Enter') { e.preventDefault(); handleNext(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); handlePrev(); }
      else if (e.key === 'Escape') { e.preventDefault(); handleSkip(); }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, handleNext, handlePrev, handleSkip]);

  if (!open) return null;

  const SlideComponent = SLIDES[step];

  return (
    <div
      className={['fixed z-[100] flex flex-col', compact ? 'left-0 right-0 bottom-0 rounded-t-lg' : 'inset-0'].join(' ')}
      style={{ background: '#0d1f0d', imageRendering: 'pixelated', ...(compact ? { top: '44px' } : {}) }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex-1 flex flex-col min-h-0 relative">
        <SlideComponent />
      </div>
      <TutorialNav current={step} total={TOTAL_SLIDES} onPrev={handlePrev} onNext={handleNext} onDot={handleDot} onSkip={handleSkip} isLast={step === TOTAL_SLIDES - 1} />
    </div>
  );
}

export function hasTutorialBeenSeen(): boolean {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem(TUTORIAL_STORAGE_KEY) === 'true';
}

export function markTutorialSeen(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(TUTORIAL_STORAGE_KEY, 'true');
}

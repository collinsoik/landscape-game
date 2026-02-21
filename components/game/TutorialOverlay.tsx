'use client';

import { useState, useCallback, useEffect } from 'react';
import PixelButton from '@/components/shared/PixelButton';

const TUTORIAL_STORAGE_KEY = 'landscape-game-tutorial-seen';

interface TutorialStep {
  title: string;
  content: string;
  icon: string;
  tip?: string;
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    title: 'Welcome to Landscape Builder',
    content:
      'Work with your team to design the best landscape! Place trees, flowers, water features, and more to build a thriving ecosystem. Your goal is to maximize biodiversity, sustainability, aesthetics, and ecosystem health.',
    icon: '🌿',
    tip: 'Each round has a time limit — plan quickly and place wisely!',
  },
  {
    title: 'Choosing Elements',
    content:
      'The sidebar on the left shows all available elements organized by category: Trees, Shrubs, Flowers, Ground Cover, Water Features, Structures, Habitat, and Invasive species. Click or tap any element to select it.',
    icon: '📋',
    tip: 'Check the score preview at the bottom of the sidebar to see how each element affects your four scores.',
  },
  {
    title: 'Placing Elements',
    content:
      'After selecting an element, click anywhere inside your highlighted zone on the canvas to place it. You can also drag elements directly from the sidebar onto the canvas.',
    icon: '🎯',
    tip: 'On mobile, tap the menu button in the bottom-right corner to open the element sidebar.',
  },
  {
    title: 'Your Zone',
    content:
      'Each player has a designated zone highlighted on the canvas. You can only place elements within your own zone. If you see an "Outside zone" warning, move your cursor back inside the highlighted area.',
    icon: '🗺️',
    tip: 'You can drag your already-placed elements to rearrange them within your zone.',
  },
  {
    title: 'Scoring & Synergies',
    content:
      'Elements interact with each other! Placing complementary elements nearby creates synergies (green lines, bonus points). Conflicting placements cause penalties (red lines, lost points). Experiment with combinations!',
    icon: '⚡',
    tip: 'Native plants near water features often create strong synergies. Avoid invasive species — they hurt your scores!',
  },
  {
    title: 'Managing Placements',
    content:
      'Click on any element you placed to select it. Press Delete or Backspace to remove it. You can reposition elements by dragging them to a new spot within your zone.',
    icon: '✏️',
    tip: 'Don\'t be afraid to rearrange — finding the optimal layout is part of the strategy!',
  },
  {
    title: 'You\'re Ready!',
    content:
      'That\'s everything you need to know. Build a beautiful, biodiverse landscape and score higher than the other teams. Good luck!',
    icon: '🏆',
    tip: 'You can reopen this tutorial anytime by clicking the "?" button in the top bar.',
  },
];

interface TutorialOverlayProps {
  open: boolean;
  onClose: () => void;
}

export default function TutorialOverlay({ open, onClose }: TutorialOverlayProps) {
  const [step, setStep] = useState(0);

  // Reset step when opened
  useEffect(() => {
    if (open) setStep(0);
  }, [open]);

  const handleNext = useCallback(() => {
    if (step < TUTORIAL_STEPS.length - 1) {
      setStep((s) => s + 1);
    } else {
      onClose();
    }
  }, [step, onClose]);

  const handlePrev = useCallback(() => {
    setStep((s) => Math.max(0, s - 1));
  }, []);

  const handleSkip = useCallback(() => {
    onClose();
  }, [onClose]);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Enter') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleSkip();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, handleNext, handlePrev, handleSkip]);

  if (!open) return null;

  const current = TUTORIAL_STEPS[step];
  const isLast = step === TUTORIAL_STEPS.length - 1;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: 'rgba(0, 0, 0, 0.80)' }}
    >
      <div
        className="bg-[#1a2e1a] text-[#d4e8c2] w-full max-w-lg"
        style={{
          boxShadow:
            'inset -2px -2px 0 rgba(0,0,0,0.4), inset 2px 2px 0 rgba(255,255,255,0.1), 6px 6px 0 rgba(0,0,0,0.4)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-3"
          style={{ borderBottom: '2px solid #2d5a27' }}
        >
          <div className="flex items-center gap-2">
            <span className="text-2xl" role="img" aria-label="icon">
              {current.icon}
            </span>
            <h3 className="text-sm font-bold uppercase tracking-widest text-[#8bba6a]">
              {current.title}
            </h3>
          </div>
          <button
            onClick={handleSkip}
            className="text-[#6a9a4a] hover:text-[#8bba6a] text-xs uppercase tracking-wider cursor-pointer"
            title="Skip tutorial (Esc)"
          >
            Skip
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4">
          <p className="text-sm leading-relaxed">{current.content}</p>

          {current.tip && (
            <div
              className="mt-3 px-3 py-2 text-xs text-[#8bba6a] leading-relaxed"
              style={{
                background: 'rgba(45, 90, 39, 0.2)',
                borderLeft: '3px solid #2d5a27',
              }}
            >
              <span className="font-bold uppercase tracking-wider">Tip: </span>
              {current.tip}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between px-5 py-3"
          style={{ borderTop: '2px solid #2d5a27' }}
        >
          {/* Step indicator */}
          <div className="flex items-center gap-1.5">
            {TUTORIAL_STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                className="cursor-pointer"
                aria-label={`Go to step ${i + 1}`}
              >
                <div
                  className="w-2 h-2 transition-colors duration-150"
                  style={{
                    background: i === step ? '#8bba6a' : i < step ? '#4a7c3f' : '#2d3d2d',
                    boxShadow: i === step ? '0 0 4px rgba(139, 186, 106, 0.5)' : 'none',
                  }}
                />
              </button>
            ))}
            <span className="text-[10px] text-[#4a6a3a] ml-2">
              {step + 1}/{TUTORIAL_STEPS.length}
            </span>
          </div>

          {/* Navigation buttons */}
          <div className="flex gap-2">
            {step > 0 && (
              <PixelButton variant="secondary" size="sm" onClick={handlePrev}>
                Back
              </PixelButton>
            )}
            <PixelButton variant="primary" size="sm" onClick={handleNext}>
              {isLast ? "Let's Go!" : 'Next'}
            </PixelButton>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Check if the player has already seen the tutorial this session. */
export function hasTutorialBeenSeen(): boolean {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem(TUTORIAL_STORAGE_KEY) === 'true';
}

/** Mark the tutorial as seen for this session. */
export function markTutorialSeen(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(TUTORIAL_STORAGE_KEY, 'true');
}

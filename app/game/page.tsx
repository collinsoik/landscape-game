'use client';

import { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/store';
import { ROUNDS } from '@/config/rounds';
import { GAME_DEFAULTS } from '@/config/game-defaults';
import { getElementDef } from '@/config/elements';
import { calculateStars } from '@/lib/stars';
import { isElementUnlocked } from '@/lib/proximity';
import CanvasArea from '@/components/game/CanvasArea';
import ElementSidebar from '@/components/sidebar/ElementSidebar';
import GameHUD from '@/components/game/GameHUD';
import GoalBanner from '@/components/game/GoalBanner';
import RoundTransition from '@/components/game/RoundTransition';

export default function GamePage() {
  const router = useRouter();
  const {
    phase, currentRound, playerName, roundResults,
    completeRound, advanceRound, setPhase,
    placements, selectedElementType, addPlacement, updatePlacementPosition, removePlacement, selectElement,
  } = useGameStore();

  const [selectedPlacementId, setSelectedPlacementId] = useState<string | null>(null);

  // Redirect if no player name
  if (!playerName && typeof window !== 'undefined') {
    router.replace('/');
    return null;
  }

  const roundConfig = ROUNDS[currentRound - 1];
  const roundPlacements = useMemo(
    () => placements.filter((p) => p.round === currentRound),
    [placements, currentRound],
  );

  const handlePlaceElement = useCallback(
    (elementType: string, x: number, y: number) => {
      if (!roundConfig) return;
      const roundPlaced = placements.filter((p) => p.round === currentRound);
      if (roundPlaced.length >= roundConfig.cap) return;
      if (!roundConfig.elements.includes(elementType)) return;
      if (!isElementUnlocked(elementType, placements)) return;

      const def = getElementDef(elementType);
      if (!def) return;
      const spriteScale = GAME_DEFAULTS.canvas.spriteScale;

      addPlacement({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        elementType,
        x,
        y,
        width: def.width * spriteScale,
        height: def.height * spriteScale,
        round: currentRound,
      });
    },
    [roundConfig, placements, currentRound, addPlacement],
  );

  const handleNextRound = useCallback(() => {
    const stars = calculateStars(currentRound, placements);
    completeRound(stars);
  }, [currentRound, placements, completeRound]);

  const handleContinue = useCallback(() => {
    if (currentRound >= 4) {
      setPhase('submission');
      router.push('/submit');
    } else {
      advanceRound();
    }
  }, [currentRound, advanceRound, setPhase, router]);

  const lastResult = roundResults[roundResults.length - 1];

  return (
    <div className="flex flex-col h-screen bg-neutral-900">
      <GameHUD
        currentRound={currentRound}
        placedCount={roundPlacements.length}
        cap={roundConfig?.cap ?? 0}
        onNextRound={handleNextRound}
      />
      <GoalBanner currentRound={currentRound} placements={placements} />

      <div className="flex-1 flex flex-col md:flex-row min-h-0">
        <CanvasArea
          canvasWidth={GAME_DEFAULTS.canvas.width}
          canvasHeight={GAME_DEFAULTS.canvas.height}
          placements={placements}
          currentRound={currentRound}
          selectedElementType={selectedElementType}
          selectedPlacementId={selectedPlacementId}
          onSelectPlacement={setSelectedPlacementId}
          onMovePlacement={updatePlacementPosition}
          onPlaceElement={handlePlaceElement}
          onClearSelection={() => { selectElement(null); setSelectedPlacementId(null); }}
        />
        <ElementSidebar
          currentRound={currentRound}
          placements={placements}
          selectedElementType={selectedElementType}
          onSelectElement={(type) => { selectElement(type); setSelectedPlacementId(null); }}
        />
      </div>

      <RoundTransition
        show={phase === 'round_complete'}
        round={currentRound}
        starsEarned={lastResult?.stars ?? 0}
        onContinue={handleContinue}
        isFinalRound={currentRound >= 4}
      />
    </div>
  );
}

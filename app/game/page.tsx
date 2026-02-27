'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
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
    phase, currentRound, playerName, roundResults, landscapeId,
    completeRound, advanceRound, setPhase,
    placements, selectedElementType, addPlacement, updatePlacementPosition, removePlacement, selectElement,
  } = useGameStore();

  const [selectedPlacementId, setSelectedPlacementId] = useState<string | null>(null);

  // Wait for store to hydrate from sessionStorage
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    const unsub = useGameStore.persist.onFinishHydration(() => setHydrated(true));
    if (useGameStore.persist.hasHydrated()) setHydrated(true);
    return unsub;
  }, []);

  // Delete/Backspace removes the selected placement
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (!selectedPlacementId) return;
        e.preventDefault();
        removePlacement(selectedPlacementId);
        setSelectedPlacementId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPlacementId, removePlacement]);

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

  const handleDeletePlacement = useCallback(() => {
    if (!selectedPlacementId) return;
    removePlacement(selectedPlacementId);
    setSelectedPlacementId(null);
  }, [selectedPlacementId, removePlacement]);

  const handleNextRound = useCallback(() => {
    const stars = calculateStars(currentRound, placements);
    completeRound(stars);
  }, [currentRound, placements, completeRound]);

  const handleContinue = useCallback(() => {
    if (currentRound >= ROUNDS.length) {
      setPhase('submission');
      router.push('/submit');
    } else {
      advanceRound();
    }
  }, [currentRound, advanceRound, setPhase, router]);

  const lastResult = roundResults[roundResults.length - 1];

  // Guards must come after all hooks
  if (!hydrated) return null;
  if (!playerName) {
    router.replace('/');
    return null;
  }

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
          landscapeId={landscapeId}
          onSelectPlacement={setSelectedPlacementId}
          onMovePlacement={updatePlacementPosition}
          onPlaceElement={handlePlaceElement}
          onClearSelection={() => { selectElement(null); setSelectedPlacementId(null); }}
        />
        <ElementSidebar
          currentRound={currentRound}
          placements={placements}
          selectedElementType={selectedElementType}
          selectedPlacementId={selectedPlacementId}
          onSelectElement={(type) => { selectElement(type); setSelectedPlacementId(null); }}
          onSelectTool={() => { selectElement(null); }}
          onDeletePlacement={handleDeletePlacement}
        />
      </div>

      <RoundTransition
        show={phase === 'round_complete'}
        round={currentRound}
        starsEarned={lastResult?.stars ?? 0}
        onContinue={handleContinue}
        isFinalRound={currentRound >= ROUNDS.length}
      />
    </div>
  );
}

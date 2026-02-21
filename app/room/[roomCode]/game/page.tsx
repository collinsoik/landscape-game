'use client';

import { useEffect, useCallback, use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useGameStore } from '@/store';
import CanvasArea from '@/components/game/CanvasArea';
import ElementSidebar from '@/components/sidebar/ElementSidebar';

interface GamePageProps {
  params: Promise<{ roomCode: string }>;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function GamePage({ params }: GamePageProps) {
  const { roomCode } = use(params);
  const router = useRouter();
  const { connect, emit } = useWebSocket();

  const status = useGameStore((s) => s.room.status);
  const currentRound = useGameStore((s) => s.room.currentRound);
  const totalRounds = useGameStore((s) => s.room.totalRounds);
  const timeRemaining = useGameStore((s) => s.room.roundTimeRemaining);
  const paused = useGameStore((s) => s.room.paused);
  const areaLabel = useGameStore((s) => s.room.areaLabel);
  const canvasWidth = useGameStore((s) => s.room.canvasWidth);
  const canvasHeight = useGameStore((s) => s.room.canvasHeight);
  const satelliteImagePath = useGameStore((s) => s.room.satelliteImagePath);
  const teams = useGameStore((s) => s.teams);
  const playerId = useGameStore((s) => s.playerId);
  const error = useGameStore((s) => s.error);
  const placements = useGameStore((s) => s.placements);
  const selectedElementType = useGameStore((s) => s.selectedElementType);
  const selectElement = useGameStore((s) => s.selectElement);
  const zoneConfig = useGameStore((s) => s.zoneConfig);
  const myZoneIndex = useGameStore((s) => s.myZoneIndex);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedPlacementId, setSelectedPlacementId] = useState<string | null>(null);

  // Find my team
  const myTeam = teams.find((t) =>
    t.players.some((p) => p.id === playerId)
  );

  // Compute zone data from store
  const zones = zoneConfig?.zones ?? [];
  const playerZone = myZoneIndex != null ? zones[myZoneIndex] ?? null : null;
  const teamColor = myTeam?.team.color ?? '#888888';

  useEffect(() => {
    connect();
  }, [connect]);

  useEffect(() => {
    if (status === 'finished') {
      router.push(`/room/${roomCode}/results`);
    }
  }, [status, roomCode, router]);

  // Socket emitter handlers
  const handlePlaceElement = useCallback((elementType: string, x: number, y: number) => {
    emit('element:place', { elementType, x, y });
  }, [emit]);

  const handleMovePlacement = useCallback((placementId: string, x: number, y: number) => {
    emit('element:move', { placementId, x, y });
  }, [emit]);

  const handleRemovePlacement = useCallback((placementId: string) => {
    emit('element:remove', { placementId });
    setSelectedPlacementId(null);
  }, [emit]);

  const handleSelectPlacement = useCallback((id: string | null) => {
    setSelectedPlacementId(id);
    if (id) selectElement(null);
  }, [selectElement]);

  const handleClearSelection = useCallback(() => {
    setSelectedPlacementId(null);
    selectElement(null);
  }, [selectElement]);

  const handleSelectElement = useCallback((type: string) => {
    selectElement(type);
    setSelectedPlacementId(null);
  }, [selectElement]);

  // Delete key removes selected placement
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedPlacementId) {
        e.preventDefault();
        handleRemovePlacement(selectedPlacementId);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedPlacementId, handleRemovePlacement]);

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Top HUD bar */}
      <div
        className="flex items-center justify-between px-4 py-2 flex-shrink-0"
        style={{
          background: '#0d1f0d',
          boxShadow: '0 2px 0 #1a3a1a, 0 3px 0 rgba(0,0,0,0.3)',
        }}
      >
        <div className="flex items-center gap-2 md:gap-4">
          <span className="text-xs font-bold uppercase tracking-wider text-[#8bba6a]">
            Round {currentRound}/{totalRounds}
          </span>
          {areaLabel && (
            <span className="text-xs text-[#6a9a4a] hidden sm:inline">{areaLabel}</span>
          )}
        </div>

        <div className="flex items-center gap-4">
          {paused && (
            <span className="text-xs font-bold uppercase text-[#f39c12] animate-pulse">
              Paused
            </span>
          )}
          {timeRemaining !== null && (
            <span
              className={[
                'font-mono text-lg font-bold',
                timeRemaining <= 60 ? 'text-[#c0392b]' : 'text-[#8bba6a]',
              ].join(' ')}
            >
              {formatTime(timeRemaining)}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {myTeam && (
            <span
              className="text-xs font-bold uppercase px-2 py-1"
              style={{
                color: myTeam.team.color,
                background: `${myTeam.team.color}22`,
                boxShadow: `inset 1px 1px 0 ${myTeam.team.color}33`,
              }}
            >
              {myTeam.team.name}
            </span>
          )}
          <span className="text-xs text-[#4a6a3a] font-mono hidden sm:inline">{roomCode}</span>
        </div>
      </div>

      {error && (
        <div className="bg-[#2a0f0f] border-b border-[#c0392b] px-4 py-1 text-xs text-[#c0392b]">
          {error}
        </div>
      )}

      {/* Main game area */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile sidebar toggle */}
        <button
          className="md:hidden fixed bottom-4 right-4 z-50 bg-[#1a3a1a] text-[#8bba6a] p-3 rounded-full shadow-lg cursor-pointer"
          onClick={() => setSidebarOpen((o) => !o)}
          aria-label={sidebarOpen ? 'Close element palette' : 'Open element palette'}
        >
          {sidebarOpen ? '\u2716' : '\u2630'}
        </button>

        {/* Mobile overlay backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar - collapsible on mobile, fixed on desktop */}
        <div
          className={[
            'flex-shrink-0 overflow-y-auto transition-transform duration-200',
            'fixed inset-y-0 left-0 z-40 w-[280px]',
            'md:relative md:translate-x-0 md:w-[280px]',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full',
          ].join(' ')}
          style={{
            background: '#0d1f0d',
            boxShadow: 'inset -2px 0 0 #1a3a1a',
          }}
        >
          <ElementSidebar
            selectedElementType={selectedElementType}
            onSelectElement={handleSelectElement}
          />
        </div>

        {/* Canvas area */}
        <CanvasArea
          canvasWidth={canvasWidth}
          canvasHeight={canvasHeight}
          satelliteImagePath={satelliteImagePath}
          zones={zones}
          teamColor={teamColor}
          currentZoneIndex={myZoneIndex}
          playerZone={playerZone}
          currentPlayerId={playerId ?? ''}
          placements={placements}
          selectedElementType={selectedElementType}
          selectedPlacementId={selectedPlacementId}
          onSelectPlacement={handleSelectPlacement}
          onMovePlacement={handleMovePlacement}
          onPlaceElement={handlePlaceElement}
          onClearSelection={handleClearSelection}
        />
      </div>
    </div>
  );
}

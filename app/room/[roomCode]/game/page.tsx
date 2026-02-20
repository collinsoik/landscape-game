'use client';

import { useEffect, useRef, use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useGameStore } from '@/store';
import PixelCard from '@/components/shared/PixelCard';

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
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const { connect } = useWebSocket();

  const status = useGameStore((s) => s.room.status);
  const currentRound = useGameStore((s) => s.room.currentRound);
  const totalRounds = useGameStore((s) => s.room.totalRounds);
  const timeRemaining = useGameStore((s) => s.room.roundTimeRemaining);
  const paused = useGameStore((s) => s.room.paused);
  const areaLabel = useGameStore((s) => s.room.areaLabel);
  const teams = useGameStore((s) => s.teams);
  const playerId = useGameStore((s) => s.playerId);
  const error = useGameStore((s) => s.error);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Find my team
  const myTeam = teams.find((t) =>
    t.players.some((p) => p.id === playerId)
  );

  useEffect(() => {
    connect();
  }, [connect]);

  useEffect(() => {
    if (status === 'finished') {
      router.push(`/room/${roomCode}/results`);
    }
  }, [status, roomCode, router]);

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
          <PixelCard title="Elements" className="m-2">
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-2 animate-pulse">
                  <div className="w-9 h-9 rounded bg-[#2d5a27]/50" />
                  <div className="flex-1 space-y-1">
                    <div className="h-3 bg-[#2d5a27]/50 rounded w-3/4" />
                    <div className="h-2 bg-[#2d5a27]/30 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </PixelCard>
        </div>

        {/* Canvas area */}
        <div
          ref={canvasContainerRef}
          className="flex-1 flex items-center justify-center overflow-hidden relative"
          style={{ background: '#142014' }}
          id="canvas-container"
        >
          <div className="text-center text-[#4a6a3a]">
            <div className="animate-pulse space-y-3">
              <div className="mx-auto w-16 h-16 rounded bg-[#2d5a27]/30" />
              <p className="text-sm">Loading canvas...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

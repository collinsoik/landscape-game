'use client';

import { useEffect, useRef, use } from 'react';
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
        <div className="flex items-center gap-4">
          <span className="text-xs font-bold uppercase tracking-wider text-[#8bba6a]">
            Round {currentRound}/{totalRounds}
          </span>
          {areaLabel && (
            <span className="text-xs text-[#6a9a4a]">{areaLabel}</span>
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
          <span className="text-xs text-[#4a6a3a] font-mono">{roomCode}</span>
        </div>
      </div>

      {error && (
        <div className="bg-[#2a0f0f] border-b border-[#c0392b] px-4 py-1 text-xs text-[#c0392b]">
          {error}
        </div>
      )}

      {/* Main game area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - canvas-dev will implement ElementSidebar */}
        <div
          className="w-[280px] flex-shrink-0 overflow-y-auto"
          style={{
            background: '#0d1f0d',
            boxShadow: 'inset -2px 0 0 #1a3a1a',
          }}
        >
          <PixelCard title="Elements" className="m-2">
            <p className="text-xs text-[#4a6a3a]">
              Element sidebar loading...
            </p>
          </PixelCard>
        </div>

        {/* Canvas area - canvas-dev will implement GameCanvas */}
        <div
          ref={canvasContainerRef}
          className="flex-1 flex items-center justify-center overflow-hidden relative"
          style={{ background: '#142014' }}
          id="canvas-container"
        >
          <div className="text-center text-[#4a6a3a]">
            <p className="text-sm">Canvas loading...</p>
          </div>
        </div>
      </div>
    </div>
  );
}

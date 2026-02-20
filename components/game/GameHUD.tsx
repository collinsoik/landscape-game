'use client';

interface GameHUDProps {
  roundNumber: number;
  totalRounds: number;
  timeRemaining: number;
  teamName: string;
  teamColor: string;
  score: number;
  isPaused: boolean;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function GameHUD({
  roundNumber,
  totalRounds,
  timeRemaining,
  teamName,
  teamColor,
  score,
  isPaused,
}: GameHUDProps) {
  const isLowTime = timeRemaining <= 60 && timeRemaining > 0;

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-neutral-800 border-b border-neutral-700 text-white text-sm">
      {/* Round info */}
      <div className="flex items-center gap-4">
        <span className="font-semibold">
          Round {roundNumber}/{totalRounds}
        </span>
        <span
          className={`font-mono text-lg tabular-nums ${
            isLowTime ? 'text-red-400 animate-pulse' : 'text-white'
          }`}
        >
          {isPaused ? 'PAUSED' : formatTime(timeRemaining)}
        </span>
      </div>

      {/* Team info */}
      <div className="flex items-center gap-3">
        <div
          className="w-3 h-3 rounded-sm"
          style={{ backgroundColor: teamColor }}
        />
        <span className="font-medium">{teamName}</span>
      </div>

      {/* Score */}
      <div className="flex items-center gap-2">
        <span className="text-neutral-400">Score:</span>
        <span className="font-bold text-lg tabular-nums">{score}</span>
      </div>
    </div>
  );
}

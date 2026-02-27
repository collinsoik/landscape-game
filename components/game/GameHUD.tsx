'use client';

interface GameHUDProps {
  roundNumber: number;
  totalRounds: number;
  timeRemaining: number;
  teamName: string;
  teamColor: string;
  score: number;
  isPaused: boolean;
  missionType?: string | null;
  missionTitle?: string | null;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function getMissionTypeColor(type: string): string {
  switch (type) {
    case 'build': return '#2ecc71';
    case 'fix': return '#f39c12';
    case 'survive': return '#e74c3c';
    case 'discover': return '#3498db';
    case 'race': return '#9b59b6';
    case 'restore': return '#1abc9c';
    default: return '#8bba6a';
  }
}

export default function GameHUD({
  roundNumber,
  totalRounds,
  timeRemaining,
  teamName,
  teamColor,
  score,
  isPaused,
  missionType,
  missionTitle,
}: GameHUDProps) {
  const isLowTime = timeRemaining <= 15 && timeRemaining > 0;
  const isWarningTime = timeRemaining <= 60 && timeRemaining > 15;

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-neutral-800 border-b border-neutral-700 text-white text-sm">
      {/* Round info */}
      <div className="flex items-center gap-4">
        {missionType && (
          <span
            className="font-bold uppercase tracking-wider text-xs px-2 py-0.5 rounded"
            style={{
              color: getMissionTypeColor(missionType),
              background: `${getMissionTypeColor(missionType)}20`,
              border: `1px solid ${getMissionTypeColor(missionType)}40`,
            }}
          >
            {missionType}
          </span>
        )}
        <span className="font-semibold text-base">
          {missionTitle ?? `Round ${roundNumber}/${totalRounds}`}
        </span>
        <span
          className={`font-mono text-lg tabular-nums ${
            isLowTime ? 'text-red-400 animate-pulse' : isWarningTime ? 'text-orange-400' : 'text-white'
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

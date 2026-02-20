'use client';

interface TeamRanking {
  teamId: string;
  teamName: string;
  teamColor: string;
  autoScore: number;
  judgeScore: number | null;
  finalScore: number;
  rank: number;
}

interface LeaderboardPreviewProps {
  rankings: TeamRanking[];
}

export function LeaderboardPreview({ rankings }: LeaderboardPreviewProps) {
  const sorted = [...rankings].sort((a, b) => a.rank - b.rank);

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-bold text-green-200">Leaderboard</h3>
      {sorted.map((team) => (
        <div
          key={team.teamId}
          className="flex items-center gap-3 p-3 rounded-lg border-2"
          style={{
            borderColor: team.teamColor,
            backgroundColor: team.teamColor + '15',
          }}
        >
          <div
            className="w-8 h-8 rounded flex items-center justify-center font-bold text-white text-lg"
            style={{ backgroundColor: team.teamColor }}
          >
            {team.rank}
          </div>
          <div className="flex-1">
            <div className="font-bold text-green-100">{team.teamName}</div>
            <div className="text-xs text-green-400 flex gap-3">
              <span>Auto: {team.autoScore.toFixed(0)}</span>
              {team.judgeScore !== null && <span>Judge: {team.judgeScore.toFixed(0)}</span>}
            </div>
          </div>
          <div
            className="text-2xl font-bold font-mono"
            style={{ color: team.teamColor }}
          >
            {team.finalScore.toFixed(0)}
          </div>
        </div>
      ))}
    </div>
  );
}

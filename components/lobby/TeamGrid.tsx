'use client';

import type { Player, Team } from '@/server/src/types/models';
import TeamCard from './TeamCard';

interface TeamData {
  team: Team;
  players: Player[];
}

interface TeamGridProps {
  teams: TeamData[];
}

export default function TeamGrid({ teams }: TeamGridProps) {
  if (teams.length === 0) {
    return (
      <div className="text-center text-neutral-400 py-8">
        <p className="text-sm">Waiting for teams to be assigned...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {teams.map(({ team, players }) => (
        <TeamCard
          key={team.id}
          teamName={team.name}
          teamColor={team.color}
          players={players}
        />
      ))}
    </div>
  );
}

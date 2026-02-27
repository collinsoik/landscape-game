'use client';

import type { Player } from '@/server/src/types/models';
import PlayerAvatar from './PlayerAvatar';

interface TeamCardProps {
  teamName: string;
  teamColor: string;
  players: Player[];
}

export default function TeamCard({
  teamName,
  teamColor,
  players,
}: TeamCardProps) {
  return (
    <div
      className="rounded-lg border-2 p-4 bg-neutral-800/50"
      style={{ borderColor: teamColor }}
    >
      {/* Team header */}
      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-4 h-4 rounded-sm"
          style={{ backgroundColor: teamColor }}
        />
        <h3 className="font-semibold text-white text-sm">{teamName}</h3>
        <span className="text-xs text-neutral-400 ml-auto">
          {players.length} player{players.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Player list */}
      <div className="flex flex-wrap gap-2">
        {players.map((player) => (
          <div key={player.id} className="flex items-center gap-1.5">
            <PlayerAvatar
              name={player.name}
              teamColor={teamColor}
              connected={player.connected}
            />
            <span
              className={`text-xs ${
                player.connected ? 'text-neutral-200' : 'text-neutral-500'
              }`}
            >
              {player.name}
            </span>
          </div>
        ))}
        {players.length === 0 && (
          <span className="text-xs text-neutral-500 italic">
            No players assigned
          </span>
        )}
      </div>
    </div>
  );
}

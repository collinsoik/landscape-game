'use client';

import { useState } from 'react';
import { PixelButton } from '@/components/shared/PixelButton';
import { PixelInput } from '@/components/shared/PixelInput';
import { GAME_DEFAULTS } from '@/config/game-defaults';

interface TeamConfiguratorProps {
  playerCount: number;
  onConfigure: (teamCount: number) => void;
}

export function TeamConfigurator({ playerCount, onConfigure }: TeamConfiguratorProps) {
  const maxTeams = Math.min(playerCount, GAME_DEFAULTS.room.maxTeams);
  const defaultTeams = Math.min(Math.max(2, Math.ceil(playerCount / 4)), maxTeams);
  const [teamCount, setTeamCount] = useState(defaultTeams);

  const playersPerTeam = Math.ceil(playerCount / teamCount);

  return (
    <div className="space-y-3">
      <label className="block text-sm font-bold text-green-200">
        Number of Teams
      </label>
      <div className="flex items-center gap-3">
        <PixelInput
          type="number"
          value={teamCount}
          onChange={(e) =>
            setTeamCount(Math.max(1, Math.min(maxTeams, parseInt(e.target.value) || 2)))
          }
          min={1}
          max={maxTeams}
          className="w-24"
        />
        <span className="text-green-300 text-sm">
          ~{playersPerTeam} players per team
        </span>
      </div>
      <div className="flex gap-2 flex-wrap">
        {Array.from({ length: teamCount }, (_, i) => (
          <div
            key={i}
            className="flex items-center gap-2 px-3 py-1 rounded"
            style={{ backgroundColor: GAME_DEFAULTS.teams.colors[i] + '30' }}
          >
            <div
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: GAME_DEFAULTS.teams.colors[i] }}
            />
            <span className="text-sm text-green-200">
              {GAME_DEFAULTS.teams.names[i]}
            </span>
          </div>
        ))}
      </div>
      <PixelButton onClick={() => onConfigure(teamCount)} disabled={playerCount < 2}>
        {playerCount < 2 ? 'Need 2+ players' : `Create ${teamCount} Teams`}
      </PixelButton>
    </div>
  );
}

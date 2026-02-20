'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useGameStore } from '@/store';
import PixelCard from '@/components/shared/PixelCard';

interface LobbyPageProps {
  params: Promise<{ roomCode: string }>;
}

export default function LobbyPage({ params }: LobbyPageProps) {
  const { roomCode } = use(params);
  const router = useRouter();
  const { connect, emit } = useWebSocket();
  const [joined, setJoined] = useState(false);

  const connected = useGameStore((s) => s.connected);
  const reconnecting = useGameStore((s) => s.reconnecting);
  const players = useGameStore((s) => s.players);
  const teams = useGameStore((s) => s.teams);
  const status = useGameStore((s) => s.room.status);
  const error = useGameStore((s) => s.error);
  const sessionName = useGameStore((s) => s.room.sessionName);

  // Connect and join room
  useEffect(() => {
    connect();
  }, [connect]);

  useEffect(() => {
    if (!connected || joined) return;

    const playerName = sessionStorage.getItem('playerName') || 'Player';
    emit('room:join', { roomCode, playerName }, (res) => {
      if (res.success && res.playerId && res.sessionId) {
        useGameStore.getState().setPlayer(res.playerId, playerName);
        useGameStore.getState().setRoom(roomCode, res.sessionId);
        setJoined(true);
      } else {
        useGameStore.getState().setError(res.error || 'Failed to join room');
      }
    });
  }, [connected, joined, roomCode, emit]);

  // Redirect to game when round starts
  useEffect(() => {
    if (status === 'playing') {
      router.push(`/room/${roomCode}/game`);
    } else if (status === 'finished') {
      router.push(`/room/${roomCode}/results`);
    }
  }, [status, roomCode, router]);

  const connectedCount = players.filter((p) => p.connected).length;

  if (!connected && !error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <PixelCard className="w-full max-w-md">
          <div className="flex flex-col gap-3 animate-pulse">
            <div className="h-4 bg-[#2d5a27]/30 rounded w-3/4" />
            <div className="h-4 bg-[#2d5a27]/30 rounded w-1/2" />
            <div className="grid grid-cols-2 gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-8 bg-[#2d5a27]/20 rounded" />
              ))}
            </div>
          </div>
          <p className="text-sm text-[#6a9a4a] mt-4 text-center">
            {reconnecting ? 'Reconnecting...' : 'Connecting to server...'}
          </p>
        </PixelCard>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <h1
        className="text-2xl font-bold uppercase tracking-widest text-[#8bba6a] mb-2"
        style={{ textShadow: '2px 2px 0 #1a3a1a' }}
      >
        {sessionName || 'Lobby'}
      </h1>
      <p className="text-xs text-[#6a9a4a] mb-6">
        Room: <span className="font-mono font-bold text-[#8bba6a]">{roomCode}</span>
      </p>

      {error && (
        <PixelCard className="mb-4 w-full max-w-md">
          <p className="text-[#c0392b] text-sm">{error}</p>
        </PixelCard>
      )}

      {/* Player list */}
      <PixelCard title={`Players (${connectedCount})`} className="w-full max-w-md md:max-w-xl mb-4">
        {players.length === 0 ? (
          <p className="text-sm text-[#4a6a3a]">Waiting for players to join...</p>
        ) : (
          <div className="max-h-64 overflow-y-auto pixel-scrollbar">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {players.map((player) => (
                <div
                  key={player.id}
                  className={[
                    'flex items-center gap-2 px-3 py-2 text-sm',
                    player.connected
                      ? 'text-[#d4e8c2]'
                      : 'text-[#4a6a3a] line-through',
                  ].join(' ')}
                  style={{
                    boxShadow: 'inset 1px 1px 0 rgba(255,255,255,0.05), inset -1px -1px 0 rgba(0,0,0,0.2)',
                    background: 'rgba(13,31,13,0.5)',
                  }}
                >
                  <span
                    className="inline-block w-2 h-2 flex-shrink-0"
                    style={{
                      background: player.connected ? '#2ecc71' : '#555',
                      boxShadow: player.connected ? '0 0 4px #2ecc71' : 'none',
                    }}
                    aria-hidden="true"
                  />
                  <span className="truncate">{player.name}</span>
                  <span className={[
                    'text-[10px] ml-auto flex-shrink-0',
                    player.connected ? 'text-[#2ecc71]' : 'text-[#555]',
                  ].join(' ')}>
                    {player.connected ? 'Online' : 'Offline'}
                  </span>
                  <span className="sr-only">
                    {player.name}, {player.connected ? 'online' : 'offline'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </PixelCard>

      {/* Teams (shown when assigned) */}
      {teams.length > 0 && (
        <PixelCard title="Teams" className="w-full max-w-md mb-4">
          <div className="flex flex-col gap-3">
            {teams.map(({ team, players: teamPlayers }) => (
              <div key={team.id}>
                <h4
                  className="text-xs font-bold uppercase tracking-wider mb-1"
                  style={{ color: team.color }}
                >
                  {team.name}
                </h4>
                <div className="flex flex-wrap gap-1">
                  {teamPlayers.map((p) => (
                    <span
                      key={p.id}
                      className="text-xs px-2 py-1"
                      style={{
                        background: `${team.color}22`,
                        color: team.color,
                        boxShadow: `inset 1px 1px 0 ${team.color}33`,
                      }}
                    >
                      {p.name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </PixelCard>
      )}

      {/* Waiting indicator */}
      <p className="text-sm text-[#6a9a4a] animate-pulse">
        Waiting for host to start the game...
      </p>
    </div>
  );
}

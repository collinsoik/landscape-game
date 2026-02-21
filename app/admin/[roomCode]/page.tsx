'use client';

import { useEffect, useState, useCallback, use } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useGameStore } from '@/store';
import PixelButton from '@/components/shared/PixelButton';
import PixelCard from '@/components/shared/PixelCard';
import PixelInput from '@/components/shared/PixelInput';
import ConfirmDialog from '@/components/shared/ConfirmDialog';

interface AdminDashboardProps {
  params: Promise<{ roomCode: string }>;
}

export default function AdminDashboard({ params }: AdminDashboardProps) {
  const { roomCode } = use(params);
  const { connect, emit } = useWebSocket();
  const [adminToken, setAdminToken] = useState('');
  const [confirmEndRound, setConfirmEndRound] = useState(false);
  const [playerSearch, setPlayerSearch] = useState('');

  const connected = useGameStore((s) => s.connected);
  const players = useGameStore((s) => s.players);
  const teams = useGameStore((s) => s.teams);
  const room = useGameStore((s) => s.room);

  useEffect(() => {
    const token = sessionStorage.getItem(`admin_${roomCode}`) ?? '';
    setAdminToken(token);
    connect();
  }, [connect, roomCode]);

  // Join as admin viewer (re-use room:join with a reserved name)
  useEffect(() => {
    if (!connected) return;
    emit('room:join', { roomCode, playerName: '__admin__' }, (res: { success: boolean; error?: string }) => {
      if (!res.success) {
        console.error('[Admin] Failed to join room:', res.error);
      }
    });
  }, [connected, roomCode, emit]);

  const startRound = useCallback(() => {
    emit('admin:start-round', { adminToken });
  }, [emit, adminToken]);

  const endRound = useCallback(() => {
    emit('admin:end-round', { adminToken });
  }, [emit, adminToken]);

  const pauseGame = useCallback(() => {
    emit('admin:pause', { adminToken });
  }, [emit, adminToken]);

  const resumeGame = useCallback(() => {
    emit('admin:resume', { adminToken });
  }, [emit, adminToken]);

  const connectedPlayers = players.filter(
    (p) => p.connected && p.name !== '__admin__'
  );
  const filteredPlayers = playerSearch
    ? connectedPlayers.filter((p) =>
        p.name.toLowerCase().includes(playerSearch.toLowerCase())
      )
    : connectedPlayers;

  return (
    <div className="flex min-h-screen flex-col items-center p-6">
      <h1
        className="text-2xl font-bold uppercase tracking-widest text-[#8bba6a] mb-1"
        style={{ textShadow: '2px 2px 0 #1a3a1a' }}
      >
        Admin Dashboard
      </h1>
      <p className="text-xs text-[#4a6a3a] mb-6">
        Room: <span className="font-mono font-bold text-[#8bba6a]">{roomCode}</span>
        {' | '}
        Status: <span className="font-bold text-[#8bba6a]">{room.status}</span>
      </p>

      <div className="w-full max-w-2xl flex flex-col gap-4">
        {/* Controls */}
        <PixelCard title="Game Controls">
          <div className="flex flex-wrap gap-3">
            {room.status === 'waiting' && (
              <PixelButton variant="primary" onClick={startRound}>
                Start Round
              </PixelButton>
            )}
            {room.status === 'playing' && !room.paused && (
              <>
                <PixelButton variant="secondary" onClick={pauseGame}>
                  Pause
                </PixelButton>
                <PixelButton variant="danger" onClick={() => setConfirmEndRound(true)}>
                  End Round
                </PixelButton>
              </>
            )}
            {room.status === 'playing' && room.paused && (
              <>
                <PixelButton variant="primary" onClick={resumeGame}>
                  {room.roundDuration !== null && room.roundTimeRemaining === room.roundDuration
                    ? 'Start Timer'
                    : 'Resume'}
                </PixelButton>
                <PixelButton variant="danger" onClick={() => setConfirmEndRound(true)}>
                  End Round
                </PixelButton>
              </>
            )}
            {room.status === 'judging' && (
              <PixelButton
                variant="secondary"
                onClick={() =>
                  (window.location.href = `/admin/${roomCode}/judge`)
                }
              >
                Open Judge Panel
              </PixelButton>
            )}
            {room.status === 'judging' && (
              <PixelButton variant="primary" onClick={startRound}>
                Next Round
              </PixelButton>
            )}
          </div>

          {room.roundTimeRemaining !== null && (
            <p
              className={[
                'text-sm font-mono mt-2 font-bold',
                room.roundTimeRemaining <= 15
                  ? 'text-[#c0392b] animate-pulse'
                  : room.roundTimeRemaining <= 60
                    ? 'text-[#f39c12]'
                    : 'text-[#8bba6a]',
              ].join(' ')}
            >
              Time remaining: {Math.floor(room.roundTimeRemaining / 60)}:
              {(room.roundTimeRemaining % 60).toString().padStart(2, '0')}
            </p>
          )}
          {room.paused && room.roundDuration !== null && room.roundTimeRemaining === room.roundDuration && (
            <p className="text-xs text-[#f39c12] mt-2">
              Students are exploring the tutorial. Click Start Timer when ready.
            </p>
          )}
        </PixelCard>

        {/* Players */}
        <PixelCard title={`Players (${connectedPlayers.length})`}>
          {connectedPlayers.length > 10 && (
            <div className="mb-3">
              <PixelInput
                placeholder="Search players..."
                value={playerSearch}
                onChange={(e) => setPlayerSearch(e.target.value)}
              />
            </div>
          )}
          {filteredPlayers.length === 0 ? (
            <p className="text-sm text-[#4a6a3a]">
              {playerSearch ? 'No players match your search.' : 'No players connected yet.'}
            </p>
          ) : (
            <div className="max-h-64 overflow-y-auto pixel-scrollbar">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {filteredPlayers.map((p) => (
                  <div
                    key={p.id}
                    className="text-xs px-2 py-1 text-[#d4e8c2]"
                    style={{
                      background: 'rgba(13,31,13,0.5)',
                      boxShadow:
                        'inset 1px 1px 0 rgba(255,255,255,0.05), inset -1px -1px 0 rgba(0,0,0,0.2)',
                    }}
                  >
                    {p.name}
                    {p.teamId && (
                      <span className="text-[#6a9a4a] ml-1">
                        ({teams.find((t) => t.team.id === p.teamId)?.team.name ?? '?'})
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </PixelCard>

        {/* Teams */}
        {teams.length > 0 && (
          <PixelCard title="Teams">
            <div className="flex flex-col gap-2">
              {teams.map(({ team, players: tp }) => (
                <div key={team.id} className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 flex-shrink-0"
                    style={{ background: team.color }}
                  />
                  <span className="text-sm font-bold" style={{ color: team.color }}>
                    {team.name}
                  </span>
                  <span className="text-xs text-[#4a6a3a]">
                    ({tp.length} players)
                  </span>
                </div>
              ))}
            </div>
          </PixelCard>
        )}

        {/* Links */}
        <div className="flex gap-3 text-xs">
          <a
            href={`/admin/${roomCode}/judge`}
            className="text-[#8bba6a] underline hover:text-[#a8d880]"
          >
            Judge Panel
          </a>
          <a href="/admin" className="text-[#8bba6a] underline hover:text-[#a8d880]">
            Create New Room
          </a>
          <a href="/" className="text-[#8bba6a] underline hover:text-[#a8d880]">
            Home
          </a>
        </div>
      </div>

      <ConfirmDialog
        open={confirmEndRound}
        title="End Round?"
        confirmLabel="End Round"
        confirmVariant="danger"
        onConfirm={() => {
          endRound();
          setConfirmEndRound(false);
        }}
        onCancel={() => setConfirmEndRound(false)}
      >
        <p>
          This will end the current round for all {connectedPlayers.length} players.
          This action cannot be undone.
        </p>
      </ConfirmDialog>
    </div>
  );
}

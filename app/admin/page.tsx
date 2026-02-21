'use client';

import { useState } from 'react';
import PixelButton from '@/components/shared/PixelButton';
import PixelCard from '@/components/shared/PixelCard';
import PixelInput from '@/components/shared/PixelInput';
import { GAME_DEFAULTS } from '@/config/game-defaults';

interface CreateRoomResponse {
  roomCode: string;
  adminToken: string;
  judgeToken: string;
}

export default function AdminCreatePage() {
  const [sessionName, setSessionName] = useState('');
  const [totalRounds, setTotalRounds] = useState(GAME_DEFAULTS.round.defaultCount);
  const [roundDuration, setRoundDuration] = useState(GAME_DEFAULTS.round.defaultDuration);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<CreateRoomResponse | null>(null);
  const [showAdminToken, setShowAdminToken] = useState(false);
  const [showJudgeToken, setShowJudgeToken] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      // Fallback: do nothing, the text is still visible
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_WS_URL ?? 'http://localhost:3001';
      const res = await fetch(`${apiUrl}/api/rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: sessionName.trim() || 'Landscape Game',
          totalRounds,
          roundDuration,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to create room');
      }

      const data = await res.json();
      const roomCode = data.session?.roomCode ?? data.roomCode;
      setResult({
        roomCode,
        adminToken: data.adminToken,
        judgeToken: data.judgeToken,
      });

      // Store admin token for later use
      sessionStorage.setItem(`admin_${roomCode}`, data.adminToken);
      sessionStorage.setItem(`judge_${roomCode}`, data.judgeToken);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <PixelCard title="Room Created" glow className="w-full max-w-sm">
          <div className="flex flex-col gap-3">
            <div>
              <p className="text-xs text-[#6a9a4a] uppercase">Room Code</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold font-mono text-[#8bba6a]">
                  {result.roomCode}
                </p>
                <button
                  onClick={() => copyToClipboard(result.roomCode, 'room')}
                  className="text-[#6a9a4a] hover:text-[#8bba6a] text-xs cursor-pointer"
                >
                  {copiedField === 'room' ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
            <div>
              <p className="text-xs text-[#6a9a4a] uppercase">Admin Token</p>
              <div className="flex items-center gap-2 bg-[#0d1f0d] px-2 py-1">
                <p className="text-xs font-mono text-[#d4e8c2] break-all flex-1">
                  {showAdminToken ? result.adminToken : '\u2022'.repeat(20)}
                </p>
                <button
                  onClick={() => setShowAdminToken((v) => !v)}
                  className="text-[#6a9a4a] hover:text-[#8bba6a] text-xs flex-shrink-0 cursor-pointer"
                >
                  {showAdminToken ? 'Hide' : 'Show'}
                </button>
                <button
                  onClick={() => copyToClipboard(result.adminToken, 'admin')}
                  className="text-[#6a9a4a] hover:text-[#8bba6a] text-xs flex-shrink-0 cursor-pointer"
                >
                  {copiedField === 'admin' ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
            <div>
              <p className="text-xs text-[#6a9a4a] uppercase">Judge Token</p>
              <div className="flex items-center gap-2 bg-[#0d1f0d] px-2 py-1">
                <p className="text-xs font-mono text-[#d4e8c2] break-all flex-1">
                  {showJudgeToken ? result.judgeToken : '\u2022'.repeat(20)}
                </p>
                <button
                  onClick={() => setShowJudgeToken((v) => !v)}
                  className="text-[#6a9a4a] hover:text-[#8bba6a] text-xs flex-shrink-0 cursor-pointer"
                >
                  {showJudgeToken ? 'Hide' : 'Show'}
                </button>
                <button
                  onClick={() => copyToClipboard(result.judgeToken, 'judge')}
                  className="text-[#6a9a4a] hover:text-[#8bba6a] text-xs flex-shrink-0 cursor-pointer"
                >
                  {copiedField === 'judge' ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-2 mt-2">
              <PixelButton
                variant="primary"
                onClick={() =>
                  (window.location.href = `/admin/${result.roomCode}`)
                }
              >
                Go to Dashboard
              </PixelButton>
              <PixelButton
                variant="secondary"
                size="sm"
                onClick={() => setResult(null)}
              >
                Create Another
              </PixelButton>
            </div>
          </div>
        </PixelCard>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <h1
        className="text-2xl font-bold uppercase tracking-widest text-[#8bba6a] mb-6"
        style={{ textShadow: '2px 2px 0 #1a3a1a' }}
      >
        Create Room
      </h1>

      <PixelCard title="Session Settings" className="w-full max-w-sm">
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <PixelInput
            label="Session Name"
            placeholder="e.g. Biology 101"
            value={sessionName}
            onChange={(e) => setSessionName(e.target.value)}
            maxLength={50}
          />

          <div className="flex gap-4">
            <div className="flex-1">
              <PixelInput
                label="Rounds"
                type="number"
                min={1}
                max={10}
                value={totalRounds}
                onChange={(e) => setTotalRounds(Number(e.target.value))}
              />
            </div>
            <div className="flex-1">
              <PixelInput
                label="Duration (sec)"
                type="number"
                min={GAME_DEFAULTS.round.minDuration}
                max={GAME_DEFAULTS.round.maxDuration}
                step={60}
                value={roundDuration}
                onChange={(e) => setRoundDuration(Number(e.target.value))}
              />
            </div>
          </div>

          {error && <p className="text-xs text-[#c0392b]">{error}</p>}

          <PixelButton type="submit" variant="primary" size="lg" disabled={loading}>
            {loading ? 'Creating...' : 'Create Room'}
          </PixelButton>
        </form>
      </PixelCard>

      <p className="mt-6 text-xs text-[#4a6a3a]">
        <a href="/" className="text-[#8bba6a] underline hover:text-[#a8d880]">
          Back to Home
        </a>
      </p>
    </div>
  );
}

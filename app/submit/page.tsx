'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/store';
import { GAME_DEFAULTS } from '@/config/game-defaults';
import LandscapePreview from '@/components/game/LandscapePreview';
import StarDisplay from '@/components/game/StarDisplay';
import PixelButton from '@/components/shared/PixelButton';
import PixelCard from '@/components/shared/PixelCard';
import PixelInput from '@/components/shared/PixelInput';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function SubmitPage() {
  const router = useRouter();
  const { playerName, placements, roundResults, setSubmittedRoomCode, setPhase } = useGameStore();
  const [roomCode, setRoomCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const totalStars = roundResults.reduce((sum, r) => sum + r.stars, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const code = roomCode.trim().toUpperCase();
    if (code.length !== 6 || !/^[A-Z0-9]+$/.test(code)) {
      setError('Room code must be 6 alphanumeric characters.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/rooms/${code}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerName,
          placements,
          stars: roundResults.map((r) => ({ round: r.round, stars: r.stars })),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to submit');
      }

      setSubmittedRoomCode(code);
      setPhase('gallery');
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    const code = roomCode.trim().toUpperCase();
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <PixelCard title="Submitted!" glow className="w-full max-w-md text-center">
          <p className="text-base text-[#d4e8c2] mb-4">
            Your landscape has been submitted to room <span className="font-bold text-[#8bba6a]">{code}</span>.
          </p>
          <div className="flex flex-col gap-3">
            <PixelButton variant="primary" size="lg" onClick={() => router.push(`/gallery/${code}`)}>
              View Gallery
            </PixelButton>
            <PixelButton variant="secondary" size="md" onClick={() => { useGameStore.getState().resetGame(); router.push('/'); }}>
              Play Again
            </PixelButton>
          </div>
        </PixelCard>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold text-[#8bba6a] mb-2" style={{ textShadow: '2px 2px 0 #1a3a1a' }}>
          Submit Your Design
        </h1>
        <div className="flex justify-center mb-2">
          <StarDisplay stars={totalStars} maxStars={12} size="sm" />
        </div>
        <p className="text-sm text-[#6a9a4a]">{totalStars}/12 stars earned</p>
      </div>

      {/* Preview */}
      <div className="w-full max-w-2xl mb-6 rounded overflow-hidden border border-neutral-700">
        <LandscapePreview
          placements={placements}
          canvasWidth={GAME_DEFAULTS.canvas.width}
          canvasHeight={GAME_DEFAULTS.canvas.height}
        />
      </div>

      {/* Submit form */}
      <PixelCard title="Enter Room Code" className="w-full max-w-sm">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <PixelInput
            label="Room Code"
            placeholder="e.g. ABC123"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            maxLength={6}
            autoComplete="off"
          />
          <p className="text-xs text-[#6a9a4a]">
            Ask your teacher for the room code to submit your design for voting.
          </p>
          {error && <p className="text-xs text-[#c0392b]">{error}</p>}
          <PixelButton type="submit" variant="primary" size="lg" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit'}
          </PixelButton>
        </form>
      </PixelCard>
    </div>
  );
}

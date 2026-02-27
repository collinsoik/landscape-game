'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/store';
import PixelButton from '@/components/shared/PixelButton';
import PixelCard from '@/components/shared/PixelCard';
import PixelInput from '@/components/shared/PixelInput';

export default function LandingPage() {
  const router = useRouter();
  const setPlayerName = useGameStore((s) => s.setPlayerName);
  const startGame = useGameStore((s) => s.startGame);
  const clearCanvas = useGameStore((s) => s.clearCanvas);
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed.length < 1 || trimmed.length > 20) {
      setError('Name must be between 1 and 20 characters.');
      return;
    }
    setPlayerName(trimmed);
    clearCanvas();
    startGame();
    router.push('/game');
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="mb-8 text-center">
        <h1
          className="text-4xl font-bold uppercase tracking-widest text-[#8bba6a] mb-2"
          style={{ textShadow: '3px 3px 0 #1a3a1a, -1px -1px 0 #0d1f0d' }}
        >
          Landscape Builders
        </h1>
        <p className="text-sm text-[#6a9a4a] max-w-md">
          You want more birds to visit the courtyard at your school! Create a
          courtyard that has plants the birds will love and a place they can
          use as a home. Earn stars and share your creation!
        </p>
      </div>

      <PixelCard title="Start Building" className="w-full max-w-sm">
        <form onSubmit={handleStart} className="flex flex-col gap-4">
          <PixelInput
            label="Your Name"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={20}
            autoComplete="off"
          />
          {error && <p className="text-xs text-[#c0392b]">{error}</p>}
          <PixelButton type="submit" variant="primary" size="lg">
            Start Game
          </PixelButton>
        </form>
      </PixelCard>

      <p className="mt-6 text-xs text-[#4a6a3a]">
        Are you a teacher?{' '}
        <a href="/admin" className="text-[#8bba6a] underline hover:text-[#a8d880]">
          Create a room for voting
        </a>
      </p>
    </div>
  );
}

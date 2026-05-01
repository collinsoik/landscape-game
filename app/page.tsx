'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/store';
import PixelButton from '@/components/shared/PixelButton';
import PixelCard from '@/components/shared/PixelCard';
import { generatePlayerName } from '@/lib/name-generator';

export default function LandingPage() {
  const router = useRouter();
  const setPlayerName = useGameStore((s) => s.setPlayerName);
  const [name, setName] = useState('');

  useEffect(() => {
    const generated = generatePlayerName();
    setName(generated);
    setPlayerName(generated);
  }, [setPlayerName]);

  const reroll = () => {
    const generated = generatePlayerName();
    setName(generated);
    setPlayerName(generated);
  };

  const handleStart = () => {
    if (name) {
      router.push('/choose-landscape');
    }
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
        <div className="flex flex-col gap-4">
          <div className="text-center">
            <p className="text-xs uppercase tracking-widest text-[#6a9a4a] mb-1">
              Playing As
            </p>
            <p
              className="text-2xl font-bold text-[#8bba6a]"
              style={{ textShadow: '2px 2px 0 #1a3a1a' }}
            >
              {name || ' '}
            </p>
            <button
              type="button"
              onClick={reroll}
              className="mt-1 text-xs text-[#6a9a4a] underline hover:text-[#8bba6a]"
            >
              Re-roll name
            </button>
          </div>
          <PixelButton
            type="button"
            onClick={handleStart}
            variant="primary"
            size="lg"
          >
            Start Game
          </PixelButton>
        </div>
      </PixelCard>

      <p className="mt-6 text-xs text-[#4a6a3a]">
        Are you a teacher?{' '}
        <Link
          href="/admin"
          className="text-[#8bba6a] underline hover:text-[#a8d880]"
        >
          Create a room for voting
        </Link>
      </p>
    </div>
  );
}

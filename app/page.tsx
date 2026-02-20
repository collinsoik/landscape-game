'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import PixelButton from '@/components/shared/PixelButton';
import PixelCard from '@/components/shared/PixelCard';
import PixelInput from '@/components/shared/PixelInput';

export default function LandingPage() {
  const router = useRouter();
  const [roomCode, setRoomCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [error, setError] = useState('');

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const code = roomCode.trim().toUpperCase();
    const name = playerName.trim();

    if (code.length !== 6 || !/^[A-Z0-9]+$/.test(code)) {
      setError('Room code must be 6 alphanumeric characters.');
      return;
    }
    if (name.length < 1 || name.length > 20) {
      setError('Name must be between 1 and 20 characters.');
      return;
    }

    // Store name in sessionStorage for the lobby page to use
    sessionStorage.setItem('playerName', name);
    router.push(`/room/${code}`);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      {/* Title */}
      <div className="mb-8 text-center">
        <h1
          className="text-4xl font-bold uppercase tracking-widest text-[#8bba6a] mb-2"
          style={{
            textShadow: '3px 3px 0 #1a3a1a, -1px -1px 0 #0d1f0d',
          }}
        >
          Landscape Builders
        </h1>
        <p className="text-sm text-[#6a9a4a] max-w-md">
          Collaborate with your team to design a biodiverse, sustainable
          landscape. Place trees, flowers, water features and more to create
          thriving ecosystems.
        </p>
      </div>

      {/* Join form */}
      <PixelCard title="Join a Game" className="w-full max-w-sm">
        <form onSubmit={handleJoin} className="flex flex-col gap-4">
          <PixelInput
            label="Room Code"
            placeholder="e.g. ABC123"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            maxLength={6}
            autoComplete="off"
          />
          <PixelInput
            label="Your Name"
            placeholder="Enter your name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            maxLength={20}
            autoComplete="off"
          />

          {error && (
            <p className="text-xs text-[#c0392b]">{error}</p>
          )}

          <PixelButton type="submit" variant="primary" size="lg">
            Join Game
          </PixelButton>
        </form>
      </PixelCard>

      {/* Admin link */}
      <p className="mt-6 text-xs text-[#4a6a3a]">
        Are you a host?{' '}
        <a href="/admin" className="text-[#8bba6a] underline hover:text-[#a8d880]">
          Create a room
        </a>
      </p>
    </div>
  );
}

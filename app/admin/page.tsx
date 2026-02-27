'use client';

import { useState } from 'react';
import PixelButton from '@/components/shared/PixelButton';
import PixelCard from '@/components/shared/PixelCard';
import PixelInput from '@/components/shared/PixelInput';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function AdminPage() {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch { /* ignore */ }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() || 'Landscape Game' }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to create room');
      }
      const data = await res.json();
      setRoomCode(data.roomCode);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  if (roomCode) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6">
        <PixelCard title="Room Created!" glow className="w-full max-w-lg">
          <div className="flex flex-col gap-5">
            <div>
              <p className="text-sm text-[#6a9a4a] uppercase font-bold tracking-wide">Room Code</p>
              <div className="flex items-center gap-3 mt-1">
                <p className="text-4xl font-bold font-mono text-[#8bba6a] tracking-widest">{roomCode}</p>
                <button
                  onClick={() => copyToClipboard(roomCode, 'room')}
                  className="text-[#6a9a4a] hover:text-[#8bba6a] text-sm cursor-pointer px-2 py-1 bg-[#0d1f0d] rounded"
                >
                  {copiedField === 'room' ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <p className="text-sm text-[#6a9a4a] mt-2">
                Share this code with students so they can submit their designs.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <PixelButton variant="primary" size="lg" onClick={() => window.location.href = `/gallery/${roomCode}`}>
                View Gallery
              </PixelButton>
              <PixelButton variant="secondary" size="md" onClick={() => { setRoomCode(null); setName(''); }}>
                Create Another
              </PixelButton>
            </div>
          </div>
        </PixelCard>

        <p className="mt-6 text-xs text-[#4a6a3a]">
          <a href="/" className="text-[#8bba6a] underline hover:text-[#a8d880]">Back to Home</a>
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold uppercase tracking-widest text-[#8bba6a] mb-2" style={{ textShadow: '2px 2px 0 #1a3a1a' }}>
          Teacher Dashboard
        </h1>
        <p className="text-sm text-[#6a9a4a]">
          Create a room for students to submit and vote on designs.
        </p>
      </div>

      <PixelCard title="Create Room" className="w-full max-w-sm">
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <PixelInput
            label="Room Name (optional)"
            placeholder="e.g. Biology 101"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={50}
          />
          {error && <p className="text-xs text-[#c0392b]">{error}</p>}
          <PixelButton type="submit" variant="primary" size="lg" disabled={loading}>
            {loading ? 'Creating...' : 'Create Room'}
          </PixelButton>
        </form>
      </PixelCard>

      <p className="mt-6 text-xs text-[#4a6a3a]">
        <a href="/" className="text-[#8bba6a] underline hover:text-[#a8d880]">Back to Home</a>
      </p>
    </div>
  );
}

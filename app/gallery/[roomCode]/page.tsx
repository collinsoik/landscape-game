'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { GAME_DEFAULTS } from '@/config/game-defaults';
import { AWARDS } from '@/config/rounds';
import type { GalleryEntry, LocalPlacement } from '@/lib/types';
import type { LandscapeId } from '@/config/landscapes';
import LandscapePreview from '@/components/game/LandscapePreview';
import StarDisplay from '@/components/game/StarDisplay';
import PixelButton from '@/components/shared/PixelButton';
import PixelCard from '@/components/shared/PixelCard';
import PixelInput from '@/components/shared/PixelInput';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface VoteResults {
  mostBeautiful: { playerName: string; count: number }[];
  mostEcoFriendly: { playerName: string; count: number }[];
  mostCreative: { playerName: string; count: number }[];
}

export default function GalleryPage() {
  const params = useParams();
  const roomCode = (params.roomCode as string)?.toUpperCase();

  const [entries, setEntries] = useState<GalleryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Voting state
  const [voterName, setVoterName] = useState('');
  const [votes, setVotes] = useState<{ mostBeautiful: number | null; mostEcoFriendly: number | null; mostCreative: number | null }>({
    mostBeautiful: null, mostEcoFriendly: null, mostCreative: null,
  });
  const [voteSubmitted, setVoteSubmitted] = useState(false);
  const [voteError, setVoteError] = useState('');

  // Results
  const [results, setResults] = useState<VoteResults | null>(null);
  const [showResults, setShowResults] = useState(false);

  const fetchEntries = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/rooms/${roomCode}/submissions`);
      if (!res.ok) throw new Error('Failed to load');
      const data = await res.json();
      const list = Array.isArray(data) ? data : data.submissions ?? [];
      setEntries(
        list.map((s: Record<string, unknown>) => ({
          id: s.id as number,
          playerName: (s.playerName ?? s.player_name) as string,
          placements: (typeof s.placements === 'string' ? JSON.parse(s.placements as string) : s.placements) as LocalPlacement[],
          stars: (typeof s.stars === 'string' ? JSON.parse(s.stars as string) : s.stars) as { round: number; stars: number }[],
          submittedAt: (s.submittedAt ?? s.submitted_at) as string,
          landscapeId: (s.landscapeId ?? s.landscape_id ?? 'meadow') as string,
        })),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load submissions');
    } finally {
      setLoading(false);
    }
  }, [roomCode]);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  const handleVote = async () => {
    if (!voterName.trim()) { setVoteError('Enter your name to vote.'); return; }
    if (!votes.mostBeautiful && !votes.mostEcoFriendly && !votes.mostCreative) {
      setVoteError('Select at least one vote.'); return;
    }
    setVoteError('');
    try {
      const res = await fetch(`${API_URL}/api/rooms/${roomCode}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          voterName: voterName.trim(),
          mostBeautiful: votes.mostBeautiful,
          mostEcoFriendly: votes.mostEcoFriendly,
          mostCreative: votes.mostCreative,
        }),
      });
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.error || 'Vote failed'); }
      setVoteSubmitted(true);
    } catch (err) {
      setVoteError(err instanceof Error ? err.message : 'Vote failed');
    }
  };

  const fetchResults = async () => {
    try {
      const res = await fetch(`${API_URL}/api/rooms/${roomCode}/results`);
      if (!res.ok) throw new Error('Failed to load results');
      const data = await res.json();
      setResults(data);
      setShowResults(true);
    } catch {
      // ignore
    }
  };

  const setVoteForCategory = (category: 'mostBeautiful' | 'mostEcoFriendly' | 'mostCreative', id: number) => {
    setVotes((v) => ({ ...v, [category]: v[category] === id ? null : id }));
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-[#6a9a4a]">Loading gallery...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-[#c0392b]">{error}</p>
      </div>
    );
  }

  const VOTE_KEYS = ['mostBeautiful', 'mostEcoFriendly', 'mostCreative'] as const;

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#8bba6a] mb-1" style={{ textShadow: '2px 2px 0 #1a3a1a' }}>
            Gallery - Room {roomCode}
          </h1>
          <p className="text-sm text-[#6a9a4a]">{entries.length} submission{entries.length !== 1 ? 's' : ''}</p>
        </div>

        {/* Gallery grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          {entries.map((entry) => {
            const totalStars = entry.stars.reduce((sum, s) => sum + s.stars, 0);
            return (
              <PixelCard key={entry.id} className="flex flex-col">
                <div className="rounded overflow-hidden mb-3">
                  <LandscapePreview
                    placements={entry.placements}
                    canvasWidth={GAME_DEFAULTS.canvas.width}
                    canvasHeight={GAME_DEFAULTS.canvas.height}
                    landscapeId={entry.landscapeId as LandscapeId}
                  />
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-base font-bold text-white">{entry.playerName}</span>
                  <StarDisplay stars={totalStars} maxStars={12} size="sm" />
                </div>

                {/* Vote buttons */}
                {!voteSubmitted && !showResults && (
                  <div className="flex gap-1 flex-wrap">
                    {VOTE_KEYS.map((key, i) => {
                      const selected = votes[key] === entry.id;
                      return (
                        <button
                          key={key}
                          onClick={() => setVoteForCategory(key, entry.id)}
                          className={`text-xs px-2 py-1 rounded cursor-pointer transition-colors ${
                            selected ? 'bg-[#2d5a27] text-[#8bba6a] ring-1 ring-[#8bba6a]' : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
                          }`}
                        >
                          {AWARDS[i]}
                        </button>
                      );
                    })}
                  </div>
                )}
              </PixelCard>
            );
          })}
        </div>

        {/* Voting panel */}
        {!voteSubmitted && !showResults && entries.length > 0 && (
          <div className="max-w-md mx-auto mb-8">
            <PixelCard title="Cast Your Votes">
              <div className="flex flex-col gap-3">
                <PixelInput
                  label="Your Name"
                  placeholder="Enter your name"
                  value={voterName}
                  onChange={(e) => setVoterName(e.target.value)}
                  maxLength={20}
                />
                {voteError && <p className="text-xs text-[#c0392b]">{voteError}</p>}
                <PixelButton variant="primary" size="md" onClick={handleVote}>
                  Submit Votes
                </PixelButton>
              </div>
            </PixelCard>
          </div>
        )}

        {voteSubmitted && !showResults && (
          <div className="text-center mb-8">
            <p className="text-[#2ecc71] font-bold mb-3">Votes submitted!</p>
            <PixelButton variant="secondary" size="md" onClick={fetchResults}>
              View Results
            </PixelButton>
          </div>
        )}

        {/* Results */}
        {showResults && results && (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-[#8bba6a] text-center mb-6">Results</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {AWARDS.map((award, i) => {
                const key = VOTE_KEYS[i];
                const list = results[key] ?? [];
                const winner = list[0];
                return (
                  <PixelCard key={award} title={award}>
                    {winner ? (
                      <div>
                        <p className="text-lg font-bold text-[#f39c12]">{winner.playerName}</p>
                        <p className="text-sm text-[#6a9a4a]">{winner.count} vote{winner.count !== 1 ? 's' : ''}</p>
                      </div>
                    ) : (
                      <p className="text-sm text-[#6a9a4a]">No votes yet</p>
                    )}
                  </PixelCard>
                );
              })}
            </div>
          </div>
        )}

        <div className="text-center mt-8">
          <a href="/" className="text-[#8bba6a] underline hover:text-[#a8d880] text-sm">
            Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}

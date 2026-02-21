'use client';

import { useEffect, useState, use } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useGameStore } from '@/store';
import PixelButton from '@/components/shared/PixelButton';
import PixelCard from '@/components/shared/PixelCard';
import PixelInput from '@/components/shared/PixelInput';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import LandscapePreview from '@/components/game/LandscapePreview';

interface JudgePageProps {
  params: Promise<{ roomCode: string }>;
}

interface JudgeFormData {
  biodiversity: number;
  sustainability: number;
  aesthetics: number;
  ecosystemHealth: number;
  comment: string;
}

const CATEGORIES = [
  { key: 'biodiversity' as const, label: 'Biodiversity' },
  { key: 'sustainability' as const, label: 'Sustainability' },
  { key: 'aesthetics' as const, label: 'Aesthetics' },
  { key: 'ecosystemHealth' as const, label: 'Ecosystem Health' },
];

const defaultForm = (): JudgeFormData => ({
  biodiversity: 50,
  sustainability: 50,
  aesthetics: 50,
  ecosystemHealth: 50,
  comment: '',
});

export default function JudgePage({ params }: JudgePageProps) {
  const { roomCode } = use(params);
  const { connect, emit } = useWebSocket();

  const teams = useGameStore((s) => s.teams);
  const room = useGameStore((s) => s.room);
  const scores = useGameStore((s) => s.scores);
  const connected = useGameStore((s) => s.connected);
  const placements = useGameStore((s) => s.placements);
  const canvasWidth = useGameStore((s) => s.room.canvasWidth);
  const canvasHeight = useGameStore((s) => s.room.canvasHeight);
  const satelliteImagePath = useGameStore((s) => s.room.satelliteImagePath);

  const [forms, setForms] = useState<Record<string, JudgeFormData>>({});
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<Set<string>>(new Set());
  const [error, setError] = useState('');
  const [confirmSubmit, setConfirmSubmit] = useState<string | null>(null);

  useEffect(() => {
    connect();
  }, [connect]);

  useEffect(() => {
    if (connected) {
      emit('room:join', { roomCode, playerName: '__admin__' }, (res: { success: boolean; error?: string }) => {
        if (!res.success) {
          console.error('[Judge] Failed to join room:', res.error);
        }
      });
    }
  }, [connected, emit, roomCode]);

  // Init forms for each team
  useEffect(() => {
    const newForms: Record<string, JudgeFormData> = {};
    for (const t of teams) {
      if (!forms[t.team.id]) {
        newForms[t.team.id] = defaultForm();
      }
    }
    if (Object.keys(newForms).length > 0) {
      setForms((prev) => ({ ...prev, ...newForms }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teams]);

  const updateForm = (teamId: string, field: keyof JudgeFormData, value: number | string) => {
    setForms((prev) => ({
      ...prev,
      [teamId]: { ...prev[teamId], [field]: value },
    }));
  };

  const submitScore = async (teamId: string) => {
    const form = forms[teamId];
    if (!form) return;

    setSubmitting(teamId);
    setError('');

    try {
      const judgeToken = sessionStorage.getItem(`judge_${roomCode}`) ?? '';
      const apiUrl = process.env.NEXT_PUBLIC_WS_URL ?? 'http://localhost:3001';
      const res = await fetch(
        `${apiUrl}/api/rooms/${roomCode}/judge-scores`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            judgeToken,
            round: room.currentRound,
            scores: [{ teamId, ...form }],
          }),
        }
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to submit score');
      }

      setSubmitted((prev) => new Set(prev).add(teamId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center p-6">
      <h1
        className="text-2xl font-bold uppercase tracking-widest text-[#8bba6a] mb-1"
        style={{ textShadow: '2px 2px 0 #1a3a1a' }}
      >
        Judge Scoring
      </h1>
      <p className="text-xs text-[#4a6a3a] mb-6">
        Room: <span className="font-mono font-bold">{roomCode}</span> | Round{' '}
        {room.currentRound}/{room.totalRounds}
      </p>

      {error && (
        <div
          className="fixed top-0 left-0 right-0 z-40 text-xs text-[#fde8e5] bg-[#c0392b] px-4 py-3 flex items-center justify-between"
          style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.4)' }}
        >
          <span>{error}</span>
          <button
            onClick={() => setError('')}
            className="ml-4 text-[#fde8e5] hover:text-white font-bold cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      <div
        className="mb-4 text-sm text-[#d4e8c2] bg-[#0d1f0d] px-3 py-2 font-mono"
        style={{
          boxShadow: 'inset 1px 1px 0 rgba(255,255,255,0.05), inset -1px -1px 0 rgba(0,0,0,0.2)',
        }}
      >
        Scored {submitted.size} of {teams.length} teams
        {submitted.size === teams.length && teams.length > 0 && (
          <span className="text-[#2ecc71] ml-2">-- All teams scored!</span>
        )}
      </div>

      <div className="w-full max-w-3xl flex flex-col gap-6">
        {teams.map(({ team }) => {
          const form = forms[team.id] ?? defaultForm();
          const isSubmitted = submitted.has(team.id);
          const teamScore = scores[team.id];

          return (
            <PixelCard key={team.id} glow={isSubmitted}>
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="w-3 h-3 flex-shrink-0"
                  style={{ background: team.color }}
                />
                <h3 className="text-sm font-bold" style={{ color: team.color }}>
                  {team.name}
                </h3>
                {isSubmitted && (
                  <span className="text-xs text-[#2ecc71] ml-auto">Submitted</span>
                )}
              </div>

              {/* Landscape preview */}
              <div className="mb-3 overflow-hidden" style={{ borderRadius: 2 }}>
                <LandscapePreview
                  placements={placements.filter((p) => p.teamId === team.id)}
                  canvasWidth={canvasWidth}
                  canvasHeight={canvasHeight}
                  satelliteImagePath={satelliteImagePath}
                />
              </div>

              {/* Auto-score summary */}
              {teamScore && (
                <div className="mb-3 p-2 bg-[#0d1f0d] text-xs">
                  <p className="text-[#6a9a4a] mb-1 uppercase font-bold">Auto Score</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {CATEGORIES.map(({ key, label }) => (
                      <div key={key}>
                        <span className="text-[#4a6a3a]">{label}: </span>
                        <span className="font-mono text-[#8bba6a]">
                          {teamScore.total[key].toFixed(1)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Judge score form */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                {CATEGORIES.map(({ key, label }) => (
                  <div key={key} className="flex flex-col gap-1">
                    <label className="text-xs text-[#6a9a4a]">{label}</label>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={form[key]}
                      onChange={(e) =>
                        updateForm(team.id, key, Number(e.target.value))
                      }
                      className="accent-[#2d5a27]"
                      disabled={isSubmitted}
                    />
                    <span className="text-xs font-mono text-[#8bba6a] text-center">
                      {form[key]}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mb-3">
                <PixelInput
                  label="Comment"
                  placeholder="Optional feedback..."
                  value={form.comment}
                  onChange={(e) => updateForm(team.id, 'comment', e.target.value)}
                  disabled={isSubmitted}
                />
              </div>

              <PixelButton
                variant="primary"
                size="sm"
                onClick={() => setConfirmSubmit(team.id)}
                disabled={isSubmitted || submitting === team.id}
              >
                {submitting === team.id
                  ? 'Submitting...'
                  : isSubmitted
                    ? 'Submitted'
                    : 'Submit Score'}
              </PixelButton>
            </PixelCard>
          );
        })}
      </div>

      <ConfirmDialog
        open={confirmSubmit !== null}
        title="Submit Score?"
        confirmLabel="Submit"
        confirmVariant="primary"
        onConfirm={() => {
          if (confirmSubmit) submitScore(confirmSubmit);
          setConfirmSubmit(null);
        }}
        onCancel={() => setConfirmSubmit(null)}
      >
        <p>
          Submit judge scores for{' '}
          <strong>
            {teams.find((t) => t.team.id === confirmSubmit)?.team.name ?? 'this team'}
          </strong>
          ? This cannot be changed after submission.
        </p>
      </ConfirmDialog>

      <div className="mt-6 text-xs">
        <a
          href={`/admin/${roomCode}`}
          className="text-[#8bba6a] underline hover:text-[#a8d880]"
        >
          Back to Dashboard
        </a>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { PixelButton } from '@/components/shared/PixelButton';
import ConfirmDialog from '@/components/shared/ConfirmDialog';

interface JudgeScoreFormProps {
  teamId: string;
  teamName: string;
  teamColor: string;
  round: number;
  onSubmit: (scores: {
    biodiversity: number;
    sustainability: number;
    aesthetics: number;
    ecosystemHealth: number;
    comment: string;
  }) => void;
}

const CATEGORIES = [
  { key: 'biodiversity', label: 'Biodiversity' },
  { key: 'sustainability', label: 'Sustainability' },
  { key: 'aesthetics', label: 'Aesthetics' },
  { key: 'ecosystemHealth', label: 'Ecosystem Health' },
] as const;

export function JudgeScoreForm({ teamId, teamName, teamColor, round, onSubmit }: JudgeScoreFormProps) {
  const [scores, setScores] = useState({
    biodiversity: 50,
    sustainability: 50,
    aesthetics: 50,
    ecosystemHealth: 50,
  });
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  function handleScoreChange(category: string, value: number) {
    setScores((prev) => ({ ...prev, [category]: Math.max(0, Math.min(100, value)) }));
  }

  function handleSubmit() {
    setShowConfirm(true);
  }

  function confirmSubmit() {
    onSubmit({ ...scores, comment });
    setSubmitted(true);
    setShowConfirm(false);
  }

  if (submitted) {
    return (
      <div className="p-4 border-2 rounded-lg text-center" style={{ borderColor: teamColor }}>
        <p className="text-green-300 font-bold">Scores submitted for {teamName}!</p>
        <PixelButton variant="secondary" onClick={() => setSubmitted(false)} className="mt-2">
          Edit Scores
        </PixelButton>
      </div>
    );
  }

  return (
    <div
      className="p-4 border-2 rounded-lg space-y-3"
      style={{ borderColor: teamColor, backgroundColor: teamColor + '10' }}
    >
      <h3 className="text-lg font-bold" style={{ color: teamColor }}>
        {teamName} — Round {round}
      </h3>

      {CATEGORIES.map(({ key, label }) => (
        <div key={key} className="space-y-1">
          <div className="flex justify-between items-center">
            <label className="text-sm font-bold text-green-200">
              {label}
            </label>
            <span className="text-sm text-green-400 font-mono">
              {scores[key as keyof typeof scores]}/100
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={scores[key as keyof typeof scores]}
            onChange={(e) => handleScoreChange(key, parseInt(e.target.value))}
            className="w-full h-2 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, ${teamColor} ${scores[key as keyof typeof scores]}%, #1a3a1a ${scores[key as keyof typeof scores]}%)`,
            }}
          />
        </div>
      ))}

      <div className="space-y-1">
        <label className="text-sm font-bold text-green-200">Comments</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Feedback for the team..."
          rows={3}
          className="w-full bg-green-900/50 border-2 border-green-700 rounded p-2 text-green-100 text-sm placeholder-green-600 focus:border-green-500 focus:outline-none resize-none"
        />
      </div>

      <PixelButton onClick={handleSubmit}>Submit Scores</PixelButton>

      <ConfirmDialog
        open={showConfirm}
        title="Submit Scores?"
        confirmLabel="Submit"
        confirmVariant="primary"
        onConfirm={confirmSubmit}
        onCancel={() => setShowConfirm(false)}
      >
        <p>Submit scores for <strong>{teamName}</strong>? This cannot be undone.</p>
      </ConfirmDialog>
    </div>
  );
}

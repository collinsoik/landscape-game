'use client';

import { useEffect } from 'react';

export default function GameError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Game error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#0d1f0d] text-[#d4e8c2]">
      <div className="max-w-md text-center px-6">
        <h2 className="text-xl font-bold text-[#e74c3c] mb-3">Something went wrong</h2>
        <p className="text-sm text-[#8bba6a] mb-2">
          An error occurred in the game canvas.
        </p>
        <pre className="text-xs text-[#6a9a4a] bg-[#1a3a1a] p-3 rounded mb-4 overflow-auto max-h-32 text-left">
          {error.message}
        </pre>
        <button
          onClick={reset}
          className="px-6 py-2 bg-[#2d5a27] text-[#d4e8c2] font-bold uppercase text-sm tracking-wider cursor-pointer hover:bg-[#3a7a34] transition-colors"
          style={{
            boxShadow:
              'inset -1px -1px 0 rgba(0,0,0,0.3), inset 1px 1px 0 rgba(255,255,255,0.1)',
          }}
        >
          Try Again
        </button>
      </div>
    </div>
  );
}

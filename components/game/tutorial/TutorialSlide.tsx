'use client';

import { type ReactNode } from 'react';

interface TutorialSlideProps {
  title: string;
  body: string;
  tip?: string;
  illustration: ReactNode;
}

export default function TutorialSlide({ title, body, tip, illustration }: TutorialSlideProps) {
  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Illustration area — takes up available space */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-8 min-h-0 overflow-hidden">
        {illustration}
      </div>

      {/* Text area */}
      <div className="flex-shrink-0 px-6 py-4 md:px-10 md:py-5" style={{ borderTop: '2px solid #2d5a27' }}>
        <h2 className="text-xl md:text-2xl font-bold uppercase tracking-wider text-[#8bba6a] mb-2">
          {title}
        </h2>
        <p className="text-base md:text-lg text-[#d4e8c2] leading-relaxed">{body}</p>
        {tip && (
          <p className="text-sm text-[#8bba6a] mt-2 leading-relaxed opacity-80">{tip}</p>
        )}
      </div>
    </div>
  );
}

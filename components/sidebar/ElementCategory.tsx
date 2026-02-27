'use client';

import { useEffect, useState } from 'react';
import type { ElementDefinition } from '@/config/elements';
import ElementCard from './ElementCard';

interface ElementCategoryProps {
  categoryKey: string;
  label: string;
  color: string;
  elements: ElementDefinition[];
  selectedElementType: string | null;
  onSelectElement: (type: string) => void;
  locked?: boolean;
  budgetRemaining?: number;
}

export default function ElementCategory({
  categoryKey,
  label,
  color,
  elements,
  selectedElementType,
  onSelectElement,
  locked = false,
  budgetRemaining,
}: ElementCategoryProps) {
  const [isOpen, setIsOpen] = useState(!locked);

  // Auto-open newly unlocked categories
  useEffect(() => {
    if (!locked) setIsOpen(true);
  }, [locked]);

  return (
    <div className="mb-1">
      {/* Category header */}
      <button
        onClick={() => !locked && setIsOpen(!isOpen)}
        className={`flex items-center gap-2 w-full px-3 py-2 text-left rounded transition-colors ${
          locked ? 'opacity-40 cursor-not-allowed' : 'hover:bg-white/5 cursor-pointer'
        }`}
      >
        <div
          className="w-3 h-3 rounded-sm flex-shrink-0"
          style={{ backgroundColor: locked ? '#555' : color }}
        />
        <span className="text-sm font-semibold text-neutral-300 uppercase tracking-wider flex-1">
          {label}
        </span>
        {locked && (
          <span className="text-xs text-neutral-500" title="Unlocks in a later round">
            &#128274;
          </span>
        )}
        {!locked && (
          <>
            <span className="text-neutral-500 text-sm">
              {elements.length}
            </span>
            <span
              className={`text-neutral-500 text-xs transition-transform ${
                isOpen ? 'rotate-90' : ''
              }`}
            >
              &#9654;
            </span>
          </>
        )}
      </button>

      {/* Element list */}
      {isOpen && !locked && (
        <div className="flex flex-col gap-0.5 px-2 pb-1">
          {elements.map((el) => (
            <ElementCard
              key={el.type}
              element={el}
              isSelected={selectedElementType === el.type}
              onSelect={onSelectElement}
              placements={[]}
            />
          ))}
        </div>
      )}
    </div>
  );
}

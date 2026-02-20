'use client';

import { useState } from 'react';
import type { ElementDefinition } from '@/server/src/types/models';
import ElementCard from './ElementCard';

interface ElementCategoryProps {
  categoryKey: string;
  label: string;
  color: string;
  elements: ElementDefinition[];
  selectedElementType: string | null;
  onSelectElement: (type: string) => void;
}

export default function ElementCategory({
  categoryKey,
  label,
  color,
  elements,
  selectedElementType,
  onSelectElement,
}: ElementCategoryProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="mb-1">
      {/* Category header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 w-full px-3 py-1.5 text-left hover:bg-white/5 rounded transition-colors"
      >
        <div
          className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
          style={{ backgroundColor: color }}
        />
        <span className="text-xs font-semibold text-neutral-300 uppercase tracking-wider flex-1">
          {label}
        </span>
        <span className="text-neutral-500 text-xs">
          {elements.length}
        </span>
        <span
          className={`text-neutral-500 text-[10px] transition-transform ${
            isOpen ? 'rotate-90' : ''
          }`}
        >
          &#9654;
        </span>
      </button>

      {/* Element list */}
      {isOpen && (
        <div className="flex flex-col gap-0.5 px-2 pb-1">
          {elements.map((el) => (
            <ElementCard
              key={el.type}
              element={el}
              isSelected={selectedElementType === el.type}
              onSelect={onSelectElement}
            />
          ))}
        </div>
      )}
    </div>
  );
}

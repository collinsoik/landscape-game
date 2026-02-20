'use client';

import { type InputHTMLAttributes } from 'react';

interface PixelInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export { PixelInput };
export default function PixelInput({
  label,
  className = '',
  ...props
}: PixelInputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-xs font-bold uppercase tracking-wider text-[#8bba6a]">
          {label}
        </label>
      )}
      <input
        className={[
          'bg-[#0d1f0d] text-[#d4e8c2] px-3 py-2 text-sm',
          'border-none outline-none placeholder-[#4a6a3a]',
          'focus:ring-2 focus:ring-[#2d5a27]',
          className,
        ].join(' ')}
        style={{
          boxShadow:
            'inset 2px 2px 0 rgba(0,0,0,0.5), inset -2px -2px 0 rgba(255,255,255,0.05)',
        }}
        {...props}
      />
    </div>
  );
}

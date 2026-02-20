'use client';

import { useId, type InputHTMLAttributes } from 'react';

interface PixelInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export { PixelInput };
export default function PixelInput({
  label,
  className = '',
  ...props
}: PixelInputProps) {
  const generatedId = useId();
  const inputId = props.id || generatedId;

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-bold uppercase tracking-wider text-[#8bba6a]"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={[
          'bg-[#0d1f0d] text-[#d4e8c2] px-3 py-2 text-sm',
          'border-none outline-none placeholder-[#4a6a3a]',
          'focus-visible:ring-2 focus-visible:ring-[#8bba6a]',
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

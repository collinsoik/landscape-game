'use client';

import { type ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface PixelButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variantStyles: Record<Variant, string> = {
  primary:
    'bg-[#2d5a27] text-[#e8f5e0] hover:bg-[#3a7232] active:bg-[#1a3a1a]',
  secondary:
    'bg-[#8b6914] text-[#fdf6e3] hover:bg-[#a07b1a] active:bg-[#705510]',
  danger:
    'bg-[#c0392b] text-[#fde8e5] hover:bg-[#d44637] active:bg-[#962d22]',
};

const sizeStyles: Record<Size, string> = {
  sm: 'px-3 py-1 text-xs',
  md: 'px-5 py-2 text-sm',
  lg: 'px-7 py-3 text-base',
};

export { PixelButton };
export default function PixelButton({
  variant = 'primary',
  size = 'md',
  className = '',
  disabled,
  children,
  ...props
}: PixelButtonProps) {
  return (
    <button
      className={[
        'relative font-bold uppercase tracking-wider cursor-pointer select-none',
        'border-none outline-none focus-visible:ring-2 focus-visible:ring-[#8bba6a] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1a2e1a] transition-all duration-100',
        variantStyles[variant],
        sizeStyles[size],
        disabled
          ? 'opacity-50 cursor-not-allowed grayscale'
          : 'active:translate-y-[2px]',
        className,
      ].join(' ')}
      style={{
        boxShadow: disabled
          ? 'inset -2px -2px 0 rgba(0,0,0,0.3), inset 2px 2px 0 rgba(255,255,255,0.15)'
          : 'inset -3px -3px 0 rgba(0,0,0,0.35), inset 3px 3px 0 rgba(255,255,255,0.2), 0 3px 0 rgba(0,0,0,0.25)',
        imageRendering: 'pixelated',
      }}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

'use client';

interface StarDisplayProps {
  stars: number;
  maxStars?: number;
  size?: 'sm' | 'md' | 'lg';
}

const SIZES = { sm: 'text-lg', md: 'text-2xl', lg: 'text-4xl' };

export default function StarDisplay({ stars, maxStars = 3, size = 'md' }: StarDisplayProps) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: maxStars }).map((_, i) => (
        <span
          key={i}
          className={SIZES[size]}
          style={{ color: i < stars ? '#f39c12' : '#333' }}
        >
          {'\u2605'}
        </span>
      ))}
    </div>
  );
}

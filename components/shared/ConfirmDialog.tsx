'use client';

import { useEffect, useCallback, type ReactNode } from 'react';
import PixelButton from '@/components/shared/PixelButton';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  children: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: 'primary' | 'secondary' | 'danger';
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  children,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmVariant = 'danger',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    },
    [onCancel],
  );

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [open, handleKeyDown]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0, 0, 0, 0.7)' }}
      onClick={onCancel}
    >
      <div
        className="bg-[#1a2e1a] text-[#d4e8c2] p-6 w-full max-w-sm"
        style={{
          boxShadow:
            'inset -2px -2px 0 rgba(0,0,0,0.4), inset 2px 2px 0 rgba(255,255,255,0.1), 4px 4px 0 rgba(0,0,0,0.3)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3
          className="text-sm font-bold uppercase tracking-widest text-[#8bba6a] mb-3 pb-2"
          style={{ borderBottom: '2px solid #2d5a27' }}
        >
          {title}
        </h3>
        <div className="text-sm mb-4">{children}</div>
        <div className="flex gap-3 justify-end">
          <PixelButton variant="secondary" size="sm" onClick={onCancel}>
            {cancelLabel}
          </PixelButton>
          <PixelButton variant={confirmVariant} size="sm" onClick={onConfirm}>
            {confirmLabel}
          </PixelButton>
        </div>
      </div>
    </div>
  );
}

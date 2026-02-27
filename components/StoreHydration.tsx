'use client';

import { useEffect } from 'react';
import { useGameStore } from '@/store';

export default function StoreHydration() {
  useEffect(() => {
    useGameStore.persist.rehydrate();
  }, []);
  return null;
}

import type { StateCreator } from 'zustand';
import type { LocalPlacement } from '@/lib/types';
import { hasDuplicatePlacement } from '@/lib/placement';

export interface CanvasSlice {
  placements: LocalPlacement[];
  selectedElementType: string | null;

  setPlacements: (placements: LocalPlacement[]) => void;
  addPlacement: (placement: LocalPlacement) => boolean;
  updatePlacementPosition: (placementId: string, x: number, y: number) => void;
  removePlacement: (placementId: string) => void;
  selectElement: (elementType: string | null) => void;
  clearCanvas: () => void;
}

export const createCanvasSlice: StateCreator<CanvasSlice, [], [], CanvasSlice> = (set) => ({
  placements: [],
  selectedElementType: null,

  setPlacements: (placements) => set({ placements }),

  addPlacement: (placement) => {
    let added = false;
    set((s) => {
      if (hasDuplicatePlacement(s.placements, placement.elementType, placement.x, placement.y)) return s;
      added = true;
      return { placements: [...s.placements, placement] };
    });
    return added;
  },

  updatePlacementPosition: (placementId, x, y) =>
    set((s) => ({
      placements: s.placements.map((p) =>
        p.id === placementId ? { ...p, x, y } : p
      ),
    })),

  removePlacement: (placementId) =>
    set((s) => ({
      placements: s.placements.filter((p) => p.id !== placementId),
    })),

  selectElement: (elementType) => set({ selectedElementType: elementType }),

  clearCanvas: () =>
    set({
      placements: [],
      selectedElementType: null,
    }),
});

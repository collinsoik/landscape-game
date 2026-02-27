import type { StateCreator } from 'zustand';
import type { LocalPlacement } from '@/lib/types';

export interface CanvasSlice {
  placements: LocalPlacement[];
  selectedElementType: string | null;

  setPlacements: (placements: LocalPlacement[]) => void;
  addPlacement: (placement: LocalPlacement) => void;
  updatePlacementPosition: (placementId: string, x: number, y: number) => void;
  removePlacement: (placementId: string) => void;
  selectElement: (elementType: string | null) => void;
  clearCanvas: () => void;
}

export const createCanvasSlice: StateCreator<CanvasSlice, [], [], CanvasSlice> = (set) => ({
  placements: [],
  selectedElementType: null,

  setPlacements: (placements) => set({ placements }),

  addPlacement: (placement) =>
    set((s) => ({ placements: [...s.placements, placement] })),

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

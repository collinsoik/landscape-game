import type { StateCreator } from 'zustand';
import type { Placement, ZoneConfig } from '@/lib/ws/protocol';

export interface CanvasSlice {
  placements: Placement[];
  selectedElementType: string | null;
  zoneConfig: ZoneConfig | null;
  myZoneIndex: number | null;

  setPlacements: (placements: Placement[]) => void;
  addPlacement: (placement: Placement) => void;
  movePlacement: (placementId: string, x: number, y: number) => void;
  removePlacement: (placementId: string) => void;
  selectElement: (elementType: string | null) => void;
  setZoneConfig: (config: ZoneConfig | null) => void;
  setMyZoneIndex: (index: number | null) => void;
  resetCanvas: () => void;
}

export const createCanvasSlice: StateCreator<CanvasSlice, [], [], CanvasSlice> = (set) => ({
  placements: [],
  selectedElementType: null,
  zoneConfig: null,
  myZoneIndex: null,

  setPlacements: (placements) => set({ placements }),

  addPlacement: (placement) =>
    set((s) => ({ placements: [...s.placements, placement] })),

  movePlacement: (placementId, x, y) =>
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

  setZoneConfig: (config) => set({ zoneConfig: config }),

  setMyZoneIndex: (index) => set({ myZoneIndex: index }),

  resetCanvas: () =>
    set({
      placements: [],
      selectedElementType: null,
      zoneConfig: null,
      myZoneIndex: null,
    }),
});

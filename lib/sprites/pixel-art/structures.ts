import { drawTemplate, type DrawFn } from './helpers';

// ---------------------------------------------------------------------------
// birdhouse: 24x36, 4px blocks, 6 cols x 9 rows
//   6 * 4 = 24  ✓
//   9 * 4 = 36  ✓
// Triangular roof, square body with entrance hole, thin pole below.
// ---------------------------------------------------------------------------
const BIRDHOUSE: string[] = [
  //012345
  '..R...', // 0  roof peak
  '.RRR..', // 1  roof mid
  'RRRRRR', // 2  roof base
  '.WWWW.', // 3  body top
  '.WLHW.', // 4  body with entrance hole
  '.WLHW.', // 5  body with entrance hole
  '.WWWW.', // 6  body bottom
  '..PP..', // 7  pole
  '..PP..', // 8  pole
];

const BIRDHOUSE_PALETTE: Record<string, string> = {
  R: '#5c3a1e', // dark brown roof
  W: '#a67c52', // brown wood body
  L: '#c9a06c', // light brown accent
  H: '#2a1a0a', // dark entrance hole
  P: '#8a8a8a', // gray pole
};

// ---------------------------------------------------------------------------
// insect_hotel: 28x32, 4px blocks, 7 cols x 8 rows
//   7 * 4 = 28  ✓
//   8 * 4 = 32  ✓
// Wooden frame with compartments filled with tubes, holes, sticks.
// ---------------------------------------------------------------------------
const INSECT_HOTEL: string[] = [
  //0123456
  'BBBBBBB', // 0  top frame
  'BTTHTTB', // 1  compartment row: tubes & holes
  'BTTHTTB', // 2  compartment row: tubes & holes
  'BBBBBBB', // 3  mid divider
  'BHHLLHB', // 4  compartment row: holes & light wood
  'BHLHLHB', // 5  compartment row: mixed
  'BHHLLHB', // 6  compartment row: holes & light wood
  'BBBBBBB', // 7  bottom frame
];

const INSECT_HOTEL_PALETTE: Record<string, string> = {
  B: '#5c3a1e', // brown wood frame
  T: '#c9a06c', // tan/beige tube fill
  H: '#2a1a0a', // dark holes/tubes
  L: '#d4b896', // light wood sticks
};

// ---------------------------------------------------------------------------
// compost_bin: 28x28, 4px blocks, 7 cols x 7 rows
//   7 * 4 = 28  ✓
//   7 * 4 = 28  ✓
// Wooden slatted bin with green/brown compost visible inside.
// ---------------------------------------------------------------------------
const COMPOST_BIN: string[] = [
  //0123456
  'FFFFFEF', // 0  top frame with gap showing compost
  'FGCGCEF', // 1  slats with green/brown compost showing through
  'EFFFFEF', // 2  horizontal slat
  'FCDGCEF', // 3  compost visible between slats
  'EFFFFEF', // 4  horizontal slat
  'FGDCGEF', // 5  lower compost
  'FFFFFFF', // 6  bottom frame
];

const COMPOST_BIN_PALETTE: Record<string, string> = {
  F: '#8b5e3c', // brown wood slats
  E: '#5c3a1e', // dark brown frame/edge
  G: '#4a7a2e', // green compost
  C: '#6b4226', // dark brown compost
  D: '#3d5c1a', // darker green compost
};

// ---------------------------------------------------------------------------
// bench: 40x28, 4px blocks, 10 cols x 7 rows
//   10 * 4 = 40  ✓
//    7 * 4 = 28  ✓
// Wooden park bench with slatted back, seat, and iron legs.
// ---------------------------------------------------------------------------
const BENCH: string[] = [
  //0123456789
  '.BBBBBBBB.', // 0  back rest top rail
  '.BbBBbBBb.', // 1  back slats with light wood grain
  '.BBBBBBBB.', // 2  back rest bottom rail
  'SSSSSSSSSS', // 3  seat plank
  '..L....L..', // 4  iron legs
  '..L....L..', // 5  iron legs
  '..FF..FF..', // 6  feet / ground contact
];

const BENCH_PALETTE: Record<string, string> = {
  B: '#5c3a1e', // dark brown back frame
  b: '#a67c52', // lighter brown slat detail
  S: '#8b6b3e', // medium brown seat wood
  L: '#4a4a4a', // dark iron legs
  F: '#333333', // darker iron feet
};

export const structureSprites: Record<string, DrawFn> = {
  birdhouse: (ctx, w, h) => {
    const pixelSize = 4;
    drawTemplate(ctx, BIRDHOUSE, BIRDHOUSE_PALETTE, pixelSize);
  },

  insect_hotel: (ctx, w, h) => {
    const pixelSize = 4;
    drawTemplate(ctx, INSECT_HOTEL, INSECT_HOTEL_PALETTE, pixelSize);
  },

  compost_bin: (ctx, w, h) => {
    const pixelSize = 4;
    drawTemplate(ctx, COMPOST_BIN, COMPOST_BIN_PALETTE, pixelSize);
  },

  bench: (ctx, w, h) => {
    const pixelSize = 4;
    drawTemplate(ctx, BENCH, BENCH_PALETTE, pixelSize);
  },
};

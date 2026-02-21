import { drawTemplate, type DrawFn } from './helpers';

// ---------------------------------------------------------------------------
// wildflower_patch  40x32  =>  4px blocks  =>  10 columns x 8 rows
// A cheerful patch of mixed small blooms on green stems.
// Palette:
//   P = pink flower    Y = yellow flower   U = purple flower
//   R = red flower     G = green stem      L = leaf green
//   D = dark green base
// ---------------------------------------------------------------------------
const wildflowerPatchTemplate: string[] = [
  '..P...Y...',  // row 0 – flower tops
  '.PP.Y.YU..',  // row 1 – blooms
  '..P..Y.UU.',  // row 2 – blooms continued
  '.RG..GG.G.',  // row 3 – red bloom + stems
  'RRG.LGL.GL',  // row 4 – red bloom + stems + leaves
  '.GGLGG.LG.',  // row 5 – stems and leaves
  '.DGDDGDDGD',  // row 6 – dark green base
  'DDDDDDDDDD',  // row 7 – ground
];

const wildflowerPatchPalette: Record<string, string> = {
  P: '#f472b6', // pink
  Y: '#facc15', // yellow
  U: '#a78bfa', // purple
  R: '#ef4444', // red
  G: '#4ade80', // green stem
  L: '#22c55e', // leaf green
  D: '#166534', // dark green base
};

// ---------------------------------------------------------------------------
// sunflower_cluster  36x44  =>  4px blocks  =>  9 columns x 11 rows
// Two tall sunflowers with big yellow petals and brown centers.
// Palette:
//   Y = bright yellow petals   B = dark brown center
//   G = green stem              L = green leaf
//   D = darker green
// ---------------------------------------------------------------------------
const sunflowerClusterTemplate: string[] = [
  '..YYY....',  // row 0  – left flower top petals
  '.YYBYYY..',  // row 1  – left flower head
  '.YBYBYY..',  // row 2  – left flower center + right petals start
  '..YYY.YYY',  // row 3  – left flower bottom + right flower top
  '..G..YBYY',  // row 4  – left stem + right flower head
  '.LG..YBYY',  // row 5  – left leaf + right flower center
  '..G...YYY',  // row 6  – stems
  '..GL..G..',  // row 7  – stems and leaves
  '..G..LG..',  // row 8  – stems and leaves
  '..GD.DGD.',  // row 9  – base
  '.DDDDDDD.',  // row 10 – ground
];

const sunflowerClusterPalette: Record<string, string> = {
  Y: '#fbbf24', // bright yellow petals
  B: '#78350f', // dark brown center
  G: '#4ade80', // green stem
  L: '#22c55e', // green leaf
  D: '#166534', // darker green
};

// ---------------------------------------------------------------------------
// shade_fern  32x28  =>  4px blocks  =>  8 columns x 7 rows
// Delicate fern fronds spreading outward and drooping. Lush and leafy.
// Palette:
//   D = dark green   M = medium green   L = light green
//   S = thin brown stem
// ---------------------------------------------------------------------------
const shadeFernTemplate: string[] = [
  '.L....L.',  // row 0 – frond tips
  'ML.DM.LM',  // row 1 – upper fronds spreading
  'DML.DLMD',  // row 2 – mid fronds
  '.DMMDMD.',  // row 3 – inner fronds converging
  '..DMMD..',  // row 4 – central cluster
  '...SS...',  // row 5 – thin brown stem
  '..DSSD..',  // row 6 – stem base with dark green
];

const shadeFernPalette: Record<string, string> = {
  D: '#166534', // dark green
  M: '#22c55e', // medium green
  L: '#86efac', // light green
  S: '#92400e', // thin brown stem
};

// ---------------------------------------------------------------------------
// Exported record mapping type names to drawing functions.
// ---------------------------------------------------------------------------
export const flowerSprites: Record<string, DrawFn> = {
  wildflower_patch(ctx, w, h) {
    const pixelSize = 4; // 40/10 = 4, 32/8 = 4
    drawTemplate(ctx, wildflowerPatchTemplate, wildflowerPatchPalette, pixelSize);
  },

  sunflower_cluster(ctx, w, h) {
    const pixelSize = 4; // 36/9 = 4, 44/11 = 4
    drawTemplate(ctx, sunflowerClusterTemplate, sunflowerClusterPalette, pixelSize);
  },

  shade_fern(ctx, w, h) {
    const pixelSize = 4; // 32/8 = 4, 28/7 = 4
    drawTemplate(ctx, shadeFernTemplate, shadeFernPalette, pixelSize);
  },
};

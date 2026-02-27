import { drawTemplate, type DrawFn } from './helpers';

// ---------------------------------------------------------------------------
// Log Pile  --  44x28  ->  11x7 grid @ 4px blocks
// A cute pile of stacked horizontal logs showing circular cross-sections
// with visible growth rings. Two logs on the bottom, one nestled on top.
// ---------------------------------------------------------------------------
// Palette keys:
//   D = dark brown (bark / outline)
//   B = medium brown (log body)
//   L = light brown/tan (inner wood center)
//   R = dark ring details (growth rings)
const logPileTemplate: string[] = [
  // 01234567890   (11 columns)
  '...DDDDD...',  // 0  top log bark cap
  '..DRLBLRD..',  // 1  top log: rings around light center
  '..DBLRLBD..',  // 2  top log: wood grain with ring
  '..DRDLDRD..',  // 3  top log: bottom bark
  'DDDDDDDDDDD',  // 4  bark line separating top/bottom
  'DRLBDDDBLRD',  // 5  bottom two logs: ring patterns
  'DDDDDDDDDDD',  // 6  ground bark line
];

// Verification: every row is 11 characters, 7 rows.
// 11 * 4 = 44 (w), 7 * 4 = 28 (h).

const logPilePalette: Record<string, string> = {
  D: '#5c3a1e',  // dark brown (bark / outline)
  B: '#8b6333',  // medium brown (log body)
  L: '#c9a55a',  // light brown/tan (inner wood)
  R: '#6b4423',  // dark ring details
};

// ---------------------------------------------------------------------------
// Rock Garden  --  48x32  ->  12x8 grid @ 4px blocks
// A cluster of rounded stones of varying sizes. A large rock in the center,
// medium rocks to the sides, and small pebbles at the edges.
// ---------------------------------------------------------------------------
// Palette keys:
//   S = very dark gray (shadow / outline)
//   D = dark gray (rock shaded side)
//   M = medium gray (rock body)
//   L = light gray (highlights on top)
const rockGardenTemplate: string[] = [
  // 0123456789AB   (12 columns)
  '..SSSS..SS..',  // 0  big rock top + small rock top
  '.SLMMDS.LMD.',  // 1  big rock lit face + small rock
  '.SMMDDSSMDS.',  // 2  big rock body + small rock base
  'SSLMMDSLMMDS',  // 3  big rock base + medium rock
  'SDMMDSSLMMDS',  // 4  rocks sitting on ground
  '.SSMDS.SMDS.',  // 5  lower edges
  '..SSS..SSSS.',  // 6  base outlines
  '..SS........',  // 7  shadow remnants
];

// Verification: every row is 12 characters, 8 rows.
// 12 * 4 = 48 (w), 8 * 4 = 32 (h).

const rockGardenPalette: Record<string, string> = {
  S: '#3a3a3a',  // very dark gray (shadows / outlines)
  D: '#5a5a5a',  // dark gray (shaded side)
  M: '#8a8a8a',  // medium gray (rock body)
  L: '#b0b0b0',  // light gray (highlights)
};

// ---------------------------------------------------------------------------
// Exported sprite map
// ---------------------------------------------------------------------------
export const habitatSprites: Record<string, DrawFn> = {
  log_pile: (ctx, w, h) => {
    const pixelSize = w / 11; // 44 / 11 = 4
    drawTemplate(ctx, logPileTemplate, logPilePalette, pixelSize);
  },

  rock_garden: (ctx, w, h) => {
    const pixelSize = w / 12; // 48 / 12 = 4
    drawTemplate(ctx, rockGardenTemplate, rockGardenPalette, pixelSize);
  },
};

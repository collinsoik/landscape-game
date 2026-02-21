import { drawTemplate, type DrawFn } from './helpers';

// ---------------------------------------------------------------------------
// invasive_vine  36x36  =>  4px blocks  =>  9 columns x 9 rows
// Tangled, aggressive vines with thorny tendrils reaching outward.
// Dark greens with red/maroon warning tones — chaotic and unwelcome.
// Palette:
//   V = dark green vine     S = sickly yellow-green
//   T = dark red/maroon thorn   K = black shadow
// ---------------------------------------------------------------------------
const invasiveVineTemplate: string[] = [
  'T..V..S.T',  // row 0 – thorn tips poking up, vine reaching
  '.V.VV.VS.',  // row 1 – tangled upper vines
  'SVT.KV.TV',  // row 2 – thorny mid-section, shadowed
  '.VVTVVVS.',  // row 3 – dense chaotic tangle
  'TV.KVKVVT',  // row 4 – dark core with thorns
  '.SVVTVVV.',  // row 5 – spreading lower vines
  'V.TKVK.SV',  // row 6 – thorny tendrils reaching out
  '.VV.VV.V.',  // row 7 – trailing vines
  'K.SV.VS.K',  // row 8 – shadowy base with sickly tips
];

const invasiveVinePalette: Record<string, string> = {
  V: '#1a5c2a', // dark green vine
  S: '#a3b518', // sickly yellow-green
  T: '#7f1d1d', // dark red/maroon thorns
  K: '#1c1917', // black shadow
};

// ---------------------------------------------------------------------------
// invasive_grass  48x24  =>  4px blocks  =>  12 columns x 6 rows
// Tall, sharp, aggressive grass blades spreading outward. Unruly and
// dominating with dark, unpleasant tones.
// Palette:
//   G = dark olive-green    S = sickly yellow-green
//   B = brownish-green      D = dark tips
// ---------------------------------------------------------------------------
const invasiveGrassTemplate: string[] = [
  'D..D.D..D.SD',  // row 0 – sharp dark tips jutting up
  'GD.GDG.DG.DG',  // row 1 – tall aggressive blades
  'SG.GSGSGBGSG',  // row 2 – dense mid blades, sickly tones
  'GGBGSGGGGSGB',  // row 3 – thick unruly cluster
  'BGGGBGGBGGGG',  // row 4 – brownish-green spreading base
  'GBBGGGBGBGBG',  // row 5 – ground-level tangle
];

const invasiveGrassPalette: Record<string, string> = {
  G: '#3d5a1e', // dark olive-green
  S: '#a3b518', // sickly yellow-green
  B: '#5a4a2a', // brownish-green
  D: '#2d3a0e', // dark tips
};

// ---------------------------------------------------------------------------
// Exported record mapping type names to drawing functions.
// ---------------------------------------------------------------------------
export const invasiveSprites: Record<string, DrawFn> = {
  invasive_vine(ctx, w, h) {
    const pixelSize = 4; // 36/9 = 4, 36/9 = 4
    drawTemplate(ctx, invasiveVineTemplate, invasiveVinePalette, pixelSize);
  },

  invasive_grass(ctx, w, h) {
    const pixelSize = 4; // 48/12 = 4, 24/6 = 4
    drawTemplate(ctx, invasiveGrassTemplate, invasiveGrassPalette, pixelSize);
  },
};

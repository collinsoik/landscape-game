import { drawTemplate, type DrawFn } from './helpers';

// ---------------------------------------------------------------------------
// Palettes
// ---------------------------------------------------------------------------

const nativeShrubPalette: Record<string, string> = {
  D: '#2d6a1e', // dark green
  M: '#4a9e2f', // medium green
  L: '#7ecc49', // light green highlight
  B: '#6b4226', // brown stem
};

const berryBushPalette: Record<string, string> = {
  D: '#2d6a1e', // dark green
  M: '#4a9e2f', // medium green
  P: '#9b30ff', // purple berry
  B: '#e040a0', // magenta berry
  S: '#6b4226', // brown stem
};

const hedgeRowPalette: Record<string, string> = {
  D: '#2d6a1e', // dark green
  M: '#4a9e2f', // medium green
  L: '#7ecc49', // light green highlight
};

// ---------------------------------------------------------------------------
// Templates
// ---------------------------------------------------------------------------

// native_shrub: 40x36 -> 4px blocks -> 10 cols x 9 rows
const nativeShrubTemplate: string[] = [
  '....DD....', // rounded crown
  '..DMMDL...', // upper canopy
  '.DDMLMMD..', // spreading left
  '.DMLMMDD..', // full upper body
  'DMMLLMMMD.', // dense wide middle
  'DMMMLMMMDD', // lush lower body
  '.DDMMMMD..', // tapering base
  '...DMMD...', // lower foliage
  '....BB....', // small brown stem
];

// berry_bush: 36x32 -> 4px blocks -> 9 cols x 8 rows
const berryBushTemplate: string[] = [
  '..DDDD...', // compact crown
  '.DMMPMD..', // top with purple berry
  '.DMPMMBD.', // berries scattered
  'DMBMMMPD.', // full with magenta + purple
  'DMMPDMMD.', // lower berries
  '.DMBMMD..', // tapering
  '..DMMD...', // base foliage
  '...SS....', // small brown stem
];

// hedge_row: 64x28 -> 4px blocks -> 16 cols x 7 rows
const hedgeRowTemplate: string[] = [
  '..LLLLLLLLLLLL..', // bright flat top highlights
  '.LMMMMMMMMMMMML.', // upper body with light edges
  'DMMMMMMMMMMMMMMD', // dense green fill
  'DMMDMMMDMMMDMMMD', // darker accent pattern
  'DMMMMMMMMMMMMMMD', // dense green fill
  'DDMMMMMMMMMMMMDD', // dark lower edges
  '..DDDDDDDDDDDD..', // dark flat base
];

// ---------------------------------------------------------------------------
// Exported sprite record
// ---------------------------------------------------------------------------

export const shrubSprites: Record<string, DrawFn> = {
  native_shrub: (ctx, w, h) => {
    const pixelSize = 4;
    drawTemplate(ctx, nativeShrubTemplate, nativeShrubPalette, pixelSize);
  },

  berry_bush: (ctx, w, h) => {
    const pixelSize = 4;
    drawTemplate(ctx, berryBushTemplate, berryBushPalette, pixelSize);
  },

  hedge_row: (ctx, w, h) => {
    const pixelSize = 4;
    drawTemplate(ctx, hedgeRowTemplate, hedgeRowPalette, pixelSize);
  },
};

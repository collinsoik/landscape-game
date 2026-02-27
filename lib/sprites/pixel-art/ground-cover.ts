import { drawTemplate, type DrawFn } from './helpers';

// ---------------------------------------------------------------------------
// native_grass  48x24  =>  4px blocks  =>  12 columns x 6 rows
// Short grass tufts/blades sticking up from the ground in small clumps.
// Palette:
//   d = dark green       g = medium green
//   l = light green tips  b = brown earth
// ---------------------------------------------------------------------------
const nativeGrassTemplate: string[] = [
  // 123456789012
  '..l..l..l...',  // row 0 – light blade tips poking up
  '.lg.lg..lg..',  // row 1 – upper blades with light tips
  '.gg.gg.lgg.l',  // row 2 – mid blades filling in
  'dggdggdgggdg',  // row 3 – dense lower blades
  'dgdggdggdgdg',  // row 4 – thick base meeting earth
  'bbdbbbdbbbdb',  // row 5 – brown earth ground line
];

const nativeGrassPalette: Record<string, string> = {
  d: '#2d6e2d',  // dark green
  g: '#4a9e4a',  // medium green
  l: '#7ec87e',  // light green blade tips
  b: '#8b6b3e',  // brown earth
};

// ---------------------------------------------------------------------------
// moss_patch  40x20  =>  4px blocks  =>  10 columns x 5 rows
// Soft, low, rounded mossy mounds. Fluffy and damp looking.
// Palette:
//   d = dark green   g = medium green
//   l = light green  y = yellow-green accents
// ---------------------------------------------------------------------------
const mossPatchTemplate: string[] = [
  // 1234567890
  '..lg..lg..',  // row 0 – top highlight bumps
  '.lggl.gyl.',  // row 1 – upper mound curves
  'lggglygggl',  // row 2 – wide mossy body
  'dggyggygdg',  // row 3 – lower moss with yellow-green
  'ddggddggdd',  // row 4 – dark base grounding
];

const mossPatchPalette: Record<string, string> = {
  d: '#2d6e2d',  // dark green
  g: '#4a9e4a',  // medium green
  l: '#7ec87e',  // light green highlights
  y: '#a0c840',  // yellow-green accents
};

// ---------------------------------------------------------------------------
// clover_ground  44x22  =>  2px blocks  =>  22 columns x 11 rows
// Low green ground cover with small white clover flowers dotted across.
// Palette:
//   d = dark green    g = medium green
//   l = light green   w = white clover flowers
// ---------------------------------------------------------------------------
const cloverGroundTemplate: string[] = [
  // 1234567890123456789012
  '....l.....l.....l.....',  // row 0  – sparse light tips
  '..g.gl.w..gl.g..glw...',  // row 1  – clover flowers peeking
  '.gg.gg.gg.gg.gg.gg.gg.',  // row 2  – green canopy layer
  'ggg.wg.ggggg.wg.gggggg',  // row 3  – white clovers in green
  'ggggggggggggggggggggg.',  // row 4  – dense green cover
  '.ggg.gglgg.ggg.gglgg..',  // row 5  – light green accents
  'gg.w.ggggggg.w.ggggglg',  // row 6  – more clover dots
  'ggggggglgggggggglggggg',  // row 7  – lush green fill
  '.ggg.ggggg.ggg.ggggg..',  // row 8  – softening edges
  'dgdgdggdgdddgdgdggdgdd',  // row 9  – dark green base
  'ddd.ddd.dddddddddd.ddd',  // row 10 – ground base
];

const cloverGroundPalette: Record<string, string> = {
  d: '#2d6e2d',  // dark green
  g: '#4a9e4a',  // medium green
  l: '#7ec87e',  // light green
  w: '#ffffff',  // white clover flowers
};

// ---------------------------------------------------------------------------
// Exported record mapping type names to drawing functions.
// ---------------------------------------------------------------------------
export const groundCoverSprites: Record<string, DrawFn> = {
  native_grass(ctx, _w, _h) {
    // 12 cols * 4px = 48 = w, 6 rows * 4px = 24 = h
    drawTemplate(ctx, nativeGrassTemplate, nativeGrassPalette, 4);
  },

  moss_patch(ctx, _w, _h) {
    // 10 cols * 4px = 40 = w, 5 rows * 4px = 20 = h
    drawTemplate(ctx, mossPatchTemplate, mossPatchPalette, 4);
  },

  clover_ground(ctx, _w, _h) {
    // 22 cols * 2px = 44 = w, 11 rows * 2px = 22 = h
    drawTemplate(ctx, cloverGroundTemplate, cloverGroundPalette, 2);
  },
};

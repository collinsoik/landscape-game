import { drawTemplate, type DrawFn } from './helpers';

// ---------------------------------------------------------------------------
// Oak Tree  –  64×64  →  16×16 grid @ 4px blocks
// A majestic oak with a wide, round dark-green canopy and a thick brown trunk.
// Lighter green highlights and darker spots add depth. Small shadow at base.
// ---------------------------------------------------------------------------
//   D = dark green   (canopy edge / outline)
//   G = medium green (canopy body)
//   L = light green  (highlights)
//   K = darker green (depth / shadow spots)
//   T = dark brown   (trunk)
//   B = medium brown (trunk highlight)
//   S = shadow       (base shadow)
const oakTemplate: string[] = [
  // 16 columns each row, 16 rows total
  '......DDDD......', // row 0  – crown tip
  '....DDGLGGDD....', // row 1  – top of canopy
  '...DGGLGLGGGD...', // row 2  – upper canopy widens
  '..DGLGGKGGLGGD..', // row 3  – mid-upper canopy
  '.DGGKGGGGGLGGLD.', // row 4  – canopy broadens
  '.DGLGGLGGGKGGLD.', // row 5  – wide canopy
  'DGGGKGGGLGGGLGGD', // row 6  – full width canopy
  'DGLGGGKGGGGKGLGD', // row 7  – full width with depth
  'DGGGLGGGLGGLGGGD', // row 8  – full width highlights
  'DGKGGGLGGGKGGLGD', // row 9  – full width with depth
  '.DGGGLGGGGLGGGD.', // row 10 – canopy narrows
  '.DGKGGGGKGGGLGD.', // row 11 – canopy narrows more
  '..DDGGLGGGLGDD..', // row 12 – lower canopy
  '......TBBT......', // row 13 – thick trunk
  '......TBBT......', // row 14 – thick trunk
  '.....SSSSSS.....', // row 15 – base shadow
];

const oakPalette: Record<string, string> = {
  D: '#2d5a1e', // dark green outline
  G: '#3e8a2e', // medium green body
  L: '#6abe45', // light green highlights
  K: '#1e4216', // darker depth spots
  T: '#5c3a1e', // dark brown trunk
  B: '#7a5230', // medium brown trunk
  S: '#3a3a2a', // base shadow
};

// ---------------------------------------------------------------------------
// Maple Tree  –  64×64  →  16×16 grid @ 4px blocks
// Round canopy in stunning fall colours – a vibrant mix of orange, red,
// dark orange, and yellow-green leaves. Brown trunk.
// ---------------------------------------------------------------------------
//   O = orange         R = red
//   D = dark orange    Y = yellow-green
//   T = brown trunk
const mapleTemplate: string[] = [
  // 16 columns each row, 16 rows total
  '.....DDDDD......', // row 0  – crown tip
  '...DDORRRODD....', // row 1  – top of canopy
  '..DORYOYRYROD...', // row 2  – upper canopy
  '.DROYRROYOYRRD..', // row 3  – mid-upper canopy
  '.DORRYDORYORROD.', // row 4  – canopy widens
  'DROYORRORYRROYRD', // row 5  – full width
  'DORRYDORYOYRROYD', // row 6  – full width with color mix
  'DROYORRDOYORYORD', // row 7  – full width peak
  'DOYRDORYORYRODYD', // row 8  – full width colors
  'DROYRROYOYRRDYRD', // row 9  – full width depth
  '.DORRYDORYORROD.', // row 10 – canopy narrows
  '.DROYORRDOYOROD.', // row 11 – canopy narrows
  '..DDORYOYRDDD...', // row 12 – lower canopy
  '......TTTT......', // row 13 – trunk
  '.......TT.......', // row 14 – trunk narrows
  '................', // row 15 – ground line
];

const maplePalette: Record<string, string> = {
  O: '#e8922e', // bright orange
  R: '#c0392b', // red
  D: '#b5651d', // dark orange
  Y: '#8baa30', // yellow-green
  T: '#5c3a1e', // brown trunk
};

// ---------------------------------------------------------------------------
// Pine Tree  –  48×64  →  12×16 grid @ 4px blocks
// Classic triangular / Christmas-tree shape with three layered tiers that
// widen toward the bottom. Narrow brown trunk at the base.
// ---------------------------------------------------------------------------
//   D = dark green  (outline / shaded side)
//   G = medium green (fill / lit side)
//   T = brown trunk
const pineTemplate: string[] = [
  // 12 columns each row, 16 rows total
  '.....DG.....', // row 0  – very top point
  '....DGGD....', // row 1  – tiny peak
  '...DGGGD....', // row 2  – first tier
  '..DDGGGDD...', // row 3  – first tier widens
  '....DGGD....', // row 4  – second tier starts narrow
  '...DGGGGD...', // row 5  – second tier widens
  '..DGGGGGGD..', // row 6  – second tier full
  '.DDGGGGGGDD.', // row 7  – second tier base
  '...DGGGGD...', // row 8  – third tier starts narrow
  '..DGGGGGDD..', // row 9  – third tier widens
  '.DGGGGGGGDD.', // row 10 – third tier full
  'DDGGGGGGGGDD', // row 11 – third tier wide base
  'DGGGGGGGGGDD', // row 12 – widest point
  '.....TT.....', // row 13 – narrow trunk
  '.....TT.....', // row 14 – narrow trunk
  '.....TT.....', // row 15 – trunk base
];

const pinePalette: Record<string, string> = {
  D: '#1e5a1e', // dark green outline
  G: '#3e8a2e', // medium green fill
  T: '#5c3a1e', // brown trunk
};

// ---------------------------------------------------------------------------
// Fruit Tree  –  48×56  →  12×14 grid @ 4px blocks
// Round green canopy with small red and orange fruit dots scattered on it.
// Cute and plump shape. Brown trunk.
// ---------------------------------------------------------------------------
//   D = dark green  (canopy edge / outline)
//   G = medium green (canopy body)
//   R = red fruit
//   O = orange fruit
//   T = brown trunk
const fruitTemplate: string[] = [
  // 12 columns each row, 14 rows total
  '...DDDDD....', // row 0  – crown tip
  '..DGGRGGGD..', // row 1  – top with a red fruit
  '.DGGRGGOGD..', // row 2  – upper canopy with fruits
  '.DGOGGGGRDD.', // row 3  – canopy widens
  'DGGGRGGGGGRD', // row 4  – full width with red fruits
  'DGRGGGOGGOGD', // row 5  – full width, mixed fruits
  'DGGGRGGGRGDD', // row 6  – full width with red fruits
  'DGOGGGGGOGGD', // row 7  – full width, orange fruits
  'DGGRGGGGGRGD', // row 8  – full width with red
  '.DGGGOGGGGD.', // row 9  – canopy narrows
  '..DDGGGDDD..', // row 10 – lower canopy edge
  '.....TT.....', // row 11 – trunk
  '.....TT.....', // row 12 – trunk
  '....TTTT....', // row 13 – trunk base / roots
];

const fruitPalette: Record<string, string> = {
  D: '#2d5a1e', // dark green outline
  G: '#3e8a2e', // medium green body
  R: '#d4352a', // red fruits
  O: '#e8922e', // orange fruits
  T: '#5c3a1e', // brown trunk
};

// ---------------------------------------------------------------------------
// Exported sprite map
// ---------------------------------------------------------------------------
export const treeSprites: Record<string, DrawFn> = {
  oak_tree: (ctx, w, h) => {
    const pixelSize = w / 16; // 64 / 16 = 4
    drawTemplate(ctx, oakTemplate, oakPalette, pixelSize);
  },

  maple_tree: (ctx, w, h) => {
    const pixelSize = w / 16; // 64 / 16 = 4
    drawTemplate(ctx, mapleTemplate, maplePalette, pixelSize);
  },

  pine_tree: (ctx, w, h) => {
    const pixelSize = w / 12; // 48 / 12 = 4
    drawTemplate(ctx, pineTemplate, pinePalette, pixelSize);
  },

  fruit_tree: (ctx, w, h) => {
    const pixelSize = w / 12; // 48 / 12 = 4
    drawTemplate(ctx, fruitTemplate, fruitPalette, pixelSize);
  },
};

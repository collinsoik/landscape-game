import { drawTemplate, type DrawFn } from './helpers';

export const waterSprites: Record<string, DrawFn> = {
  /**
   * rain_garden: 56x48, 4px blocks -> 14x12 grid
   * A sunken garden depression with blue water pooled in the center,
   * green plants around the edges, and brown earth rim.
   */
  rain_garden: (ctx, w, h) => {
    const pixelSize = 4; // 14*4=56, 12*4=48

    const palette: Record<string, string> = {
      B: '#3b82f6', // blue water
      b: '#93c5fd', // light blue water highlights
      G: '#22c55e', // green plants
      g: '#166534', // dark green
      E: '#92400e', // brown earth edges
      e: '#78350f', // dark brown
    };

    //         1234567890ABCD  (14 columns)
    const template: string[] = [
      '...eEEEEee....', // row 1
      '..eGgGgGgEe...', // row 2
      '.eG.g..g.gGe..', // row 3
      'eEGBBBBBBbGEe.', // row 4
      'EG.BBbBBBBBgGE', // row 5
      'EG.BBBbBBbBBGE', // row 6
      'EgGBbBBBBBBgGE', // row 7
      'EG.BBBBbBBBgGE', // row 8
      'eEGBBBBBBBbGEe', // row 9
      '.eGg.gGg.gGe..', // row 10
      '..eGgGgGgEe...', // row 11
      '...eEEEEee....', // row 12
    ];

    drawTemplate(ctx, template, palette, pixelSize);
  },

  /**
   * small_pond: 56x44, 4px blocks -> 14x11 grid
   * An oval blue pond with ripple highlights, small rocks on the edge,
   * and a lily pad floating on the surface.
   */
  small_pond: (ctx, w, h) => {
    const pixelSize = 4; // 14*4=56, 11*4=44

    const palette: Record<string, string> = {
      D: '#1e40af', // dark blue water
      M: '#3b82f6', // medium blue
      L: '#93c5fd', // light blue ripples
      R: '#9ca3af', // gray rocks
      G: '#22c55e', // green lily pad
    };

    //         1234567890ABCD  (14 columns)
    const template: string[] = [
      '....DMMMD.....', // row 1
      '..DDMMLMMD....', // row 2
      '.DMMMLMMMD.R..', // row 3
      'DMMLMMMLMMD.R.', // row 4
      'DMMMMMMMMMDR..', // row 5
      'DMMLMMLMGMMD..', // row 6
      'DMMMMMMGMMMD..', // row 7
      '.DMMLMMMMMD...', // row 8
      '..DDMMLMDD....', // row 9
      '...DDMMDD.....', // row 10
      '.....DD.......', // row 11
    ];

    drawTemplate(ctx, template, palette, pixelSize);
  },

  /**
   * birdbath: 28x32, 4px blocks -> 7x8 grid
   * A cute pedestal birdbath with a round bowl of blue water on top
   * and a stone gray pedestal below.
   */
  birdbath: (ctx, w, h) => {
    const pixelSize = 4; // 7*4=28, 8*4=32

    const palette: Record<string, string> = {
      S: '#9ca3af', // gray stone
      s: '#d1d5db', // light gray
      B: '#3b82f6', // blue water
      b: '#93c5fd', // light blue highlight
    };

    //         1234567  (7 columns)
    const template: string[] = [
      '.sSsSs.', // row 1  bowl rim
      'SBbBBBS', // row 2  water with highlight
      'SBBbBBS', // row 3  water
      '.sSSSs.', // row 4  bowl base
      '..sSs..', // row 5  pedestal top
      '..SsS..', // row 6  pedestal mid
      '..sSs..', // row 7  pedestal lower
      '.sSSSs.', // row 8  pedestal base
    ];

    drawTemplate(ctx, template, palette, pixelSize);
  },
};

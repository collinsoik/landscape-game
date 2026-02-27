// Shared pixel-art drawing helpers

export type DrawFn = (ctx: CanvasRenderingContext2D, w: number, h: number) => void;

/**
 * Draws a pixel-art sprite from a template grid.
 * Each character in the template maps to a color in the palette.
 * '.' or ' ' = transparent (skip).
 */
export function drawTemplate(
  ctx: CanvasRenderingContext2D,
  template: string[],
  palette: Record<string, string>,
  pixelSize: number,
  offsetX = 0,
  offsetY = 0,
): void {
  for (let y = 0; y < template.length; y++) {
    const row = template[y];
    for (let x = 0; x < row.length; x++) {
      const ch = row[x];
      if (ch === '.' || ch === ' ') continue;
      const color = palette[ch];
      if (color) {
        ctx.fillStyle = color;
        ctx.fillRect(
          offsetX + x * pixelSize,
          offsetY + y * pixelSize,
          pixelSize,
          pixelSize,
        );
      }
    }
  }
}

/** Draws a filled rectangle snapped to pixel grid. */
export function pxRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string,
): void {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

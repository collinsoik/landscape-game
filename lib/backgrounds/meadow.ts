// Meadow background — green gradient with wildflower dots and terrain depth stripes

import { seededRandom } from './seed';

export function drawMeadow(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  // Base gradient
  const grad = ctx.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0, '#4a7c3f');
  grad.addColorStop(0.3, '#5d8f4a');
  grad.addColorStop(0.6, '#6b8f3c');
  grad.addColorStop(1, '#3d6b2e');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Terrain depth stripes — subtle horizontal bands
  const rand = seededRandom(42);
  ctx.globalAlpha = 0.08;
  for (let y = 0; y < h; y += 12) {
    const shade = rand() > 0.5 ? '#2d5a27' : '#7aa54e';
    ctx.fillStyle = shade;
    ctx.fillRect(0, y, w, 4 + Math.floor(rand() * 6));
  }
  ctx.globalAlpha = 1;

  // Wildflower dots scattered across the meadow
  const flowerColors = ['#e8d44d', '#e87d7d', '#d4a0d4', '#ffffff', '#f5a623'];
  for (let i = 0; i < 120; i++) {
    const fx = Math.floor(rand() * w);
    const fy = Math.floor(rand() * h);
    const color = flowerColors[Math.floor(rand() * flowerColors.length)];
    const size = 2 + Math.floor(rand() * 3);
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.5 + rand() * 0.4;
    ctx.fillRect(fx, fy, size, size);
  }
  ctx.globalAlpha = 1;

  // Small grass tufts
  ctx.fillStyle = '#3d6b2e';
  ctx.globalAlpha = 0.15;
  for (let i = 0; i < 60; i++) {
    const gx = Math.floor(rand() * w);
    const gy = Math.floor(rand() * h);
    ctx.fillRect(gx, gy, 2, 6);
    ctx.fillRect(gx + 3, gy + 1, 2, 5);
  }
  ctx.globalAlpha = 1;
}

// Coastal background — grass at top transitioning to sandy beach then ocean water

import { seededRandom } from './seed';

export function drawCoastal(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  const rand = seededRandom(314);

  // Sky-grass zone (top ~35%)
  const grassEnd = h * 0.35;
  const grassGrad = ctx.createLinearGradient(0, 0, 0, grassEnd);
  grassGrad.addColorStop(0, '#5a8a45');
  grassGrad.addColorStop(0.7, '#4a7c3f');
  grassGrad.addColorStop(1, '#3d6b2e');
  ctx.fillStyle = grassGrad;
  ctx.fillRect(0, 0, w, grassEnd + 4);

  // Sand zone (~35% to ~60%)
  const sandStart = grassEnd;
  const sandEnd = h * 0.6;
  const sandGrad = ctx.createLinearGradient(0, sandStart, 0, sandEnd);
  sandGrad.addColorStop(0, '#c4b07a');
  sandGrad.addColorStop(0.5, '#d4c48a');
  sandGrad.addColorStop(1, '#ccb878');
  ctx.fillStyle = sandGrad;
  ctx.fillRect(0, sandStart, w, sandEnd - sandStart + 4);

  // Ocean zone (~60% to bottom)
  const oceanStart = sandEnd;
  const oceanGrad = ctx.createLinearGradient(0, oceanStart, 0, h);
  oceanGrad.addColorStop(0, '#4a9fc4');
  oceanGrad.addColorStop(0.3, '#3a8aaf');
  oceanGrad.addColorStop(0.7, '#2a6a8a');
  oceanGrad.addColorStop(1, '#1a4a6a');
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, oceanStart, w, h - oceanStart);

  // Jagged grass-sand transition
  ctx.fillStyle = '#3d6b2e';
  ctx.globalAlpha = 0.5;
  for (let x = 0; x < w; x += 4) {
    const jitter = Math.floor(rand() * 8) - 3;
    ctx.fillRect(x, grassEnd + jitter - 2, 4, 6);
  }
  ctx.globalAlpha = 1;

  // Grass texture
  ctx.globalAlpha = 0.07;
  for (let y = 0; y < grassEnd; y += 8) {
    ctx.fillStyle = rand() > 0.5 ? '#2d5a27' : '#6b9f4a';
    ctx.fillRect(0, y, w, 2 + Math.floor(rand() * 4));
  }
  ctx.globalAlpha = 1;

  // Sand speckles
  ctx.globalAlpha = 0.15;
  for (let i = 0; i < 50; i++) {
    const sx = Math.floor(rand() * w);
    const sy = sandStart + Math.floor(rand() * (sandEnd - sandStart));
    ctx.fillStyle = rand() > 0.5 ? '#b8a46a' : '#e0d4a0';
    ctx.fillRect(sx, sy, 3, 2);
  }
  ctx.globalAlpha = 1;

  // Small shells on sand
  ctx.globalAlpha = 0.3;
  const shellColors = ['#f0e8d0', '#e8d8b8', '#d4c4a0'];
  for (let i = 0; i < 12; i++) {
    const sx = Math.floor(rand() * w);
    const sy = sandStart + Math.floor(rand() * (sandEnd - sandStart));
    ctx.fillStyle = shellColors[Math.floor(rand() * shellColors.length)];
    ctx.fillRect(sx, sy, 3 + Math.floor(rand() * 4), 2 + Math.floor(rand() * 3));
  }
  ctx.globalAlpha = 1;

  // Wave foam lines — white lines at shore and across ocean
  ctx.fillStyle = '#ffffff';
  ctx.globalAlpha = 0.3;
  // Shore foam
  for (let x = 0; x < w; x += 3) {
    const jitter = Math.floor(rand() * 6) - 2;
    ctx.fillRect(x, oceanStart + jitter - 1, 3, 2);
  }
  // Ocean wave lines
  for (let waveY = oceanStart + 20; waveY < h; waveY += 18 + Math.floor(rand() * 10)) {
    ctx.globalAlpha = 0.12 + rand() * 0.12;
    for (let x = 0; x < w; x += 4) {
      if (rand() > 0.3) {
        const jitter = Math.floor(rand() * 4) - 2;
        ctx.fillRect(x, waveY + jitter, 4, 2);
      }
    }
  }
  ctx.globalAlpha = 1;

  // Ocean depth highlights
  ctx.fillStyle = '#5ab0d0';
  ctx.globalAlpha = 0.15;
  for (let i = 0; i < 20; i++) {
    const ox = Math.floor(rand() * w);
    const oy = oceanStart + 10 + Math.floor(rand() * (h - oceanStart - 10));
    ctx.fillRect(ox, oy, 8 + Math.floor(rand() * 12), 2);
  }
  ctx.globalAlpha = 1;
}

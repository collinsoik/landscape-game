// Rocky Hills background — green terrain with pixel-art boulder clusters

import { seededRandom } from './seed';

export function drawRockyHills(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  // Base green with subtle hill shading
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, '#5a8a45');
  grad.addColorStop(0.4, '#4a7c3f');
  grad.addColorStop(0.7, '#3d6b2e');
  grad.addColorStop(1, '#356028');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  const rand = seededRandom(123);

  // Rolling hill contours
  ctx.globalAlpha = 0.1;
  for (let i = 0; i < 5; i++) {
    const hillY = h * (0.15 + rand() * 0.7);
    const hillW = w * (0.3 + rand() * 0.5);
    const hillX = rand() * w;
    ctx.fillStyle = rand() > 0.5 ? '#2d5a27' : '#6b9f4a';
    ctx.beginPath();
    ctx.ellipse(hillX, hillY, hillW, 30 + rand() * 40, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Grass texture
  ctx.globalAlpha = 0.06;
  for (let y = 0; y < h; y += 8) {
    ctx.fillStyle = rand() > 0.5 ? '#2d5a27' : '#7aa54e';
    ctx.fillRect(0, y, w, 2 + Math.floor(rand() * 4));
  }
  ctx.globalAlpha = 1;

  // Boulder clusters
  const boulderColors = ['#7a7a6a', '#6b6b5a', '#8a8070', '#5a5a4a', '#9a9080'];
  const highlightColors = ['#a0a090', '#b0a898'];
  const shadowColor = '#3a3a30';

  for (let i = 0; i < 18; i++) {
    const cx = Math.floor(rand() * w);
    const cy = Math.floor(rand() * h);
    const clusterSize = 2 + Math.floor(rand() * 3);

    for (let j = 0; j < clusterSize; j++) {
      const bx = cx + Math.floor((rand() - 0.5) * 24);
      const by = cy + Math.floor((rand() - 0.5) * 16);
      const bw = 8 + Math.floor(rand() * 14);
      const bh = 6 + Math.floor(rand() * 10);

      // Shadow
      ctx.fillStyle = shadowColor;
      ctx.globalAlpha = 0.3;
      ctx.fillRect(bx + 2, by + 2, bw, bh);

      // Main boulder body
      ctx.globalAlpha = 1;
      ctx.fillStyle = boulderColors[Math.floor(rand() * boulderColors.length)];
      ctx.fillRect(bx, by, bw, bh);

      // Pixel highlight on top-left
      ctx.fillStyle = highlightColors[Math.floor(rand() * highlightColors.length)];
      ctx.globalAlpha = 0.6;
      ctx.fillRect(bx, by, bw * 0.4, bh * 0.3);

      // Dark edge on bottom-right
      ctx.fillStyle = '#4a4a3a';
      ctx.globalAlpha = 0.4;
      ctx.fillRect(bx + bw * 0.6, by + bh * 0.7, bw * 0.4, bh * 0.3);
      ctx.globalAlpha = 1;
    }
  }

  // Small scattered pebbles
  ctx.globalAlpha = 0.4;
  for (let i = 0; i < 40; i++) {
    const px = Math.floor(rand() * w);
    const py = Math.floor(rand() * h);
    ctx.fillStyle = boulderColors[Math.floor(rand() * boulderColors.length)];
    ctx.fillRect(px, py, 3 + Math.floor(rand() * 4), 2 + Math.floor(rand() * 3));
  }
  ctx.globalAlpha = 1;
}

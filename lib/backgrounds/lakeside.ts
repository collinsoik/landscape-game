// Lakeside background — green landscape with a large pond/lake area

import { seededRandom } from './seed';

export function drawLakeside(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  // Green base
  const grad = ctx.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0, '#4a7c3f');
  grad.addColorStop(0.4, '#5a8a45');
  grad.addColorStop(1, '#3d6b2e');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  const rand = seededRandom(256);

  // Grass texture
  ctx.globalAlpha = 0.07;
  for (let y = 0; y < h; y += 10) {
    ctx.fillStyle = rand() > 0.5 ? '#2d5a27' : '#6b9f4a';
    ctx.fillRect(0, y, w, 3 + Math.floor(rand() * 5));
  }
  ctx.globalAlpha = 1;

  // Lake — large oval in the lower-center area
  const lakeX = w * 0.5;
  const lakeY = h * 0.55;
  const lakeRX = w * 0.32;
  const lakeRY = h * 0.25;

  // Lake shadow/depth
  ctx.fillStyle = '#1a4a6a';
  ctx.beginPath();
  ctx.ellipse(lakeX, lakeY + 4, lakeRX, lakeRY, 0, 0, Math.PI * 2);
  ctx.fill();

  // Lake body
  const lakeGrad = ctx.createRadialGradient(
    lakeX - lakeRX * 0.2, lakeY - lakeRY * 0.2, 0,
    lakeX, lakeY, lakeRX,
  );
  lakeGrad.addColorStop(0, '#5ab0d0');
  lakeGrad.addColorStop(0.5, '#3a8aaf');
  lakeGrad.addColorStop(1, '#2a6a8a');
  ctx.fillStyle = lakeGrad;
  ctx.beginPath();
  ctx.ellipse(lakeX, lakeY, lakeRX, lakeRY, 0, 0, Math.PI * 2);
  ctx.fill();

  // Shore line — slightly larger darker ring
  ctx.strokeStyle = '#2d5a27';
  ctx.lineWidth = 3;
  ctx.globalAlpha = 0.4;
  ctx.beginPath();
  ctx.ellipse(lakeX, lakeY, lakeRX + 2, lakeRY + 2, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalAlpha = 1;

  // Sandy shore patches
  ctx.fillStyle = '#c4b07a';
  ctx.globalAlpha = 0.3;
  for (let i = 0; i < 12; i++) {
    const angle = rand() * Math.PI * 2;
    const sx = lakeX + Math.cos(angle) * (lakeRX + 4 + rand() * 8);
    const sy = lakeY + Math.sin(angle) * (lakeRY + 4 + rand() * 6);
    ctx.fillRect(sx, sy, 6 + Math.floor(rand() * 10), 3 + Math.floor(rand() * 5));
  }
  ctx.globalAlpha = 1;

  // Ripple highlights on lake surface
  ctx.fillStyle = '#8fd4ea';
  ctx.globalAlpha = 0.3;
  for (let i = 0; i < 20; i++) {
    const angle = rand() * Math.PI * 2;
    const dist = rand() * 0.85;
    const rx = lakeX + Math.cos(angle) * lakeRX * dist;
    const ry = lakeY + Math.sin(angle) * lakeRY * dist;
    ctx.fillRect(rx, ry, 5 + Math.floor(rand() * 10), 2);
  }
  ctx.globalAlpha = 1;

  // Small reeds/cattails around shore
  ctx.fillStyle = '#3d6b2e';
  ctx.globalAlpha = 0.5;
  for (let i = 0; i < 15; i++) {
    const angle = rand() * Math.PI * 2;
    const tx = lakeX + Math.cos(angle) * (lakeRX + 6 + rand() * 12);
    const ty = lakeY + Math.sin(angle) * (lakeRY + 6 + rand() * 10);
    ctx.fillRect(tx, ty - 8, 2, 10);
    ctx.fillRect(tx + 3, ty - 6, 2, 8);
  }
  ctx.globalAlpha = 1;
}

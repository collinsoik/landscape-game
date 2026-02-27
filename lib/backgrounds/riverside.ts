// Riverside background — grassy terrain with a winding stream

import { seededRandom } from './seed';

export function drawRiverside(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  // Green base
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, '#4a7c3f');
  grad.addColorStop(0.5, '#5a8a45');
  grad.addColorStop(1, '#3d6b2e');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  const rand = seededRandom(77);

  // Grass texture
  ctx.globalAlpha = 0.07;
  for (let y = 0; y < h; y += 10) {
    ctx.fillStyle = rand() > 0.5 ? '#2d5a27' : '#6b9f4a';
    ctx.fillRect(0, y, w, 3 + Math.floor(rand() * 5));
  }
  ctx.globalAlpha = 1;

  // Winding river — draw as a series of bezier-connected segments
  const riverWidth = w * 0.12;
  const riverCenterX = w * 0.45;

  // River base (darker water)
  ctx.fillStyle = '#2a6b8f';
  ctx.beginPath();
  ctx.moveTo(riverCenterX - riverWidth, -10);
  ctx.bezierCurveTo(
    riverCenterX - riverWidth * 1.5, h * 0.25,
    riverCenterX + riverWidth * 0.8, h * 0.35,
    riverCenterX - riverWidth * 0.3, h * 0.5,
  );
  ctx.bezierCurveTo(
    riverCenterX - riverWidth * 1.2, h * 0.65,
    riverCenterX + riverWidth * 0.5, h * 0.8,
    riverCenterX - riverWidth * 0.5, h + 10,
  );
  ctx.lineTo(riverCenterX + riverWidth * 0.5, h + 10);
  ctx.bezierCurveTo(
    riverCenterX + riverWidth * 1.5, h * 0.8,
    riverCenterX - riverWidth * 0.2, h * 0.65,
    riverCenterX + riverWidth * 0.7, h * 0.5,
  );
  ctx.bezierCurveTo(
    riverCenterX + riverWidth * 1.8, h * 0.35,
    riverCenterX - riverWidth * 0.5, h * 0.25,
    riverCenterX + riverWidth, -10,
  );
  ctx.closePath();
  ctx.fill();

  // River highlight layer
  ctx.fillStyle = '#4a9fc4';
  ctx.globalAlpha = 0.5;
  ctx.beginPath();
  ctx.moveTo(riverCenterX - riverWidth * 0.6, -10);
  ctx.bezierCurveTo(
    riverCenterX - riverWidth * 1.1, h * 0.25,
    riverCenterX + riverWidth * 0.4, h * 0.35,
    riverCenterX - riverWidth * 0.1, h * 0.5,
  );
  ctx.bezierCurveTo(
    riverCenterX - riverWidth * 0.8, h * 0.65,
    riverCenterX + riverWidth * 0.1, h * 0.8,
    riverCenterX - riverWidth * 0.2, h + 10,
  );
  ctx.lineTo(riverCenterX + riverWidth * 0.2, h + 10);
  ctx.bezierCurveTo(
    riverCenterX + riverWidth * 1.1, h * 0.8,
    riverCenterX - riverWidth * 0.4, h * 0.65,
    riverCenterX + riverWidth * 0.3, h * 0.5,
  );
  ctx.bezierCurveTo(
    riverCenterX + riverWidth * 1.4, h * 0.35,
    riverCenterX - riverWidth * 0.7, h * 0.25,
    riverCenterX + riverWidth * 0.6, -10,
  );
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;

  // Ripple highlights
  ctx.fillStyle = '#8fcce8';
  ctx.globalAlpha = 0.35;
  for (let i = 0; i < 25; i++) {
    const ry = Math.floor(rand() * h);
    const rx = riverCenterX + (rand() - 0.5) * riverWidth * 1.2;
    ctx.fillRect(rx, ry, 6 + Math.floor(rand() * 8), 2);
  }
  ctx.globalAlpha = 1;

  // River bank stones
  ctx.fillStyle = '#5a5040';
  ctx.globalAlpha = 0.3;
  for (let i = 0; i < 20; i++) {
    const side = rand() > 0.5 ? -1 : 1;
    const sy = Math.floor(rand() * h);
    const sx = riverCenterX + side * riverWidth * (0.8 + rand() * 0.4);
    const sz = 3 + Math.floor(rand() * 5);
    ctx.fillRect(sx, sy, sz, sz - 1);
  }
  ctx.globalAlpha = 1;
}

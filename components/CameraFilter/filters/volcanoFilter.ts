import type { FaceMetrics } from "../faceMetrics";

export function drawVolcanoFilter(
  ctx: CanvasRenderingContext2D,
  m: FaceMetrics
): void {
  ctx.save();
  const w = m.faceWidth * 1.1;
  const craterTopY = m.cy - m.faceHeight * 0.5;
  const volcanoBaseY = m.cy + m.faceHeight * 0.6;

  // Volcano rocky body (trapezoid)
  ctx.beginPath();
  ctx.moveTo(m.cx - w * 0.28, craterTopY);
  ctx.lineTo(m.cx + w * 0.28, craterTopY);
  ctx.lineTo(m.cx + w * 0.55, volcanoBaseY);
  ctx.lineTo(m.cx - w * 0.55, volcanoBaseY);
  ctx.closePath();
  const rockGrad = ctx.createLinearGradient(m.cx - w * 0.55, 0, m.cx + w * 0.55, 0);
  rockGrad.addColorStop(0, "#795548");
  rockGrad.addColorStop(0.5, "#5D4037");
  rockGrad.addColorStop(1, "#6D4C41");
  ctx.fillStyle = rockGrad;
  ctx.fill();

  // Rocky texture bumps on sides
  ctx.fillStyle = "#4E342E";
  const bumpPositions: [number, number, number][] = [
    [m.cx - w * 0.4, volcanoBaseY - 20, 18],
    [m.cx + w * 0.38, volcanoBaseY - 15, 15],
    [m.cx - w * 0.5, volcanoBaseY - 5, 12],
    [m.cx + w * 0.45, volcanoBaseY - 8, 14],
  ];
  bumpPositions.forEach(([bx, by, br]) => {
    ctx.beginPath();
    ctx.arc(bx, by, br, Math.PI, 0);
    ctx.fill();
  });

  // Crater opening
  ctx.beginPath();
  ctx.ellipse(m.cx, craterTopY, w * 0.28, 18, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#3E2723";
  ctx.fill();

  // Lava inside crater
  ctx.beginPath();
  ctx.ellipse(m.cx, craterTopY + 6, w * 0.22, 10, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#FF6F00";
  ctx.fill();

  // Lava drips down sides
  const lavaDrips: [number, number, number][] = [
    [m.cx - w * 0.12, craterTopY, 50],
    [m.cx + w * 0.08, craterTopY, 70],
    [m.cx + w * 0.2, craterTopY, 40],
  ];
  ctx.fillStyle = "#FF6D00";
  lavaDrips.forEach(([lx, ly, llen]) => {
    ctx.beginPath();
    ctx.moveTo(lx - 6, ly);
    ctx.bezierCurveTo(lx - 8, ly + llen * 0.5, lx + 4, ly + llen * 0.8, lx + 2, ly + llen);
    ctx.bezierCurveTo(lx + 8, ly + llen * 0.8, lx + 12, ly + llen * 0.5, lx + 8, ly);
    ctx.closePath();
    ctx.fill();
  });

  // Smoke / eruption puffs on top if mouth open
  if (m.mouthOpenRatio > 0.25) {
    ctx.globalAlpha = 0.55;
    const puffs: [number, number, number][] = [
      [m.cx, craterTopY - 28, 20],
      [m.cx - 18, craterTopY - 50, 15],
      [m.cx + 14, craterTopY - 55, 18],
      [m.cx, craterTopY - 72, 13],
    ];
    puffs.forEach(([px, py, pr]) => {
      ctx.beginPath();
      ctx.arc(px, py, pr, 0, Math.PI * 2);
      ctx.fillStyle = "#B0BEC5";
      ctx.fill();
    });
    ctx.globalAlpha = 1;
  }

  ctx.restore();
}

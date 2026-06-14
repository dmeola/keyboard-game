import type { FaceMetrics } from "../faceMetrics";

export function drawCatFilter(
  ctx: CanvasRenderingContext2D,
  m: FaceMetrics
): void {
  ctx.save();
  const r = m.faceWidth * 0.5;
  const earH = r * 0.65;
  const earW = r * 0.42;
  const earTopY = m.cy - m.faceHeight * 0.5;

  // Left ear (triangle)
  ctx.beginPath();
  ctx.moveTo(m.cx - r * 0.55, earTopY);
  ctx.lineTo(m.cx - r * 0.1, earTopY + earH);
  ctx.lineTo(m.cx - r * 1.05, earTopY + earH);
  ctx.closePath();
  ctx.fillStyle = "#FFA726";
  ctx.fill();

  // Left ear inner
  ctx.beginPath();
  ctx.moveTo(m.cx - r * 0.55, earTopY + earH * 0.18);
  ctx.lineTo(m.cx - r * 0.2, earTopY + earH * 0.85);
  ctx.lineTo(m.cx - r * 0.9, earTopY + earH * 0.85);
  ctx.closePath();
  ctx.fillStyle = "#FF7043";
  ctx.fill();

  // Right ear
  ctx.beginPath();
  ctx.moveTo(m.cx + r * 0.55, earTopY);
  ctx.lineTo(m.cx + r * 0.1, earTopY + earH);
  ctx.lineTo(m.cx + r * 1.05, earTopY + earH);
  ctx.closePath();
  ctx.fillStyle = "#FFA726";
  ctx.fill();

  // Right ear inner
  ctx.beginPath();
  ctx.moveTo(m.cx + r * 0.55, earTopY + earH * 0.18);
  ctx.lineTo(m.cx + r * 0.2, earTopY + earH * 0.85);
  ctx.lineTo(m.cx + r * 0.9, earTopY + earH * 0.85);
  ctx.closePath();
  ctx.fillStyle = "#FF7043";
  ctx.fill();

  // Small triangle nose
  const noseY = m.cy + m.faceHeight * 0.08;
  ctx.beginPath();
  ctx.moveTo(m.cx, noseY + 10);
  ctx.lineTo(m.cx - 10, noseY);
  ctx.lineTo(m.cx + 10, noseY);
  ctx.closePath();
  ctx.fillStyle = "#FF7043";
  ctx.fill();

  // Whiskers — left side
  const whiskerY = noseY + 6;
  ctx.strokeStyle = "rgba(255,255,255,0.85)";
  ctx.lineWidth = 2.5;
  ctx.lineCap = "round";
  [[-25, -8], [-25, 0], [-25, 8]].forEach(([dx, dy]) => {
    ctx.beginPath();
    ctx.moveTo(m.cx - 12, whiskerY + dy);
    ctx.lineTo(m.cx + dx - 60, whiskerY + dy + dx * 0.2);
    ctx.stroke();
  });

  // Whiskers — right side
  [[25, -8], [25, 0], [25, 8]].forEach(([dx, dy]) => {
    ctx.beginPath();
    ctx.moveTo(m.cx + 12, whiskerY + dy);
    ctx.lineTo(m.cx + dx + 60, whiskerY + dy - dx * 0.2);
    ctx.stroke();
  });

  // Mouth
  const mouthY = noseY + 14;
  ctx.beginPath();
  ctx.moveTo(m.cx, mouthY);
  ctx.bezierCurveTo(m.cx - 12, mouthY + 10, m.cx - 22, mouthY + 8, m.cx - 24, mouthY + 4);
  ctx.moveTo(m.cx, mouthY);
  ctx.bezierCurveTo(m.cx + 12, mouthY + 10, m.cx + 22, mouthY + 8, m.cx + 24, mouthY + 4);
  ctx.strokeStyle = "#7B1F22";
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Wide mouth when open
  if (m.mouthOpenRatio > 0.35) {
    ctx.beginPath();
    ctx.ellipse(m.cx, mouthY + earW * 0.15, earW * 0.25, earW * 0.18 * m.mouthOpenRatio, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#7B1F22";
    ctx.fill();
  }

  ctx.restore();
}

import type { FaceMetrics } from "../faceMetrics";

export function drawDogFilter(
  ctx: CanvasRenderingContext2D,
  m: FaceMetrics
): void {
  ctx.save();
  const r = m.faceWidth * 0.5;
  const earTopY = m.cy - m.faceHeight * 0.38;

  // Floppy left ear
  ctx.beginPath();
  ctx.moveTo(m.cx - r * 0.6, earTopY);
  ctx.bezierCurveTo(m.cx - r * 1.4, earTopY + 10, m.cx - r * 1.5, earTopY + 80, m.cx - r * 0.9, earTopY + 120);
  ctx.bezierCurveTo(m.cx - r * 0.5, earTopY + 130, m.cx - r * 0.3, earTopY + 80, m.cx - r * 0.6, earTopY);
  ctx.fillStyle = "#C8A26B";
  ctx.fill();

  // Floppy right ear
  ctx.beginPath();
  ctx.moveTo(m.cx + r * 0.6, earTopY);
  ctx.bezierCurveTo(m.cx + r * 1.4, earTopY + 10, m.cx + r * 1.5, earTopY + 80, m.cx + r * 0.9, earTopY + 120);
  ctx.bezierCurveTo(m.cx + r * 0.5, earTopY + 130, m.cx + r * 0.3, earTopY + 80, m.cx + r * 0.6, earTopY);
  ctx.fillStyle = "#C8A26B";
  ctx.fill();

  // Wet nose — brown oval
  const noseY = m.cy + m.faceHeight * 0.1;
  ctx.beginPath();
  ctx.ellipse(m.cx, noseY, 22, 16, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#5D4037";
  ctx.fill();

  // Nose highlight
  ctx.beginPath();
  ctx.ellipse(m.cx - 6, noseY - 4, 6, 4, 0, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,0.45)";
  ctx.fill();

  // Tongue when mouth opens
  if (m.mouthOpenRatio > 0.3) {
    const tongueY = noseY + 20;
    const tongueLen = 30 + 30 * m.mouthOpenRatio;
    ctx.beginPath();
    ctx.ellipse(m.cx, tongueY + tongueLen / 2, 18, tongueLen / 2, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#FF6B88";
    ctx.fill();
    // Tongue crease
    ctx.beginPath();
    ctx.moveTo(m.cx, tongueY);
    ctx.lineTo(m.cx, tongueY + tongueLen - 8);
    ctx.strokeStyle = "#D81B60";
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  ctx.restore();
}

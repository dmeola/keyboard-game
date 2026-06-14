import type { FaceMetrics } from "../faceMetrics";

export function drawPenguinFilter(
  ctx: CanvasRenderingContext2D,
  m: FaceMetrics
): void {
  ctx.save();
  const r = m.faceWidth * 0.55;

  // Black penguin outer body (circle around face)
  ctx.beginPath();
  ctx.arc(m.cx, m.cy, r, 0, Math.PI * 2);
  ctx.fillStyle = "#1A237E";
  ctx.fill();

  // White belly oval (front of penguin)
  ctx.beginPath();
  ctx.ellipse(m.cx, m.cy + r * 0.1, r * 0.55, r * 0.7, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#ECEFF1";
  ctx.fill();

  // Flippers on sides
  [-1, 1].forEach((side) => {
    ctx.beginPath();
    ctx.ellipse(m.cx + side * r * 0.88, m.cy, r * 0.22, r * 0.55, side * 0.4, 0, Math.PI * 2);
    ctx.fillStyle = "#0D1B6E";
    ctx.fill();
  });

  // Orange beak overlaid on nose area
  const beakY = m.cy + m.faceHeight * 0.06;
  const beakOpen = m.mouthOpenRatio > 0.3 ? m.mouthOpenRatio : 0;
  // Upper beak
  ctx.beginPath();
  ctx.moveTo(m.cx - 14, beakY);
  ctx.lineTo(m.cx + 14, beakY);
  ctx.lineTo(m.cx, beakY - 18);
  ctx.closePath();
  ctx.fillStyle = "#FF8F00";
  ctx.fill();

  if (beakOpen > 0) {
    // Lower beak drops down
    ctx.beginPath();
    ctx.moveTo(m.cx - 12, beakY);
    ctx.lineTo(m.cx + 12, beakY);
    ctx.lineTo(m.cx, beakY + 10 + 14 * beakOpen);
    ctx.closePath();
    ctx.fillStyle = "#E65100";
    ctx.fill();
  }

  // Bow tie at neck
  const tieY = m.cy + r * 0.72;
  ctx.beginPath();
  ctx.moveTo(m.cx, tieY);
  ctx.bezierCurveTo(m.cx - 20, tieY - 12, m.cx - 28, tieY, m.cx, tieY);
  ctx.bezierCurveTo(m.cx - 20, tieY + 12, m.cx - 28, tieY, m.cx, tieY);
  ctx.fillStyle = "#E53935";
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(m.cx, tieY);
  ctx.bezierCurveTo(m.cx + 20, tieY - 12, m.cx + 28, tieY, m.cx, tieY);
  ctx.bezierCurveTo(m.cx + 20, tieY + 12, m.cx + 28, tieY, m.cx, tieY);
  ctx.fillStyle = "#E53935";
  ctx.fill();
  ctx.beginPath();
  ctx.arc(m.cx, tieY, 5, 0, Math.PI * 2);
  ctx.fillStyle = "#B71C1C";
  ctx.fill();

  ctx.restore();
}

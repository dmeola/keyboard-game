import type { FaceMetrics } from "../faceMetrics";

export function drawBalloonFilter(
  ctx: CanvasRenderingContext2D,
  m: FaceMetrics
): void {
  ctx.save();
  const rx = m.faceWidth * 0.56;
  const ry = m.faceHeight * 0.6;

  // Balloon oval body
  ctx.beginPath();
  ctx.ellipse(m.cx, m.cy - ry * 0.05, rx, ry, 0, 0, Math.PI * 2);
  const grad = ctx.createRadialGradient(m.cx - rx * 0.2, m.cy - ry * 0.3, rx * 0.1, m.cx, m.cy, rx);
  grad.addColorStop(0, "#64B5F6");
  grad.addColorStop(1, "#1565C0");
  ctx.fillStyle = grad;
  ctx.fill();

  // Shine highlight
  ctx.beginPath();
  ctx.ellipse(m.cx - rx * 0.3, m.cy - ry * 0.35, rx * 0.18, ry * 0.15, -0.3, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,0.4)";
  ctx.fill();

  // Knot at bottom
  const knotY = m.cy + ry + 4;
  ctx.beginPath();
  ctx.arc(m.cx, knotY, 7, 0, Math.PI * 2);
  ctx.fillStyle = "#0D47A1";
  ctx.fill();

  // String
  ctx.beginPath();
  ctx.moveTo(m.cx, knotY + 7);
  ctx.bezierCurveTo(m.cx + 20, knotY + 40, m.cx - 10, knotY + 70, m.cx + 8, knotY + 100);
  ctx.strokeStyle = "#5C9BD6";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Smiley mouth on balloon
  const mouthY = m.cy + ry * 0.35;
  ctx.beginPath();
  if (m.mouthOpenRatio > 0.3) {
    ctx.ellipse(m.cx, mouthY, rx * 0.28, rx * 0.18 * m.mouthOpenRatio, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#0D47A1";
    ctx.fill();
  } else {
    ctx.arc(m.cx, mouthY - rx * 0.1, rx * 0.25, 0.2, Math.PI - 0.2);
    ctx.strokeStyle = "#0D47A1";
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  ctx.restore();
}

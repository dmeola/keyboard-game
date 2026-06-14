import type { FaceMetrics } from "../faceMetrics";

export function drawAppleFilter(
  ctx: CanvasRenderingContext2D,
  m: FaceMetrics
): void {
  ctx.save();
  const r = m.faceWidth * 0.56;

  // Red apple body
  ctx.beginPath();
  ctx.arc(m.cx, m.cy, r, 0, Math.PI * 2);
  ctx.fillStyle = "#E63946";
  ctx.fill();

  // Shine highlight
  ctx.beginPath();
  ctx.arc(m.cx - r * 0.28, m.cy - r * 0.3, r * 0.2, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,0.35)";
  ctx.fill();

  // Green stem
  ctx.beginPath();
  ctx.moveTo(m.cx, m.cy - r);
  ctx.bezierCurveTo(m.cx + 6, m.cy - r - 22, m.cx + 18, m.cy - r - 28, m.cx + 14, m.cy - r - 38);
  ctx.strokeStyle = "#5D4037";
  ctx.lineWidth = 5;
  ctx.lineCap = "round";
  ctx.stroke();

  // Leaf
  ctx.beginPath();
  ctx.moveTo(m.cx + 6, m.cy - r - 16);
  ctx.bezierCurveTo(m.cx + 24, m.cy - r - 30, m.cx + 36, m.cy - r - 20, m.cx + 20, m.cy - r - 10);
  ctx.bezierCurveTo(m.cx + 12, m.cy - r - 6, m.cx + 2, m.cy - r - 10, m.cx + 6, m.cy - r - 16);
  ctx.fillStyle = "#2D6A4F";
  ctx.fill();

  // Character mouth (opens with mouthOpenRatio)
  const mouthY = m.cy + r * 0.35;
  const mouthW = r * 0.45;
  ctx.beginPath();
  if (m.mouthOpenRatio > 0.3) {
    const openH = mouthW * 0.5 * m.mouthOpenRatio;
    ctx.ellipse(m.cx, mouthY, mouthW, openH, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#7B1F22";
    ctx.fill();
  } else {
    ctx.arc(m.cx, mouthY - mouthW * 0.15, mouthW, 0.15, Math.PI - 0.15);
    ctx.strokeStyle = "#7B1F22";
    ctx.lineWidth = 3.5;
    ctx.stroke();
  }

  // Rosy cheeks
  ctx.globalAlpha = 0.35;
  ctx.beginPath();
  ctx.ellipse(m.cx - r * 0.5, m.cy + r * 0.05, r * 0.2, r * 0.12, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#FF6B6B";
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(m.cx + r * 0.5, m.cy + r * 0.05, r * 0.2, r * 0.12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  ctx.restore();
}

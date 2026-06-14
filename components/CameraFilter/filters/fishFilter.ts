import type { FaceMetrics } from "../faceMetrics";

export function drawFishFilter(
  ctx: CanvasRenderingContext2D,
  m: FaceMetrics
): void {
  ctx.save();
  const rx = m.faceWidth * 0.58;
  const ry = m.faceHeight * 0.52;

  // Fish body (oval)
  ctx.beginPath();
  ctx.ellipse(m.cx, m.cy, rx, ry, 0, 0, Math.PI * 2);
  const grad = ctx.createLinearGradient(m.cx - rx, m.cy, m.cx + rx, m.cy);
  grad.addColorStop(0, "#0288D1");
  grad.addColorStop(1, "#4FC3F7");
  ctx.fillStyle = grad;
  ctx.fill();

  // Triangle tail on the right side
  const tailX = m.cx + rx;
  ctx.beginPath();
  ctx.moveTo(tailX, m.cy);
  ctx.lineTo(tailX + rx * 0.7, m.cy - ry * 0.7);
  ctx.lineTo(tailX + rx * 0.7, m.cy + ry * 0.7);
  ctx.closePath();
  ctx.fillStyle = "#0277BD";
  ctx.fill();

  // Scale pattern (arcs on the body)
  ctx.strokeStyle = "rgba(255,255,255,0.3)";
  ctx.lineWidth = 1.5;
  const scaleRows = 4;
  const scaleCols = 5;
  for (let row = 0; row < scaleRows; row++) {
    for (let col = 0; col < scaleCols; col++) {
      const sx = m.cx - rx * 0.6 + col * rx * 0.28 + (row % 2) * rx * 0.14;
      const sy = m.cy - ry * 0.5 + row * ry * 0.32;
      ctx.beginPath();
      ctx.arc(sx, sy, rx * 0.16, 0, Math.PI);
      ctx.stroke();
    }
  }

  // Top dorsal fin
  ctx.beginPath();
  ctx.moveTo(m.cx - rx * 0.2, m.cy - ry);
  ctx.bezierCurveTo(m.cx, m.cy - ry - 40, m.cx + rx * 0.3, m.cy - ry - 30, m.cx + rx * 0.3, m.cy - ry);
  ctx.fillStyle = "#01579B";
  ctx.fill();

  // Bottom fin
  ctx.beginPath();
  ctx.moveTo(m.cx - rx * 0.1, m.cy + ry);
  ctx.bezierCurveTo(m.cx + rx * 0.1, m.cy + ry + 25, m.cx + rx * 0.3, m.cy + ry + 20, m.cx + rx * 0.3, m.cy + ry);
  ctx.fillStyle = "#0277BD";
  ctx.fill();

  // Mouth (O shape that opens)
  const mouthX = m.cx - rx * 0.65;
  const mouthR = ry * 0.18;
  const openH = m.mouthOpenRatio > 0.2 ? mouthR * m.mouthOpenRatio * 1.5 : mouthR * 0.3;
  ctx.beginPath();
  ctx.ellipse(mouthX, m.cy, mouthR * 0.6, openH, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#01579B";
  ctx.fill();

  ctx.restore();
}

import type { FaceMetrics } from "../faceMetrics";

export function drawStarFilter(
  ctx: CanvasRenderingContext2D,
  m: FaceMetrics
): void {
  ctx.save();
  const outerR = m.faceWidth * 0.72;
  const innerR = outerR * 0.42;
  const points = 5;

  // Five-pointed star around face
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const angle = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
    const r = i % 2 === 0 ? outerR : innerR;
    const x = m.cx + Math.cos(angle) * r;
    const y = m.cy + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();

  const grad = ctx.createRadialGradient(m.cx, m.cy - outerR * 0.2, innerR * 0.2, m.cx, m.cy, outerR);
  grad.addColorStop(0, "#FFF9C4");
  grad.addColorStop(0.5, "#FDD835");
  grad.addColorStop(1, "#F57F17");
  ctx.fillStyle = grad;
  ctx.fill();

  // Gold outline
  ctx.strokeStyle = "#E65100";
  ctx.lineWidth = 3;
  ctx.stroke();

  // Sparkles at star tips
  for (let i = 0; i < points; i++) {
    const angle = (i / points) * Math.PI * 2 - Math.PI / 2;
    const sx = m.cx + Math.cos(angle) * (outerR + 12);
    const sy = m.cy + Math.sin(angle) * (outerR + 12);
    drawSparkle(ctx, sx, sy, 10);
  }

  // Smile inside star
  const smileY = m.cy + innerR * 0.5;
  ctx.beginPath();
  if (m.mouthOpenRatio > 0.3) {
    ctx.ellipse(m.cx, smileY, innerR * 0.4, innerR * 0.22 * m.mouthOpenRatio, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#BF360C";
    ctx.fill();
  } else {
    ctx.arc(m.cx, smileY - innerR * 0.12, innerR * 0.35, 0.2, Math.PI - 0.2);
    ctx.strokeStyle = "#BF360C";
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  ctx.restore();
}

function drawSparkle(ctx: CanvasRenderingContext2D, x: number, y: number, r: number): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = "#FFF9C4";
  for (let i = 0; i < 4; i++) {
    ctx.save();
    ctx.rotate((i / 4) * Math.PI * 2);
    ctx.beginPath();
    ctx.ellipse(0, -r * 0.5, r * 0.15, r * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();
}

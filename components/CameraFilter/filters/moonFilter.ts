import type { FaceMetrics } from "../faceMetrics";

export function drawMoonFilter(
  ctx: CanvasRenderingContext2D,
  m: FaceMetrics
): void {
  ctx.save();
  const r = m.faceWidth * 0.58;

  // Crescent moon: full circle minus offset circle
  ctx.save();
  ctx.beginPath();
  ctx.arc(m.cx, m.cy, r, 0, Math.PI * 2);
  const moonGrad = ctx.createRadialGradient(m.cx - r * 0.2, m.cy - r * 0.2, r * 0.05, m.cx, m.cy, r);
  moonGrad.addColorStop(0, "#FFF9C4");
  moonGrad.addColorStop(1, "#7986CB");
  ctx.fillStyle = moonGrad;
  ctx.fill();

  // Cut out offset circle to create crescent
  ctx.globalCompositeOperation = "destination-out";
  ctx.beginPath();
  ctx.arc(m.cx + r * 0.35, m.cy - r * 0.08, r * 0.78, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(0,0,0,1)";
  ctx.fill();
  ctx.restore();

  // Stars scattered around
  const starPositions: [number, number, number][] = [
    [m.cx + r * 1.4, m.cy - r * 0.8, 8],
    [m.cx + r * 1.7, m.cy + r * 0.2, 5],
    [m.cx - r * 0.3, m.cy - r * 1.4, 6],
    [m.cx - r * 0.8, m.cy - r * 1.2, 4],
    [m.cx + r * 0.6, m.cy - r * 1.5, 5],
    [m.cx + r * 1.3, m.cy - r * 0.2, 3],
    [m.cx - r * 0.2, m.cy + r * 1.2, 4],
  ];

  starPositions.forEach(([sx, sy, sr]) => {
    drawStar(ctx, sx, sy, sr);
  });

  // Smile on the visible crescent part
  const smileX = m.cx - r * 0.2;
  const smileY = m.cy + r * 0.35;
  ctx.beginPath();
  if (m.mouthOpenRatio > 0.3) {
    ctx.ellipse(smileX, smileY, r * 0.18, r * 0.1 * m.mouthOpenRatio, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#3949AB";
    ctx.fill();
  } else {
    ctx.arc(smileX, smileY - r * 0.06, r * 0.16, 0.2, Math.PI - 0.2);
    ctx.strokeStyle = "#3949AB";
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  ctx.restore();
}

function drawStar(ctx: CanvasRenderingContext2D, x: number, y: number, r: number): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const outerAngle = (i / 5) * Math.PI * 2 - Math.PI / 2;
    const innerAngle = outerAngle + Math.PI / 5;
    if (i === 0) ctx.moveTo(Math.cos(outerAngle) * r, Math.sin(outerAngle) * r);
    else ctx.lineTo(Math.cos(outerAngle) * r, Math.sin(outerAngle) * r);
    ctx.lineTo(Math.cos(innerAngle) * r * 0.45, Math.sin(innerAngle) * r * 0.45);
  }
  ctx.closePath();
  ctx.fillStyle = "#FFF9C4";
  ctx.fill();
  ctx.restore();
}

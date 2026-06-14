import type { FaceMetrics } from "../faceMetrics";

export function drawOrangeFilter(
  ctx: CanvasRenderingContext2D,
  m: FaceMetrics
): void {
  ctx.save();
  const r = m.faceWidth * 0.56;

  // Orange circle body
  const grad = ctx.createRadialGradient(m.cx - r * 0.2, m.cy - r * 0.2, r * 0.05, m.cx, m.cy, r);
  grad.addColorStop(0, "#FFCC80");
  grad.addColorStop(1, "#FF9800");
  ctx.beginPath();
  ctx.arc(m.cx, m.cy, r, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();

  // Peel texture: segment lines radiating from center
  ctx.strokeStyle = "rgba(230,115,0,0.5)";
  ctx.lineWidth = 2;
  const segments = 10;
  for (let i = 0; i < segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(m.cx + Math.cos(angle) * r * 0.12, m.cy + Math.sin(angle) * r * 0.12);
    ctx.lineTo(m.cx + Math.cos(angle) * r * 0.95, m.cy + Math.sin(angle) * r * 0.95);
    ctx.stroke();
  }

  // Center navel dot
  ctx.beginPath();
  ctx.arc(m.cx, m.cy, r * 0.1, 0, Math.PI * 2);
  ctx.fillStyle = "#E65100";
  ctx.fill();

  // Green leaves on top
  const leafY = m.cy - r;
  const leafColors = ["#4CAF50", "#388E3C"];
  [[-12, -10], [4, -15]].forEach(([lx, rx2], i) => {
    ctx.beginPath();
    ctx.moveTo(m.cx + lx, leafY);
    ctx.bezierCurveTo(m.cx + lx - 16, leafY - 20, m.cx + lx + rx2 + 8, leafY - 28, m.cx + lx + rx2, leafY - 10);
    ctx.bezierCurveTo(m.cx + lx + rx2 - 4, leafY - 5, m.cx + lx + 2, leafY - 4, m.cx + lx, leafY);
    ctx.fillStyle = leafColors[i];
    ctx.fill();
  });

  // Shine
  ctx.beginPath();
  ctx.arc(m.cx - r * 0.3, m.cy - r * 0.35, r * 0.16, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,0.3)";
  ctx.fill();

  // Smile
  const smileY = m.cy + r * 0.38;
  ctx.beginPath();
  if (m.mouthOpenRatio > 0.3) {
    ctx.ellipse(m.cx, smileY, r * 0.28, r * 0.14 * m.mouthOpenRatio, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#BF360C";
    ctx.fill();
  } else {
    ctx.arc(m.cx, smileY - r * 0.08, r * 0.24, 0.18, Math.PI - 0.18);
    ctx.strokeStyle = "#BF360C";
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  ctx.restore();
}

import type { FaceMetrics } from "../faceMetrics";

export function drawTrainFilter(
  ctx: CanvasRenderingContext2D,
  m: FaceMetrics
): void {
  ctx.save();
  const r = m.faceWidth * 0.52;

  // Circular boiler (red circle around face)
  ctx.beginPath();
  ctx.arc(m.cx, m.cy, r, 0, Math.PI * 2);
  const grad = ctx.createRadialGradient(m.cx - r * 0.2, m.cy - r * 0.2, r * 0.05, m.cx, m.cy, r);
  grad.addColorStop(0, "#FF6B6B");
  grad.addColorStop(1, "#C62828");
  ctx.fillStyle = grad;
  ctx.fill();

  // Boiler bands
  ctx.strokeStyle = "#B71C1C";
  ctx.lineWidth = 5;
  [-1, 0, 1].forEach((offset) => {
    ctx.beginPath();
    ctx.arc(m.cx, m.cy, r - 8 + offset * 16, Math.PI * 0.15, Math.PI * 0.85);
    ctx.stroke();
  });

  // Smokestack on top
  const stackX = m.cx - r * 0.15;
  const stackBaseY = m.cy - r;
  ctx.beginPath();
  ctx.rect(stackX - 12, stackBaseY - 50, 24, 50);
  ctx.fillStyle = "#212121";
  ctx.fill();
  // Flared top
  ctx.beginPath();
  ctx.rect(stackX - 16, stackBaseY - 58, 32, 12);
  ctx.fillStyle = "#424242";
  ctx.fill();

  // Smoke puffs
  if (m.mouthOpenRatio > 0.2) {
    ctx.globalAlpha = 0.6;
    [0, 14, 26].forEach((off) => {
      ctx.beginPath();
      ctx.arc(stackX + Math.sin(off) * 8, stackBaseY - 65 - off * 2, 10 + off * 0.5, 0, Math.PI * 2);
      ctx.fillStyle = "#ECEFF1";
      ctx.fill();
    });
    ctx.globalAlpha = 1;
  }

  // Wheels at the bottom
  const wheelY = m.cy + r + 8;
  const wheelR = 20;
  [-1, 0, 1].forEach((offset) => {
    const wx = m.cx + offset * r * 0.65;
    ctx.beginPath();
    ctx.arc(wx, wheelY, wheelR, 0, Math.PI * 2);
    ctx.fillStyle = "#212121";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(wx, wheelY, wheelR * 0.55, 0, Math.PI * 2);
    ctx.fillStyle = "#E53935";
    ctx.fill();
    // Spokes
    ctx.strokeStyle = "#212121";
    ctx.lineWidth = 2;
    for (let i = 0; i < 4; i++) {
      const sa = (i / 4) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(wx + Math.cos(sa) * wheelR * 0.18, wheelY + Math.sin(sa) * wheelR * 0.18);
      ctx.lineTo(wx + Math.cos(sa) * wheelR * 0.9, wheelY + Math.sin(sa) * wheelR * 0.9);
      ctx.stroke();
    }
  });

  // Headlamp
  ctx.beginPath();
  ctx.arc(m.cx + r * 0.7, m.cy, 14, 0, Math.PI * 2);
  ctx.fillStyle = "#FDD835";
  ctx.fill();
  ctx.beginPath();
  ctx.arc(m.cx + r * 0.7 - 3, m.cy - 3, 5, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.fill();

  ctx.restore();
}

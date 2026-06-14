import type { FaceMetrics } from "../faceMetrics";

export function drawIceCreamFilter(
  ctx: CanvasRenderingContext2D,
  m: FaceMetrics
): void {
  ctx.save();
  const r = m.faceWidth * 0.5;
  const scoopY = m.cy - m.faceHeight * 0.3;

  // Cone (triangle below face)
  const coneTop = m.cy + m.faceHeight * 0.48;
  const coneH = m.faceHeight * 0.55;
  ctx.beginPath();
  ctx.moveTo(m.cx - r * 0.55, coneTop);
  ctx.lineTo(m.cx + r * 0.55, coneTop);
  ctx.lineTo(m.cx, coneTop + coneH);
  ctx.closePath();
  ctx.fillStyle = "#D4A056";
  ctx.fill();

  // Cone waffle lines
  ctx.strokeStyle = "#A0722A";
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 5; i++) {
    const y = coneTop + coneH * (i / 5) * 0.9;
    const spread = (r * 0.55) * (1 - i / 6);
    ctx.beginPath();
    ctx.moveTo(m.cx - spread, y);
    ctx.lineTo(m.cx + spread, y);
    ctx.stroke();
  }

  // Main pink scoop (face area)
  ctx.beginPath();
  ctx.arc(m.cx, scoopY, r * 0.62, 0, Math.PI * 2);
  const scoopGrad = ctx.createRadialGradient(m.cx - r * 0.2, scoopY - r * 0.2, r * 0.05, m.cx, scoopY, r * 0.62);
  scoopGrad.addColorStop(0, "#FFCDD2");
  scoopGrad.addColorStop(1, "#F48FB1");
  ctx.fillStyle = scoopGrad;
  ctx.fill();

  // Second scoop on top
  ctx.beginPath();
  ctx.arc(m.cx - r * 0.12, scoopY - r * 1.05, r * 0.45, 0, Math.PI * 2);
  ctx.fillStyle = "#A5D6A7";
  ctx.fill();

  // Third tiny scoop top
  ctx.beginPath();
  ctx.arc(m.cx + r * 0.2, scoopY - r * 1.4, r * 0.3, 0, Math.PI * 2);
  ctx.fillStyle = "#FFCC80";
  ctx.fill();

  // Drip
  ctx.beginPath();
  ctx.moveTo(m.cx + r * 0.3, scoopY - r * 0.55);
  ctx.bezierCurveTo(m.cx + r * 0.35, scoopY - r * 0.3, m.cx + r * 0.35, scoopY, m.cx + r * 0.3, scoopY + r * 0.1);
  ctx.strokeStyle = "#F48FB1";
  ctx.lineWidth = 6;
  ctx.lineCap = "round";
  ctx.stroke();

  // Sprinkles around
  const sprinkleColors = ["#FF5252", "#FFEB3B", "#69F0AE", "#40C4FF", "#FF4081"];
  for (let i = 0; i < 14; i++) {
    const angle = (i / 14) * Math.PI * 2;
    const sr = r * 0.55 + 10;
    const sx = m.cx + Math.cos(angle) * sr;
    const sy = scoopY + Math.sin(angle) * sr * 0.6;
    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(angle + Math.PI / 4);
    ctx.fillStyle = sprinkleColors[i % sprinkleColors.length];
    ctx.fillRect(-5, -2, 10, 4);
    ctx.restore();
  }

  // Smile that opens
  const smileY = scoopY + r * 0.32;
  ctx.beginPath();
  if (m.mouthOpenRatio > 0.3) {
    ctx.ellipse(m.cx, smileY, r * 0.25, r * 0.15 * m.mouthOpenRatio, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#880E4F";
    ctx.fill();
  } else {
    ctx.arc(m.cx, smileY - r * 0.08, r * 0.22, 0.2, Math.PI - 0.2);
    ctx.strokeStyle = "#880E4F";
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  ctx.restore();
}

import type { FaceMetrics } from "../faceMetrics";

export function drawJellyfishFilter(
  ctx: CanvasRenderingContext2D,
  m: FaceMetrics
): void {
  ctx.save();
  const rx = m.faceWidth * 0.58;
  const ry = m.faceHeight * 0.45;
  const domeTopY = m.cy - m.faceHeight * 0.5;

  // Translucent dome above face
  ctx.beginPath();
  ctx.ellipse(m.cx, domeTopY + ry * 0.7, rx, ry, 0, Math.PI, 0);
  const domeGrad = ctx.createRadialGradient(m.cx, domeTopY + ry * 0.3, rx * 0.1, m.cx, domeTopY + ry * 0.7, rx);
  domeGrad.addColorStop(0, "rgba(206,147,216,0.7)");
  domeGrad.addColorStop(1, "rgba(171,71,188,0.5)");
  ctx.fillStyle = domeGrad;
  ctx.fill();

  // Dome outline
  ctx.strokeStyle = "rgba(171,71,188,0.9)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(m.cx, domeTopY + ry * 0.7, rx, ry, 0, Math.PI, 0);
  ctx.stroke();

  // Inner dome shimmer
  ctx.beginPath();
  ctx.ellipse(m.cx - rx * 0.2, domeTopY + ry * 0.4, rx * 0.3, ry * 0.25, 0, Math.PI, 0);
  ctx.fillStyle = "rgba(255,255,255,0.2)";
  ctx.fill();

  // Tentacles hanging down from bottom of dome
  const tentacleBaseY = m.cy + m.faceHeight * 0.45;
  const tentacleColors = ["#CE93D8", "#AB47BC", "#E040FB", "#BA68C8", "#9C27B0", "#E91E63"];
  const tentacleCount = 8;
  for (let i = 0; i < tentacleCount; i++) {
    const t = i / (tentacleCount - 1);
    const tx = m.cx - rx * 0.85 + t * rx * 1.7;
    const len = 60 + Math.sin(i * 1.3) * 25;
    const sway = Math.sin(i * 0.8) * 20;
    ctx.beginPath();
    ctx.moveTo(tx, tentacleBaseY);
    ctx.bezierCurveTo(tx + sway, tentacleBaseY + len * 0.3, tx - sway * 0.5, tentacleBaseY + len * 0.7, tx + sway * 0.3, tentacleBaseY + len);
    ctx.strokeStyle = tentacleColors[i % tentacleColors.length];
    ctx.lineWidth = 2.5 + (i % 3) * 0.5;
    ctx.globalAlpha = 0.75;
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Dot eyes on dome
  const eyeY = domeTopY + ry * 0.55;
  ctx.beginPath();
  ctx.arc(m.cx - rx * 0.22, eyeY, 6, 0, Math.PI * 2);
  ctx.arc(m.cx + rx * 0.22, eyeY, 6, 0, Math.PI * 2);
  ctx.fillStyle = "#4A148C";
  ctx.fill();

  ctx.restore();
}

import type { FaceMetrics } from "../faceMetrics";
import { foreheadY, faceRx } from "./shared";

export function drawJellyfishFilter(
  ctx: CanvasRenderingContext2D,
  m: FaceMetrics
): void {
  ctx.save();
  const u = m.u;
  const rx = faceRx(m) * 1.25;
  const ry = m.faceHeight * 0.32;
  const rimY = foreheadY(m) + u * 4;

  // Tentacles hang beside the face (outside the face oval), swaying gently
  const tentacleColors = ["#CE93D8", "#AB47BC", "#E040FB", "#BA68C8", "#F48FB1", "#9C27B0"];
  const wiggle = 1 + m.mouthOpenRatio * 1.5;
  const len = m.faceHeight * 0.9;
  [-1, 1].forEach((side) => {
    [52, 59, 66].forEach((offset, i) => {
      const tx = side * u * offset;
      const phase = m.time * 2.2 + i * 1.3 + (side > 0 ? 0.7 : 0);
      const sway = Math.sin(phase) * u * 4 * wiggle;
      ctx.beginPath();
      ctx.moveTo(tx, rimY);
      ctx.bezierCurveTo(
        tx + side * u * 4 + sway, rimY + len * 0.3,
        tx + side * u * 2 - sway, rimY + len * 0.65,
        tx + side * u * 6 + sway * 0.6, rimY + len * (0.85 + i * 0.08)
      );
      ctx.strokeStyle = tentacleColors[(i + (side > 0 ? 3 : 0)) % tentacleColors.length];
      ctx.lineWidth = u * (2.2 - i * 0.4);
      ctx.lineCap = "round";
      ctx.globalAlpha = 0.8;
      ctx.stroke();
    });
  });
  ctx.globalAlpha = 1;

  // Translucent dome sitting on the head like a hat
  ctx.beginPath();
  ctx.ellipse(0, rimY, rx, ry, 0, Math.PI, 0);
  // Scalloped rim
  const scallops = 9;
  for (let i = 0; i < scallops; i++) {
    const x1 = rx - (i / scallops) * rx * 2;
    const x2 = rx - ((i + 1) / scallops) * rx * 2;
    ctx.quadraticCurveTo((x1 + x2) / 2, rimY + u * 5, x2, rimY);
  }
  ctx.closePath();
  const domeGrad = ctx.createRadialGradient(0, rimY - ry * 0.6, rx * 0.1, 0, rimY - ry * 0.3, rx);
  domeGrad.addColorStop(0, "rgba(243,229,245,0.85)");
  domeGrad.addColorStop(1, "rgba(171,71,188,0.7)");
  ctx.fillStyle = domeGrad;
  ctx.fill();
  ctx.strokeStyle = "rgba(123,31,162,0.9)";
  ctx.lineWidth = u * 1.5;
  ctx.stroke();

  // Inner shimmer
  ctx.beginPath();
  ctx.ellipse(-rx * 0.3, rimY - ry * 0.6, rx * 0.22, ry * 0.18, -0.4, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,0.45)";
  ctx.fill();

  // Glowing spots that pulse
  const glow = 0.5 + Math.sin(m.time * 3) * 0.25;
  ctx.fillStyle = `rgba(255,128,171,${glow})`;
  [[-0.45, -0.3], [0.1, -0.55], [0.5, -0.25]].forEach(([fx, fy]) => {
    ctx.beginPath();
    ctx.arc(rx * fx, rimY + ry * fy, u * 3, 0, Math.PI * 2);
    ctx.fill();
  });

  // Cute dot eyes and a smile on the dome
  const eyeY = rimY - ry * 0.35;
  ctx.fillStyle = "#4A148C";
  [-1, 1].forEach((side) => {
    ctx.beginPath();
    ctx.arc(side * rx * 0.22, eyeY, u * 2.4, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.beginPath();
  ctx.arc(0, eyeY + u * 2, u * 4, 0.2, Math.PI - 0.2);
  ctx.strokeStyle = "#4A148C";
  ctx.lineWidth = u * 1.2;
  ctx.stroke();

  ctx.restore();
}

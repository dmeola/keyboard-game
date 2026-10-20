import type { FaceMetrics } from "../faceMetrics";
import { headTop } from "./shared";

export function drawDogFilter(
  ctx: CanvasRenderingContext2D,
  m: FaceMetrics
): void {
  ctx.save();
  const u = m.u;
  const top = headTop(m);
  const { nose, mouth } = m;
  const open = Math.min(1, Math.max(0, (m.mouthOpenRatio - 0.3) / 0.5));

  // Floppy ears hanging beside the head — they flap out when the mouth opens
  [-1, 1].forEach((s) => {
    const ax = s * u * 30;
    const ay = top + u * 12;
    ctx.save();
    ctx.translate(ax, ay);
    ctx.rotate(-s * (Math.sin(m.time * 2) * 0.04 + open * 0.18));
    ctx.translate(-ax, -ay);

    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.bezierCurveTo(s * u * 58, top + u * 2, s * u * 80, top + u * 60, s * u * 66, top + u * 92);
    ctx.bezierCurveTo(s * u * 58, top + u * 104, s * u * 44, top + u * 96, s * u * 46, top + u * 62);
    ctx.bezierCurveTo(s * u * 46, top + u * 40, s * u * 40, top + u * 22, ax, ay);
    ctx.closePath();
    ctx.fillStyle = "#8D6E63";
    ctx.fill();
    ctx.strokeStyle = "#5D4037";
    ctx.lineWidth = u * 1.5;
    ctx.stroke();

    // Lighter inner fur
    ctx.beginPath();
    ctx.ellipse(s * u * 58, top + u * 66, u * 6, u * 18, s * -0.2, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,224,178,0.35)";
    ctx.fill();
    ctx.restore();
  });

  // Muzzle line from nose to mouth
  ctx.beginPath();
  ctx.moveTo(nose.x, nose.y + u * 5);
  ctx.lineTo(mouth.x, mouth.y - u * 4);
  ctx.strokeStyle = "rgba(62,39,35,0.7)";
  ctx.lineWidth = u * 1;
  ctx.lineCap = "round";
  ctx.stroke();

  // Wet nose
  ctx.beginPath();
  ctx.ellipse(nose.x, nose.y, u * 9, u * 6.5, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#3E2723";
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(nose.x - u * 3, nose.y - u * 2.5, u * 3, u * 1.8, 0, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.fill();

  // Tongue when the mouth opens
  if (open > 0) {
    const len = u * 12 + u * 14 * open;
    ctx.beginPath();
    ctx.ellipse(mouth.x, mouth.y + len / 2, u * 7.5, len / 2, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#FF6B88";
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(mouth.x, mouth.y + u * 2);
    ctx.lineTo(mouth.x, mouth.y + len - u * 4);
    ctx.strokeStyle = "#D81B60";
    ctx.lineWidth = u * 1.2;
    ctx.stroke();
  }

  ctx.restore();
}

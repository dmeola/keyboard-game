import type { FaceMetrics } from "../faceMetrics";
import { chinY, faceRx, headTop } from "./shared";

const SEGMENT_COLORS = ["#AB47BC", "#7B1FA2", "#CE93D8", "#6A1B9A", "#BA68C8", "#9C27B0", "#E040FB", "#8E24AA"];

export function drawUmbrellaFilter(
  ctx: CanvasRenderingContext2D,
  m: FaceMetrics
): void {
  ctx.save();
  const u = m.u;

  // The shaft leans in from beside the face so it never crosses it
  const handleX = faceRx(m) + u * 25;
  const handleY = chinY(m) - u * 2;
  const topX = faceRx(m) + u * 5;
  const topY = headTop(m) + u * 5;
  const tilt = Math.atan2(topX - handleX, handleY - topY);
  const r = u * 78;

  // Shaft
  ctx.beginPath();
  ctx.moveTo(topX, topY);
  ctx.lineTo(handleX, handleY);
  ctx.strokeStyle = "#4A148C";
  ctx.lineWidth = u * 2.5;
  ctx.lineCap = "round";
  ctx.stroke();

  // J-hook handle curling outward
  ctx.beginPath();
  ctx.moveTo(handleX, handleY);
  ctx.bezierCurveTo(handleX, handleY + u * 14, handleX + u * 16, handleY + u * 14, handleX + u * 16, handleY + u * 4);
  ctx.strokeStyle = "#6D4C41";
  ctx.lineWidth = u * 4;
  ctx.stroke();

  // Canopy, drawn in its own tilted frame. Mouth open → it spins.
  ctx.save();
  ctx.translate(topX, topY);
  ctx.rotate(tilt);
  const spin = m.mouthOpenRatio > 0.3 ? Math.floor(m.time * 10) : 0;
  const segs = SEGMENT_COLORS.length;
  for (let i = 0; i < segs; i++) {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, r, Math.PI + (i / segs) * Math.PI, Math.PI + ((i + 1) / segs) * Math.PI);
    ctx.closePath();
    ctx.fillStyle = SEGMENT_COLORS[(i + spin) % segs];
    ctx.fill();
  }

  // Ribs
  ctx.strokeStyle = "rgba(74,20,140,0.6)";
  ctx.lineWidth = u;
  for (let i = 1; i < segs; i++) {
    const a = Math.PI + (i / segs) * Math.PI;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    ctx.stroke();
  }

  // Outline
  ctx.beginPath();
  ctx.arc(0, 0, r, Math.PI, 0);
  ctx.strokeStyle = "#4A148C";
  ctx.lineWidth = u * 2;
  ctx.stroke();

  // Scalloped edge
  const scallops = 8;
  const sr = r / scallops;
  ctx.fillStyle = "#F3E5F5";
  for (let i = 0; i < scallops; i++) {
    ctx.beginPath();
    ctx.arc(-r + sr + i * sr * 2, 0, sr, 0, Math.PI);
    ctx.fill();
  }

  // Tip
  ctx.beginPath();
  ctx.arc(0, -r - u * 3, u * 3, 0, Math.PI * 2);
  ctx.fillStyle = "#4A148C";
  ctx.fill();
  ctx.restore();

  // Rain falling outside the umbrella: on the open side of the face,
  // and onto the canopy from above
  ctx.fillStyle = "#81D4FA";
  const drop = (x: number, y: number) => {
    ctx.beginPath();
    ctx.ellipse(x, y, u * 1.4, u * 3.5, 0, 0, Math.PI * 2);
    ctx.fill();
  };
  const sideTop = topY + Math.sin(Math.PI + tilt) * r;
  for (let i = 0; i < 6; i++) {
    const x = -faceRx(m) - u * (12 + (i % 3) * 14);
    const range = handleY + u * 20 - sideTop;
    const y = sideTop + ((m.time * u * 90 + i * range * 0.37) % range);
    drop(x, y);
  }
  for (let i = 0; i < 6; i++) {
    const x = topX - r * 0.8 + (i / 5) * r * 1.6;
    const dx = x - topX;
    const canopyY = topY - Math.sqrt(Math.max(0, r * r - dx * dx)) + dx * Math.tan(tilt) - u * 4;
    const start = canopyY - u * 60;
    const y = start + ((m.time * u * 90 + i * u * 23) % (canopyY - start));
    drop(x, y);
  }

  ctx.restore();
}

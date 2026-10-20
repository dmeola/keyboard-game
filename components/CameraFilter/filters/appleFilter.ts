import type { FaceMetrics } from "../faceMetrics";
import { chinY, drawBlush, faceOvalSubpath, faceRx, fillWithFaceHole, headTop } from "./shared";

/** Adds an apple outline (two lobes on top, dimple at the bottom) to the current path */
function appleOutline(ctx: CanvasRenderingContext2D, m: FaceMetrics, w: number, top: number, bottom: number): void {
  const u = m.u;
  const dip = top + u * 10;
  const mid = -u * 5;
  ctx.moveTo(0, dip);
  ctx.bezierCurveTo(w * 0.3, top - u * 4, w * 1.05, top - u * 2, w * 1.02, mid);
  ctx.bezierCurveTo(w * 1.0, bottom * 0.6, w * 0.6, bottom, w * 0.25, bottom);
  ctx.quadraticCurveTo(0, bottom - u * 6, -w * 0.25, bottom);
  ctx.bezierCurveTo(-w * 0.6, bottom, -w * 1.0, bottom * 0.6, -w * 1.02, mid);
  ctx.bezierCurveTo(-w * 1.05, top - u * 2, -w * 0.3, top - u * 4, 0, dip);
  ctx.closePath();
}

export function drawAppleFilter(
  ctx: CanvasRenderingContext2D,
  m: FaceMetrics
): void {
  ctx.save();
  const u = m.u;
  const w = faceRx(m) * 1.55;
  const top = headTop(m) - u * 6;
  const bottom = chinY(m) + u * 24;
  const dip = top + u * 10;
  const open = Math.min(1, Math.max(0, (m.mouthOpenRatio - 0.3) / 0.5));

  // Worm peeking out of the apple when the mouth opens (drawn first so it comes out from behind)
  if (open > 0) {
    const holeX = w * 0.98;
    const holeY = u * 12;
    const wob = Math.sin(m.time * 6) * u * 1.5;
    for (let i = 3; i >= 0; i--) {
      const t = (i / 3) * open;
      ctx.beginPath();
      ctx.arc(holeX + t * u * 18, holeY - t * u * 10 + Math.sin(i + m.time * 6) * u * 1.2, u * 4.2, 0, Math.PI * 2);
      ctx.fillStyle = i === 3 ? "#9CCC65" : "#8BC34A";
      ctx.fill();
    }
    // Worm eyes
    const hx = holeX + open * u * 18;
    const hy = holeY - open * u * 10 + wob;
    ctx.fillStyle = "#1B1B1B";
    ctx.beginPath();
    ctx.arc(hx - u * 1.4, hy - u * 1.2, u * 0.9, 0, Math.PI * 2);
    ctx.arc(hx + u * 1.6, hy - u * 1.2, u * 0.9, 0, Math.PI * 2);
    ctx.fill();
  }

  // Red apple frame with the child's face showing through
  const grad = ctx.createRadialGradient(-w * 0.3, -w * 0.4, u * 5, 0, 0, w * 1.3);
  grad.addColorStop(0, "#FF6B6B");
  grad.addColorStop(0.55, "#E63946");
  grad.addColorStop(1, "#A4161A");
  fillWithFaceHole(ctx, m, () => appleOutline(ctx, m, w, top, bottom), grad, 1.02);

  // Outline + soft inner rim around the face
  ctx.beginPath();
  appleOutline(ctx, m, w, top, bottom);
  ctx.strokeStyle = "#8B1A1A";
  ctx.lineWidth = u * 1.5;
  ctx.stroke();
  ctx.beginPath();
  faceOvalSubpath(ctx, m, 1.02);
  ctx.strokeStyle = "rgba(255,255,255,0.55)";
  ctx.lineWidth = u * 1.5;
  ctx.stroke();

  // Shine highlight on the frame
  ctx.beginPath();
  ctx.ellipse(-w * 0.82, -u * 30, u * 5, u * 13, 0.35, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,0.45)";
  ctx.fill();
  ctx.beginPath();
  ctx.arc(-w * 0.78, -u * 12, u * 2.2, 0, Math.PI * 2);
  ctx.fill();

  // Brown stem
  ctx.beginPath();
  ctx.moveTo(0, dip + u * 2);
  ctx.bezierCurveTo(u * 1, dip - u * 8, u * 4, dip - u * 14, u * 6, dip - u * 18);
  ctx.strokeStyle = "#5D4037";
  ctx.lineWidth = u * 4;
  ctx.lineCap = "round";
  ctx.stroke();

  // Leaf
  ctx.beginPath();
  ctx.moveTo(u * 3, dip - u * 12);
  ctx.bezierCurveTo(u * 18, dip - u * 28, u * 32, dip - u * 20, u * 22, dip - u * 8);
  ctx.bezierCurveTo(u * 14, dip - u * 4, u * 5, dip - u * 6, u * 3, dip - u * 12);
  ctx.fillStyle = "#2D6A4F";
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(u * 4, dip - u * 11);
  ctx.quadraticCurveTo(u * 15, dip - u * 17, u * 24, dip - u * 12);
  ctx.strokeStyle = "rgba(255,255,255,0.35)";
  ctx.lineWidth = u * 0.8;
  ctx.stroke();

  // Rosy cheeks
  drawBlush(ctx, m);

  ctx.restore();
}

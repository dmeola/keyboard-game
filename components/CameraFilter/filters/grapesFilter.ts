import type { FaceMetrics } from "../faceMetrics";
import { faceRx, faceRy } from "./shared";

function drawGrape(ctx: CanvasRenderingContext2D, u: number, x: number, y: number, r: number): void {
  // Shadow
  ctx.beginPath();
  ctx.arc(x + u * 1, y + u * 1.2, r, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(74,20,140,0.35)";
  ctx.fill();

  const grad = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
  grad.addColorStop(0, "#CE93D8");
  grad.addColorStop(1, "#6A1B9A");
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();

  ctx.beginPath();
  ctx.arc(x - r * 0.35, y - r * 0.4, r * 0.2, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.fill();
}

/** Vine leaf: three rounded lobes and a vein, pointing along `rot` */
function drawLeaf(ctx: CanvasRenderingContext2D, u: number, x: number, y: number, size: number, rot: number): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(-size * 0.7, -size * 0.1, -size * 0.6, -size * 0.8, -size * 0.2, -size * 0.75);
  ctx.quadraticCurveTo(0, -size * 1.15, size * 0.2, -size * 0.75);
  ctx.bezierCurveTo(size * 0.6, -size * 0.8, size * 0.7, -size * 0.1, 0, 0);
  ctx.fillStyle = "#43A047";
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, -size * 0.85);
  ctx.strokeStyle = "rgba(255,255,255,0.4)";
  ctx.lineWidth = u * 0.8;
  ctx.stroke();
  ctx.restore();
}

export function drawGrapesFilter(
  ctx: CanvasRenderingContext2D,
  m: FaceMetrics
): void {
  ctx.save();
  const u = m.u;
  const cy0 = m.faceHeight * 0.02;
  const rx = faceRx(m) + u * 6;
  const ry = faceRy(m) + u * 8;
  const open = Math.min(1, Math.max(0, (m.mouthOpenRatio - 0.3) / 0.5));
  // Grapes jiggle gently — more when the mouth opens
  const jiggle = (i: number) => Math.sin(m.time * 4 + i * 1.3) * u * 0.6 * (1 + 3 * open);

  // Leaves peeking out behind the wreath
  [
    { a: Math.PI * 1.5, rot: 0 },
    { a: Math.PI * 1.3, rot: -0.7 },
    { a: Math.PI * 1.7, rot: 0.7 },
  ].forEach(({ a, rot }) => {
    drawLeaf(ctx, u, Math.cos(a) * (rx + u * 12), cy0 + Math.sin(a) * (ry + u * 12), u * 20, rot);
  });

  // Curly tendril on the top-left
  const tx = Math.cos(Math.PI * 1.38) * (rx + u * 16);
  const ty = cy0 + Math.sin(Math.PI * 1.38) * (ry + u * 16);
  ctx.beginPath();
  ctx.moveTo(tx, ty);
  ctx.quadraticCurveTo(tx - u * 8, ty - u * 10, tx - u * 2, ty - u * 14);
  ctx.quadraticCurveTo(tx + u * 4, ty - u * 16, tx + u * 2, ty - u * 10);
  ctx.quadraticCurveTo(tx, ty - u * 8, tx - u * 1, ty - u * 10);
  ctx.strokeStyle = "#66BB6A";
  ctx.lineWidth = u * 1.2;
  ctx.lineCap = "round";
  ctx.stroke();

  // Wreath of grapes around the top of the head: back row, then front row
  let idx = 0;
  [
    { offset: u * 9, count: 9, r: u * 6.5, from: Math.PI * 1.12, to: Math.PI * 1.88 },
    { offset: 0, count: 11, r: u * 7, from: Math.PI * 1.04, to: Math.PI * 1.96 },
  ].forEach(({ offset, count, r, from, to }) => {
    for (let i = 0; i < count; i++) {
      const a = from + (i / (count - 1)) * (to - from);
      drawGrape(ctx, u, Math.cos(a) * (rx + offset), cy0 + Math.sin(a) * (ry + offset) + jiggle(idx), r);
      idx++;
    }
  });

  // A little bunch hanging beside the right ear
  const bx = faceRx(m) + u * 16;
  const by = -u * 4;
  ctx.beginPath();
  ctx.moveTo(bx, by - u * 8);
  ctx.quadraticCurveTo(bx - u * 4, by - u * 14, bx - u * 9, by - u * 12);
  ctx.strokeStyle = "#5D4037";
  ctx.lineWidth = u * 1.6;
  ctx.stroke();
  [3, 2, 1].forEach((n, row) => {
    for (let i = 0; i < n; i++) {
      const gx = bx + (i - (n - 1) / 2) * u * 9.5;
      drawGrape(ctx, u, gx, by + row * u * 8.5 + jiggle(idx), u * 5.5);
      idx++;
    }
  });

  ctx.restore();
}

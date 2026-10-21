import type { FaceMetrics } from "../faceMetrics";
import { faceOvalSubpath, faceRx, faceRy, headTop } from "./shared";

/** Scalloped fan fin spreading from (x, y) toward `dir` */
function drawFin(
  ctx: CanvasRenderingContext2D,
  u: number,
  x: number,
  y: number,
  dir: number,
  radius: number,
  spread: number
): void {
  const rays = 5;
  const at = (a: number, r: number) => ({ x: x + Math.cos(a) * r, y: y + Math.sin(a) * r });

  ctx.beginPath();
  ctx.moveTo(x, y);
  const start = at(dir - spread, radius);
  ctx.lineTo(start.x, start.y);
  for (let i = 0; i < rays; i++) {
    const a0 = dir - spread + ((i + 0.5) / rays) * spread * 2;
    const a1 = dir - spread + ((i + 1) / rays) * spread * 2;
    const c = at(a0, radius * 0.86);
    const e = at(a1, radius);
    ctx.quadraticCurveTo(c.x, c.y, e.x, e.y);
  }
  ctx.closePath();
  const grad = ctx.createRadialGradient(x, y, radius * 0.1, x, y, radius);
  grad.addColorStop(0, "#FFB74D");
  grad.addColorStop(1, "#FB8C00");
  ctx.fillStyle = grad;
  ctx.fill();

  // Fin rays
  ctx.strokeStyle = "rgba(255,255,255,0.5)";
  ctx.lineWidth = u * 1;
  for (let i = 0; i <= rays; i++) {
    const e = at(dir - spread + (i / rays) * spread * 2, radius * 0.95);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(e.x, e.y);
    ctx.stroke();
  }
}

function drawBubble(ctx: CanvasRenderingContext2D, u: number, x: number, y: number, r: number, alpha: number): void {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(225,245,255,${0.18 * alpha})`;
  ctx.fill();
  ctx.strokeStyle = `rgba(255,255,255,${0.85 * alpha})`;
  ctx.lineWidth = u * 1;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x - r * 0.35, y - r * 0.35, r * 0.22, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(255,255,255,${0.9 * alpha})`;
  ctx.fill();
}

export function drawFishFilter(
  ctx: CanvasRenderingContext2D,
  m: FaceMetrics
): void {
  ctx.save();
  const u = m.u;
  const open = Math.min(1, Math.max(0, (m.mouthOpenRatio - 0.25) / 0.5));
  const wave = Math.sin(m.time * 3) * 0.08;

  // Side fins and a dorsal fin on top — clipped so they never cover the face
  ctx.save();
  ctx.beginPath();
  ctx.rect(-m.faceWidth * 3, -m.faceHeight * 3, m.faceWidth * 6, m.faceHeight * 6);
  faceOvalSubpath(ctx, m);
  ctx.clip("evenodd");
  drawFin(ctx, u, -(faceRx(m) - u * 4), u * 8, Math.PI - wave, u * 34, 0.6);
  drawFin(ctx, u, faceRx(m) - u * 4, u * 8, wave, u * 34, 0.6);
  drawFin(ctx, u, 0, headTop(m) + u * 14, -Math.PI / 2 + wave * 0.5, u * 30, 0.7);
  ctx.restore();

  // A little goldfish swimming around the head
  const orbitRx = faceRx(m) + u * 26;
  const orbitRy = faceRy(m) + u * 16;
  const a = m.time * 0.9;
  const fx = Math.cos(a) * orbitRx;
  const fy = Math.sin(a) * orbitRy + m.faceHeight * 0.02;
  const heading = Math.atan2(Math.cos(a) * orbitRy, -Math.sin(a) * orbitRx);
  ctx.save();
  ctx.translate(fx, fy);
  ctx.rotate(heading);
  if (Math.cos(heading) < 0) ctx.scale(1, -1);
  const tailWag = Math.sin(m.time * 12) * u * 1.2;
  ctx.beginPath();
  ctx.moveTo(-u * 8, 0);
  ctx.lineTo(-u * 16, -u * 6 + tailWag);
  ctx.lineTo(-u * 16, u * 6 + tailWag);
  ctx.closePath();
  ctx.fillStyle = "#FF7043";
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(0, 0, u * 10, u * 6, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#FF8A65";
  ctx.fill();
  ctx.beginPath();
  ctx.arc(u * 5, -u * 1.5, u * 1.4, 0, Math.PI * 2);
  ctx.fillStyle = "#1B1B1B";
  ctx.fill();
  ctx.restore();

  // Idle bubbles drifting up beside the left fin
  for (let i = 0; i < 3; i++) {
    const phase = (m.time * 0.35 + i / 3) % 1;
    const bx = -(faceRx(m) + u * 22) + Math.sin(phase * 6 + i) * u * 4;
    const by = u * 10 - phase * u * 90;
    drawBubble(ctx, u, bx, by, u * (2 + phase * 2.5), 1 - phase);
  }

  // Bubbles rising from the mouth when it opens
  if (open > 0) {
    const count = 6;
    for (let i = 0; i < count; i++) {
      const phase = (m.time * 0.7 + i / count) % 1;
      const bx = m.mouth.x + Math.sin(phase * 7 + i * 1.9) * u * 7 + (i % 2 === 0 ? -u * 3 : u * 3);
      const by = m.mouth.y - u * 6 - phase * u * 95;
      drawBubble(ctx, u, bx, by, u * (2.5 + phase * 4 + (i % 3)), (1 - phase) * open);
    }
  }

  ctx.restore();
}

import type { FaceMetrics } from "../faceMetrics";
import { chinY, faceRx, foreheadY } from "./shared";

/** Striped railway conductor cap sitting on top of the head */
function drawConductorCap(ctx: CanvasRenderingContext2D, m: FaceMetrics): void {
  const u = m.u;
  const bottom = foreheadY(m) - u * 2;
  const top = bottom - u * 30;

  const capShape = () => {
    ctx.beginPath();
    ctx.moveTo(-u * 38, bottom);
    ctx.lineTo(-u * 42, top + u * 8);
    ctx.quadraticCurveTo(0, top - u * 6, u * 42, top + u * 8);
    ctx.lineTo(u * 38, bottom);
    ctx.closePath();
  };

  capShape();
  ctx.fillStyle = "#1E3A8A";
  ctx.fill();

  // Hickory pinstripes
  ctx.save();
  capShape();
  ctx.clip();
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  for (let x = -u * 44; x < u * 44; x += u * 6) {
    ctx.fillRect(x, top - u * 8, u * 1.8, bottom - top + u * 8);
  }
  ctx.restore();

  // Band and badge
  ctx.fillStyle = "#0F172A";
  ctx.fillRect(-u * 38, bottom - u * 7, u * 76, u * 7);
  ctx.beginPath();
  ctx.ellipse(0, bottom - u * 3.5, u * 6, u * 4.5, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#FBC02D";
  ctx.fill();
  ctx.strokeStyle = "#F57F17";
  ctx.lineWidth = u;
  ctx.stroke();

  // Brim
  ctx.beginPath();
  ctx.ellipse(0, bottom, u * 40, u * 9, 0, 0, Math.PI);
  ctx.fillStyle = "#0F172A";
  ctx.fill();
}

/** Little steam locomotive chugging beside the face */
function drawLocomotive(ctx: CanvasRenderingContext2D, m: FaceMetrics): void {
  const u = m.u;
  const ox = faceRx(m) + u * 14;
  const rail = chinY(m) - u * 5;
  const chug = Math.sin(m.time * 14) * u * 1.2;

  // Track with sleepers
  ctx.fillStyle = "#6D4C41";
  for (let x = ox - u * 4; x < ox + u * 70; x += u * 8) {
    ctx.fillRect(x, rail, u * 4, u * 3);
  }
  ctx.fillStyle = "#757575";
  ctx.fillRect(ox - u * 6, rail - u * 0.5, u * 76, u * 1.5);

  // Wheels with turning spokes
  const wheelR = u * 7;
  const spin = m.time * 6;
  [12, 30, 48].forEach((wx) => {
    const cx = ox + u * wx;
    const cy = rail - wheelR;
    ctx.beginPath();
    ctx.arc(cx, cy, wheelR, 0, Math.PI * 2);
    ctx.fillStyle = "#212121";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx, cy, wheelR * 0.6, 0, Math.PI * 2);
    ctx.fillStyle = "#E53935";
    ctx.fill();
    ctx.strokeStyle = "#212121";
    ctx.lineWidth = u * 0.9;
    for (let i = 0; i < 4; i++) {
      const a = spin + (i / 4) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(a) * wheelR * 0.85, cy + Math.sin(a) * wheelR * 0.85);
      ctx.stroke();
    }
  });

  const by = rail - u * 14 + chug;

  // Cab with window and roof
  ctx.fillStyle = "#B71C1C";
  ctx.fillRect(ox + u * 2, by - u * 32, u * 22, u * 32);
  ctx.fillStyle = "#FFF59D";
  ctx.fillRect(ox + u * 7, by - u * 27, u * 11, u * 10);
  ctx.fillStyle = "#212121";
  ctx.fillRect(ox, by - u * 36, u * 26, u * 5);

  // Boiler
  ctx.beginPath();
  ctx.roundRect(ox + u * 20, by - u * 20, u * 42, u * 20, u * 6);
  const grad = ctx.createLinearGradient(0, by - u * 20, 0, by);
  grad.addColorStop(0, "#FF6B6B");
  grad.addColorStop(1, "#C62828");
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.fillStyle = "#FBC02D";
  [32, 44].forEach((bx) => ctx.fillRect(ox + u * bx, by - u * 20, u * 2, u * 20));

  // Chimney
  ctx.fillStyle = "#212121";
  ctx.fillRect(ox + u * 50, by - u * 34, u * 7, u * 14);
  ctx.fillRect(ox + u * 48, by - u * 38, u * 11, u * 4);

  // Headlamp and cowcatcher
  ctx.beginPath();
  ctx.arc(ox + u * 62, by - u * 14, u * 3, 0, Math.PI * 2);
  ctx.fillStyle = "#FFEB3B";
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(ox + u * 58, by);
  ctx.lineTo(ox + u * 68, rail);
  ctx.lineTo(ox + u * 58, rail);
  ctx.closePath();
  ctx.fillStyle = "#424242";
  ctx.fill();

  // Steam — a gentle wisp, or big puffs when the mouth opens
  const open = m.mouthOpenRatio > 0.25;
  const puffs = open ? 6 : 2;
  const chimneyX = ox + u * 53.5;
  const chimneyY = by - u * 40;
  for (let i = 0; i < puffs; i++) {
    const p = (m.time * (open ? 1.2 : 0.6) + i / puffs) % 1;
    const r = u * (3 + p * 9) * (open ? 1 + m.mouthOpenRatio : 0.7);
    ctx.globalAlpha = (1 - p) * (open ? 0.85 : 0.5);
    ctx.beginPath();
    ctx.arc(chimneyX - p * u * 16, chimneyY - p * u * 40, r, 0, Math.PI * 2);
    ctx.fillStyle = "#ECEFF1";
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

export function drawTrainFilter(
  ctx: CanvasRenderingContext2D,
  m: FaceMetrics
): void {
  ctx.save();
  drawLocomotive(ctx, m);
  drawConductorCap(ctx, m);
  ctx.restore();
}

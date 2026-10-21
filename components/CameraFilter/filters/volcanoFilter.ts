import type { FaceMetrics } from "../faceMetrics";
import { drawCloud, foreheadY } from "./shared";

export function drawVolcanoFilter(
  ctx: CanvasRenderingContext2D,
  m: FaceMetrics
): void {
  ctx.save();
  const u = m.u;

  // Volcano hat sitting on top of the head
  const baseY = foreheadY(m) - u * 6;
  const craterY = baseY - u * 42;
  const baseHalf = u * 50;
  const craterHalf = u * 16;
  const open = m.mouthOpenRatio > 0.25;
  const power = open ? m.mouthOpenRatio : 0;

  // Smoke — a lazy wisp, or a big plume during an eruption
  const puffs = open ? 5 : 2;
  for (let i = 0; i < puffs; i++) {
    const p = (m.time * (open ? 0.9 : 0.35) + i / puffs) % 1;
    const r = u * (6 + p * 14) * (open ? 1 + power : 0.6);
    ctx.globalAlpha = (1 - p) * (open ? 0.7 : 0.45);
    drawCloud(ctx, Math.sin(p * 5 + i) * u * 6, craterY - u * 8 - p * u * (open ? 70 : 35), r, "#B0BEC5");
  }
  ctx.globalAlpha = 1;

  // Rocky cone
  ctx.beginPath();
  ctx.moveTo(-craterHalf, craterY);
  ctx.lineTo(craterHalf, craterY);
  ctx.quadraticCurveTo(u * 30, baseY - u * 18, baseHalf, baseY);
  ctx.quadraticCurveTo(0, baseY + u * 8, -baseHalf, baseY);
  ctx.quadraticCurveTo(-u * 30, baseY - u * 18, -craterHalf, craterY);
  ctx.closePath();
  const rock = ctx.createLinearGradient(-baseHalf, 0, baseHalf, 0);
  rock.addColorStop(0, "#795548");
  rock.addColorStop(0.5, "#5D4037");
  rock.addColorStop(1, "#6D4C41");
  ctx.fillStyle = rock;
  ctx.fill();

  // Rocky bumps
  ctx.fillStyle = "#4E342E";
  ([[-30, -6, 6], [26, -8, 5], [-12, -20, 4], [12, -26, 3.5]] as const).forEach(([bx, by, br]) => {
    ctx.beginPath();
    ctx.arc(u * bx, baseY + u * by, u * br, Math.PI, 0);
    ctx.fill();
  });

  // Lava drips down the sides
  ctx.fillStyle = "#FF6D00";
  ([[-10, 22], [3, 32], [11, 16]] as const).forEach(([lx, len]) => {
    const x = u * lx;
    const l = u * len * (1 + power * 0.5);
    ctx.beginPath();
    ctx.moveTo(x - u * 3, craterY);
    ctx.bezierCurveTo(x - u * 4, craterY + l * 0.5, x + u * 2, craterY + l * 0.8, x + u, craterY + l);
    ctx.bezierCurveTo(x + u * 4, craterY + l * 0.8, x + u * 6, craterY + l * 0.5, x + u * 4, craterY);
    ctx.closePath();
    ctx.fill();
  });

  // Crater with a pulsing lava glow
  ctx.beginPath();
  ctx.ellipse(0, craterY, craterHalf, u * 5, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#3E2723";
  ctx.fill();
  const glow = 0.75 + Math.sin(m.time * 5) * 0.25;
  const lava = ctx.createRadialGradient(0, craterY, 0, 0, craterY, craterHalf);
  lava.addColorStop(0, "#FFEB3B");
  lava.addColorStop(0.5, "#FF9100");
  lava.addColorStop(1, "rgba(255,61,0,0)");
  ctx.globalAlpha = glow;
  ctx.beginPath();
  ctx.ellipse(0, craterY + u, craterHalf * 0.85, u * 3.5, 0, 0, Math.PI * 2);
  ctx.fillStyle = lava;
  ctx.fill();
  ctx.globalAlpha = 1;

  // ERUPTION — lava blobs arc out of the crater
  if (open) {
    const blobs = 9;
    for (let i = 0; i < blobs; i++) {
      const p = (m.time * 1.3 + i / blobs) % 1;
      const vx = (i / (blobs - 1) - 0.5) * u * 70;
      const rise = u * (60 + (i % 3) * 18) * (0.6 + power);
      const x = vx * p;
      const y = craterY - (rise * 4 * p * (1 - p));
      ctx.beginPath();
      ctx.arc(x, y, u * (3.5 + (i % 2) * 1.5) * (1 - p * 0.4), 0, Math.PI * 2);
      ctx.fillStyle = i % 2 === 0 ? "#FF3D00" : "#FFAB00";
      ctx.fill();
    }
  }

  ctx.restore();
}

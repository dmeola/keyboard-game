import type { FaceMetrics } from "../faceMetrics";
import { chinY, headTop } from "./shared";

/** A scoop: round top with a drippy, bumpy bottom edge */
function drawScoop(
  ctx: CanvasRenderingContext2D,
  u: number,
  x: number,
  y: number,
  rx: number,
  ry: number,
  light: string,
  dark: string
): void {
  const grad = ctx.createRadialGradient(x - rx * 0.3, y - ry * 0.4, rx * 0.05, x, y, rx);
  grad.addColorStop(0, light);
  grad.addColorStop(1, dark);
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  const bumps = Math.max(3, Math.round(rx / (u * 11)));
  for (let k = 0; k <= bumps * 2; k++) {
    const bx = x - rx * 0.85 + (k / (bumps * 2)) * rx * 1.7;
    ctx.beginPath();
    ctx.arc(bx, y + ry * 0.72 + (k % 2 === 0 ? 0 : u * 3), u * 6, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function drawIceCreamFilter(
  ctx: CanvasRenderingContext2D,
  m: FaceMetrics
): void {
  ctx.save();
  const u = m.u;
  const open = Math.min(1, Math.max(0, (m.mouthOpenRatio - 0.3) / 0.5));

  // Waffle cone below the chin — the child's face is the scoop in the middle!
  const coneTop = chinY(m) + u * 2;
  const coneW = u * 30;
  const coneH = u * 62;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(-coneW, coneTop);
  ctx.lineTo(coneW, coneTop);
  ctx.lineTo(0, coneTop + coneH);
  ctx.closePath();
  const coneGrad = ctx.createLinearGradient(-coneW, 0, coneW, 0);
  coneGrad.addColorStop(0, "#E0B36A");
  coneGrad.addColorStop(1, "#C68B3C");
  ctx.fillStyle = coneGrad;
  ctx.fill();
  ctx.clip();
  ctx.strokeStyle = "#A0722A";
  ctx.lineWidth = u * 1.2;
  for (let i = -8; i <= 8; i++) {
    ctx.beginPath();
    ctx.moveTo(i * u * 9 - coneH, coneTop);
    ctx.lineTo(i * u * 9 + coneH, coneTop + coneH * 2);
    ctx.moveTo(i * u * 9 + coneH, coneTop);
    ctx.lineTo(i * u * 9 - coneH, coneTop + coneH * 2);
    ctx.stroke();
  }
  ctx.restore();
  ctx.beginPath();
  ctx.roundRect(-coneW - u * 2, coneTop - u * 2, coneW * 2 + u * 4, u * 7, u * 3);
  ctx.fillStyle = "#D4A056";
  ctx.fill();

  // Scoops stacked on top of the head
  const base = headTop(m) + u * 4;

  // Drips running down beside the head
  ctx.fillStyle = "#F48FB1";
  [
    { x: -u * 46, len: u * 22 },
    { x: u * 46, len: u * 30 },
  ].forEach(({ x, len }) => {
    ctx.beginPath();
    ctx.moveTo(x - u * 4, base + u * 10);
    ctx.lineTo(x - u * 4, base + u * 10 + len);
    ctx.arc(x, base + u * 10 + len, u * 4, Math.PI, 0, true);
    ctx.lineTo(x + u * 4, base + u * 10);
    ctx.closePath();
    ctx.fill();
  });

  drawScoop(ctx, u, 0, base, u * 50, u * 22, "#FFE0E6", "#F48FB1");
  drawScoop(ctx, u, -u * 3, base - u * 24, u * 36, u * 20, "#E8F5E9", "#81C784");
  drawScoop(ctx, u, u * 2, base - u * 44, u * 24, u * 17, "#BCAAA4", "#6D4C41");

  // Sprinkles on the pink and mint scoops (fixed pseudo-random layout)
  const sprinkleColors = ["#FF5252", "#FFEB3B", "#69F0AE", "#40C4FF", "#FF4081", "#FFFFFF"];
  for (let i = 0; i < 16; i++) {
    const r1 = Math.abs(Math.sin(i * 12.9898) * 43758.5453) % 1;
    const r2 = Math.abs(Math.sin(i * 78.233) * 12543.123) % 1;
    const onTop = i % 2 === 0;
    const sx = (r1 - 0.5) * (onTop ? u * 56 : u * 80) + (onTop ? -u * 3 : 0);
    const sy = (onTop ? base - u * 24 : base) + (r2 - 0.5) * u * 22;
    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(r2 * Math.PI * 2);
    ctx.fillStyle = sprinkleColors[i % sprinkleColors.length];
    ctx.fillRect(-u * 2, -u * 0.7, u * 4, u * 1.4);
    ctx.restore();
  }

  // Cherry on top — bounces when the mouth opens
  const bounce = Math.abs(Math.sin(m.time * 7)) * u * 10 * open + Math.sin(m.time * 2) * u * 0.8;
  const cherryX = u * 4;
  const cherryY = base - u * 44 - u * 17 - u * 5 - bounce;
  ctx.beginPath();
  ctx.moveTo(cherryX, cherryY - u * 5);
  ctx.quadraticCurveTo(cherryX + u * 2, cherryY - u * 13, cherryX + u * 8, cherryY - u * 16);
  ctx.strokeStyle = "#558B2F";
  ctx.lineWidth = u * 1.4;
  ctx.lineCap = "round";
  ctx.stroke();
  const cherryGrad = ctx.createRadialGradient(cherryX - u * 2, cherryY - u * 2, u * 0.5, cherryX, cherryY, u * 6.5);
  cherryGrad.addColorStop(0, "#FF5252");
  cherryGrad.addColorStop(1, "#B71C1C");
  ctx.beginPath();
  ctx.arc(cherryX, cherryY, u * 6.5, 0, Math.PI * 2);
  ctx.fillStyle = cherryGrad;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cherryX - u * 2.2, cherryY - u * 2.2, u * 1.6, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.fill();

  ctx.restore();
}

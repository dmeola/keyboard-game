import type { FaceMetrics } from "../faceMetrics";
import { chinY, faceRx, headTop } from "./shared";

export function drawBalloonFilter(
  ctx: CanvasRenderingContext2D,
  m: FaceMetrics
): void {
  ctx.save();
  const u = m.u;
  // Blowing (open mouth) inflates the balloons
  const open = Math.min(1, Math.max(0, (m.mouthOpenRatio - 0.2) / 0.6));
  const inflate = 1 + open * 0.3;
  const anchorY = chinY(m) + u * 12;

  const balloons = [
    { x: -faceRx(m) - u * 28, y: headTop(m) - u * 6, phase: 0, light: "#90CAF9", dark: "#1565C0", anchorX: -u * 34 },
    { x: faceRx(m) + u * 30, y: headTop(m) - u * 22, phase: 1.7, light: "#FFAB91", dark: "#E53935", anchorX: u * 34 },
  ];

  balloons.forEach((b) => {
    const bx = b.x + Math.sin(m.time * 1.1 + b.phase) * u * 2;
    const by = b.y + Math.sin(m.time * 1.6 + b.phase) * u * 3;
    const rx = u * 20 * inflate;
    const ry = u * 25 * inflate;
    const knotY = by + ry;

    // String down to the shoulder
    const midX = (bx + b.anchorX) / 2;
    const midY = (knotY + anchorY) / 2;
    ctx.beginPath();
    ctx.moveTo(bx, knotY + u * 2);
    ctx.bezierCurveTo(bx + u * 6, (knotY + midY) / 2, midX - u * 6, midY, b.anchorX, anchorY);
    ctx.strokeStyle = "rgba(90,90,90,0.8)";
    ctx.lineWidth = u * 0.8;
    ctx.stroke();

    // Knot
    ctx.beginPath();
    ctx.moveTo(bx, knotY - u * 1);
    ctx.lineTo(bx - u * 3, knotY + u * 3.5);
    ctx.lineTo(bx + u * 3, knotY + u * 3.5);
    ctx.closePath();
    ctx.fillStyle = b.dark;
    ctx.fill();

    // Balloon body
    const grad = ctx.createRadialGradient(bx - rx * 0.3, by - ry * 0.35, rx * 0.1, bx, by, ry);
    grad.addColorStop(0, b.light);
    grad.addColorStop(1, b.dark);
    ctx.beginPath();
    ctx.ellipse(bx, by, rx, ry, 0, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    // Shine
    ctx.beginPath();
    ctx.ellipse(bx - rx * 0.38, by - ry * 0.4, rx * 0.16, ry * 0.22, -0.4, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    ctx.fill();

    // Little smiley face on the balloon
    ctx.fillStyle = "rgba(0,0,0,0.45)";
    ctx.beginPath();
    ctx.arc(bx - rx * 0.28, by - ry * 0.05, u * 1.6, 0, Math.PI * 2);
    ctx.arc(bx + rx * 0.28, by - ry * 0.05, u * 1.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(bx, by + ry * 0.12, rx * 0.3, 0.2, Math.PI - 0.2);
    ctx.strokeStyle = "rgba(0,0,0,0.45)";
    ctx.lineWidth = u * 1.2;
    ctx.lineCap = "round";
    ctx.stroke();
  });

  ctx.restore();
}
